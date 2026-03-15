import type { IncomingMessage } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'

export interface AuthTrustedClient {
  authId: string
  ua: string
  origin: string
  timestamp: number
}

export interface AuthStorageData {
  trusted: Record<string, AuthTrustedClient>
}

export interface AuthInput {
  authId: string
  ua: string
  origin: string
}

export interface AuthResult {
  isTrusted: boolean
}

export interface ConnectionAuthMeta {
  isTrusted: boolean
  authId?: string
}

const ANONYMOUS_SCOPE = 'rspack:anonymous:'
const AUTH_METHOD = 'rspack:anonymous:auth'

export { ANONYMOUS_SCOPE, AUTH_METHOD }

export class AuthStorage {
  private filepath: string
  private data: AuthStorageData

  constructor(workspaceRoot: string) {
    this.filepath = path.join(workspaceRoot, 'node_modules/.rspack-devtools/auth.json')
    this.data = this.load()
  }

  private load(): AuthStorageData {
    try {
      if (fs.existsSync(this.filepath)) {
        return JSON.parse(fs.readFileSync(this.filepath, 'utf-8'))
      }
    }
    catch {
      // ignore parse errors
    }
    return { trusted: {} }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.filepath), { recursive: true })
    fs.writeFileSync(this.filepath, `${JSON.stringify(this.data, null, 2)}\n`)
  }

  isTrusted(authId: string): boolean {
    return !!this.data.trusted[authId]
  }

  addTrusted(client: AuthTrustedClient): void {
    this.data.trusted[client.authId] = client
    this.save()
  }
}

let pendingPrompt: Promise<AuthResult> | null = null

export async function promptAuth(
  authStorage: AuthStorage,
  meta: ConnectionAuthMeta,
  query: AuthInput,
): Promise<AuthResult> {
  if (meta.isTrusted || authStorage.isTrusted(query.authId)) {
    meta.authId = query.authId
    meta.isTrusted = true
    return { isTrusted: true }
  }

  // Serialize concurrent auth prompts to avoid terminal corruption
  if (pendingPrompt) {
    await pendingPrompt
    if (authStorage.isTrusted(query.authId)) {
      meta.authId = query.authId
      meta.isTrusted = true
      return { isTrusted: true }
    }
  }

  const doPrompt = async (): Promise<AuthResult> => {
    const message = [
      `A browser is requesting permissions to connect to the Rspack DevTools.`,
      '',
      `User Agent: ${c.yellow(c.bold(query.ua || 'Unknown'))}`,
      `Origin    : ${c.cyan(c.bold(query.origin || 'Unknown'))}`,
      `Identifier: ${c.green(c.bold(query.authId))}`,
      '',
      'This will allow the browser to interact with the server, make file changes and run commands.',
      c.red(c.bold('You should only trust your local development browsers.')),
    ]

    p.note(
      c.reset(message.join('\n')),
      c.bold(c.yellow(' Rspack DevTools Permission Request ')),
    )

    const answer = await p.confirm({
      message: c.bold(`Do you trust this client (${c.green(c.bold(query.authId))})?`),
      initialValue: false,
    })

    if (answer && answer !== Symbol.for('cancel')) {
      authStorage.addTrusted({
        authId: query.authId,
        ua: query.ua,
        origin: query.origin,
        timestamp: Date.now(),
      })
      meta.authId = query.authId
      meta.isTrusted = true

      p.outro(c.green(c.bold(`You have granted permissions to ${c.bold(query.authId)}`)))
      return { isTrusted: true }
    }

    p.outro(c.red(c.bold(`You have denied permissions to ${c.bold(query.authId)}`)))
    return { isTrusted: false }
  }

  pendingPrompt = doPrompt()
  try {
    return await pendingPrompt
  }
  finally {
    pendingPrompt = null
  }
}

export function isClientAuthDisabledByEnv(): boolean {
  return process.env.RSPACK_DEVTOOLS_DISABLE_CLIENT_AUTH === 'true'
}

export function extractAuthIdFromRequest(req: IncomingMessage): string | undefined {
  const url = new URL(req.url ?? '', 'http://localhost')
  return url.searchParams.get('rspack_devtools_auth_id') ?? undefined
}

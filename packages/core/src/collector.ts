import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  AssetData,
  BuildError,
  BuildSession,
  BuildWarning,
  ChunkData,
  EntrypointData,
  GraphEdge,
  GraphNode,
  ModuleData,
  PackageData,
  PackageInstance,
  PluginData,
} from './types'

let sessionCounter = 0

export class DataCollector {
  sessions: Map<string, BuildSession> = new Map()
  private cwd: string = process.cwd()

  setCwd(cwd: string) {
    this.cwd = cwd
  }

  collectFromStats(statsJson: any, pluginNames: string[]): BuildSession {
    const sessionId = `build-${++sessionCounter}-${Date.now()}`
    const timestamp = Date.now()

    const modules = this.collectModules(statsJson)
    const chunks = this.collectChunks(statsJson)
    const assets = this.collectAssets(statsJson, chunks)
    const entrypoints = this.collectEntrypoints(statsJson)
    const errors = this.collectErrors(statsJson)
    const warnings = this.collectWarnings(statsJson)
    const plugins = this.collectPlugins(pluginNames)
    const packages = this.collectPackages(modules)
    const duration = (statsJson.time ?? 0) as number

    const session: BuildSession = {
      id: sessionId,
      timestamp,
      duration,
      hash: statsJson.hash ?? '',
      cwd: this.cwd,
      errors,
      warnings,
      modules,
      chunks,
      assets,
      entrypoints,
      plugins,
      packages,
    }

    this.sessions.set(sessionId, session)
    return session
  }

  private collectModules(statsJson: any): ModuleData[] {
    const rawModules = statsJson.modules ?? []
    const moduleMap = new Map<string, ModuleData>()

    for (const m of rawModules) {
      const id = m.identifier ?? m.name ?? ''
      const dependents: string[] = []

      if (m.reasons) {
        for (const reason of m.reasons) {
          if (reason.moduleIdentifier) {
            dependents.push(reason.moduleIdentifier)
          }
        }
      }

      moduleMap.set(id, {
        id,
        name: m.name ?? m.identifier ?? '',
        size: m.size ?? 0,
        chunks: (m.chunks ?? []).map(String),
        issuer: m.issuer ?? null,
        issuerId: m.issuerId ?? null,
        reasons: (m.reasons ?? []).map((r: any) => ({
          moduleId: r.moduleId ?? r.moduleIdentifier ?? null,
          moduleName: r.moduleName ?? null,
          type: r.type ?? '',
          userRequest: r.userRequest ?? '',
        })),
        depth: m.depth ?? null,
        type: m.type ?? '',
        moduleType: m.moduleType ?? '',
        dependencies: [],
        dependents,
        source: m.source ?? undefined,
      })
    }

    for (const mod of moduleMap.values()) {
      for (const depId of mod.dependents) {
        const parent = moduleMap.get(depId)
        if (parent && !parent.dependencies.includes(mod.id)) {
          parent.dependencies.push(mod.id)
        }
      }
    }

    return Array.from(moduleMap.values())
  }

  private collectChunks(statsJson: any): ChunkData[] {
    const rawChunks = statsJson.chunks ?? []
    return rawChunks.map((c: any) => ({
      id: String(c.id ?? c.hash ?? ''),
      names: c.names ?? [],
      size: c.size ?? 0,
      modules: (c.modules ?? []).map((m: any) => m.identifier ?? m.name ?? ''),
      files: c.files ?? [],
      entry: c.entry ?? false,
      initial: c.initial ?? false,
      rendered: c.rendered ?? false,
      moduleCount: c.modules?.length ?? 0,
      parents: (c.parents ?? []).map(String),
      children: (c.children ?? []).map(String),
      siblings: (c.siblings ?? []).map(String),
      origins: (c.origins ?? []).map((o: any) => ({
        module: o.module ?? '',
        moduleIdentifier: o.moduleIdentifier ?? '',
        moduleName: o.moduleName ?? '',
        loc: o.loc ?? '',
        request: o.request ?? '',
      })),
    }))
  }

  private collectAssets(statsJson: any, chunks: ChunkData[]): AssetData[] {
    const rawAssets = statsJson.assets ?? []
    return rawAssets.map((a: any) => {
      const assetChunks = (a.chunks ?? []).map(String)
      const relatedModules: string[] = []
      for (const chunk of chunks) {
        if (assetChunks.includes(chunk.id)) {
          relatedModules.push(...chunk.modules)
        }
      }
      return {
        name: a.name ?? '',
        size: a.size ?? 0,
        chunks: assetChunks,
        chunkNames: a.chunkNames ?? [],
        emitted: a.emitted ?? false,
        info: a.info ?? {},
        relatedChunks: assetChunks,
        relatedModules: [...new Set(relatedModules)],
      }
    })
  }

  private collectEntrypoints(statsJson: any): EntrypointData[] {
    const rawEntrypoints = statsJson.entrypoints ?? {}
    return Object.entries(rawEntrypoints).map(([name, ep]: [string, any]) => ({
      name,
      chunks: (ep.chunks ?? []).map(String),
      assets: (ep.assets ?? []).map((a: any) => ({
        name: typeof a === 'string' ? a : a.name ?? '',
        size: typeof a === 'string' ? 0 : a.size ?? 0,
      })),
      size: ep.assetsSize ?? ep.assets?.reduce((s: number, a: any) => s + (a.size ?? 0), 0) ?? 0,
    }))
  }

  private collectErrors(statsJson: any): BuildError[] {
    return (statsJson.errors ?? []).map((e: any) => ({
      message: typeof e === 'string' ? e : e.message ?? '',
      moduleId: e.moduleId ?? undefined,
      moduleName: e.moduleName ?? undefined,
      loc: e.loc ?? undefined,
      details: e.details ?? undefined,
    }))
  }

  private collectWarnings(statsJson: any): BuildWarning[] {
    return (statsJson.warnings ?? []).map((w: any) => ({
      message: typeof w === 'string' ? w : w.message ?? '',
      moduleId: w.moduleId ?? undefined,
      moduleName: w.moduleName ?? undefined,
      loc: w.loc ?? undefined,
      details: w.details ?? undefined,
    }))
  }

  private collectPlugins(pluginNames: string[]): PluginData[] {
    return pluginNames.map((name, index) => ({ name, index }))
  }

  private collectPackages(modules: ModuleData[]): PackageData[] {
    const pkgMap = new Map<string, {
      versions: Map<string, PackageInstance>
      modules: Set<string>
      totalSize: number
    }>()

    for (const mod of modules) {
      const pkgInfo = this.extractPackageInfo(mod.name)
      if (!pkgInfo) continue

      let pkg = pkgMap.get(pkgInfo.name)
      if (!pkg) {
        pkg = { versions: new Map(), modules: new Set(), totalSize: 0 }
        pkgMap.set(pkgInfo.name, pkg)
      }

      pkg.modules.add(mod.id)
      pkg.totalSize += mod.size

      const existing = pkg.versions.get(pkgInfo.version)
      if (existing) {
        existing.size += mod.size
      } else {
        pkg.versions.set(pkgInfo.version, {
          path: pkgInfo.path,
          version: pkgInfo.version,
          size: mod.size,
        })
      }
    }

    const allPkgNames = new Set(pkgMap.keys())
    const result: PackageData[] = []

    for (const [name, pkg] of pkgMap) {
      const instances = Array.from(pkg.versions.values())
      const isDuplicate = instances.length > 1

      const dependedBy: string[] = []
      for (const modId of pkg.modules) {
        const mod = modules.find(m => m.id === modId)
        if (mod?.issuer) {
          const issuerPkg = this.extractPackageInfo(mod.issuer)
          if (issuerPkg && issuerPkg.name !== name && !dependedBy.includes(issuerPkg.name)) {
            dependedBy.push(issuerPkg.name)
          }
        }
      }

      result.push({
        name,
        version: instances[0]?.version ?? 'unknown',
        size: pkg.totalSize,
        moduleCount: pkg.modules.size,
        modules: Array.from(pkg.modules),
        isDirect: dependedBy.length === 0 || !dependedBy.every(d => allPkgNames.has(d)),
        isDuplicate,
        instances,
        dependedBy,
      })
    }

    return result.sort((a, b) => b.size - a.size)
  }

  private versionCache = new Map<string, string>()

  private extractPackageInfo(moduleName: string): { name: string; version: string; path: string } | null {
    const nmIndex = moduleName.lastIndexOf('node_modules/')
    if (nmIndex === -1) return null

    const afterNm = moduleName.slice(nmIndex + 'node_modules/'.length)
    let pkgName: string

    if (afterNm.startsWith('@')) {
      const parts = afterNm.split('/')
      if (parts.length < 2) return null
      pkgName = `${parts[0]}/${parts[1]}`
    } else {
      const parts = afterNm.split('/')
      pkgName = parts[0]
    }

    const pkgPath = moduleName.slice(0, nmIndex + 'node_modules/'.length + pkgName.length)
    const version = this.readPackageVersion(pkgPath)

    return { name: pkgName, version, path: pkgPath }
  }

  private readPackageVersion(pkgPath: string): string {
    if (this.versionCache.has(pkgPath)) return this.versionCache.get(pkgPath)!
    try {
      const pkgJsonPath = join(this.cwd, pkgPath, 'package.json')
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      const version = pkgJson.version ?? 'unknown'
      this.versionCache.set(pkgPath, version)
      return version
    } catch {
      this.versionCache.set(pkgPath, 'unknown')
      return 'unknown'
    }
  }

  buildModuleGraph(session: BuildSession): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const seen = new Set<string>()

    for (const mod of session.modules) {
      if (seen.has(mod.id)) continue
      seen.add(mod.id)

      nodes.push({
        id: mod.id,
        name: mod.name,
        size: mod.size,
        type: mod.moduleType,
        group: this.getModuleGroup(mod.name),
      })

      for (const depId of mod.dependencies) {
        edges.push({ source: mod.id, target: depId, type: 'dependency' })
      }
    }

    return { nodes, edges }
  }

  getModuleGroup(name: string): string {
    if (name.includes('node_modules')) return 'node_modules'
    if (/\.(css|scss|less|styl)$/.test(name)) return 'styles'
    if (/\.(vue|svelte)$/.test(name)) return 'components'
    if (/\.(ts|tsx)$/.test(name)) return 'typescript'
    if (/\.(js|jsx|mjs|cjs)$/.test(name)) return 'javascript'
    if (/\.json$/.test(name)) return 'json'
    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images'
    return 'other'
  }
}

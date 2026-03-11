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
} from './types'

let sessionCounter = 0

export class DataCollector {
  sessions: Map<string, BuildSession> = new Map()

  collectFromStats(statsJson: any): BuildSession {
    const sessionId = `build-${++sessionCounter}-${Date.now()}`
    const timestamp = Date.now()

    const modules = this.collectModules(statsJson)
    const chunks = this.collectChunks(statsJson)
    const assets = this.collectAssets(statsJson)
    const entrypoints = this.collectEntrypoints(statsJson)
    const errors = this.collectErrors(statsJson)
    const warnings = this.collectWarnings(statsJson)
    const duration = (statsJson.time ?? 0) as number

    const session: BuildSession = {
      id: sessionId,
      timestamp,
      duration,
      hash: statsJson.hash ?? '',
      errors,
      warnings,
      modules,
      chunks,
      assets,
      entrypoints,
    }

    this.sessions.set(sessionId, session)
    return session
  }

  private collectModules(statsJson: any): ModuleData[] {
    const rawModules = statsJson.modules ?? []
    const moduleMap = new Map<string, ModuleData>()

    for (const m of rawModules) {
      const id = m.identifier ?? m.name ?? ''
      const dependencies: string[] = []
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
        dependencies,
        dependents,
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
    }))
  }

  private collectAssets(statsJson: any): AssetData[] {
    const rawAssets = statsJson.assets ?? []
    return rawAssets.map((a: any) => ({
      name: a.name ?? '',
      size: a.size ?? 0,
      chunks: (a.chunks ?? []).map(String),
      chunkNames: a.chunkNames ?? [],
      emitted: a.emitted ?? false,
      info: a.info ?? {},
    }))
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

  buildModuleGraph(session: BuildSession): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const seen = new Set<string>()

    for (const mod of session.modules) {
      if (seen.has(mod.id)) continue
      seen.add(mod.id)

      const group = this.getModuleGroup(mod.name)
      nodes.push({
        id: mod.id,
        name: mod.name,
        size: mod.size,
        type: mod.moduleType,
        group,
      })

      for (const depId of mod.dependencies) {
        edges.push({
          source: mod.id,
          target: depId,
          type: 'dependency',
        })
      }
    }

    return { nodes, edges }
  }

  private getModuleGroup(name: string): string {
    if (name.includes('node_modules')) return 'node_modules'
    if (name.endsWith('.css') || name.endsWith('.scss') || name.endsWith('.less')) return 'styles'
    if (name.endsWith('.vue') || name.endsWith('.svelte')) return 'components'
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript'
    if (name.endsWith('.json')) return 'json'
    if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(name)) return 'images'
    return 'other'
  }
}

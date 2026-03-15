import type { RpcFunctionDefinition } from '@rspack-devtools/kit'
import type { DevToolsTerminalHost } from '@rspack-devtools/kit'
import type { DataCollector } from '../collector'
import { rspackListSessions } from './functions/rspack-list-sessions'
import { rspackGetSession } from './functions/rspack-get-session'
import { rspackGetModules } from './functions/rspack-get-modules'
import { rspackGetModuleInfo } from './functions/rspack-get-module-info'
import { rspackGetModuleGraph } from './functions/rspack-get-module-graph'
import { rspackGetChunks } from './functions/rspack-get-chunks'
import { rspackGetChunkInfo } from './functions/rspack-get-chunk-info'
import { rspackGetAssets } from './functions/rspack-get-assets'
import { rspackGetAssetDetails } from './functions/rspack-get-asset-details'
import { rspackGetEntrypoints } from './functions/rspack-get-entrypoints'
import { rspackGetErrors } from './functions/rspack-get-errors'
import { rspackGetWarnings } from './functions/rspack-get-warnings'
import { rspackGetPlugins } from './functions/rspack-get-plugins'
import { rspackGetPackages } from './functions/rspack-get-packages'
import { rspackGetPackageDetails } from './functions/rspack-get-package-details'
import { rspackCompareSessions } from './functions/rspack-compare-sessions'
import { rspackOpenInEditor } from './functions/rspack-open-in-editor'

export function rspackBuildRpcDeclarations(
  collector: DataCollector,
  _terminalHost: DevToolsTerminalHost,
): RpcFunctionDefinition[] {
  return [
    rspackListSessions(collector),
    rspackGetSession(collector),
    rspackGetModules(collector),
    rspackGetModuleInfo(collector),
    rspackGetModuleGraph(collector),
    rspackGetChunks(collector),
    rspackGetChunkInfo(collector),
    rspackGetAssets(collector),
    rspackGetAssetDetails(collector),
    rspackGetEntrypoints(collector),
    rspackGetErrors(collector),
    rspackGetWarnings(collector),
    rspackGetPlugins(collector),
    rspackGetPackages(collector),
    rspackGetPackageDetails(collector),
    rspackCompareSessions(collector),
    rspackOpenInEditor(),
  ]
}

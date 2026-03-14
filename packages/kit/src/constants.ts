export const DEVTOOLS_MOUNT_PATH = '/.devtools/'
export const DEVTOOLS_CONNECTION_META_FILENAME = '.connection.json'
export const DEVTOOLS_INJECT_SCRIPT_PATH = '/devtools-inject.js'
export const DEVTOOLS_CLIENT_IMPORTS_PATH = '/.devtools/client-imports.js'

export const INTERNAL_SHARED_STATE_DOCKS = 'devtoolskit:internal:docks'
export const INTERNAL_SHARED_STATE_SETTINGS = 'devtoolskit:internal:user-settings'

export const INTERNAL_RPC_TERMINALS_UPDATED = 'devtoolskit:internal:terminals:updated'
export const INTERNAL_RPC_TERMINALS_STREAM = 'devtoolskit:internal:terminals:stream-chunk'
export const INTERNAL_RPC_LOGS_UPDATED = 'devtoolskit:internal:logs:updated'

export const INTERNAL_RPC_LOGS_LIST = 'devtoolskit:internal:logs:list'
export const INTERNAL_RPC_LOGS_ADD = 'devtoolskit:internal:logs:add'
export const INTERNAL_RPC_LOGS_UPDATE = 'devtoolskit:internal:logs:update'
export const INTERNAL_RPC_LOGS_REMOVE = 'devtoolskit:internal:logs:remove'
export const INTERNAL_RPC_LOGS_CLEAR = 'devtoolskit:internal:logs:clear'

export const INTERNAL_RPC_DOCKS_ON_LAUNCH = 'devtoolskit:internal:docks:on-launch'

export const INTERNAL_RPC_SELF_INSPECT_GET_DOCKS = 'devtoolskit:self-inspect:get-docks'
export const INTERNAL_RPC_SELF_INSPECT_GET_RPC_FUNCTIONS = 'devtoolskit:self-inspect:get-rpc-functions'
export const INTERNAL_RPC_SELF_INSPECT_GET_CLIENT_SCRIPTS = 'devtoolskit:self-inspect:get-client-scripts'
export const INTERNAL_RPC_SELF_INSPECT_GET_DEVTOOLS_PLUGINS = 'devtoolskit:self-inspect:get-devtools-plugins'

export interface DevToolsDocksUserSettings {
  docksHidden: string[]
  docksCategoriesHidden: string[]
  docksPinned: string[]
  docksCustomOrder: string[]
  showIframeAddressBar: boolean
  closeOnOutsideClick: boolean
}

export function DEFAULT_STATE_USER_SETTINGS(): DevToolsDocksUserSettings {
  return {
    docksHidden: [],
    docksCategoriesHidden: [],
    docksPinned: [],
    docksCustomOrder: [],
    showIframeAddressBar: false,
    closeOnOutsideClick: false,
  }
}

export const DEFAULT_CATEGORIES_ORDER = [
  '~rspackplus',
  'default',
  'app',
  'framework',
  'web',
  'advanced',
  '~builtin',
]

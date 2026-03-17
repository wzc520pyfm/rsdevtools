export interface SerializedDock {
  id: string
  title: string
  icon: string
  type: string
  url?: string
  category?: string
  launcher?: {
    title: string
    description?: string
    buttonStart?: string
    buttonLoading?: string
    status?: string
  }
  action?: { importFrom: string; importName?: string }
  renderer?: { importFrom: string; importName?: string }
}

export interface InjectConfig {
  devtoolsUrl: string
  wsPort: number
  host: string
  clientAuth: boolean
  docks: SerializedDock[]
}

export interface DockEntry {
  id: string
  title: string
  icon: string
  type: string
  category: string
  url?: string
  launcher?: {
    title: string
    description?: string
    buttonStart?: string
    buttonLoading?: string
    status?: string
  }
  action?: { importFrom: string; importName?: string }
  renderer?: { importFrom: string; importName?: string }
}

export interface DockState {
  position: 'left' | 'right' | 'top' | 'bottom'
  width: number
  height: number
  left: number
  top: number
  open: boolean
  selectedDock: string | null
  anchorOffset: number
  inactiveTimeout: number
}

export interface DockButtonItem {
  el: HTMLButtonElement
  dock: DockEntry
}

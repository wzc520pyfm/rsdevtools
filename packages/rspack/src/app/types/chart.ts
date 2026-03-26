import type { TreeNode } from 'nanovis'
import type { AssetData, ChunkData } from '../../shared/types'

export type AssetChartInfo = Omit<AssetData, 'type'> & {
  path: string
  type: 'folder' | 'file'
}

export type AssetChartNode = TreeNode<AssetChartInfo | undefined>

export type ChunkChartInfo = Omit<ChunkData, 'type'> & {
  path: string
  type: 'folder' | 'chunk'
  size: number
}

export type ChunkChartNode = TreeNode<ChunkChartInfo | undefined>

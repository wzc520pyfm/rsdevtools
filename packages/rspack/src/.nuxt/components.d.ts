
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const AssetsFlamegraph: typeof import("../app/components/assets/Flamegraph.vue")['default']
export const AssetsFolder: typeof import("../app/components/assets/Folder.vue")['default']
export const AssetsList: typeof import("../app/components/assets/List.vue")['default']
export const AssetsSunburst: typeof import("../app/components/assets/Sunburst.vue")['default']
export const ChartNavBreadcrumb: typeof import("../app/components/chart/NavBreadcrumb.vue")['default']
export const ChartTreemap: typeof import("../app/components/chart/Treemap.vue")['default']
export const ChunksFlamegraph: typeof import("../app/components/chunks/Flamegraph.vue")['default']
export const ChunksFlatList: typeof import("../app/components/chunks/FlatList.vue")['default']
export const ChunksGraph: typeof import("../app/components/chunks/Graph.vue")['default']
export const ChunksSunburst: typeof import("../app/components/chunks/Sunburst.vue")['default']
export const CodeDiffEditor: typeof import("../app/components/code/DiffEditor.vue")['default']
export const CodeViewer: typeof import("../app/components/code/Viewer.vue")['default']
export const CompareMetricCard: typeof import("../app/components/compare/MetricCard.vue")['default']
export const CompareSessionMeta: typeof import("../app/components/compare/SessionMeta.vue")['default']
export const DataAssetDetailsLoader: typeof import("../app/components/data/AssetDetailsLoader.vue")['default']
export const DataChunkDetailsLoader: typeof import("../app/components/data/ChunkDetailsLoader.vue")['default']
export const DataModuleDetailsLoader: typeof import("../app/components/data/ModuleDetailsLoader.vue")['default']
export const DataPackageDetailsLoader: typeof import("../app/components/data/PackageDetailsLoader.vue")['default']
export const DataPathSelector: typeof import("../app/components/data/PathSelector.vue")['default']
export const DataPluginDetailsLoader: typeof import("../app/components/data/PluginDetailsLoader.vue")['default']
export const DataSearchPanel: typeof import("../app/components/data/SearchPanel.vue")['default']
export const DisplayCodeViewer: typeof import("../app/components/display/CodeViewer.vue")['default']
export const DisplayFileIcon: typeof import("../app/components/display/FileIcon.vue")['default']
export const DisplayFileSizeBadge: typeof import("../app/components/display/FileSizeBadge.vue")['default']
export const DisplayGraphHoverView: typeof import("../app/components/display/GraphHoverView.vue")['default']
export const DisplayModuleId: typeof import("../app/components/display/ModuleId.vue")['default']
export const DisplayTreeNode: typeof import("../app/components/display/TreeNode.vue")['default']
export const LogsFilterToggles: typeof import("../app/components/logs/FilterToggles.vue")['default']
export const LogsHashBadge: typeof import("../app/components/logs/HashBadge.vue")['default']
export const LogsLogItem: typeof import("../app/components/logs/LogItem.vue")['default']
export const LogsLogItemConstants: typeof import("../app/components/logs/LogItemConstants")['default']
export const ModulesDetailedList: typeof import("../app/components/modules/DetailedList.vue")['default']
export const ModulesFlatList: typeof import("../app/components/modules/FlatList.vue")['default']
export const ModulesFolder: typeof import("../app/components/modules/Folder.vue")['default']
export const ModulesGraph: typeof import("../app/components/modules/Graph.vue")['default']
export const PackagesDuplicated: typeof import("../app/components/packages/Duplicated.vue")['default']
export const PackagesTable: typeof import("../app/components/packages/Table.vue")['default']
export const PluginsFlatList: typeof import("../app/components/plugins/FlatList.vue")['default']
export const DataVirtualList: typeof import("../../../ui/src/components/DataVirtualList.vue")['default']
export const DisplayBadge: typeof import("../../../ui/src/components/DisplayBadge.vue")['default']
export const DisplayCloseButton: typeof import("../../../ui/src/components/DisplayCloseButton.vue")['default']
export const DisplayDuration: typeof import("../../../ui/src/components/DisplayDuration.vue")['default']
export const DisplayIconButton: typeof import("../../../ui/src/components/DisplayIconButton.vue")['default']
export const DisplayNumberBadge: typeof import("../../../ui/src/components/DisplayNumberBadge.vue")['default']
export const DisplayNumberWithUnit: typeof import("../../../ui/src/components/DisplayNumberWithUnit.vue")['default']
export const DisplayTimestamp: typeof import("../../../ui/src/components/DisplayTimestamp.vue")['default']
export const PanelSideNav: typeof import("../../../ui/src/components/PanelSideNav.vue")['default']
export const VisualLoading: typeof import("../../../ui/src/components/VisualLoading.vue")['default']
export const VisualLogoBanner: typeof import("../../../ui/src/components/VisualLogoBanner.vue")['default']
export const UnoIcon: typeof import("../../../../node_modules/.pnpm/@unocss+nuxt@66.6.6_magicast@0.5.2_vite@7.3.1_@types+node@22.19.15_jiti@2.6.1_terser@5.46.0_yaml@2.8.2__webpack@5.105.4/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']
export const NuxtWelcome: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAssetsFlamegraph: LazyComponent<typeof import("../app/components/assets/Flamegraph.vue")['default']>
export const LazyAssetsFolder: LazyComponent<typeof import("../app/components/assets/Folder.vue")['default']>
export const LazyAssetsList: LazyComponent<typeof import("../app/components/assets/List.vue")['default']>
export const LazyAssetsSunburst: LazyComponent<typeof import("../app/components/assets/Sunburst.vue")['default']>
export const LazyChartNavBreadcrumb: LazyComponent<typeof import("../app/components/chart/NavBreadcrumb.vue")['default']>
export const LazyChartTreemap: LazyComponent<typeof import("../app/components/chart/Treemap.vue")['default']>
export const LazyChunksFlamegraph: LazyComponent<typeof import("../app/components/chunks/Flamegraph.vue")['default']>
export const LazyChunksFlatList: LazyComponent<typeof import("../app/components/chunks/FlatList.vue")['default']>
export const LazyChunksGraph: LazyComponent<typeof import("../app/components/chunks/Graph.vue")['default']>
export const LazyChunksSunburst: LazyComponent<typeof import("../app/components/chunks/Sunburst.vue")['default']>
export const LazyCodeDiffEditor: LazyComponent<typeof import("../app/components/code/DiffEditor.vue")['default']>
export const LazyCodeViewer: LazyComponent<typeof import("../app/components/code/Viewer.vue")['default']>
export const LazyCompareMetricCard: LazyComponent<typeof import("../app/components/compare/MetricCard.vue")['default']>
export const LazyCompareSessionMeta: LazyComponent<typeof import("../app/components/compare/SessionMeta.vue")['default']>
export const LazyDataAssetDetailsLoader: LazyComponent<typeof import("../app/components/data/AssetDetailsLoader.vue")['default']>
export const LazyDataChunkDetailsLoader: LazyComponent<typeof import("../app/components/data/ChunkDetailsLoader.vue")['default']>
export const LazyDataModuleDetailsLoader: LazyComponent<typeof import("../app/components/data/ModuleDetailsLoader.vue")['default']>
export const LazyDataPackageDetailsLoader: LazyComponent<typeof import("../app/components/data/PackageDetailsLoader.vue")['default']>
export const LazyDataPathSelector: LazyComponent<typeof import("../app/components/data/PathSelector.vue")['default']>
export const LazyDataPluginDetailsLoader: LazyComponent<typeof import("../app/components/data/PluginDetailsLoader.vue")['default']>
export const LazyDataSearchPanel: LazyComponent<typeof import("../app/components/data/SearchPanel.vue")['default']>
export const LazyDisplayCodeViewer: LazyComponent<typeof import("../app/components/display/CodeViewer.vue")['default']>
export const LazyDisplayFileIcon: LazyComponent<typeof import("../app/components/display/FileIcon.vue")['default']>
export const LazyDisplayFileSizeBadge: LazyComponent<typeof import("../app/components/display/FileSizeBadge.vue")['default']>
export const LazyDisplayGraphHoverView: LazyComponent<typeof import("../app/components/display/GraphHoverView.vue")['default']>
export const LazyDisplayModuleId: LazyComponent<typeof import("../app/components/display/ModuleId.vue")['default']>
export const LazyDisplayTreeNode: LazyComponent<typeof import("../app/components/display/TreeNode.vue")['default']>
export const LazyLogsFilterToggles: LazyComponent<typeof import("../app/components/logs/FilterToggles.vue")['default']>
export const LazyLogsHashBadge: LazyComponent<typeof import("../app/components/logs/HashBadge.vue")['default']>
export const LazyLogsLogItem: LazyComponent<typeof import("../app/components/logs/LogItem.vue")['default']>
export const LazyLogsLogItemConstants: LazyComponent<typeof import("../app/components/logs/LogItemConstants")['default']>
export const LazyModulesDetailedList: LazyComponent<typeof import("../app/components/modules/DetailedList.vue")['default']>
export const LazyModulesFlatList: LazyComponent<typeof import("../app/components/modules/FlatList.vue")['default']>
export const LazyModulesFolder: LazyComponent<typeof import("../app/components/modules/Folder.vue")['default']>
export const LazyModulesGraph: LazyComponent<typeof import("../app/components/modules/Graph.vue")['default']>
export const LazyPackagesDuplicated: LazyComponent<typeof import("../app/components/packages/Duplicated.vue")['default']>
export const LazyPackagesTable: LazyComponent<typeof import("../app/components/packages/Table.vue")['default']>
export const LazyPluginsFlatList: LazyComponent<typeof import("../app/components/plugins/FlatList.vue")['default']>
export const LazyDataVirtualList: LazyComponent<typeof import("../../../ui/src/components/DataVirtualList.vue")['default']>
export const LazyDisplayBadge: LazyComponent<typeof import("../../../ui/src/components/DisplayBadge.vue")['default']>
export const LazyDisplayCloseButton: LazyComponent<typeof import("../../../ui/src/components/DisplayCloseButton.vue")['default']>
export const LazyDisplayDuration: LazyComponent<typeof import("../../../ui/src/components/DisplayDuration.vue")['default']>
export const LazyDisplayIconButton: LazyComponent<typeof import("../../../ui/src/components/DisplayIconButton.vue")['default']>
export const LazyDisplayNumberBadge: LazyComponent<typeof import("../../../ui/src/components/DisplayNumberBadge.vue")['default']>
export const LazyDisplayNumberWithUnit: LazyComponent<typeof import("../../../ui/src/components/DisplayNumberWithUnit.vue")['default']>
export const LazyDisplayTimestamp: LazyComponent<typeof import("../../../ui/src/components/DisplayTimestamp.vue")['default']>
export const LazyPanelSideNav: LazyComponent<typeof import("../../../ui/src/components/PanelSideNav.vue")['default']>
export const LazyVisualLoading: LazyComponent<typeof import("../../../ui/src/components/VisualLoading.vue")['default']>
export const LazyVisualLogoBanner: LazyComponent<typeof import("../../../ui/src/components/VisualLogoBanner.vue")['default']>
export const LazyUnoIcon: LazyComponent<typeof import("../../../../node_modules/.pnpm/@unocss+nuxt@66.6.6_magicast@0.5.2_vite@7.3.1_@types+node@22.19.15_jiti@2.6.1_terser@5.46.0_yaml@2.8.2__webpack@5.105.4/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_b0513375306e2ad429a1eefc2011f2d9/node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]

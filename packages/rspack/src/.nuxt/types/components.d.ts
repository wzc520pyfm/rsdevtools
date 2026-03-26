
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

interface _GlobalComponents {
  AssetsFlamegraph: typeof import("../../app/components/assets/Flamegraph.vue")['default']
  AssetsFolder: typeof import("../../app/components/assets/Folder.vue")['default']
  AssetsList: typeof import("../../app/components/assets/List.vue")['default']
  AssetsSunburst: typeof import("../../app/components/assets/Sunburst.vue")['default']
  ChartNavBreadcrumb: typeof import("../../app/components/chart/NavBreadcrumb.vue")['default']
  ChartTreemap: typeof import("../../app/components/chart/Treemap.vue")['default']
  ChunksFlamegraph: typeof import("../../app/components/chunks/Flamegraph.vue")['default']
  ChunksFlatList: typeof import("../../app/components/chunks/FlatList.vue")['default']
  ChunksGraph: typeof import("../../app/components/chunks/Graph.vue")['default']
  ChunksSunburst: typeof import("../../app/components/chunks/Sunburst.vue")['default']
  CodeDiffEditor: typeof import("../../app/components/code/DiffEditor.vue")['default']
  CodeViewer: typeof import("../../app/components/code/Viewer.vue")['default']
  CompareMetricCard: typeof import("../../app/components/compare/MetricCard.vue")['default']
  CompareSessionMeta: typeof import("../../app/components/compare/SessionMeta.vue")['default']
  DataAssetDetailsLoader: typeof import("../../app/components/data/AssetDetailsLoader.vue")['default']
  DataChunkDetailsLoader: typeof import("../../app/components/data/ChunkDetailsLoader.vue")['default']
  DataEntryDetailsLoader: typeof import("../../app/components/data/EntryDetailsLoader.vue")['default']
  DataModuleDetailsLoader: typeof import("../../app/components/data/ModuleDetailsLoader.vue")['default']
  DataPackageDetailsLoader: typeof import("../../app/components/data/PackageDetailsLoader.vue")['default']
  DataPathSelector: typeof import("../../app/components/data/PathSelector.vue")['default']
  DataPluginDetailsLoader: typeof import("../../app/components/data/PluginDetailsLoader.vue")['default']
  DataSearchPanel: typeof import("../../app/components/data/SearchPanel.vue")['default']
  DisplayCodeViewer: typeof import("../../app/components/display/CodeViewer.vue")['default']
  DisplayFileIcon: typeof import("../../app/components/display/FileIcon.vue")['default']
  DisplayFileSizeBadge: typeof import("../../app/components/display/FileSizeBadge.vue")['default']
  DisplayGraphHoverView: typeof import("../../app/components/display/GraphHoverView.vue")['default']
  DisplayHighlightedPackageName: typeof import("../../app/components/display/HighlightedPackageName")['default']
  DisplayHighlightedPath: typeof import("../../app/components/display/HighlightedPath")['default']
  DisplayModuleGraph: typeof import("../../app/components/display/ModuleGraph.vue")['default']
  DisplayModuleId: typeof import("../../app/components/display/ModuleId.vue")['default']
  DisplayPluginName: typeof import("../../app/components/display/PluginName.vue")['default']
  DisplayTreeNode: typeof import("../../app/components/display/TreeNode.vue")['default']
  FlowmapExpandable: typeof import("../../app/components/flowmap/Expandable.vue")['default']
  FlowmapNode: typeof import("../../app/components/flowmap/Node.vue")['default']
  LogsFilterToggles: typeof import("../../app/components/logs/FilterToggles.vue")['default']
  LogsHashBadge: typeof import("../../app/components/logs/HashBadge.vue")['default']
  LogsLogItem: typeof import("../../app/components/logs/LogItem.vue")['default']
  LogsLogItemConstants: typeof import("../../app/components/logs/LogItemConstants")['default']
  ModulesDetailedList: typeof import("../../app/components/modules/DetailedList.vue")['default']
  ModulesFlatList: typeof import("../../app/components/modules/FlatList.vue")['default']
  ModulesFolder: typeof import("../../app/components/modules/Folder.vue")['default']
  ModulesGraph: typeof import("../../app/components/modules/Graph.vue")['default']
  PackagesDuplicated: typeof import("../../app/components/packages/Duplicated.vue")['default']
  PackagesTable: typeof import("../../app/components/packages/Table.vue")['default']
  PluginsFlatList: typeof import("../../app/components/plugins/FlatList.vue")['default']
  DataVirtualList: typeof import("../../../../ui/src/components/DataVirtualList.vue")['default']
  DisplayBadge: typeof import("../../../../ui/src/components/DisplayBadge.vue")['default']
  DisplayCloseButton: typeof import("../../../../ui/src/components/DisplayCloseButton.vue")['default']
  DisplayDuration: typeof import("../../../../ui/src/components/DisplayDuration.vue")['default']
  DisplayIconButton: typeof import("../../../../ui/src/components/DisplayIconButton.vue")['default']
  DisplayNumberBadge: typeof import("../../../../ui/src/components/DisplayNumberBadge.vue")['default']
  DisplayNumberWithUnit: typeof import("../../../../ui/src/components/DisplayNumberWithUnit.vue")['default']
  DisplayTimestamp: typeof import("../../../../ui/src/components/DisplayTimestamp.vue")['default']
  PanelSideNav: typeof import("../../../../ui/src/components/PanelSideNav.vue")['default']
  VisualLoading: typeof import("../../../../ui/src/components/VisualLoading.vue")['default']
  VisualLogoBanner: typeof import("../../../../ui/src/components/VisualLogoBanner.vue")['default']
  UnoIcon: typeof import("../../../../../node_modules/.pnpm/@unocss+nuxt@66.6.6_magicast@0.5.2_vite@7.3.1_@types+node@22.19.15_jiti@2.6.1_sass-embe_38555a02e3129a601c8a381647bc84f8/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']
  NuxtWelcome: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAssetsFlamegraph: LazyComponent<typeof import("../../app/components/assets/Flamegraph.vue")['default']>
  LazyAssetsFolder: LazyComponent<typeof import("../../app/components/assets/Folder.vue")['default']>
  LazyAssetsList: LazyComponent<typeof import("../../app/components/assets/List.vue")['default']>
  LazyAssetsSunburst: LazyComponent<typeof import("../../app/components/assets/Sunburst.vue")['default']>
  LazyChartNavBreadcrumb: LazyComponent<typeof import("../../app/components/chart/NavBreadcrumb.vue")['default']>
  LazyChartTreemap: LazyComponent<typeof import("../../app/components/chart/Treemap.vue")['default']>
  LazyChunksFlamegraph: LazyComponent<typeof import("../../app/components/chunks/Flamegraph.vue")['default']>
  LazyChunksFlatList: LazyComponent<typeof import("../../app/components/chunks/FlatList.vue")['default']>
  LazyChunksGraph: LazyComponent<typeof import("../../app/components/chunks/Graph.vue")['default']>
  LazyChunksSunburst: LazyComponent<typeof import("../../app/components/chunks/Sunburst.vue")['default']>
  LazyCodeDiffEditor: LazyComponent<typeof import("../../app/components/code/DiffEditor.vue")['default']>
  LazyCodeViewer: LazyComponent<typeof import("../../app/components/code/Viewer.vue")['default']>
  LazyCompareMetricCard: LazyComponent<typeof import("../../app/components/compare/MetricCard.vue")['default']>
  LazyCompareSessionMeta: LazyComponent<typeof import("../../app/components/compare/SessionMeta.vue")['default']>
  LazyDataAssetDetailsLoader: LazyComponent<typeof import("../../app/components/data/AssetDetailsLoader.vue")['default']>
  LazyDataChunkDetailsLoader: LazyComponent<typeof import("../../app/components/data/ChunkDetailsLoader.vue")['default']>
  LazyDataEntryDetailsLoader: LazyComponent<typeof import("../../app/components/data/EntryDetailsLoader.vue")['default']>
  LazyDataModuleDetailsLoader: LazyComponent<typeof import("../../app/components/data/ModuleDetailsLoader.vue")['default']>
  LazyDataPackageDetailsLoader: LazyComponent<typeof import("../../app/components/data/PackageDetailsLoader.vue")['default']>
  LazyDataPathSelector: LazyComponent<typeof import("../../app/components/data/PathSelector.vue")['default']>
  LazyDataPluginDetailsLoader: LazyComponent<typeof import("../../app/components/data/PluginDetailsLoader.vue")['default']>
  LazyDataSearchPanel: LazyComponent<typeof import("../../app/components/data/SearchPanel.vue")['default']>
  LazyDisplayCodeViewer: LazyComponent<typeof import("../../app/components/display/CodeViewer.vue")['default']>
  LazyDisplayFileIcon: LazyComponent<typeof import("../../app/components/display/FileIcon.vue")['default']>
  LazyDisplayFileSizeBadge: LazyComponent<typeof import("../../app/components/display/FileSizeBadge.vue")['default']>
  LazyDisplayGraphHoverView: LazyComponent<typeof import("../../app/components/display/GraphHoverView.vue")['default']>
  LazyDisplayHighlightedPackageName: LazyComponent<typeof import("../../app/components/display/HighlightedPackageName")['default']>
  LazyDisplayHighlightedPath: LazyComponent<typeof import("../../app/components/display/HighlightedPath")['default']>
  LazyDisplayModuleGraph: LazyComponent<typeof import("../../app/components/display/ModuleGraph.vue")['default']>
  LazyDisplayModuleId: LazyComponent<typeof import("../../app/components/display/ModuleId.vue")['default']>
  LazyDisplayPluginName: LazyComponent<typeof import("../../app/components/display/PluginName.vue")['default']>
  LazyDisplayTreeNode: LazyComponent<typeof import("../../app/components/display/TreeNode.vue")['default']>
  LazyFlowmapExpandable: LazyComponent<typeof import("../../app/components/flowmap/Expandable.vue")['default']>
  LazyFlowmapNode: LazyComponent<typeof import("../../app/components/flowmap/Node.vue")['default']>
  LazyLogsFilterToggles: LazyComponent<typeof import("../../app/components/logs/FilterToggles.vue")['default']>
  LazyLogsHashBadge: LazyComponent<typeof import("../../app/components/logs/HashBadge.vue")['default']>
  LazyLogsLogItem: LazyComponent<typeof import("../../app/components/logs/LogItem.vue")['default']>
  LazyLogsLogItemConstants: LazyComponent<typeof import("../../app/components/logs/LogItemConstants")['default']>
  LazyModulesDetailedList: LazyComponent<typeof import("../../app/components/modules/DetailedList.vue")['default']>
  LazyModulesFlatList: LazyComponent<typeof import("../../app/components/modules/FlatList.vue")['default']>
  LazyModulesFolder: LazyComponent<typeof import("../../app/components/modules/Folder.vue")['default']>
  LazyModulesGraph: LazyComponent<typeof import("../../app/components/modules/Graph.vue")['default']>
  LazyPackagesDuplicated: LazyComponent<typeof import("../../app/components/packages/Duplicated.vue")['default']>
  LazyPackagesTable: LazyComponent<typeof import("../../app/components/packages/Table.vue")['default']>
  LazyPluginsFlatList: LazyComponent<typeof import("../../app/components/plugins/FlatList.vue")['default']>
  LazyDataVirtualList: LazyComponent<typeof import("../../../../ui/src/components/DataVirtualList.vue")['default']>
  LazyDisplayBadge: LazyComponent<typeof import("../../../../ui/src/components/DisplayBadge.vue")['default']>
  LazyDisplayCloseButton: LazyComponent<typeof import("../../../../ui/src/components/DisplayCloseButton.vue")['default']>
  LazyDisplayDuration: LazyComponent<typeof import("../../../../ui/src/components/DisplayDuration.vue")['default']>
  LazyDisplayIconButton: LazyComponent<typeof import("../../../../ui/src/components/DisplayIconButton.vue")['default']>
  LazyDisplayNumberBadge: LazyComponent<typeof import("../../../../ui/src/components/DisplayNumberBadge.vue")['default']>
  LazyDisplayNumberWithUnit: LazyComponent<typeof import("../../../../ui/src/components/DisplayNumberWithUnit.vue")['default']>
  LazyDisplayTimestamp: LazyComponent<typeof import("../../../../ui/src/components/DisplayTimestamp.vue")['default']>
  LazyPanelSideNav: LazyComponent<typeof import("../../../../ui/src/components/PanelSideNav.vue")['default']>
  LazyVisualLoading: LazyComponent<typeof import("../../../../ui/src/components/VisualLoading.vue")['default']>
  LazyVisualLogoBanner: LazyComponent<typeof import("../../../../ui/src/components/VisualLogoBanner.vue")['default']>
  LazyUnoIcon: LazyComponent<typeof import("../../../../../node_modules/.pnpm/@unocss+nuxt@66.6.6_magicast@0.5.2_vite@7.3.1_@types+node@22.19.15_jiti@2.6.1_sass-embe_38555a02e3129a601c8a381647bc84f8/node_modules/@unocss/nuxt/runtime/UnoIcon.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../../../../node_modules/.pnpm/nuxt@3.21.2_@parcel+watcher@2.5.6_@types+node@22.19.15_@vue+compiler-sfc@3.5.30_cac@6.7_f9c807d48227f8d295d539446a7f18c8/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}

export interface EventEmitter<Events extends Record<string, (...args: any[]) => void>> {
  on<K extends keyof Events>(event: K, handler: Events[K]): void
  off<K extends keyof Events>(event: K, handler: Events[K]): void
  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void
}

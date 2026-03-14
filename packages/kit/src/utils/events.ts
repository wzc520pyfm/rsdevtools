import type { EventEmitter } from '../types/events'

export function createEventEmitter<
  Events extends Record<string, (...args: any[]) => void>,
>(): EventEmitter<Events> {
  const listeners = new Map<keyof Events, Set<(...args: any[]) => void>>()

  return {
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set())
      }
      listeners.get(event)!.add(handler)
    },
    off(event, handler) {
      listeners.get(event)?.delete(handler)
    },
    emit(event, ...args) {
      listeners.get(event)?.forEach((handler) => {
        try {
          handler(...args)
        }
        catch (e) {
          console.error(`[DevTools EventEmitter] Error in handler for "${String(event)}":`, e)
        }
      })
    },
  }
}

export type { EventEmitter }

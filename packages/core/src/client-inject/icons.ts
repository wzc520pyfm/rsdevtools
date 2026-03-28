type IconRenderer = (size: number) => string

function resolveDockIconSrc(icon: string, assetBaseUrl?: string): string | null {
  if (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:'))
    return icon
  if (assetBaseUrl && icon.startsWith('/'))
    return `${assetBaseUrl.replace(/\/$/, '')}${icon}`
  return null
}

const builtinIcons: Record<string, IconRenderer> = {
  'ph:lightning-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>`,
  'ph:folder-open-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="currentColor" opacity="0.85"/></svg>`,
  'ph:terminal-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="18" rx="2" fill="currentColor" opacity="0.15"/><path d="M6 16l4-4-4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16h6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  'ph:notification-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  'ph:gear-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  'ph:arrow-square-out-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  'ph:stethoscope-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><circle cx="17" cy="14" r="3" fill="currentColor" opacity="0.3"/><path d="M4.8 2.3A.3.3 0 005 2h2a.3.3 0 01.3.3V7a4 4 0 01-8 0V2.3A.3.3 0 014.8 2M14 11V9a2 2 0 00-2-2H8a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="14" r="3" stroke="currentColor" stroke-width="1.5"/></svg>`,
  'ph:chart-bar-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" opacity="0.6"/><rect x="10" y="7" width="4" height="14" rx="1" fill="currentColor" opacity="0.8"/><rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor"/></svg>`,
  'ph:puzzle-piece-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M20 8h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3H4a2 2 0 00-2 2v6a2 2 0 002 2h3v3a2 2 0 002 2h6a2 2 0 002-2v-3h3a2 2 0 002-2v-6a2 2 0 00-2-2z" fill="currentColor" opacity="0.7"/></svg>`,
  'ph:cursor-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 7-6 2-2 6z" fill="currentColor" opacity="0.7"/></svg>`,
  'ph:code-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'ph:house-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-8 9 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" fill="currentColor" opacity="0.7"/></svg>`,
  'ph:rocket-launch-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" fill="currentColor" opacity="0.3"/><path d="M12 13l-3-3" stroke="currentColor" stroke-width="1.5"/><path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  'ph:pencil-simple-duotone': s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
}

export function renderIcon(iconName: string, size: number = 20, assetBaseUrl?: string): string {
  const src = resolveDockIconSrc(iconName, assetBaseUrl)
  if (src) {
    const esc = src.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    return `<img src="${esc}" alt="" width="${size}" height="${size}" draggable="false" style="display:block;object-fit:contain;pointer-events:none;" />`
  }
  if (builtinIcons[iconName]) return builtinIcons[iconName](size)
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>`
}

export function makeSVG(type: string): string {
  if (type === 'popout') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
  if (type === 'close') return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  if (type === 'rspack-logo') return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="rgl" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#60a5fa"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#rgl)"/></svg>'
  if (type === 'bracket-left') return '<svg width="100%" height="100%" viewBox="0 0 9 20" fill="none"><path d="M4.96 0C1.03 5.63 1 14.35 4.96 20H7.61C3.66 14.35 3.68 5.63 7.61 0H4.96Z" fill="currentColor"/></svg>'
  if (type === 'bracket-right') return '<svg width="100%" height="100%" viewBox="0 0 9 20" fill="none"><path d="M4.25 10H6.9C6.9 6.41 5.91 2.82 3.95 0H1.29C3.26 2.82 4.24 6.41 4.25 10ZM8.94 14.91H6.27C6.47 14.17 6.62 13.41 6.72 12.66H4.07C3.96 13.41 3.81 14.17 3.61 14.91H0.94C0.7 15.82 0.39 16.71 0 17.57H2.67C2.29 18.42 1.82 19.23 1.29 20H3.95C4.48 19.23 4.94 18.42 5.33 17.57H7.99C8.38 16.71 8.69 15.82 8.94 14.91Z" fill="currentColor"/></svg>'
  return ''
}

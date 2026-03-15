export function isJavaScript(name: string): boolean {
  return /\.[jt]sx?$/.test(name)
}

export function isCSS(name: string): boolean {
  return /\.(?:css|s[ac]ss|less|styl)$/.test(name)
}

export function isImage(name: string): boolean {
  return /\.(?:png|jpe?g|gif|svg|webp|ico|bmp|avif)$/i.test(name)
}

export function isFont(name: string): boolean {
  return /\.(?:woff2?|ttf|eot|otf)$/i.test(name)
}

export function isSourceMap(name: string): boolean {
  return /\.map$/.test(name)
}

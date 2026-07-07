const localAssetModules = import.meta.glob<string>('../assets/*.{avif,gif,jpeg,jpg,png,svg,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const localAssetUrls = new Map(
  Object.entries(localAssetModules).map(([path, url]) => [path.split('/').pop() ?? path, url]),
)

function isExternalUrl(value: string) {
  return /^(https?:)?\/\//.test(value) || value.startsWith('data:')
}

export function resolveAssetUrl(value?: string) {
  if (!value) {
    return undefined
  }

  if (isExternalUrl(value)) {
    return value
  }

  const filename = value.split(/[?#]/)[0]?.split('/').pop()

  if (filename && localAssetUrls.has(filename)) {
    return localAssetUrls.get(filename)
  }

  return value
}

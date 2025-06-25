let _loading: Promise<void> | null = null

export const loadGoogleMaps = (apiKey: string): Promise<void> => {
  if (_loading) return _loading
  if (window.google?.maps) return Promise.resolve()

  _loading = new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    tag.async = true; tag.defer = true
    tag.onload = () => resolve()
    tag.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.append(tag)
  })

  return _loading
}

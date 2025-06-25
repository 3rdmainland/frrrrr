// services/placesService.ts

/**
 * Autocomplete via the v1 REST endpoint
 */
export async function getPredictions(
  input: string,
): Promise<{ placeId: string; description: string }[]> {
  if (!input || input.length < 2) return []

  const body = {
    input,
    locationBias: {
      circle: {
        center: { latitude: -26.2041, longitude: 28.0473 },
        radius: 50000,
      },
    },
  }

  const res = await fetch(
    `https://places.googleapis.com/v1/places:autocomplete?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) throw new Error(`Autocomplete error: ${res.statusText}`)
  const json = await res.json() as any

  return (json.suggestions || []).map((s: any) => {
    // build a user‐friendly description
    const main = s.placePrediction.structuredFormat.mainText.text
    const sec  = s.placePrediction.structuredFormat.secondaryText.text
    return {
      placeId:     s.placePrediction.placeId,
      description: `${main}, ${sec}`,
    }
  })
}

/**
 * Interface for the formatted address response
 */
export interface FormattedAddress {
  id: string
  name: string
  latitude: number
  longitude: number
  formattedAddress: string
  street: string
  streetNumber: string | null
  city: string
  postalCode: string
  country: string
  building: string | null
  instructions: string | null
}

/**
 * Place Details via the v1 REST endpoint - returns formatted address
 */
export async function getPlaceDetails(
  placeId: string,
): Promise<FormattedAddress> {
  const url = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
  )
  url.searchParams.set('key', import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  url.searchParams.set('fields', 'id,displayName,formattedAddress,location,postalAddress,addressComponents')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Place Details error: ${res.statusText}`)
  const json = await res.json() as any

  console.log('Google Places API response:', json)

  // Extract address components
  const addressComponents = json.addressComponents || []

  // Helper function to find specific address component
  const findComponent = (types: string[]) => {
    return addressComponents.find((comp: any) =>
      types.some((type: string) => comp.types.includes(type))
    )
  }

  // Extract individual components
  const streetNumberComp = findComponent(['street_number'])
  const streetNameComp = findComponent(['route'])
  const cityComp = findComponent(['locality', 'administrative_area_level_1'])
  const postalCodeComp = findComponent(['postal_code'])
  const countryComp = findComponent(['country'])
  const premiseComp = findComponent(['premise', 'subpremise'])

  // Build street name (combine street number and route if available)
  let street = ''
  let streetNumber: string | null = null

  if (streetNumberComp && streetNameComp) {
    streetNumber = streetNumberComp.longText
    street = streetNameComp.longText
  } else if (streetNameComp) {
    street = streetNameComp.longText
  } else if (streetNumberComp) {
    street = streetNumberComp.longText
  }

  // Use displayName as fallback for street if no route found
  if (!street && json.displayName?.text) {
    street = json.displayName.text
  }

  return {
    id: json.id || placeId,
    name: json.displayName?.text || street || 'Unknown Location',
    latitude: json.location?.latitude || 0,
    longitude: json.location?.longitude || 0,
    formattedAddress: json.formattedAddress || '',
    street: street,
    streetNumber: streetNumber,
    city: cityComp?.longText || '',
    postalCode: postalCodeComp?.longText || '',
    country: countryComp?.longText || '',
    building: premiseComp?.longText || null,
    instructions: null
  }
}

/**
 * Geocode free‐text address and return formatted address
 */
export async function geocodeAddress(
  address: string,
): Promise<FormattedAddress> {
  const geo = new google.maps.Geocoder()
  const [res] = await new Promise<google.maps.GeocoderResult[]>((res, rej) =>
    geo.geocode({ address }, (r, st) =>
      st === 'OK' && r ? res(r) : rej(new Error('Geocode failed')),
    ),
  )

  // Parse geocoder result into our format
  const addressComponents = res.address_components || []

  const findComponent = (types: string[]) => {
    return addressComponents.find((comp: any) =>
      types.some((type: string) => comp.types.includes(type))
    )
  }

  const streetNumberComp = findComponent(['street_number'])
  const streetNameComp = findComponent(['route'])
  const cityComp = findComponent(['locality', 'administrative_area_level_1'])
  const postalCodeComp = findComponent(['postal_code'])
  const countryComp = findComponent(['country'])
  const premiseComp = findComponent(['premise', 'subpremise'])

  let street = ''
  let streetNumber: string | null = null

  if (streetNumberComp && streetNameComp) {
    streetNumber = streetNumberComp.long_name
    street = streetNameComp.long_name
  } else if (streetNameComp) {
    street = streetNameComp.long_name
  } else if (streetNumberComp) {
    street = streetNumberComp.long_name
  }

  return {
    id: '', // Generate ID elsewhere or use a UUID library
    name: street || 'Unknown Location',
    latitude: res.geometry.location.lat(),
    longitude: res.geometry.location.lng(),
    formattedAddress: res.formatted_address!,
    street: street,
    streetNumber: streetNumber,
    city: cityComp?.long_name || '',
    postalCode: postalCodeComp?.long_name || '',
    country: countryComp?.long_name || '',
    building: premiseComp?.long_name || null,
    instructions: null
  }
}

/**
 * Reverse‐geocode lat/lng to formatted address
 */
export async function reverseGeocode(
  loc: google.maps.LatLngLiteral
): Promise<FormattedAddress> {
  const geo = new google.maps.Geocoder()
  const [res] = await new Promise<google.maps.GeocoderResult[]>((res, rej) =>
    geo.geocode({ location: loc }, (r, st) =>
      st === 'OK' && r ? res(r) : rej(new Error('Reverse geocode failed')),
    ),
  )

  // Parse geocoder result into our format
  const addressComponents = res.address_components || []

  const findComponent = (types: string[]) => {
    return addressComponents.find((comp: any) =>
      types.some((type: string) => comp.types.includes(type))
    )
  }

  const streetNumberComp = findComponent(['street_number'])
  const streetNameComp = findComponent(['route'])
  const cityComp = findComponent(['locality', 'administrative_area_level_1'])
  const postalCodeComp = findComponent(['postal_code'])
  const countryComp = findComponent(['country'])
  const premiseComp = findComponent(['premise', 'subpremise'])

  let street = ''
  let streetNumber: string | null = null

  if (streetNumberComp && streetNameComp) {
    streetNumber = streetNumberComp.long_name
    street = streetNameComp.long_name
  } else if (streetNameComp) {
    street = streetNameComp.long_name
  } else if (streetNumberComp) {
    street = streetNumberComp.long_name
  }

  return {
    id: '', // Generate ID elsewhere or use a UUID library
    name: street || 'Unknown Location',
    latitude: loc.lat,
    longitude: loc.lng,
    formattedAddress: res.formatted_address!,
    street: street,
    streetNumber: streetNumber,
    city: cityComp?.long_name || '',
    postalCode: postalCodeComp?.long_name || '',
    country: countryComp?.long_name || '',
    building: premiseComp?.long_name || null,
    instructions: null
  }
}

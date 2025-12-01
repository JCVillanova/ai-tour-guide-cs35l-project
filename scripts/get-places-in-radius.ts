/**
 * React Native / browser-friendly Places Nearby Search using fetch.
 * Use this in the client (Expo/React Native). For production hide the API key
 * behind a server proxy — do NOT embed unrestricted keys in app builds.
 */
type PlaceResult = any;

export async function GetPlacesInRadius(lat: number, lng: number, radius: number, apiKey?: string): Promise<PlaceResult[]> {
  const key = apiKey || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('Missing Google Maps API key (pass as 4th arg or set GOOGLE_MAPS_API_KEY)');

  const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const params = (pagetoken?: string) => {
    const p = new URLSearchParams({
      key,
      location: `${lat},${lng}`,
      radius: String(radius),
    });
    if (pagetoken) p.append('pagetoken', pagetoken);
    return p.toString();
  };

  const results: PlaceResult[] = [];

  const url1 = `${base}?${params()}`;
  const r1 = await fetch(url1);
  if (!r1.ok) {
    throw new Error(`Places API HTTP error: ${r1.status} ${r1.statusText}`);
  }
  const d1 = await r1.json();
  if (d1.status && d1.status !== 'OK' && d1.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${d1.status} ${d1.error_message ?? ''}`.trim());
  }
  if (d1.status === 'ZERO_RESULTS') return [];

  results.push(...(d1.results || []));
  let nextPageToken: string | undefined = d1.next_page_token;

  // follow pagination (if any). API requires a brief delay before next_page_token becomes valid
  for (let i = 0; i < 2 && nextPageToken; i++) {
    await new Promise((res) => setTimeout(res, 2000));
    const rn = await fetch(`${base}?${params(nextPageToken)}`);
    if (!rn.ok) break;
    const dn = await rn.json();
    if (dn.status && dn.status !== 'OK' && dn.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error (page): ${dn.status} ${dn.error_message ?? ''}`.trim());
    }
    if (dn.status === 'ZERO_RESULTS') break;
    results.push(...(dn.results || []));
    nextPageToken = dn.next_page_token;
  }

  return results;
}
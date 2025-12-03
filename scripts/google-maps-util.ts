/**
 * React Native / browser-friendly Places Nearby Search using fetch.
 * Use this in the client (Expo/React Native). For production hide the API key
 * behind a server proxy — do NOT embed unrestricted keys in app builds.
 */
type PlaceResult = any;

let map: google.maps.Map;
let markers = {};
let infoWindow;

async function initMap() {
  const { Map, InfoWindow } = await (google as any).maps.importLibrary("maps") as google.maps.MapsLibrary;

    const center = { lat: 37.4161493, lng: -122.0812166 };
    map = new Map(document.getElementById('map') as HTMLElement, {
        center: center,
        zoom: 11,
        mapTypeControl: false,
        mapId: 'DEMO_MAP_ID',
    });

    const textInput = document.getElementById('text-input') as HTMLInputElement;
    const textInputButton = document.getElementById('text-input-button') as HTMLButtonElement;
    const card = document.getElementById('text-input-card') as HTMLElement;
    map.controls[(google as any).maps.ControlPosition.TOP_LEFT].push(card);

    textInputButton.addEventListener('click', () => {
        SearchWithText(textInput.value);
    });

    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            SearchWithText(textInput.value);
        }
    });

    infoWindow = new (google as any).maps.InfoWindow();
}

export async function SearchWithText(query: string) {
  // If running in a browser with the Maps JS API and map is initialized, use the client-side PlacesService.
  if (typeof google !== 'undefined' && (google as any).maps && map) {
    const placesService: any = (google as any).maps.places ? new (google as any).maps.places.PlacesService(map) : null;
    if (placesService) {
      const request: any = {
        query,
        fields: ['name', 'geometry', 'business_status', 'formatted_address', 'vicinity'],
        locationBias: map.getCenter(),
      };

      const results: any[] = await new Promise((resolve) => {
        placesService.findPlaceFromQuery(request, (res: any, status: any) => {
          if (status === (google as any).maps.places.PlacesServiceStatus.OK) {
            resolve(res || []);
          } else {
            resolve([]);
          }
        });
      });

      return results;
    }
  }

  // Fallback: use Places Text Search REST API (works in React Native)
  const apiKey = "AIzaSyBPrqOHzkkW6mZOOjeiId-krDVF0lygy1A";
  if (!apiKey) throw new Error('Missing GOOGLE_MAPS_API_KEY for REST fallback');

  const base = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const params = new URLSearchParams({ key: apiKey, query });
  try {
    if (map && typeof map.getCenter === 'function') {
      const c: any = map.getCenter();
      if (c && typeof c.lat === 'function') {
        params.set('location', `${c.lat()},${c.lng()}`);
      } else if (c && c.lat != null) {
        params.set('location', `${c.lat},${c.lng}`);
      }
    }
  } catch (e) {
    // ignore
  }

  const url = `${base}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Places TextSearch HTTP error: ${res.status}`);
  const data = await res.json();
  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places TextSearch error: ${data.status} ${data.error_message || ''}`);
  }
  return data.results || [];
}

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

// Only initialize the web map when running in a browser environment with the Maps JS API loaded.
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof google !== 'undefined' && (google as any).maps && (google as any).maps.importLibrary) {
  initMap().catch((err) => console.error('initMap failed:', err));
} else {
  console.warn('Google Maps JS API not available in this runtime; skipping initMap (likely running in React Native).');
}

/*******************************************
EXTENSIVE LLM PROMPTING USED IN THIS FILE:

GitHub Copilot used. Prompt:
Consider my function for GetPlacesInRadius, why isn't it working? How can I get the file to recognize my Google Maps API calls?

Response:
I'll add a short todo list and then inspect your get-places-in-radius.ts to find why the Places calls aren't recognized. I'll check for missing imports, environment variables, and runtime issues.

Created 3 todos

Read [](file:///home/joshuacvillanova/repos/ai-tour-guide/scripts/get-places-in-radius.ts)

I'm going to replace the broken implementation with a Node-friendly async function that calls the Places Nearby Search REST API using `fetch`, reads `process.env.GOOGLE_MAPS_API_KEY`, handles pagination (next_page_token), and exports the function. If you prefer using an installed HTTP client or the official Node client, I can switch it.

Using "Apply Patch"


```

```


Checked [](file:///home/joshuacvillanova/repos/ai-tour-guide/scripts/get-places-in-radius.ts), no problems found

Completed: *Inspect `get-places-in-radius.ts`* (1/3)

Progress update
- I inspected get-places-in-radius.ts, found multiple issues (bad TypeScript syntax, use of browser-only Google Maps JS API, missing async/await usage), and replaced it with a Node-friendly implementation that calls the Google Places Nearby Search REST API using `fetch` and `process.env.GOOGLE_MAPS_API_KEY`. I also added pagination handling for `next_page_token`.

Why your original function failed
- Syntax problems: `type LatLng { ... }` is invalid — it should be `type LatLng = { ... }`.
- Missing `async`: you used `await` at top level of a non-async function.
- Wrong runtime API: `google.maps.importLibrary('places')` is part of the browser-side Google Maps JS API (or the new modular web JS API). That `google` object isn't available inside a Node script — so the imports and methods you used won't be found when running the script with Node.
- No API key handling: the script didn't read an API key or make REST calls.

What I changed
- Added a correct `LatLng` type.
- Implemented `GetPlacesInRadius(center, radius)` as an async function that:
  - Reads `GOOGLE_MAPS_API_KEY` from `process.env`.
  - Calls the Places Nearby Search REST endpoint.
  - Collects results and follows `next_page_token` (with the required ~2s delay) for up to two extra pages.
  - Returns the combined results array.

How to make the new file work in your environment
- Ensure Node has a global `fetch`. Node 18+ provides it natively. If your environment uses an older Node version, either upgrade or install `node-fetch` and add an import:
  - Install: `npm install node-fetch`
  - Add at top: `import fetch from 'node-fetch';` (and update TypeScript types if needed)
- Set the API key in your environment before running the script:
  - Linux/macOS: `export GOOGLE_MAPS_API_KEY='YOUR_KEY'`
  - Or add to your `.env` and load with a package like `dotenv`.
- Run the script (example):
  - If the script is meant to be run with ts-node: `npx ts-node scripts/get-places-in-radius.ts` (you'll need to add a small runner or call the exported function from another script).
  - Or compile it and run with node.

Security note
- Avoid committing API keys. Prefer using environment variables or a server-side proxy that hides the key from clients.

Optional next steps I can do for you
- Add an example CLI runner (e.g., `scripts/run-get-places.ts`) that imports the function and logs sample output for a test coordinate.
- Add `node-fetch` to package.json and a small README snippet showing how to run it.
- Integrate the same logic directly into your `explore.tsx` (client-side) but with the caution about shipping API keys — recommend using a server proxy if you want to call Places from the mobile app.

Which next step would you like? Add a small runner and example command, or wire a secure proxy?

Made changes.
*******************************************/
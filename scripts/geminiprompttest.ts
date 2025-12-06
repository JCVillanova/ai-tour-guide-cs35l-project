import { GEMINI_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';
// import Config from 'react-native-config';
//import dotenv from 'react-native-dotenv';
//require('react-native-dotenv').config({path: '../.env'})
//dotenv.config({ path: findConfig('.env') });
//import { GEMINI_KEY } from '@env';

const apiKey = GEMINI_KEY;

if (!apiKey) {
  console.error("GEMINI_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Keep track of which specific sites have already been used
const usedSites = new Set<string>();
export function clearSites(){
  usedSites.clear();
}
export async function warmGemini(){
  const warm = await model.generateContent("send me only the word hello");
  return warm;
}
export async function getGeminiResponse(places: any) {
  // Turn our usedSites into a readable list for the prompt
  const usedSitesList = Array.from(usedSites);
  const usedSitesText =
    usedSitesList.length > 0
      ? usedSitesList.join(', ')
      : 'none yet';
  console.log("used sites: " + usedSitesText);
  const prompt = `
You are generating narration for a walking tour.

You will be given a numbered list of nearby places (one per line). Your job:

- Only consider entries that are specific physical sites such as buildings, landmarks, museums, statues, parks, or other concrete locations a person can stand in front of.
- Completely ignore general areas, neighborhoods, districts, or cities (examples to ignore: "Westwood", "Los Angeles", "Downtown", etc.).
- From the remaining physical sites, choose exactly ONE location: the single most historically or culturally important site that has NOT already been covered in this tour.
- These locations have ALREADY been covered and must NOT be chosen again: ${usedSitesText}.

Output format (very strict):

1. First line: the exact name of the chosen place, matching how it appears in the list as closely as possible.
2. Second line: a single very short blurb (1–3 sentences, at most about 60 words) with interesting tour-guide-style information about that site only.

Do NOT mention any other places. Focus only on this one chosen site.

If there is no suitable NEW physical site in the list
(because all are non-physical, too generic, or already used),
reply with exactly:
NO_NEW_SITE

Now here is the list of nearby places:

${places}
`.trim();

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  console.log("Gemini raw response:\n", rawText);

  // If Gemini reports no new site, return empty string so nothing new is spoken/printed
  if (rawText === "NO_NEW_SITE") {
    return "";
  }
  

  // Expect first line = place name, second line = blurb
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) {
    return "";
  }

  const placeName = lines[0];
  const blurb = lines.slice(1).join(' ').trim();

  if (usedSites.has(placeName)) {
    return "";
  }
  if (placeName && !usedSites.has(placeName)) {
    usedSites.add(placeName);
  }
  console.log("place name: " + placeName);

  // What the UI / TTS actually gets
  const finalText = blurb
    ? `${placeName}: ${blurb}`
    : placeName;

  console.log("Gemini (processed):\n", finalText);

  return finalText;
}


export async function generateTour(places: any) {
  // Turn our usedSites into a readable list for the prompt
  const prompt = `
System Role: You are an expert road trip companion and local historian. Your goal is to curate a list of raw location data into an engaging driving tour.

Input Data: I will provide a list of locations (longitude and latitude) derived from the Google Maps API. These locations are spaced out and intended for a driving route.

Your Task:

Analyze & Filter: Review the specific locations from the list and select only those that are worth a driver's attention.

KEEP: Scenic overlooks, major historical landmarks visible from the road, "World's Largest" roadside attractions, historic districts, quirky local diners/dives (famous ones), and natural wonders.

DISCARD: Places that require walking deep into a pedestrian-only zone to see, generic businesses, standard strip malls, and locations where parking is notoriously impossible (unless the drive-by view is spectacular).

Categorize by Visit Type: For each kept location, determine if it is a "Drive-By" (visible from the car, no stop needed) or a "Stop" (requires parking and getting out to appreciate).

There is no need to bold text with **

Formatting Instructions (Crucial):

You must separate the complete description block for each location from the next location's block using a string of "===================="s.

There is no need to put a string of "====================" at the end of the last location generated

The output must be formatted to clearly present the details of one location, followed by the separator, then the next location, and so on.

Now here is the list of the coordinates of places along the route:

${JSON.stringify(places, null, 2)}
`.trim();

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  console.log("Gemini raw response:\n", rawText);

  // If Gemini reports no new site, return empty string so nothing new is spoken/printed
  if (rawText === "NO_NEW_SITE") {
    return "";
  }
  

  // Expect first line = place name, second line = blurb
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length === 0) {
    return "";
  }

  const placeName = lines[0];
  const blurb = lines.slice(1).join(' ').trim();

  console.log("place name: " + placeName);

  // What the UI / TTS actually gets
  const finalText = blurb
    ? `${placeName}: ${blurb}`
    : placeName;

  console.log("Gemini (processed):\n", finalText);

  return finalText;
}

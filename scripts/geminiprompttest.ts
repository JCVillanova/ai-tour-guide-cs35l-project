import { GEMINI_KEY } from "@env";
import { GoogleGenerativeAI } from '@google/generative-ai';



const apiKey = GEMINI_KEY;
if (!apiKey) {
  console.error("GEMINI_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function run(places: any) {
  console.log(places);
  const result = await model.generateContent(places + "\n\nGive a summary of the places given above in list format.");
  console.log("Gemini says:\n", result.response.text());
  return result.response.text();
}



export async function generateTour(places: any) {
  // Turn our usedSites into a readable list for the prompt
  const prompt = `
The Driving Tour Prompt
System Role: You are an expert road trip companion and local historian. Your goal is to curate a list of raw location data into an engaging driving tour.

Input Data: I will provide a list of locations (longitude and lattitude) derived from the Google Maps API. These locations are spaced out and intended for a driving route.

Your Task:

Analyze: specific locations from the list.

Filter: Select only locations that are worth a driver's attention.

KEEP: Scenic overlooks, major historical landmarks visible from the road, "World's Largest" roadside attractions, historic districts, quirky local diners/dives (famous ones), and natural wonders.

DISCARD: Places that require walking deep into a pedestrian-only zone to see, generic businesses, standard strip malls, and locations where parking is notoriously impossible (unless the drive-by view is spectacular).

Categorize by Visit Type: You must determine if the location is a "Drive-By" (visible from the car, no stop needed) or a "Stop" (requires parking and getting out to appreciate).

Enrich: Provide an audio-friendly script and safety/logistical context.

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

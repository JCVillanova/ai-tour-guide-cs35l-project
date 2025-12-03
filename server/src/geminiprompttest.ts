// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// import Config from 'react-native-config';
//import dotenv from 'react-native-dotenv';
//require('react-native-dotenv').config({path: '../.env'})
//dotenv.config({ path: findConfig('.env') });
//import { GEMINI_KEY } from '@env';

dotenv.config({ path: path.resolve(__dirname, ".env") });
const apiKey: string | undefined = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const usedSites = new Set<string>();

export async function run(places: any) {
  const usedSitesList = Array.from(usedSites);
  const usedSitesText =
    usedSitesList.length > 0 ? usedSitesList.join(", ") : "none yet";

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

  if (rawText === "NO_NEW_SITE") {
    return "";
  }

  const lines = rawText
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);

  if (lines.length === 0) {
    return "";
  }

  const placeName = lines[0];
  const blurb = lines.slice(1).join(" ").trim();

  if (placeName && !usedSites.has(placeName)) {
    usedSites.add(placeName);
  }

  const finalText = blurb ? `${placeName}: ${blurb}` : placeName;

  console.log("Gemini (processed):\n", finalText);

  return finalText;
}

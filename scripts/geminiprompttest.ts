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
  const result = await model.generateContent(places + "\n\nGive a summary of the places given above in list format.");
  console.log("Gemini says:\n", result.response.text());
  return result.response.text();
}
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import findConfig from 'find-config';

dotenv.config({ path: findConfig('.env') });

const apiKey = process.env.GEMINI_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not foun");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  const result = await model.generateContent("Write somethinhg silly");
  console.log("Gemini says:\n", result.response.text());
}

run();

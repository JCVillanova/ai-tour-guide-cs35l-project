import { GoogleGenerativeAI } from '@google/generative-ai';
// import Config from 'react-native-config';
//import dotenv from 'react-native-dotenv';
//require('react-native-dotenv').config({path: '../.env'})
//dotenv.config({ path: findConfig('.env') });
//import { GEMINI_KEY } from '@env';




const apiKey = "DO NOT PUSH THIS";
console.log(apiKey);
if (!apiKey) {
  console.error("GEMINI_KEY not found");
  process.exit(1);
}


console.log(apiKey);


const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function run() {
  const result = await model.generateContent("Write somethinhg silly");
  console.log("Gemini says:\n", result.response.text());
  return result.response.text();


}


run();



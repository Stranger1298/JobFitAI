import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Key:", apiKey ? "Set" : "Missing");

const genAI = new GoogleGenerativeAI(apiKey);
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash success:", await result.response.text());
  } catch (e) { console.error("gemini-1.5-flash failed:", e.message); }
}
test();

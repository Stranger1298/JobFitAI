import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = \https://generativelanguage.googleapis.com/v1beta/models?key=\\;
fetch(apiUrl).then(r=>r.json()).then(d=>console.log(d)).catch(console.error);

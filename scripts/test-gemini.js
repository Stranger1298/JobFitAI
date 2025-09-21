#!/usr/bin/env node

// Simple script to test Gemini API connection
// Run with: npm run test-gemini

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  console.log('Please add your Gemini API key to .env.local');
  process.exit(1);
}

console.log('🔑 API Key found, testing connection...');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testConnection() {
  try {
    const prompt = "Hello, can you respond with 'API connection successful'?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API connection successful!');
    console.log('📝 Response:', text);
  } catch (error) {
    console.error('❌ Gemini API connection failed:');
    console.error(error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Tips:');
      console.log('1. Check if your API key is correct in .env.local');
      console.log('2. Get a new key from: https://makersuite.google.com/app/apikey');
      console.log('3. Make sure the API key has proper permissions');
    }
  }
}

testConnection();
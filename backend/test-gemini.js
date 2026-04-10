import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function test() {
  try {
    const key = process.env.GEMINI_API_KEY;
    console.log("Key extracted:", key ? key.substring(0, 5) + "..." : "missing");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hi');
    console.log("Success! Output:", result.response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();

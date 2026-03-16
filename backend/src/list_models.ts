/**
 * list_models.ts - Utility to list available Gemini models
 * 
 * This is a debugging tool that shows what AI models are available
 * with your Gemini API key.
 * 
 * Run with: npx tsx src/list_models.ts
 * 
 * It prints each model name and what actions it supports.
 * Useful to verify your API key works and see available models.
 */
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const response = await ai.models.list();

for await (const model of response) {
  console.log(model.name, '|', model.supportedActions);
}
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateGeminiResponse(apiKey: string, message: string, modelName: string = "gemini-pro"): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API Key is not provided.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(message);
  const response = await result.response;
  const text = response.text();
  return text;
}

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  version: string;
  id: string; // Added id property
  // Add other properties if needed from the API response
}

export async function fetchGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  if (!apiKey) {
    throw new Error("Gemini API Key is not provided.");
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data = await response.json();
    // Filter for models that support 'generateContent' and are not blocked
    const models = data.models.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent') && 
      !model.name.includes('blocklisted') // Exclude blocklisted models
    ).map((model: any) => ({
      name: model.name.split('/').pop(), // Extract model ID from "models/model-id"
      displayName: model.displayName,
      description: model.description,
      inputTokenLimit: model.inputTokenLimit,
      outputTokenLimit: model.outputTokenLimit,
      version: model.version,
    }));
    return models;
  } catch (error) {
    console.error("Error fetching Gemini models:", error);
    throw error;
  }
}
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, AnalysisResult } from "../types";

// Initialize Gemini
// Note: In a real production app, you should proxy this through a backend to protect the API Key.
// For this demo, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const analyzeASO = async (appData: AppData): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock analysis.");
    return mockAnalysis(appData);
  }

  try {
    const prompt = `
      Analyze the ASO (App Store Optimization) potential for this mobile application based on its metadata.
      
      App Name: ${appData.name}
      Developer: ${appData.developer}
      Category: ${appData.category}
      Description: ${appData.description.substring(0, 500)}...
      Current Rating: ${appData.rating}
      
      Provide a JSON response with:
      1. An ASO score (0-100).
      2. 3 key strengths.
      3. 3 key weaknesses.
      4. 3 actionable suggestions to improve conversion.
      5. A simulated comparison with 3 competitor apps (names and scores).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitorComparison: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return mockAnalysis(appData);
  }
};

const mockAnalysis = (appData: AppData): AnalysisResult => {
  return {
    score: Math.floor(Math.random() * (95 - 70) + 70),
    strengths: ["Strong keyword usage in title", "High quality visual assets", "Positive initial sentiment"],
    weaknesses: ["Description lacks call-to-action", "Screenshots text is too small", "Update frequency is low"],
    suggestions: [
      "Add a video preview to increase engagement",
      "Localize description for LATAM markets",
      "Run A/B tests on the first 3 screenshots"
    ],
    competitorComparison: [
      { name: appData.name, score: 78 },
      { name: "Competitor A", score: 85 },
      { name: "Competitor B", score: 62 },
      { name: "Competitor C", score: 91 }
    ]
  };
};
import { GoogleGenAI, Type } from "@google/genai";
import { AppData, AnalysisResult } from "../types";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeASO = async (appData: AppData): Promise<AnalysisResult> => {
  // Use process.env.API_KEY directly for conditional checks as per guidelines
  if (!process.env.API_KEY) {
    console.warn("No API Key provided. Returning mock analysis.");
    return mockAnalysis(appData);
  }

  try {
    const prompt = `
      Perform a deep-dive ASO (App Store Optimization) audit for the following app:
      
      App Name: ${appData.name}
      Developer: ${appData.developer}
      Category: ${appData.category}
      Current Rating: ${appData.rating}
      Reviews: ${appData.reviews}
      Store: ${appData.store}
      
      Description Excerpt: ${appData.description.substring(0, 800)}...
      
      Tasks:
      1. Calculate an aggregate ASO Score (0-100) based on metadata quality and market standards.
      2. Identify 3 specific strengths in their current listing.
      3. Identify 3 critical weaknesses or missed opportunities.
      4. Provide 3 high-impact, actionable suggestions to improve conversion rates (CRO).
      5. Generate a simulated benchmarking comparison against 3 hypothetical or real top competitors in this niche.
      
      Format the response as strict JSON.
    `;

    // Always use ai.models.generateContent to query GenAI
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class App Store Optimization (ASO) and Mobile Growth strategist. Your advice is data-driven, critical, and used by top-tier app developers to dominate the charts. You must always return valid JSON that matches the required schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "A score from 0 to 100" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 strengths" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 weaknesses" },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 actionable items" },
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
          },
          required: ["score", "strengths", "weaknesses", "suggestions", "competitorComparison"]
        }
      }
    });

    // Directly access the .text property of GenerateContentResponse (not a method)
    if (response.text) {
      return JSON.parse(response.text.trim()) as AnalysisResult;
    }
    throw new Error("Empty response from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return mockAnalysis(appData);
  }
};

const mockAnalysis = (appData: AppData): AnalysisResult => {
  return {
    score: 72,
    strengths: ["Strong keyword density in subtitle", "Icon has high contrast", "App name includes core functionality"],
    weaknesses: ["Screenshot captions are difficult to read", "Description lacks bulleted features", "Poor localization for secondary markets"],
    suggestions: [
      "Implement a 'What's New' section optimized for keywords",
      "A/B test screenshot order to lead with the most unique feature",
      "Add social proof/awards to the first three screenshots"
    ],
    competitorComparison: [
      { name: appData.name, score: 72 },
      { name: "Global Competitor A", score: 88 },
      { name: "Local Challenger B", score: 65 },
      { name: "New Entrant C", score: 45 }
    ]
  };
};
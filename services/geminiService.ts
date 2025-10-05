
import { GoogleGenAI } from "@google/genai";
import { HistoryItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePerformanceReport = async (history: HistoryItem[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }
  
  if (history.length === 0) {
    return "You haven't attempted any problems yet. Complete a few problems to get a report!";
  }

  const prompt = `
    You are a friendly and encouraging math tutor for a student who has been practicing math problems.
    Analyze the following practice history and provide a concise performance report.
    The report should include:
    1. A brief, positive summary of the student's effort.
    2. Identification of their strongest area (e.g., "You're doing great with addition!").
    3. Identification of areas where they could improve, framed constructively (e.g., "It looks like multiplication with larger numbers is a bit tricky. Let's practice that more!").
    4. One or two simple, actionable tips to help them improve.

    Here is the practice history in JSON format:
    ${JSON.stringify(history, null, 2)}

    Please format your response as a simple text string with paragraphs, not JSON or Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "Sorry, there was an error generating your report. Please try again later.";
  }
};

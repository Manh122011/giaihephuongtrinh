import { GoogleGenAI, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiFeedbackForNotes = async (parts: Part[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Please set the API_KEY environment variable.";
  }

  const hasContent = parts.some(part =>
    ('text' in part && part.text.trim() !== '') || 'inlineData' in part
  );

  if (!hasContent) {
    return "Your notepad is empty. Write something or paste an image first!";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: `You are a friendly and encouraging math tutor. The user has provided notes, which may include text and images (like a pasted equation). 
        Please analyze their notes and images, and provide a helpful and concise response in Vietnamese.
        If an image of a math problem is provided, solve it step-by-step.
        Keep your response helpful and easy to understand.`
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating feedback for notes:", error);
    return "Sorry, there was an error getting feedback from Gemini. Please try again later.";
  }
};

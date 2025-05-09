import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

// Safety settings to ensure appropriate content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Generation config for the model
const generationConfig = {
  temperature: 0.4,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

// Convert a file to a GoogleGenerativeAI.Part
export const fileToGenerativePart = async (
  file: File,
  mimeType: string
): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  const base64EncodedContent = await readFileAsBase64(file);
  
  return {
    inlineData: {
      data: base64EncodedContent,
      mimeType,
    },
  };
};

// Helper function to read a file as base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Convert a base64 string to a GoogleGenerativeAI.Part
export const base64ToGenerativePart = (
  base64Data: string,
  mimeType: string
): { inlineData: { data: string; mimeType: string } } => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export { getGeminiClient, safetySettings, generationConfig };

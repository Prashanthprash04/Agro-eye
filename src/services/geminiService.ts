import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzePlantDisease = async (imageBase64: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64,
          },
        },
        {
          text: `Analyze this plant image for diseases. Provide the following in ${language}:
          1. Health Status (Healthy/Diseased)
          2. Disease Name (if any)
          3. Infection Percentage
          4. Traditional (Ayurvedic/Organic) Solutions
          5. Modern (Chemical/Agri-Science) Solutions
          
          Use simple language suitable for a farmer.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthStatus: { type: Type.STRING },
          diseaseName: { type: Type.STRING },
          infectionPercentage: { type: Type.STRING },
          traditionalSolutions: { type: Type.STRING },
          modernSolutions: { type: Type.STRING },
        },
        required: ["healthStatus", "diseaseName", "infectionPercentage", "traditionalSolutions", "modernSolutions"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeSoil = async (imageBase64: string, language: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64,
          },
        },
        {
          text: `Analyze this soil image. Detect the soil type (e.g., Black, Red, Sandy, Loamy) and recommend suitable crops. Provide the response in ${language}.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          soilType: { type: Type.STRING },
          moisturePercentage: { type: Type.STRING, description: "Estimated moisture percentage based on appearance" },
          weatherCondition: { type: Type.STRING, description: "Inferred weather condition suitable for this soil state" },
          recommendedCrops: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["soilType", "moisturePercentage", "weatherCondition", "recommendedCrops"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateSpeech = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const chatWithMitr = async (message: string, language: string, history: any[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are "AI Mitr" (AI Friend), a helpful assistant for farmers. 
      Speak in ${language}. Use very simple words (no jargon). 
      Be encouraging and practical. 
      If the user asks about diseases or soil, guide them to use the specialized tools in the dashboard.`,
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};


import { GoogleGenAI, Type } from "@google/genai";
// FIX: Correcting the import path to be a relative path.
import { Boq, ProductDetails, GroundingSource } from "../types";

// Initialize the Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Define the schema for a single BOQ item, which will be used by the Gemini model to generate a structured JSON response.
const boqItemSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "e.g., Display, Audio, Control" },
    itemDescription: { type: Type.STRING, description: "A detailed description of the item." },
    brand: { type: Type.STRING, description: "The manufacturer of the item." },
    model: { type: Type.STRING, description: "The model number or name of the item." },
    quantity: { type: Type.INTEGER, description: "The number of units required." },
    unitPrice: { type: Type.NUMBER, description: "The price of a single unit in USD." },
    totalPrice: { type: Type.NUMBER, description: "The total price for the quantity, in USD." },
  },
  required: ["category", "itemDescription", "brand", "model", "quantity", "unitPrice", "totalPrice"],
};

// Define the schema for the entire Bill of Quantities (BOQ), which is an array of BOQ items.
const boqSchema = {
  type: Type.ARRAY,
  items: boqItemSchema,
};

/**
 * Generates a Bill of Quantities (BOQ) based on user requirements using the Gemini model.
 * @param requirements - A string describing the project and room requirements.
 * @returns A promise that resolves to a BOQ object.
 */
export async function generateBoq(requirements: string): Promise<Boq> {
  const model = "gemini-2.5-pro"; // Using a more capable model for complex generation

  const systemInstruction = `You are an expert Audio-Visual system designer. Your task is to generate a detailed Bill of Quantities (BOQ) in JSON format based on the user's requirements.
  - The BOQ must be a JSON array of objects.
  - Each object must conform to the provided schema, including category, item description, brand, model, quantity, unit price (USD), and total price (USD).
  - Use realistic, current, and professional-grade AV equipment brands and models (e.g., Crestron, Shure, Samsung, Barco, Biamp, QSC).
  - Calculate the totalPrice accurately (quantity * unitPrice).
  - Ensure all necessary components for a functional system are included (cables, mounts, connectors, etc.).
  - The output must be ONLY the JSON array, with no other text or markdown.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: `Generate a BOQ for the following requirements: ${requirements}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: boqSchema,
    },
  });

  const boqText = response.text.trim();
  try {
    const boq = JSON.parse(boqText);
    return boq as Boq;
  } catch (e) {
    console.error("Failed to parse BOQ JSON:", boqText);
    throw new Error("The AI returned an invalid BOQ format.");
  }
}

/**
 * Refines an existing Bill of Quantities (BOQ) based on a user's prompt.
 * @param currentBoq - The current BOQ object to be refined.
 * @param refinementPrompt - A string describing the desired changes to the BOQ.
 * @returns A promise that resolves to the refined BOQ object.
 */
export async function refineBoq(currentBoq: Boq, refinementPrompt: string): Promise<Boq> {
  const model = "gemini-2.5-pro";

  const systemInstruction = `You are an expert Audio-Visual system designer. Your task is to refine an existing Bill of Quantities (BOQ) based on user instructions.
  - You will be given a BOQ in JSON format and a prompt for changes.
  - Apply the changes and return the complete, updated BOQ as a JSON array of objects.
  - The returned BOQ must conform to the provided schema.
  - Ensure all calculations (totalPrice) are correct in the updated BOQ.
  - The output must be ONLY the JSON array, with no other text or markdown.`;

  const content = `
    Current BOQ:
    ${JSON.stringify(currentBoq, null, 2)}

    Refinement Request:
    "${refinementPrompt}"

    Please provide the full, updated BOQ in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: content,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: boqSchema,
    },
  });
  
  const boqText = response.text.trim();
  try {
    const boq = JSON.parse(boqText);
    return boq as Boq;
  } catch (e) {
    console.error("Failed to parse refined BOQ JSON:", boqText);
    throw new Error("The AI returned an invalid refined BOQ format.");
  }
}


/**
 * Fetches product details, including an image, description, and sources, using Google Search grounding.
 * @param productName - The name of the product to search for.
 * @returns A promise that resolves to the product details.
 */
export async function fetchProductDetails(productName: string): Promise<ProductDetails> {
  const model = "gemini-2.5-flash";

  const content = `
    Find information about the product: "${productName}".
    Provide a public URL for a high-quality image of the product and a brief, one-paragraph technical description.
    Return the result as a single, minified JSON object with keys "imageUrl" (string) and "description" (string).
    Do not include any other text, explanations, or markdown formatting. Just the JSON object.
    Example: {"imageUrl":"https://example.com/image.jpg","description":"This is a product description."}
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: content,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = groundingChunks.map((chunk: any) => ({
      web: chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : undefined,
      maps: chunk.maps ? { uri: chunk.maps.uri, title: chunk.maps.title } : undefined,
  })).filter((source: GroundingSource) => source.web || source.maps);
  
  let productInfo: { imageUrl: string; description: string } = {
    imageUrl: '',
    description: 'No details found.'
  };

  try {
    const textResponse = response.text.trim();
    // The response might be wrapped in markdown ```json ... ```, so we need to extract the JSON part.
    const jsonMatch = textResponse.match(/\{.*\}/s);
    if (jsonMatch) {
      productInfo = JSON.parse(jsonMatch[0]);
    } else {
        // Fallback for when no JSON is found in a code block
        productInfo = JSON.parse(textResponse);
    }
  } catch (e) {
    console.error("Failed to parse product details JSON:", response.text);
    // If parsing fails, we still return the sources. The UI can handle missing image/description.
  }
  
  return {
    ...productInfo,
    sources: sources,
  };
}
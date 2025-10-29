import { GoogleGenAI, Type } from "@google/genai";
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

  const systemInstruction = `You are a world-class, AVIXA CTS-D certified Audio-Visual system designer. Your primary objective is to generate a detailed, logical, and 100% production-ready Bill of Quantities (BOQ) in JSON format. An AV integrator must be able to install a complete, functional system using only the items in this BOQ.

**NON-NEGOTIABLE MANDATES (To be followed for ALL budget levels):**

1.  **AVIXA STANDARDS ARE LAW:**
    *   **DISCAS for Displays:** Rigorously calculate the *minimum appropriate display size* based on room dimensions and the farthest viewer. The chosen display must meet this minimum.
    *   **Audio Clarity & Coverage:** Ensure full, intelligible audio coverage for all participants. For any room larger than a small 4-person huddle space, a Digital Signal Processor (DSP) is **mandatory** for echo cancellation and proper audio routing. This is not optional.
    *   **System Functionality:** The design must be logical and all components compatible.

2.  **SYSTEM COMPLETENESS IS PARAMOUNT:**
    *   **NO MISSING PARTS:** The BOQ must be exhaustive. Include all major components AND every single necessary ancillary item. This means: mounts, racks, power distribution units (PDUs), all required cables (HDMI, USB, network, speaker), connectors, faceplates, etc. The system must be installable "out-of-the-box" from this list.

**THE BUDGET CONSTRAINT (This guides your component selection, NOT system completeness):**

After satisfying all the non-negotiable mandates above, use the 'budgetLevel' from the user's requirements to guide your component selection. The budget influences the *quality, features, and brand* of the components, not their presence or absence.

*   **'budget_friendly':**
    *   **Goal:** Achieve all core functionality with maximum cost-effectiveness without sacrificing reliability or completeness.
    *   **Action:** Select professional-grade but entry-level models. Prioritize robust, wired solutions over expensive wireless ones (e.g., specify cable cubbies with HDMI/USB-C instead of a premium wireless presentation system). Use reliable, cost-effective brands (e.g., ViewSonic, Logitech, Behringer, Atlona, Kramer). **You must still include a cost-effective DSP, proper cabling, and appropriate mounts.** Choose the most affordable versions that reliably perform the required function.

*   **'mid_range' (Default):**
    *   **Goal:** A balanced solution with industry-standard, reputable equipment.
    *   **Action:** Use brands known for great performance and features that represent the benchmark for a typical corporate installation (e.g., Samsung, Shure, Biamp, QSC, Crestron, Extron).

*   **'high_end':**
    *   **Goal:** Top-tier performance, aesthetics, and advanced features.
    *   **Action:** Use premium, best-in-class brands and models (e.g., Planar, Barco, Meyer Sound, high-end Crestron/AMX series).

**FINAL INSTRUCTIONS:**
*   Output **ONLY** the valid JSON array. Do not include any other text, explanations, or markdown formatting.
*   Calculate 'totalPrice' accurately (quantity * unitPrice).
*   Use realistic, current, professional-grade AV brands and models.
*   **Final Sanity Check:** Before outputting, ask yourself: "Is this a complete, working system that meets AVIXA standards and could be installed tomorrow by a professional integrator without them needing to add missing core components?"`;

  const response = await ai.models.generateContent({
    model: model,
    contents: `Generate a complete, production-ready BOQ based on the following detailed requirements, adhering to all instructions: ${requirements}`,
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
- When adding or changing an item, ensure that any necessary dependent components (e.g., a specific mount for a new display, required cables) are also added or updated to maintain a complete and functional system.
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
  } catch (e)
{
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
import { GoogleGenAI, Type } from "@google/genai";
import type { Room, ClientDetails } from '../types';

// FIX: Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-pro'; // Use a powerful model for this complex task

const boqItemSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: 'e.g., Display, Audio, Control, Cabling' },
    itemName: { type: Type.STRING, description: 'A descriptive name for the item, e.g., 85" 4K UHD Professional Display' },
    brand: { type: Type.STRING, description: 'Manufacturer of the item, e.g., Samsung, Crestron, Shure' },
    modelNumber: { type: Type.STRING, description: 'Specific model number of the product' },
    description: { type: Type.STRING, description: 'Brief technical description of the item and its purpose in the setup.' },
    quantity: { type: Type.INTEGER, description: 'Number of units required.' },
    unitPrice: { type: Type.NUMBER, description: 'Estimated price per unit in USD. Provide a realistic market estimate.' },
    imageUrl: { type: Type.STRING, description: "A relevant, publicly accessible placeholder image URL for the item. Can be from a manufacturer's website or a generic image search result." },
    notes: { type: Type.STRING, description: 'Any additional notes, e.g., includes mount, requires specific license.' },
  },
  required: ['category', 'itemName', 'brand', 'modelNumber', 'description', 'quantity', 'unitPrice']
};

const roomSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "A descriptive name for the room, e.g., 'Main Boardroom' or 'Huddle Space 1'" },
    requirements: { type: Type.STRING, description: "A brief summary of the requirements that this BOQ is based on." },
    boq: {
      type: Type.ARRAY,
      items: boqItemSchema,
      description: "The list of equipment for this room."
    }
  },
  required: ['name', 'requirements', 'boq']
};

const mainSchema = {
  type: Type.ARRAY,
  description: "An array of room objects, each containing a Bill of Quantities.",
  items: roomSchema,
};


const parseAndValidateResponse = (responseText: string): Room[] => {
  try {
    // The Gemini response for JSON can sometimes have markdown backticks.
    const cleanedText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
    if (!cleanedText) {
        throw new Error("Received an empty response from the AI.");
    }
    const parsed = JSON.parse(cleanedText) as Omit<Room, 'id'>[];

    if (!Array.isArray(parsed)) {
      throw new Error("AI response is not an array of rooms.");
    }
    
    // Add client-side IDs
    return parsed.map((room, index) => ({
        ...room,
        id: `${room.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}-${Date.now()}`,
        // Ensure boq is an array
        boq: Array.isArray(room.boq) ? room.boq : []
    }));
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw response text:", responseText);
    throw new Error("The AI returned an invalid response. Please try refining your request.");
  }
};


export const generateBoqFromRequirements = async (
  requirements: string,
  clientDetails: ClientDetails
): Promise<Room[]> => {
  const budgetInfo = clientDetails.budget ? `The client has an estimated budget of ${clientDetails.budget} USD. Try to stay within this budget, prioritizing core functionality.` : 'No budget has been specified.';

  const systemInstruction = `You are an expert AV (Audio-Visual) solutions architect. Your task is to generate a detailed Bill of Quantities (BOQ) for AV equipment based on user requirements.
- Analyze the requirements carefully. If multiple rooms are described, create a separate BOQ for each room.
- Select appropriate, real-world equipment from well-known professional AV brands (e.g., Crestron, Extron, QSC, Shure, Biamp, Samsung, LG, Barco, Poly, Cisco). Avoid consumer-grade equipment.
- Include all necessary components for a complete solution, including displays, mounts, microphones, speakers, DSPs, control processors, touch panels, video extenders, switches, cables, and connectors.
- Provide realistic, estimated unit prices in USD.
- Structure your response strictly according to the provided JSON schema. Do not add any extra text, explanations, or markdown formatting outside of the JSON structure.`;

  const prompt = `Please generate a BOQ based on these details:
Client Details:
- Project Name: ${clientDetails.projectName}
- Client Name: ${clientDetails.clientName}
- Location: ${clientDetails.location}
- ${budgetInfo}

Requirements:
---
${requirements}
---
`;

  // FIX: Use ai.models.generateContent instead of deprecated methods
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: mainSchema,
        temperature: 0.2, // Lower temperature for more predictable, structured output
    }
  });

  // FIX: Correctly access the response text
  const responseText = response.text;
  if (!responseText) {
    throw new Error("Failed to generate BOQ. The AI returned an empty response.");
  }

  return parseAndValidateResponse(responseText);
};

export const refineBoq = async (
  currentRooms: Room[],
  refinementPrompt: string
): Promise<Room[]> => {
    const systemInstruction = `You are an expert AV (Audio-Visual) solutions architect. Your task is to refine an existing Bill of Quantities (BOQ) based on a user's request.
- You will be given the current BOQ as a JSON object and a text prompt with refinement instructions.
- Modify the BOQ according to the instructions. This could involve adding, removing, or changing items, updating quantities, or swapping brands.
- If the user asks for a more "budget-friendly" option, replace items with lower-cost but still reliable professional-grade alternatives.
- Ensure the final BOQ is a complete and functional system.
- Structure your response strictly according to the provided JSON schema. Do not add any extra text, explanations, or markdown formatting outside of the JSON structure.
- Retain the original 'name' and 'requirements' for each room unless the prompt explicitly asks to change them.`;
    
    const prompt = `Here is the current BOQ:
\`\`\`json
${JSON.stringify(currentRooms.map(({ id, ...rest }) => rest), null, 2)}
\`\`\`

Refinement Request: "${refinementPrompt}"

Please provide the complete, updated BOQ in the specified JSON format.`;

    // FIX: Use ai.models.generateContent for the refinement call
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: mainSchema,
            temperature: 0.3,
        }
    });
    
    // FIX: Correctly access the response text
    const responseText = response.text;
    if (!responseText) {
        throw new Error("Failed to refine BOQ. The AI returned an empty response.");
    }

    return parseAndValidateResponse(responseText);
};

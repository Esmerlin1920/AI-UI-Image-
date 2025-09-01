import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { GenerateUiEditParams, GeneratedResult, LayoutItem } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function dataUrlToPart(dataUrl: string, mimeType: string): Part {
  return {
    inlineData: {
      data: dataUrl.split(',')[1],
      mimeType,
    },
  };
}

const systemInstruction = `You are an expert AI UI/UX designer and developer. Your task is to edit a given base UI image based on a user's prompt.

You will receive:
1. A base image to edit.
2. A black and white mask image. The white areas indicate the region of interest where edits should be applied. If the mask is all black, apply the changes globally to the layout.
3. An optional reference image for style guidance (colors, fonts, component styles).
4. A text prompt in Spanish describing the desired changes.

Your response MUST contain exactly two parts in this order:
1. An IMAGE part: The edited UI image. It must be high-resolution (at least 2K), clean, and sharp. It must maintain the visual style of the base image unless instructed otherwise. Do not duplicate elements. Respect transparencies. The output image should be a PNG.
2. A TEXT part: This part must ONLY contain a single, valid JSON object. It must start with '{' and end with '}'. Do not add any conversational text, explanations, or markdown formatting like \`\`\`json. The JSON object structure is:
{
  "svg": "<A string containing the complete SVG code for the new layout. All significant UI elements (buttons, inputs, cards, etc.) must be separate, named layers (e.g., using <g id='...'>).>",
  "layout": [/* An array of objects describing the detected layout of the EDITED image. Each object must have the format: {id, type, label, x, y, w, h, zone, props}, where 'type' is one of [button, input, text, title, icon, card, navbar, tab, form, image] and 'props' can include details like state, variant, required, link. */]
}

Analyze the user's prompt and apply the changes precisely. If the prompt is to 'recreate screen "Home" using the reference image', you should generate a completely new screen layout inspired by the reference image, but formatted as an edit of the base image dimensions. Ensure the JSON is perfectly formatted.`;


export async function generateUiEdit(params: GenerateUiEditParams): Promise<GeneratedResult> {
  const { baseImage, maskImage, referenceImage, prompt } = params;

  // FIX: `systemInstruction` is not a valid top-level parameter for `generateContent`. It has been moved into the `contents` array to be sent as part of the prompt.
  const contents: Part[] = [
    { text: systemInstruction },
    { text: "Base Image:" },
    dataUrlToPart(baseImage, 'image/png'),
    { text: "Mask (white is the edit area):" },
    dataUrlToPart(maskImage, 'image/png'),
  ];

  if (referenceImage) {
    contents.push({ text: "Reference Image for style:" });
    contents.push(dataUrlToPart(referenceImage, 'image/png'));
  }

  contents.push({ text: "User's instruction (in Spanish):" });
  contents.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: contents },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  let editedImage: string | null = null;
  let svg: string | null = null;
  let layout: LayoutItem[] | null = null;

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      editedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      try {
        // The model might return conversational text along with the JSON.
        // We need to extract the JSON object from the string.
        let jsonString = part.text;
        
        const jsonStartIndex = jsonString.indexOf('{');
        const jsonEndIndex = jsonString.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
          jsonString = jsonString.substring(jsonStartIndex, jsonEndIndex + 1);
          
          const parsedJson = JSON.parse(jsonString);
          if (parsedJson.svg && parsedJson.layout) {
              svg = parsedJson.svg;
              layout = parsedJson.layout;
          }
        }
      } catch (e) {
        console.error("Failed to parse JSON from text part:", part.text, e);
        // Do not throw here; continue to allow the final check to determine validity.
      }
    }
  }

  if (!editedImage || !svg || !layout) {
    console.error("Incomplete response from AI. Full response parts:", response.candidates[0].content.parts);
    throw new Error("La respuesta de la IA no estaba completa. Faltaba la imagen, el SVG o el layout.");
  }

  return { editedImage, svg, layout };
}

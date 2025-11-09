import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Dish, ImageStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const menuParserSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'The name of the dish.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, appealing description of the dish.',
      },
    },
    required: ['name', 'description'],
  },
};

export const parseMenu = async (menuText: string): Promise<Omit<Dish, 'id'>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Parse the following restaurant menu text and extract each dish with its name and description. Only include actual food items. Menu:\n\n${menuText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: menuParserSchema,
      },
    });

    const parsedJson = JSON.parse(response.text);
    if (Array.isArray(parsedJson)) {
        return parsedJson;
    }
    return [];

  } catch (error) {
    console.error("Error parsing menu:", error);
    throw new Error("Failed to parse the menu. Please check the format.");
  }
};

const getStylePrompt = (style: ImageStyle): string => {
  switch (style) {
    case ImageStyle.RusticDark:
      return 'dramatic lighting, dark wood background, rustic, moody, high-end restaurant plating';
    case ImageStyle.BrightModern:
      return 'bright and airy, clean white background, minimalist, modern plating, soft natural light';
    case ImageStyle.SocialMedia:
      return 'top-down view, flat lay, vibrant colors, on a stylish tabletop, perfect for social media';
    default:
      return 'high-quality, realistic';
  }
};

export const generateFoodImageFromDescription = async (
  dishName: string,
  dishDescription: string,
  style: ImageStyle
): Promise<string> => {
  try {
    const stylePrompt = getStylePrompt(style);
    const fullPrompt = `A professional, ultra-realistic photograph of a dish called "${dishName}".
    Description: "${dishDescription}".
    The style should be: ${stylePrompt}.
    The image must be photorealistic, high-resolution, and look like it's from a high-end food magazine. Focus on appealing textures, lighting, and plating.`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }

    throw new Error("No image was generated from the description.");

  } catch (error) {
    console.error("Error generating image from description:", error);
    throw new Error(`Failed to generate an image for ${dishName}.`);
  }
};

export const generateFoodImageFromReference = async (
    referenceImage: string, 
    dishName: string, 
    dishDescription: string, 
    style: ImageStyle
): Promise<string> => {
    try {
        const stylePrompt = getStylePrompt(style);
        const fullPrompt = `You are a professional food photographer. Your task is to transform the user's uploaded photo of a dish into a high-end, professional photograph.
        
        Dish Name: "${dishName}"
        Description: "${dishDescription}"

        Instructions:
        1. Strictly maintain the original dish's composition, ingredients, and plating from the reference image. The food itself should look identical, just higher quality.
        2. Re-render the entire scene to match the following professional style: "${stylePrompt}".
        3. Ensure the final image is hyper-realistic, visually pleasing, and looks like it belongs in a premium restaurant menu or a food magazine.
        4. Do not add, remove, or change any food items. Only enhance the quality, lighting, and background according to the style.`;

        const [header, base64Data] = referenceImage.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: fullPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const newBase64 = part.inlineData.data;
                const newMimeType = part.inlineData.mimeType;
                return `data:${newMimeType};base64,${newBase64}`;
            }
        }
        throw new Error("No image was generated from the reference.");

    } catch (error) {
        console.error("Error generating image from reference:", error);
        throw new Error(`Failed to generate an image for ${dishName}.`);
    }
};


export const editImage = async (imageUrl: string, prompt: string): Promise<string> => {
    try {
        const [header, base64Data] = imageUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        
        const enhancedPrompt = `Perform the following edit on this professional food photograph: "${prompt}". Maintain realism and high quality, ensuring the result is visually pleasing.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: enhancedPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const newBase64 = part.inlineData.data;
                const newMimeType = part.inlineData.mimeType;
                return `data:${newMimeType};base64,${newBase64}`;
            }
        }

        throw new Error("No edited image was returned.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image.");
    }
};
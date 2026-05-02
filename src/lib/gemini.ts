import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    workoutName: { type: Type.STRING },
    duration: { type: Type.NUMBER },
    difficulty: { type: Type.STRING },
    warmup: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          exercise: { type: Type.STRING },
          duration: { type: Type.STRING },
          instructions: { type: Type.STRING }
        },
        required: ["exercise", "duration"]
      }
    },
    mainExercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          exercise: { type: Type.STRING },
          sets: { type: Type.NUMBER },
          reps: { type: Type.STRING },
          rest: { type: Type.STRING },
          instructions: { type: Type.STRING }
        },
        required: ["exercise", "sets", "reps", "rest"]
      }
    },
    coolDown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          exercise: { type: Type.STRING },
          duration: { type: Type.STRING }
        },
        required: ["exercise", "duration"]
      }
    }
  },
  required: ["workoutName", "duration", "difficulty", "warmup", "mainExercises", "coolDown"]
};

export async function generateWorkout(goal: string, level: string, time: number) {
  const prompt = `Create a daily workout plan for a ${level} user with the goal of ${goal}. The total duration should be ${time} minutes.
  Focus on specific exercises that are effective for ${goal}.
  Provide clear instructions for each exercise.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: workoutSchema,
    },
  });

  return JSON.parse(response.text);
}

export const dietSchema = {
  type: Type.OBJECT,
  properties: {
    planName: { type: Type.STRING },
    description: { type: Type.STRING },
    meals: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mealType: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          nutrients: { type: Type.STRING }
        },
        required: ["mealType", "suggestion"]
      }
    }
  },
  required: ["planName", "description", "meals"]
};

export async function generateDietSuggestions(goal: string) {
  const prompt = `Provide diet suggestions for a user with the fitness goal: ${goal}.
  Include suggestions for Breakfast, Lunch, Snack, and Dinner.
  Focus on nutritional balance for ${goal}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dietSchema,
    },
  });

  return JSON.parse(response.text);
}

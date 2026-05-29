import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Description Suggestions
export async function generateDescriptionSuggestions(propertyData: {
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  area: string;
  amenities: string[];
  check_in_time: string;
  check_out_time: string;
  house_rules: string;
  current_description?: string;
}) {
  const prompt = `
You are a luxury property listing expert. Generate 7 compelling description templates for this property:

Property Details:
- Type: ${propertyData.property_type}
- Location: ${propertyData.area}
- Size: ${propertyData.area_sqm}m²
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Amenities: ${propertyData.amenities.join(", ")}
- Check-in: ${propertyData.check_in_time}
- Check-out: ${propertyData.check_out_time}
- Rules: ${propertyData.house_rules}
${propertyData.current_description ? `- Current Description: ${propertyData.current_description}` : ""}

Generate EXACTLY 7 suggestions in this JSON format:
{
  "location_vibes": "A compelling description about location and area vibe (2-3 sentences)",
  "space_layout": "Description of space, bedrooms, bathrooms, size (2-3 sentences)",
  "amenities": "Focus on key amenities that matter most (2-3 sentences)",
  "perfect_for": "Who would love this property and why (2-3 sentences)",
  "unique_highlights": "What makes this property special/unique (2-3 sentences)",
  "house_rules": "Brief summary of house rules and check-in/out (1-2 sentences)",
  "call_to_action": "Compelling call-to-action with urgency (1-2 sentences)",
  "enhancement_tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Make it engaging, professional, and persuasive. Use Arabic hospitality language if possible.
`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}

// Photo Quality Analysis
export async function analyzePhotoQuality(imageBase64: string) {
  const prompt = `
Analyze this property photo and provide detailed feedback. Score each criterion from 1-10.

Evaluate:
1. Lighting - Is there good natural or artificial light?
2. Clarity - Is the image sharp and in focus?
3. Composition - Is it well-framed?
4. Colors - Are colors natural and appealing?
5. Cleanliness - Is the space clean and tidy?
6. Professionalism - Does it look professionally photographed?

Respond in this JSON format:
{
  "scores": {
    "lighting": 8,
    "clarity": 9,
    "composition": 7,
    "colors": 8,
    "cleanliness": 9,
    "professionalism": 8
  },
  "feedback": {
    "lighting": "Feedback about lighting",
    "clarity": "Feedback about clarity",
    "composition": "Feedback about composition",
    "colors": "Feedback about colors",
    "cleanliness": "Feedback about cleanliness",
    "professionalism": "Feedback about professionalism"
  },
  "overall_score": 85,
  "grade": "B",
  "recommendations": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3"
  ]
}

Grade: A (90+), B (80-89), C (70-79), D (below 70)
`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response");

  return JSON.parse(jsonMatch[0]);
}
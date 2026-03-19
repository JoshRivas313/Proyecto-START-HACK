import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event: any) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const { cropName, currentWater, currentTemp, currentHumidity } = event.arguments;

  const prompt = `You are ARES, an Autonomous AI Agent managing a Martian Greenhouse. 
Your primary task is to optimize crop parameters to ensure the survival of 4 astronauts.
Analyze the following crop conditions:
- Crop: ${cropName}
- Current Water: ${currentWater}%
- Current Temperature: ${currentTemp}°C
- Current Humidity: ${currentHumidity}%

Provide your recommendations in valid JSON format. Provide ONLY the JSON object, absolutely no other text.
Use the following keys precisely:
{
  "success": true,
  "message": "Brief 1-sentence explanation of what you changed and why.",
  "updatedWater": <number>,
  "updatedTemp": <number>,
  "updatedHumidity": <number>
}

Base your decisions on realistic Earth botany adapted for Martian greenhouse constraints (e.g. Potatoes like 16-20°C and 60-80% humidity, Lettuce likes 15-22°C and high water). Make sure the updated values are sensible. Always return numbers, not strings for the updated values.`;

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const jsonBody = JSON.parse(responseBody);
    
    // Antropic returns text in message content
    const aiText = jsonBody.content[0].text;
    console.log("AI Response:", aiText);

    // Extract JSON from response (in case Claude added markdown or intro text)
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
            success: true,
            message: result.message || "Parameters optimized.",
            updatedWater: result.updatedWater || currentWater,
            updatedTemp: result.updatedTemp || currentTemp,
            updatedHumidity: result.updatedHumidity || currentHumidity
        };
    } else {
        throw new Error("Failed to parse JSON from AI response.");
    }
  } catch (error) {
    console.error("Bedrock invocation error:", error);
    return {
      success: false,
      message: "AI optimization failed due to an error.",
      updatedWater: currentWater,
      updatedTemp: currentTemp,
      updatedHumidity: currentHumidity
    };
  }
};

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const client = new BedrockRuntimeClient({ region: "us-east-1" });

async function askBedrock(prompt, maxTokens = 1500) {
  const tokenEstimate = Math.ceil(prompt.length / 4);
  console.log(`Bedrock prompt: ~${tokenEstimate} estimated tokens, maxTokens=${maxTokens}`);
  const input = {
    modelId: "amazon.nova-micro-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: [{ text: prompt }]
        }
      ],
      inferenceConfig: {
        maxTokens: maxTokens,
        temperature: 0.7,
        topP: 0.9,
      }
    })
  };
  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const json = JSON.parse(new TextDecoder().decode(response.body));
    console.log("Nova full response:", JSON.stringify(json).substring(0, 500));
    console.log("Nova stop_reason:", json.stopReason);

    const text =
      json?.output?.message?.content?.[0]?.text ||
      json?.results?.[0]?.outputText ||
      json?.completion ||
      null;

    if (!text) {
      console.error("Nova returned no text. Full response:", JSON.stringify(json));
      throw new Error("Nova returned an empty response. Check CloudWatch logs.");
    }

    return text;
  } catch (err) {
    console.error("Bedrock error name:", err.name);
    console.error("Bedrock error message:", err.message);
    throw new Error(`Bedrock failed (${err.name}): ${err.message}`);
  }
}

module.exports = { askBedrock };
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const client = new BedrockRuntimeClient({ region: "us-east-1" });
async function askBedrock(prompt, maxTokens = 1500) {
  const tokenEstimate = Math.ceil(prompt.length / 4);
  console.log(`Bedrock prompt: ~${tokenEstimate} estimated tokens, maxTokens=${maxTokens}`);
  const input = {
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      messages: [
        { role: "user", content: prompt }
      ]
    })
  };
  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const json = JSON.parse(new TextDecoder().decode(response.body));
    console.log("Bedrock stop_reason:", json.stop_reason);
    console.log("Bedrock usage:", JSON.stringify(json.usage));
    if (json.stop_reason === "max_tokens") {
      console.warn("Response was cut off — consider raising maxTokens or shortening the prompt.");
    }
    return json.content[0].text;
  } catch (err) {
    console.error("Bedrock error name:", err.name);
    console.error("Bedrock error message:", err.message);
    throw new Error(`Bedrock failed (${err.name}): ${err.message}`);
  }
}
module.exports = { askBedrock };
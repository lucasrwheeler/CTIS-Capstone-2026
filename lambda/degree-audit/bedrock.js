const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" });

async function askBedrock(prompt, maxTokens = 800) {
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

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);

  const json = JSON.parse(new TextDecoder().decode(response.body));
  return json.content[0].text;
}

module.exports = { askBedrock };
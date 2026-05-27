/**
 * @file bedrock.js
 * @description AI language model integration for the CTIS Academic Advisor.
 *
 * Originally written to call Amazon Bedrock (Claude / Nova Micro).
 * Switched to Groq API (llama-3.1-8b-instant) due to AWS Bedrock account-level
 * token quota restrictions (quota = 0, not adjustable) on this AWS account.
 *
 * The Groq API is OpenAI-compatible — it accepts the same request shape as
 * the OpenAI Chat Completions endpoint, making a future swap back to Bedrock
 * or to OpenAI straightforward.
 *
 * Uses Node's built-in `https` module (no external dependencies) so the Lambda
 * deployment zip stays small and has no extra node_modules to manage.
 *
 * @module bedrock
 * @requires https - Node.js built-in HTTPS module
 *
 * @environment
 *   GROQ_API_KEY - Groq API secret key, set in Lambda environment variables.
 *                  Never hardcode this value in source files.
 */

const https = require("https");

/**
 * Sends a prompt to the Groq LLM API and returns the model's text response.
 *
 * Makes a raw HTTPS POST to the Groq OpenAI-compatible chat completions
 * endpoint. Wraps the async I/O in a Promise so callers can use await.
 *
 * @async
 * @param {string} prompt - The complete prompt string to send to the model.
 *                          Built upstream in index.js to include degree context,
 *                          completed courses, the course catalog, and the question.
 * @returns {Promise<string>} The model's text response (plain string, not JSON).
 * @throws {Error} If the HTTP request fails, the response cannot be parsed,
 *                 or the Groq API returns an error object instead of a completion.
 *
 * @example
 * const answer = await getAIAdvice("What are the prerequisites for CTIS 342?");
 * console.log(answer); // "CTIS 342 requires CTIS 210 and CTIS 243..."
 */
async function getAIAdvice(prompt) {
  return new Promise((resolve, reject) => {

    // Build the OpenAI-compatible request body
    const body = JSON.stringify({
      model: "llama-3.1-8b-instant",   // Groq-hosted LLaMA 3.1 8B — fast, free tier
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.7                 // Slight creativity; lower = more factual
    });

    const options = {
      hostname: "api.groq.com",
      path:     "/openai/v1/chat/completions",
      method:   "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type":  "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";

      // Accumulate streamed response chunks
      res.on("data", chunk => { data += chunk; });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          // Standard OpenAI-compatible success shape:
          // { choices: [{ message: { content: "..." } }] }
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content);
          } else {
            // Groq returned an error object — surface it for debugging
            reject(new Error("No response from Groq: " + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = { getAIAdvice };
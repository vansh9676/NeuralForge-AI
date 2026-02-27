const DEFAULT_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
const DEFAULT_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM_PROMPT = `
You are the NeuralForge AI website assistant.
Answer briefly and clearly.
Only answer questions relevant to NeuralForge AI services:
- AI Website Development
- Business Automation
- SEO & Lead Generation
- Chatbot Integration
- Custom Web Apps
- Maintenance & Support
If asked about pricing, timelines, or project scope, invite the user to submit the contact form.
`.trim();

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  const apiKey = process.env.OPEN_SOURCE_API_KEY;
  const apiUrl = process.env.OPEN_SOURCE_API_URL || DEFAULT_API_URL;
  const model = process.env.OPEN_SOURCE_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return json(500, {
      error: "Missing OPEN_SOURCE_API_KEY environment variable.",
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message) {
    return json(400, { error: "Message is required." });
  }

  const history = Array.isArray(payload.history) ? payload.history : [];
  const safeHistory = history
    .filter((item) => item && typeof item.content === "string" && ["user", "assistant"].includes(item.role))
    .slice(-10)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1000),
    }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...safeHistory,
    { role: "user", content: message.slice(0, 1000) },
  ];

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (apiUrl.includes("openrouter.ai")) {
    if (process.env.OPEN_SOURCE_SITE_URL) {
      headers["HTTP-Referer"] = process.env.OPEN_SOURCE_SITE_URL;
    }
    if (process.env.OPEN_SOURCE_SITE_NAME) {
      headers["X-Title"] = process.env.OPEN_SOURCE_SITE_NAME;
    }
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.5,
        max_tokens: 260,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(502, {
        error: data?.error?.message || data?.error || "Upstream model request failed.",
      });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return json(502, { error: "Model returned an empty response." });
    }

    return json(200, { reply: reply.trim() });
  } catch (error) {
    return json(500, {
      error: error.message || "Unexpected server error.",
    });
  }
};

export default async function handler(req, res) {
  // Autoriser les requêtes depuis n'importe quelle origine (à sécuriser plus tard si besoin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Gestion de la requête préliminaire OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: message }],
        temperature: 0.7
      })
    });

    const result = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error", result);
      return res.status(500).json({ error: "OpenAI error", details: result });
    }

    const reply = result.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
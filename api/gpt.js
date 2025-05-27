export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Gestion requête OPTIONS (préflight CORS)
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

    const lowerMessage = message.toLowerCase();

    // ✅ Liste blanche (thèmes autorisés)
    const allowedKeywords = [
      "pain", "fever", "headache", "cough", "symptom", "health",
      "injury", "wound", "infection", "diagnosis", "medicine",
      "treatment", "doctor", "nurse", "illness", "disease",
      "sore", "chills", "vomit", "emergency", "hospital"
    ];

    // ❌ Liste noire (thèmes interdits explicites)
    const blockedKeywords = [
      "bitcoin", "crypto", "trump", "biden", "macron", "president",
      "stock", "investment", "iphone", "android", "windows", "game",
      "tiktok", "netflix", "movie", "music", "love", "sex", "relationship",
      "joke", "politics", "election", "weather", "football", "nba", "youtube"
    ];

    const isMedical = allowedKeywords.some(keyword => lowerMessage.includes(keyword));
    const isBlocked = blockedKeywords.some(keyword => lowerMessage.includes(keyword));

    if (!isMedical || isBlocked) {
      return res.status(403).json({
        reply: "⚠️ This demo is strictly limited to medical-related questions. Please avoid non-medical topics."
      });
    }

    // Appel vers OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a professional AI medical assistant. You only answer medical-related topics such as symptoms, treatments, health issues. Politely decline unrelated or inappropriate questions."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.5
      })
    });

    const result = await response.json();

    if (!response.ok) {
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
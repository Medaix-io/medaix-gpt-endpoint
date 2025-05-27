export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: message }],
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ response: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: data.error?.message || "Unknown error" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
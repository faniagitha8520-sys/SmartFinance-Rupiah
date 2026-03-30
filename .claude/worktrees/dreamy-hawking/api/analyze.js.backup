export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transactions, apiKey } = req.body;

  if (!transactions || !apiKey) {
    return res.status(400).json({ error: "Missing transactions or apiKey" });
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Analisis data transaksi keuangan berikut dalam bentuk JSON. Berikan insight dalam bahasa Indonesia yang santai.

Data transaksi (array of objects, setiap object punya date, kategori, item, pengeluaran, penghasilan, akun, catatan, bulan, tipe):

${JSON.stringify(transactions, null, 2)}

Tugas:
1. Ringkasan total pengeluaran vs penghasilan
2. Kategori dengan pengeluaran tertinggi (berapa persen)
3. Pola pengeluaran (misal: sering di hari apa, kategori dominan)
4. Saran hemat (max 3 poin) berdasarkan pola yang terlihat
5. Prediksi pengeluaran bulan depan jika pola berlanjut

RESPOND ONLY dengan JSON format:
{
  "ringkasan": {"total_pengeluaran": number, "total_penghasilan": number, "saldo": number},
  "kategori_tertinggi": {"nama": string, "jumlah": number, "persen": number},
  "pola": string,
  "saran": [string, string, string],
  "prediksi": string
}

Jangan tambahkan teks lain, hanya JSON.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || "API error" });
    }

    const text = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const analysis = JSON.parse(cleaned);
      return res.status(200).json({ analysis });
    } catch {
      return res.status(200).json({ error: "Failed to parse analysis result", raw: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

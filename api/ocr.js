import { createWorker } from 'tesseract.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, apiKey } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Missing image" });
  }

  try {
    // Decode base64 image
    const buffer = Buffer.from(image, 'base64');
    
    // Create Tesseract worker
    const worker = await createWorker('jpn+eng'); // Japanese + English
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();

    // Parse the OCR text to extract transactions
    // This is a simple parser - you might need to adjust based on receipt format
    const lines = text.split('\n').filter(line => line.trim());
    
    // Simple heuristic: lines that contain numbers likely are items
    const transactions = lines.map(line => {
      // Extract price (numbers with commas or dots)
      const priceMatch = line.match(/(\d[\d,]*)\s*円?/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
      
      // Extract item name (remove price part)
      const item = line.replace(/(\d[\d,]*)\s*円?/, '').trim();
      
      if (!item || price === 0) return null;
      
      return {
        date: new Date().toISOString().slice(0, 10),
        kategori: "Logistik", // default category
        item: item,
        penghasilan: 0,
        pengeluaran: price,
        akun: "Cash",
        catatan: "",
        bulan: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][new Date().getMonth()],
        tipe: "Pengeluaran"
      };
    }).filter(tx => tx !== null);

    // If no transactions parsed, return raw text for debugging
    if (transactions.length === 0) {
      return res.status(200).json({ 
        error: "No transactions parsed from OCR",
        rawText: text,
        lines: lines 
      });
    }

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error('OCR error:', err);
    return res.status(500).json({ error: err.message });
  }
}
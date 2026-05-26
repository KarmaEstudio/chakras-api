export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    
    // Pipe directo del stream
    await response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      })
    );
  } catch (error) {
    console.error('DeepSeek proxy error:', error);
    res.status(500).json({ 
      error: 'Error connecting to DeepSeek',
      details: error.message 
    });
  }
}

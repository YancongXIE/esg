// Backend proxy service for fetching web content
// This would be implemented on your backend server

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

export const fetchWebContent = async (url) => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/fetch-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`Backend proxy error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Example backend implementation (Node.js/Express)
/*
app.post('/api/fetch-content', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ESG-News-Bot/1.0)'
      }
    });
    
    const html = await response.text();
    res.json({ content: html, status: response.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

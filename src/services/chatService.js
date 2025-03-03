const ANTHROPIC_API_ENDPOINT = 'https://api.anthropic.com/v1/messages';

export async function sendChatMessage(documentId, userMessage, messageHistory) {
  try {
    const response = await fetch(ANTHROPIC_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2024-01-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant analyzing a document. 
                     You should answer questions about document ${documentId}.
                     Be concise and accurate in your responses.`
          },
          ...messageHistory,
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API call failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error('Chat API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
} 
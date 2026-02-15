const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.post('/chat', async (req, res) => {
  const { messages } = req.body

  const prompt =
    messages
      .map((m) => (m.role === 'user' ? `User: ${m.text}` : `AI: ${m.text}`))
      .join('\n') + '\nAI:'

  const ollamaRes = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt,
      stream: true,
    }),
  })

  res.setHeader('Content-Type', 'text/plain')

  for await (const chunk of ollamaRes.body) {
    res.write(chunk)
  }

  res.end()
})

app.listen(3000, () => console.log('Server running → http://localhost:3000'))

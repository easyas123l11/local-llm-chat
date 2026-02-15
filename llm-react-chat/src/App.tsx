import { useState } from 'react'

type Message = {
  role: 'user' | 'ai'
  text: string
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    const aiIndex = messages.length + 1

    setMessages((prev) => [...prev, { role: 'ai', text: '' }])

    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
      }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    let aiText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)

      const lines = chunk.split('\n').filter(Boolean)

      for (const line of lines) {
        const json = JSON.parse(line)
        aiText += json.response

        setMessages((prev) => {
          const updated = [...prev]
          updated[aiIndex] = { role: 'ai', text: aiText }
          return updated
        })
      }
    }
  }

  return (
    <div style={styles.container}>
      <h2>Local LLM Chat</h2>

      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div key={i} style={styles.msg}>
            <b>{m.role === 'user' ? 'You' : 'AI'}:</b> {m.text}
          </div>
        ))}
        {loading && <div>AI is thinking...</div>}
      </div>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          // handle Enter key to send message
          onKeyDown={(e) => e.key === 'Enter' && send()}
          style={styles.input}
          placeholder="Type message..."
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 2800,
    margin: '40px auto',
    fontFamily: 'Arial',
    justifyContent: 'center',
  },
  chat: {
    border: '1px solid #ccc',
    height: 400,
    overflowY: 'auto',
    padding: 10,
    marginBottom: 10,
  },
  msg: {
    marginBottom: 8,
  },
  inputRow: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 8,
  },
}

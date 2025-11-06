import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, X, Send } from 'lucide-react'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export default function Chatbot({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.username || 'there'}! 👋 I'm your GrowTogether assistant. I can help you find food resources, job opportunities, meal ideas, and answer questions about our community services. How can I help you today?`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const systemPrompt = `You are a helpful assistant for GrowTogether, a community support app that helps low-income youth and communities. The app provides:
      
1. Food resources (food banks, community kitchens)
2. Job opportunities and mentorship for ages 16+
3. Personalized meal ideas
4. Marketplace for trading goods
5. SeedBuddy for micro-farming guidance
6. Food rescue to claim surplus food

Be friendly, supportive, and provide practical advice. Keep responses concise and actionable. If asked about specific resources, suggest they check the relevant section of the app.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7
      })

      const assistantMessage = response.choices[0].message.content
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or navigate to the specific section you need help with.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-secondary hover:bg-secondary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="w-8 h-8" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col bg-white rounded-lg shadow-2xl z-50 border border-border">
      {/* Header */}
      <div className="bg-secondary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">GrowTogether Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                message.role === 'user' 
                  ? 'bg-secondary text-white' 
                  : 'bg-primary text-white'
              }`}>
                {message.role === 'user' ? (user?.username?.charAt(0).toUpperCase() || 'U') : '🤖'}
              </div>
              
              {/* Message bubble */}
              <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-secondary text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {/* Timestamp */}
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-2 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                🤖
              </div>
              <div className="relative px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="rounded-full px-4 py-2 border-2 focus:border-secondary transition-colors"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="rounded-full w-10 h-10 p-0 bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by AI • Always here to help
        </p>
      </div>
    </div>
  )
}


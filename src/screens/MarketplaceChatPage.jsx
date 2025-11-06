import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Send } from 'lucide-react'
import api from '../lib/api'

export default function MarketplaceChatPage({ user, onLogout }) {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [itemId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/marketplace/${itemId}/chat`)
      setMessages(response.data)
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await api.post(`/marketplace/${itemId}/chat`, {
        user_id: user.id,
        message: newMessage
      })
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Item Chat</h1>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-4 py-6 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.user_id === user.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-2 max-w-[75%] ${message.user_id === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    message.user_id === user.id 
                      ? 'bg-secondary text-white' 
                      : 'bg-primary text-white'
                  }`}>
                    {message.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  {/* Message bubble */}
                  <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                    message.user_id === user.id
                      ? 'bg-secondary text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      message.user_id === user.id ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {message.username}
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <div className={`text-xs mt-1 ${
                      message.user_id === user.id ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t sticky bottom-0 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto items-end">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="rounded-full px-4 py-2 border-2 focus:border-secondary transition-colors"
              />
            </div>
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim()} 
              className="rounded-full w-10 h-10 p-0 bg-secondary hover:bg-secondary/90 disabled:bg-gray-300 transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}


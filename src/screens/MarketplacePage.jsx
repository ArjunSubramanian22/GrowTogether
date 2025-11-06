import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ShoppingBag, MapPin, DollarSign, ArrowLeft, MessageCircle, Search } from 'lucide-react'
import api from '../lib/api'

export default function MarketplacePage({ user, onLogout }) {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketplaceItems()
  }, [])

  const fetchMarketplaceItems = async () => {
    try {
      const response = await api.get('/marketplace')
      setItems(response.data)
      setFilteredItems(response.data)
    } catch (err) {
      console.error('Error fetching marketplace items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(items)
    }
  }, [searchTerm, items])

  const getCategoryColor = (category) => {
    const colors = {
      produce: 'bg-green-100 text-green-800',
      crafts: 'bg-purple-100 text-purple-800',
      tools: 'bg-blue-100 text-blue-800',
      clothing: 'bg-pink-100 text-pink-800',
      food: 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Community Marketplace</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Trade & Share</h2>
          <p className="text-lg">Buy, sell, or trade goods with your community</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search items by name, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Marketplace Items */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading marketplace items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No items match your search.' : 'No items available. Be the first to list something!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden card-hover">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold">{item.item_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    {item.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                      </div>
                    )}
                    {item.trade_for && (
                      <div className="text-muted-foreground">
                        <span className="font-medium">Trade for:</span> {item.trade_for}
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{item.location}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Seller: <span className="font-medium">{item.username}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full btn-primary"
                    onClick={() => navigate(`/marketplace/${item.id}/chat`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


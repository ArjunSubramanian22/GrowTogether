import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, ArrowLeft, CheckCircle, Map as MapIcon, List } from 'lucide-react'
import MockGoogleMap from '../components/MockGoogleMap'
import Chatbot from '../components/Chatbot'
import api from '../lib/api'

export default function FoodRescuePage({ user, onLogout }) {
  const navigate = useNavigate()
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchFoodItems()
  }, [])

  const fetchFoodItems = async () => {
    try {
      const response = await api.get('/food_rescue')
      // Add mock coordinates for map display
      const itemsWithCoords = response.data.map((item, index) => ({
        ...item,
        latitude: 34.0522 + (Math.random() - 0.5) * 0.1,
        longitude: -118.2437 + (Math.random() - 0.5) * 0.1,
        name: item.food_type,
        address: item.pickup_location,
        color: item.status === 'claimed' ? 'gray' : 'orange'
      }))
      setFoodItems(itemsWithCoords)
    } catch (err) {
      console.error('Error fetching food rescue items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (itemId) => {
    setClaimingId(itemId)
    try {
      await api.post(`/food_rescue/${itemId}/claim`, { user_id: user.id })
      alert('Food claimed successfully! Check your email for pickup details.')
      // Refresh the list
      fetchFoodItems()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim food. Please try again.')
    } finally {
      setClaimingId(null)
    }
  }

  const handleMarkerClick = (item) => {
    setSelectedItem(item)
    setViewMode('list')
    // Scroll to the item card
    setTimeout(() => {
      const element = document.getElementById(`item-${item.id}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">Food Rescue</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="h-[calc(100vh-100px)]">
          <MockGoogleMap
            locations={foodItems}
            center={[34.0522, -118.2437]}
            zoom={12}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Available Food</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading available food...</p>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No food available at the moment. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => (
                <Card
                  key={item.id}
                  id={`item-${item.id}`}
                  className={`card-hover ${selectedItem?.id === item.id ? 'ring-2 ring-secondary' : ''}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{item.food_type}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      {item.status === 'claimed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Claimed
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{item.pickup_location}</span>
                      </div>
                      {item.expiry_date && (
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            Expires: {new Date(item.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="w-full btn-primary"
                      onClick={() => handleClaim(item.id)}
                      disabled={item.status === 'claimed' || claimingId === item.id}
                    >
                      {claimingId === item.id ? 'Claiming...' : (item.status === 'claimed' ? 'Already Claimed' : 'Claim Food')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chatbot */}
      <Chatbot user={user} />
    </div>
  )
}


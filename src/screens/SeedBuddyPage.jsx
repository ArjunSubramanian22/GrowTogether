import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sprout, ArrowLeft, Calendar, TrendingUp } from 'lucide-react'
import api from '../lib/api'

export default function SeedBuddyPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [plots, setPlots] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [plotsResponse, cropsResponse] = await Promise.all([
        api.get(`/seedbuddy/plots?user_id=${user.id}`),
        api.get('/seedbuddy/crops')
      ])
      setPlots(plotsResponse.data)
      setCrops(cropsResponse.data)
    } catch (err) {
      console.error('Error fetching SeedBuddy data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      planted: 'bg-yellow-100 text-yellow-800',
      growing: 'bg-green-100 text-green-800',
      ready: 'bg-blue-100 text-blue-800',
      harvested: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">SeedBuddy</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Sprout className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Your Micro-Farming Journey</h2>
          <p className="text-lg">Track your gardens, grow food, and build sustainability</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your gardens...</p>
          </div>
        ) : plots.length === 0 ? (
          <div className="text-center py-12">
            <Sprout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Your First Garden</h3>
            <p className="text-muted-foreground mb-6">Create a garden plot to begin your micro-farming journey</p>
            <Button className="btn-primary">Create Garden Plot</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Garden Plots */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Garden Plots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plots.map((plot) => (
                  <Card key={plot.id} className="card-hover">
                    {plot.image_url && (
                      <img
                        src={plot.image_url}
                        alt={plot.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <CardTitle>{plot.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{plot.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{plot.size_sqft} sq ft</span>
                        </div>
                        {plot.plan && plot.plan.crops && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Crops:</span>
                            <span className="font-medium">{plot.plan.crops.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <Button className="w-full mt-4 btn-primary">View Details</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Crops */}
            {crops.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Crops</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((crop) => (
                    <Card key={crop.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold">{crop.crop_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(crop.status)}`}>
                            {crop.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          {crop.planting_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Planted: {new Date(crop.planting_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {crop.expected_harvest_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Harvest: {new Date(crop.expected_harvest_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {crop.yield_estimate_lbs && (
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Est. yield: {crop.yield_estimate_lbs} lbs
                              </span>
                            </div>
                          )}
                        </div>

                        {crop.notes && (
                          <p className="text-sm text-muted-foreground mb-4">{crop.notes}</p>
                        )}

                        <Button className="w-full btn-secondary">Update Status</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Farming Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-secondary mb-1">{plots.length}</div>
                    <div className="text-muted-foreground">Garden Plots</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary mb-1">{crops.length}</div>
                    <div className="text-muted-foreground">Active Crops</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary mb-1">
                      {crops.reduce((sum, crop) => sum + (crop.yield_estimate_lbs || 0), 0).toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Est. Total Yield (lbs)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}


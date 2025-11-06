import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Clock, Phone, Mail, ArrowLeft, Search, Map as MapIcon, List } from 'lucide-react'
import MockGoogleMap from '../components/MockGoogleMap'
import Chatbot from '../components/Chatbot'
import api from '../lib/api'

export default function FindFoodPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get('location') || '')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    fetchResources()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredResources(filtered)
    } else {
      setFilteredResources(resources)
    }
  }, [searchTerm, resources])

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources')
      setResources(response.data)
      setFilteredResources(response.data)
    } catch (err) {
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'food_bank':
        return 'bg-green-100 text-green-800'
      case 'community_kitchen':
        return 'bg-orange-100 text-orange-800'
      case 'shelter':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleMarkerClick = (resource) => {
    setSelectedResource(resource)
    setViewMode('list')
    // Scroll to the resource card
    setTimeout(() => {
      const element = document.getElementById(`resource-${resource.id}`)
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
          <h1 className="text-2xl font-bold flex-1">Find Food Resources</h1>
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

      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, type, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="h-[calc(100vh-200px)]">
          <MockGoogleMap
            locations={filteredResources}
            center={[34.0522, -118.2437]}
            zoom={12}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No resources found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card
                  key={resource.id}
                  id={`resource-${resource.id}`}
                  className={`cursor-pointer card-hover ${selectedResource?.id === resource.id ? 'ring-2 ring-secondary' : ''}`}
                  onClick={() => navigate(`/resource/${resource.id}`)}
                >
                  {resource.image_url && (
                    <img
                      src={resource.image_url}
                      alt={resource.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://via.placeholder.com/400x300/10b981/ffffff?text=${encodeURIComponent(resource.type.replace('_', ' '))}`
                      }}
                    />
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold">{resource.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(resource.type)}`}>
                        {resource.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">{resource.address}</span>
                      </div>
                      {resource.availability && Object.keys(resource.availability).length > 0 && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {Object.entries(resource.availability)[0][1]}
                          </span>
                        </div>
                      )}
                      {resource.contact_info && resource.contact_info.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">{resource.contact_info.phone}</span>
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4 btn-primary">
                      View Details
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


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Utensils, Briefcase, ShoppingBag, Sprout, Settings, LogOut, Search } from 'lucide-react'
import Chatbot from '../components/Chatbot'

export default function HomePage({ user, onLogout }) {
  const navigate = useNavigate()
  const [searchLocation, setSearchLocation] = useState(user.location || '')

  const mainFeatures = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Find Food',
      description: 'Discover food banks and community kitchens near you',
      path: '/find-food',
      color: 'bg-green-500'
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Food Rescue',
      description: 'Claim surplus food from local donors',
      path: '/food-rescue',
      color: 'bg-orange-500'
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: 'Meal Ideas',
      description: 'Get personalized meal suggestions',
      path: '/meals',
      color: 'bg-red-500'
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: 'Jobs & Mentors',
      description: 'Find opportunities for ages 16+',
      path: '/jobs',
      color: 'bg-blue-500'
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Marketplace',
      description: 'Trade goods and connect with community',
      path: '/marketplace',
      color: 'bg-purple-500'
    },
    {
      icon: <Sprout className="w-8 h-8" />,
      title: 'SeedBuddy',
      description: 'Start your micro-farming journey',
      path: '/seedbuddy',
      color: 'bg-green-600'
    }
  ]

  const handleSearch = () => {
    if (searchLocation.trim()) {
      // Navigate to find food page with location parameter
      navigate(`/find-food?location=${encodeURIComponent(searchLocation)}`)
    } else {
      navigate('/find-food')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <Sprout className="w-8 h-8 text-secondary" />
            <h1 className="text-2xl font-bold">GrowTogether</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">Welcome, {user.username}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Uber Eats Style */}
      <div className="hero-gradient text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Find support near you
          </h2>
          <p className="text-xl md:text-2xl font-light mb-8">
            Access food, jobs, mentorship, and community resources
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
            <div className="flex-1 bg-white rounded-lg p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <Input
                type="text"
                placeholder="Enter your location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-gray-800"
              />
            </div>
            <Button
              size="lg"
              className="bg-black hover:bg-black/90 text-white px-8 py-6 text-lg"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="container mx-auto px-4 py-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-6">What can we help you with today?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feature, index) => (
            <Card
              key={index}
              className="cursor-pointer card-hover"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-6">
                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-muted-foreground">Community Resources</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">1,200+</div>
              <div className="text-muted-foreground">Job Opportunities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">10,000+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot user={user} />
    </div>
  )
}


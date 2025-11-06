import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Utensils, Home, BookOpen, Briefcase, Heart, DollarSign,
  Users, TrendingUp, MapPin, Phone, Mail, User,
  ChevronRight, ChevronLeft, Check
} from 'lucide-react'

export default function OnboardingFlow({ onComplete }) {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    interests: [],
    skills: [],
    goals: [],
    path: [] // 'resources' or 'mentorship'
  })

  const carouselScreens = [
    {
      title: 'Together, We Rise',
      subtitle: 'Building Bridges, Changing Lives',
      description: 'GrowTogether connects people who need help with those who can share — whether that\'s food, guidance, or opportunity.',
      icon: '🤝',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'The Resource Hub: Immediate Support',
      subtitle: 'When resources are shared, everyone grows stronger',
      description: 'Access essential needs through your community — from local food sharing to housing and job leads.',
      icons: ['🍞', '🏠', '📚', '💼', '❤️', '💰'],
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'The Mentorship Network: Lasting Empowerment',
      subtitle: 'Knowledge shared is power multiplied',
      description: 'Find a mentor who understands your path — or share your own skills to uplift others.',
      icon: '🎓',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Build, Track, and Grow',
      subtitle: 'See your impact in real time',
      description: 'Track your progress, celebrate milestones, and witness your community\'s impact growing stronger.',
      icon: '📈',
      color: 'from-purple-500 to-pink-600'
    }
  ]

  const resourceCategories = [
    { id: 'food', label: 'Food', icon: <Utensils className="w-6 h-6" /> },
    { id: 'housing', label: 'Housing', icon: <Home className="w-6 h-6" /> },
    { id: 'education', label: 'Education', icon: <BookOpen className="w-6 h-6" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-6 h-6" /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Heart className="w-6 h-6" /> },
    { id: 'financial', label: 'Financial Aid', icon: <DollarSign className="w-6 h-6" /> }
  ]

  const handleInterestToggle = (interest) => {
    setUserData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handlePathToggle = (path) => {
    setUserData(prev => ({
      ...prev,
      path: prev.path.includes(path)
        ? prev.path.filter(p => p !== path)
        : [...prev.path, path]
    }))
  }

  const handleComplete = () => {
    // Save user data and complete onboarding
    onComplete(userData)
  }

  // Welcome Screen
  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 space-y-6">
            <div className="text-6xl mb-4">🌉</div>
            <h1 className="text-3xl font-bold mb-2">Building Bridges, Changing Lives</h1>
            <p className="text-lg text-muted-foreground">
              Empowering communities through shared resources and mentorship
            </p>
            <div className="space-y-3 pt-4">
              <Button
                className="w-full btn-primary text-lg py-6"
                onClick={() => setCurrentScreen('carousel')}
              >
                Get Started
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert('About: GrowTogether helps low-income communities access resources and mentorship to build better futures.')}
              >
                About the Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Carousel Screens
  if (currentScreen === 'carousel') {
    const screen = carouselScreens[carouselIndex]
    return (
      <div className={`min-h-screen bg-gradient-to-br ${screen.color} text-white flex items-center justify-center p-4`}>
        <div className="w-full max-w-2xl">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-4">
                {screen.icons ? (
                  <div className="flex justify-center gap-4 text-5xl mb-4">
                    {screen.icons.map((icon, i) => (
                      <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>
                        {icon}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-7xl mb-4">{screen.icon}</div>
                )}
                <h2 className="text-3xl font-bold">{screen.title}</h2>
                <p className="text-xl font-light italic">{screen.subtitle}</p>
                <p className="text-lg leading-relaxed">{screen.description}</p>
              </div>
              <div className="flex justify-center gap-2 pt-4">
                {carouselScreens.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === carouselIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    if (carouselIndex > 0) {
                      setCarouselIndex(carouselIndex - 1)
                    } else {
                      setCurrentScreen('welcome')
                    }
                  }}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  className="bg-white text-gray-900 hover:bg-white/90"
                  onClick={() => {
                    if (carouselIndex < carouselScreens.length - 1) {
                      setCarouselIndex(carouselIndex + 1)
                    } else {
                      setCurrentScreen('signup')
                    }
                  }}
                >
                  {carouselIndex < carouselScreens.length - 1 ? 'Next' : 'Continue'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quick Setup Screen
  if (currentScreen === 'signup') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Let's connect you with your community</h2>
              <p className="text-sm text-muted-foreground">
                Your data stays private. It's used only to connect you with verified mentors and local resources.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('carousel')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="btn-primary"
                onClick={() => setCurrentScreen('path')}
                disabled={!userData.username || !userData.email}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => handleComplete()}
              >
                <User className="w-4 h-4 mr-2" />
                Browse as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Choose Your Path Screen
  if (currentScreen === 'path') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What would you like to focus on first?</h2>
              <p className="text-muted-foreground">You can select both — we'll personalize your experience</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all ${
                  userData.path.includes('resources')
                    ? 'ring-2 ring-green-500 bg-green-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handlePathToggle('resources')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">🧭</div>
                    {userData.path.includes('resources') && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">Find Support & Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Access food, housing, healthcare, education, or financial help
                  </p>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  userData.path.includes('mentorship')
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handlePathToggle('mentorship')}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">🤝</div>
                    {userData.path.includes('mentorship') && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">Find or Become a Mentor</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn new skills, prepare for work, or guide others in your community
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('signup')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="btn-primary"
                onClick={() => setCurrentScreen('personalize')}
                disabled={userData.path.length === 0}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Personalization Screen
  if (currentScreen === 'personalize') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Let's personalize your experience</h2>
              <p className="text-muted-foreground">Tell us what matters most to you</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="location">📍 Your Location</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="location"
                    placeholder="City, State or ZIP code"
                    className="pl-10"
                    value={userData.location}
                    onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>📦 Categories of Interest</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {resourceCategories.map((category) => (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all ${
                        userData.interests.includes(category.id)
                          ? 'ring-2 ring-secondary bg-secondary/10'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleInterestToggle(category.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        {category.icon}
                        <span className="font-medium">{category.label}</span>
                        {userData.interests.includes(category.id) && (
                          <Check className="w-4 h-4 ml-auto text-secondary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="goals">🧰 Skills or Goals</Label>
                <Input
                  id="goals"
                  placeholder="e.g., Learning tailoring, Finding farm work, Starting a small shop"
                  className="mt-2"
                  value={userData.goals.join(', ')}
                  onChange={(e) => setUserData({ ...userData, goals: e.target.value.split(',').map(g => g.trim()) })}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('path')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="btn-primary"
                onClick={() => setCurrentScreen('preview')}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Dashboard Preview Screen
  if (currentScreen === 'preview') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">The GrowTogether Bridge in Action</h2>
              <p className="text-muted-foreground">Your bridge connects both support and opportunity</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {userData.path.includes('resources') && (
                <Card className="bg-green-50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-green-800">Resource Hub</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍲</span>
                        <span className="text-sm">2 Food Shares Nearby</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏠</span>
                        <span className="text-sm">Housing Offers in Your Area</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💪</span>
                        <span className="text-sm">New Job Postings</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {userData.path.includes('mentorship') && (
                <Card className="bg-blue-50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-blue-800">Mentorship Network</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧑‍🏫</span>
                        <span className="text-sm">3 Local Mentors Available</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💼</span>
                        <span className="text-sm">Learn Basic Accounting with a Mentor</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <span className="text-sm">Mentor Training Session: Thursday</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('personalize')}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="btn-primary"
                onClick={() => setCurrentScreen('final')}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Final Motivation Screen
  if (currentScreen === 'final') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardContent className="p-12 space-y-8 text-center">
            <div className="text-8xl mb-4">🤝</div>
            <h2 className="text-4xl font-bold">Build Bridges, Not Barriers</h2>
            <div className="space-y-4 text-xl leading-relaxed">
              <p>Poverty ends when communities connect.</p>
              <p>Share what you can. Learn what you need.</p>
              <p className="font-semibold">Together, we build stronger futures.</p>
            </div>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 text-xl px-12 py-6 mt-8"
              onClick={handleComplete}
            >
              Start Connecting
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}


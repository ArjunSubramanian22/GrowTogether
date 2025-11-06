import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Users, Sprout } from 'lucide-react'
import api from '../lib/api'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    age: '',
    location: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        })
        onLogin(response.data.user)
        // Check if user has completed onboarding
        try {
          await api.get(`/preferences/${response.data.user.id}`)
          navigate('/home')
        } catch (err) {
          // No preferences found, redirect to onboarding
          navigate('/onboarding')
        }
      } else {
        // Register
        const response = await api.post('/auth/register', {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          age: parseInt(formData.age),
          location: formData.location
        })
        // Auto-login after registration
        const loginResponse = await api.post('/auth/login', {
          username: formData.username,
          password: formData.password
        })
        onLogin(loginResponse.data.user)
        navigate('/onboarding')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-white space-y-6 hidden md:block">
          <div className="flex items-center gap-3">
            <Leaf className="w-12 h-12" />
            <h1 className="text-5xl font-bold">GrowTogether</h1>
          </div>
          <p className="text-2xl font-light">Building stronger communities, one connection at a time</p>
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Find Resources</h3>
                <p className="text-white/90">Discover food banks, community kitchens, and support services near you</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sprout className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Grow Skills</h3>
                <p className="text-white/90">Connect with mentors and find job opportunities for ages 16+</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Leaf className="w-6 h-6 mt-1" />
              <div>
                <h3 className="font-semibold text-lg">Build Community</h3>
                <p className="text-white/90">Share resources, trade goods, and support each other</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login/Register Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Join GrowTogether'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to access your community' : 'Create an account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="username"
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              {!isLogin && (
                <>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="age"
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      name="location"
                      type="text"
                      placeholder="Location (City, State)"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}
              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


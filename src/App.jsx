import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import screens
import HomePage from './screens/HomePage'
import LoginPage from './screens/LoginPage'
import OnboardingFlow from './screens/OnboardingFlow'
import FindFoodPage from './screens/FindFoodPage'
import ResourceDetailPage from './screens/ResourceDetailPage'
import FoodRescuePage from './screens/FoodRescuePage'
import PersonalizedMealsPage from './screens/PersonalizedMealsPage'
import JobsPage from './screens/JobsPage'
import MarketplacePage from './screens/MarketplacePage'
import MarketplaceChatPage from './screens/MarketplaceChatPage'
import SeedBuddyPage from './screens/SeedBuddyPage'
import SettingsPage from './screens/SettingsPage'
import api from './lib/api'

function App() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
      // Check if user has completed onboarding
      checkOnboardingStatus(userData.id)
    }
  }, [])

  const checkOnboardingStatus = async (userId) => {
    try {
      const response = await api.get(`/preferences/${userId}`)
      setNeedsOnboarding(!response.data || Object.keys(response.data).length === 0)
    } catch (err) {
      // If preferences don't exist, user needs onboarding
      setNeedsOnboarding(true)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setNeedsOnboarding(true) // New users need onboarding
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleOnboardingComplete = async (onboardingData) => {
    try {
      // Save onboarding data to backend
      await api.post(`/preferences/${user.id}`, onboardingData)
      setNeedsOnboarding(false)
      // Force a re-render and navigation to home
      window.location.href = '/home'
    } catch (err) {
      console.error("Error saving onboarding data:", err)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setNeedsOnboarding(false)
    localStorage.removeItem("user")
  }

  // Redirect to onboarding if needed
  if (isAuthenticated && needsOnboarding) {
    return (
      <Router>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </Router>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/home" element={isAuthenticated ? <HomePage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/find-food" element={isAuthenticated ? <FindFoodPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/resource/:id" element={isAuthenticated ? <ResourceDetailPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/food-rescue" element={isAuthenticated ? <FoodRescuePage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/meals" element={isAuthenticated ? <PersonalizedMealsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/jobs" element={isAuthenticated ? <JobsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/marketplace" element={isAuthenticated ? <MarketplacePage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/marketplace/:itemId/chat" element={isAuthenticated ? <MarketplaceChatPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/seedbuddy" element={isAuthenticated ? <SeedBuddyPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/settings" element={isAuthenticated ? <SettingsPage user={user} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, DollarSign, ArrowLeft, ChefHat } from 'lucide-react'
import api from '../lib/api'

export default function PersonalizedMealsPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPersonalizedMeals()
  }, [])

  const fetchPersonalizedMeals = async () => {
    try {
      const response = await api.get(`/meals/personalized/${user.id}`)
      setMeals(response.data)
    } catch (err) {
      console.error('Error fetching personalized meals:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Personalized Meal Ideas</h1>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Meals Just for You</h2>
          <p className="text-lg">Based on your dietary preferences and favorite cuisines</p>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your personalized meals...</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No meals found. Complete your onboarding to get personalized suggestions!</p>
            <Button onClick={() => navigate('/onboarding')}>Update Preferences</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <Card key={meal.id} className="overflow-hidden card-hover">
                {meal.image_url && (
                  <img
                    src={meal.image_url}
                    alt={meal.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold">{meal.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(meal.difficulty)}`}>
                      {meal.difficulty}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{meal.description}</p>
                  
                  {/* Dietary Tags */}
                  {meal.dietary_tags && meal.dietary_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {meal.dietary_tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full capitalize">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meal Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{meal.prep_time} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${meal.cost_estimate?.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  {meal.nutrition_info && (
                    <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{meal.nutrition_info.calories}</div>
                        <div className="text-muted-foreground">cal</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{meal.nutrition_info.protein}g</div>
                        <div className="text-muted-foreground">protein</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{meal.nutrition_info.carbs}g</div>
                        <div className="text-muted-foreground">carbs</div>
                      </div>
                    </div>
                  )}

                  <Button className="w-full btn-primary">
                    View Recipe
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


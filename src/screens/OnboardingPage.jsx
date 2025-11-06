import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import api from '../lib/api'

export default function OnboardingPage({ user }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    dietary_restrictions: [],
    favorite_cuisines: [],
    skill_interests: [],
    job_interests: [],
    experience_level: '',
    availability: [],
    transportation: '',
    goals: [],
    household_size: '',
    monthly_income_range: '',
    employment_status: '',
    education_level: '',
    housing_situation: '',
    health_conditions: [],
    language_preferences: [],
    community_interests: [],
    volunteer_interests: [],
    additional_notes: ''
  })

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'kosher', 'nut-free', 'none']
  const cuisineOptions = ['italian', 'mexican', 'asian', 'mediterranean', 'american', 'indian', 'middle-eastern', 'african']
  const skillOptions = ['cooking', 'gardening', 'tech', 'arts-crafts', 'repair-maintenance', 'childcare', 'tutoring', 'healthcare']
  const jobOptions = ['food service', 'retail', 'agriculture', 'tech', 'healthcare', 'education', 'construction', 'hospitality']
  const experienceOptions = ['beginner', 'intermediate', 'advanced']
  const availabilityOptions = ['weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'flexible']
  const transportationOptions = ['car', 'bike', 'public_transit', 'walking', 'none']
  const goalOptions = ['find_food', 'learn_skills', 'earn_income', 'build_community', 'start_garden', 'find_mentor']
  const householdSizeOptions = ['1', '2', '3-4', '5-6', '7+']
  const incomeRangeOptions = ['under_10k', '10k-20k', '20k-30k', '30k-40k', '40k+']
  const employmentOptions = ['unemployed', 'part-time', 'full-time', 'student', 'retired', 'self-employed']
  const educationOptions = ['high_school', 'some_college', 'associates', 'bachelors', 'graduate', 'other']
  const housingOptions = ['own', 'rent', 'family', 'shelter', 'transitional', 'other']
  const healthOptions = ['diabetes', 'hypertension', 'food_allergies', 'mobility_issues', 'none', 'prefer_not_to_say']
  const languageOptions = ['english', 'spanish', 'mandarin', 'vietnamese', 'tagalog', 'korean', 'arabic', 'other']
  const communityOptions = ['food_security', 'youth_programs', 'senior_support', 'family_services', 'mental_health', 'housing']
  const volunteerOptions = ['food_distribution', 'tutoring', 'gardening', 'event_planning', 'administrative', 'outreach']

  const handleCheckboxChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleRadioChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await api.post(`/preferences/${user.id}`, preferences)
      navigate('/home')
    } catch (err) {
      console.error('Error saving preferences:', err)
      alert('Failed to save preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tell us about your dietary preferences</h3>
            <p className="text-sm text-muted-foreground">This helps us suggest appropriate meals and food resources</p>
            <div className="grid grid-cols-2 gap-3">
              {dietaryOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dietary-${option}`}
                    checked={preferences.dietary_restrictions.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('dietary_restrictions', option)}
                  />
                  <Label htmlFor={`dietary-${option}`} className="capitalize cursor-pointer">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What types of cuisine do you enjoy?</h3>
            <p className="text-sm text-muted-foreground">We'll personalize meal suggestions based on your tastes</p>
            <div className="grid grid-cols-2 gap-3">
              {cuisineOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${option}`}
                    checked={preferences.favorite_cuisines.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('favorite_cuisines', option)}
                  />
                  <Label htmlFor={`cuisine-${option}`} className="capitalize cursor-pointer">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What skills are you interested in learning?</h3>
            <p className="text-sm text-muted-foreground">We'll connect you with mentors and training opportunities</p>
            <div className="grid grid-cols-2 gap-3">
              {skillOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${option}`}
                    checked={preferences.skill_interests.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('skill_interests', option)}
                  />
                  <Label htmlFor={`skill-${option}`} className="capitalize cursor-pointer">
                    {option.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What types of jobs interest you?</h3>
            <p className="text-sm text-muted-foreground">We'll show you relevant opportunities for ages 16+</p>
            <div className="grid grid-cols-2 gap-3">
              {jobOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`job-${option}`}
                    checked={preferences.job_interests.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('job_interests', option)}
                  />
                  <Label htmlFor={`job-${option}`} className="capitalize cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's your experience level?</h3>
            <RadioGroup value={preferences.experience_level} onValueChange={(value) => handleRadioChange('experience_level', value)}>
              {experienceOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`exp-${option}`} />
                  <Label htmlFor={`exp-${option}`} className="capitalize cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">When are you typically available?</h3>
            <div className="grid grid-cols-2 gap-3">
              {availabilityOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`avail-${option}`}
                    checked={preferences.availability.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('availability', option)}
                  />
                  <Label htmlFor={`avail-${option}`} className="capitalize cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's your primary mode of transportation?</h3>
            <RadioGroup value={preferences.transportation} onValueChange={(value) => handleRadioChange('transportation', value)}>
              {transportationOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`trans-${option}`} />
                  <Label htmlFor={`trans-${option}`} className="capitalize cursor-pointer">
                    {option.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 8:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What are your main goals with GrowTogether?</h3>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${option}`}
                    checked={preferences.goals.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('goals', option)}
                  />
                  <Label htmlFor={`goal-${option}`} className="capitalize cursor-pointer">
                    {option.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 9:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Tell us about your household</h3>
            <div className="space-y-3">
              <div>
                <Label>Household size</Label>
                <RadioGroup value={preferences.household_size} onValueChange={(value) => handleRadioChange('household_size', value)}>
                  {householdSizeOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`household-${option}`} />
                      <Label htmlFor={`household-${option}`} className="cursor-pointer">
                        {option} {option === '1' ? 'person' : 'people'}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        )
      case 10:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What's your current employment status?</h3>
            <RadioGroup value={preferences.employment_status} onValueChange={(value) => handleRadioChange('employment_status', value)}>
              {employmentOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`employment-${option}`} />
                  <Label htmlFor={`employment-${option}`} className="capitalize cursor-pointer">
                    {option.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
      case 11:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What languages do you speak?</h3>
            <p className="text-sm text-muted-foreground">This helps us provide resources in your preferred language</p>
            <div className="grid grid-cols-2 gap-3">
              {languageOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${option}`}
                    checked={preferences.language_preferences.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('language_preferences', option)}
                  />
                  <Label htmlFor={`lang-${option}`} className="capitalize cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 12:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Which community services interest you most?</h3>
            <div className="grid grid-cols-2 gap-3">
              {communityOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`community-${option}`}
                    checked={preferences.community_interests.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('community_interests', option)}
                  />
                  <Label htmlFor={`community-${option}`} className="capitalize cursor-pointer">
                    {option.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 13:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Would you like to volunteer?</h3>
            <p className="text-sm text-muted-foreground">Select areas where you'd like to help others</p>
            <div className="grid grid-cols-2 gap-3">
              {volunteerOptions.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`volunteer-${option}`}
                    checked={preferences.volunteer_interests.includes(option)}
                    onCheckedChange={() => handleCheckboxChange('volunteer_interests', option)}
                  />
                  <Label htmlFor={`volunteer-${option}`} className="capitalize cursor-pointer">
                    {option.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )
      case 14:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Anything else you'd like us to know?</h3>
            <p className="text-sm text-muted-foreground">Share any additional information that might help us serve you better</p>
            <Textarea
              placeholder="Optional: Tell us about any specific needs, concerns, or goals..."
              value={preferences.additional_notes}
              onChange={(e) => handleInputChange('additional_notes', e.target.value)}
              rows={5}
            />
          </div>
        )
      default:
        return null
    }
  }

  const totalSteps = 14

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Let's personalize your experience</CardTitle>
          <CardDescription>
            Help us understand your needs and preferences (Step {step} of {totalSteps})
          </CardDescription>
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} className="btn-primary">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


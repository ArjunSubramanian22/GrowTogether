import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Briefcase, MapPin, Clock, DollarSign, ArrowLeft, ExternalLink, User, Search } from 'lucide-react'
import api from '../lib/api'

export default function JobsPage({ user, onLogout }) {
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [mentors, setMentors] = useState([])
  const [filteredMentors, setFilteredMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('jobs')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [oppsResponse, mentorsResponse] = await Promise.all([
        api.get(`/opportunities/personalized/${user.id}`),
        api.get('/mentors')
      ])
      setOpportunities(oppsResponse.data)
      setFilteredOpportunities(oppsResponse.data)
      setMentors(mentorsResponse.data)
      setFilteredMentors(mentorsResponse.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      // Filter opportunities
      const filteredOpps = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.skills_offered && opp.skills_offered.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
      setFilteredOpportunities(filteredOpps)

      // Filter mentors
      const filteredMents = mentors.filter(mentor =>
        mentor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.expertise && mentor.expertise.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
      setFilteredMentors(filteredMents)
    } else {
      setFilteredOpportunities(opportunities)
      setFilteredMentors(mentors)
    }
  }, [searchTerm, opportunities, mentors])

  const getTypeColor = (type) => {
    switch (type) {
      case 'job':
        return 'bg-blue-100 text-blue-800'
      case 'apprenticeship':
        return 'bg-purple-100 text-purple-800'
      case 'volunteer':
        return 'bg-green-100 text-green-800'
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
          <h1 className="text-2xl font-bold">Jobs & Mentorship</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                activeTab === 'jobs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              Opportunities
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                activeTab === 'mentors'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('mentors')}
            >
              <User className="w-4 h-4 inline mr-2" />
              Mentors
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={activeTab === 'jobs' ? "Search opportunities by title, location, or skills..." : "Search mentors by name, bio, or expertise..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : activeTab === 'jobs' ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Opportunities for You</h2>
              <p className="text-muted-foreground">Based on your interests and age ({user.age}+)</p>
            </div>
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No opportunities match your search.' : 'No opportunities found. Update your preferences to see more!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpportunities.map((opp) => (
                  <Card key={opp.id} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold">{opp.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(opp.type)}`}>
                          {opp.type}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{opp.description}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{opp.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{opp.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>{opp.compensation}</span>
                        </div>
                      </div>

                      {/* Skills Offered */}
                      {opp.skills_offered && opp.skills_offered.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Skills you'll learn:</p>
                          <div className="flex flex-wrap gap-2">
                            {opp.skills_offered.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full capitalize">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Requirements */}
                      {opp.requirements && opp.requirements.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Requirements:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {opp.requirements.map((req, index) => (
                              <li key={index}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button className="w-full btn-primary" onClick={() => window.open(opp.application_link, '_blank')}>
                        Apply Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Connect with Mentors</h2>
              <p className="text-muted-foreground">Learn from experienced professionals in your field of interest</p>
            </div>
            {filteredMentors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? 'No mentors match your search.' : 'No mentors available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <Card key={mentor.id} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-bold text-secondary">
                          {mentor.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{mentor.username}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>⭐</span>
                            <span>{mentor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>
                      
                      {/* Expertise */}
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Expertise:</p>
                          <div className="flex flex-wrap gap-2">
                            {mentor.expertise.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Age Groups */}
                      {mentor.age_groups && mentor.age_groups.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Mentors ages:</p>
                          <p className="text-sm text-muted-foreground">{mentor.age_groups.join(', ')}</p>
                        </div>
                      )}

                      <Button className="w-full btn-primary">
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}


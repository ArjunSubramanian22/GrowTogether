import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Clock, Phone, Mail, ArrowLeft, FileText, CheckCircle } from 'lucide-react'
import api from '../lib/api'

export default function ResourceDetailPage({ user, onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResourceDetail()
  }, [id])

  const fetchResourceDetail = async () => {
    try {
      const response = await api.get(`/resources/${id}`)
      setResource(response.data)
    } catch (err) {
      console.error('Error fetching resource details:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Resource not found</p>
          <Button onClick={() => navigate('/find-food')}>Back to Resources</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/find-food')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">{resource.name}</h1>
        </div>
      </header>

      {/* Resource Image */}
      {resource.image_url && (
        <div className="w-full h-64 md:h-96">
          <img
            src={resource.image_url}
            alt={resource.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Resource Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{resource.description}</p>
              </CardContent>
            </Card>

            {resource.details && (
              <>
                {resource.details.services_offered && resource.details.services_offered.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Services Offered</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resource.details.services_offered.map((service, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {resource.details.eligibility_requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{resource.details.eligibility_requirements}</p>
                    </CardContent>
                  </Card>
                )}

                {resource.details.documents_needed && resource.details.documents_needed.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {resource.details.documents_needed.map((doc, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {resource.details.additional_info && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{resource.details.additional_info}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{resource.address}</p>
                  </div>
                </div>

                {resource.contact_info && resource.contact_info.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{resource.contact_info.phone}</p>
                    </div>
                  </div>
                )}

                {resource.contact_info && resource.contact_info.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{resource.contact_info.email}</p>
                    </div>
                  </div>
                )}

                {resource.availability && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-2">Hours</p>
                      <div className="space-y-1 text-sm">
                        {Object.entries(resource.availability).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize text-muted-foreground">{day}:</span>
                            <span className="text-foreground">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {resource.languages_supported && resource.languages_supported.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resource.languages_supported.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button className="w-full btn-primary" size="lg">
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


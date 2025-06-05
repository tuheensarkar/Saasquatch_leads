"use client"

import { useState } from "react"
import { Search, Globe, Users, Building, MapPin, Phone, Mail, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Lead } from "@/types/lead"

interface LeadEnrichmentProps {
  leads: Lead[]
  onEnrichLead: (leadId: string, enrichmentData: any) => void
}

export function LeadEnrichment({ leads, onEnrichLead }: LeadEnrichmentProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentData, setEnrichmentData] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const mockEnrichmentData = {
    companyInfo: {
      website: "https://example.com",
      description: "Leading technology company specializing in innovative solutions",
      employees: "500-1000",
      founded: "2010",
      headquarters: "San Francisco, CA",
      socialMedia: {
        linkedin: "https://linkedin.com/company/example",
        twitter: "https://twitter.com/example",
      },
    },
    contactInfo: {
      alternativeEmails: ["contact@example.com", "sales@example.com"],
      directPhone: "+1-555-0123",
      departments: ["Sales", "Marketing", "Engineering"],
    },
    businessIntel: {
      recentNews: [
        "Company announces $50M Series B funding",
        "Launches new AI-powered product line",
        "Expands to European markets",
      ],
      competitors: ["CompetitorA", "CompetitorB", "CompetitorC"],
      technologies: ["React", "Node.js", "AWS", "MongoDB"],
    },
  }

  const handleEnrichLead = async (lead: Lead) => {
    setIsEnriching(true)
    setSelectedLead(lead)

    // Simulate API call
    setTimeout(() => {
      setEnrichmentData(mockEnrichmentData)
      setIsEnriching(false)
    }, 2000)
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const enrichmentScore = selectedLead
    ? Math.min(
        (selectedLead.emailValid ? 25 : 0) +
          (selectedLead.phoneValid ? 25 : 0) +
          (selectedLead.industry ? 25 : 0) +
          (selectedLead.revenue > 0 ? 25 : 0),
        100,
      )
    : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Search className="w-6 h-6 text-blue-600" />
            <span>Lead Enrichment</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Enhance your leads with additional company and contact information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Lead to Enrich</CardTitle>
            <CardDescription>Choose a lead to gather additional information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLeads.map((lead, index) => (
                <div
                  key={`${lead.companyName}-${index}`}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLead === lead
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{lead.companyName}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{lead.email}</p>
                      {lead.industry && (
                        <Badge variant="outline" className="mt-1">
                          {lead.industry}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={lead.leadScore >= 70 ? "default" : "secondary"}>{lead.leadScore}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEnrichLead(lead)
                        }}
                        disabled={isEnriching}
                      >
                        {isEnriching && selectedLead === lead ? "Enriching..." : "Enrich"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrichment Results */}
        <Card>
          <CardHeader>
            <CardTitle>Enrichment Results</CardTitle>
            <CardDescription>
              {selectedLead ? `Information for ${selectedLead.companyName}` : "Select a lead to view enrichment data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-4">
                {/* Enrichment Score */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span className="text-sm font-bold">{enrichmentScore}%</span>
                  </div>
                  <Progress value={enrichmentScore} className="h-2" />
                </div>

                {isEnriching ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Gathering additional information...</p>
                  </div>
                ) : enrichmentData ? (
                  <Tabs defaultValue="company" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="company">Company</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                      <TabsTrigger value="intelligence">Intel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="company" className="space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <a
                            href={enrichmentData.companyInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>{enrichmentData.companyInfo.website}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span>{enrichmentData.companyInfo.employees} employees</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-purple-600" />
                          <span>Founded in {enrichmentData.companyInfo.founded}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>{enrichmentData.companyInfo.headquarters}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {enrichmentData.companyInfo.description}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-3">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Alternative Emails</span>
                          </h4>
                          {enrichmentData.contactInfo.alternativeEmails.map((email: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="mr-2">
                              {email}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>Direct Phone</span>
                          </h4>
                          <Badge variant="outline">{enrichmentData.contactInfo.directPhone}</Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Departments</h4>
                          {enrichmentData.contactInfo.departments.map((dept: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="mr-2">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="intelligence" className="space-y-3">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Recent News</h4>
                          <div className="space-y-2">
                            {enrichmentData.businessIntel.recentNews.map((news: string, idx: number) => (
                              <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                {news}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Technologies</h4>
                          {enrichmentData.businessIntel.technologies.map((tech: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="mr-2 mb-1">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Competitors</h4>
                          {enrichmentData.businessIntel.competitors.map((comp: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="mr-2">
                              {comp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Enrich" to gather additional information</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a lead from the list to begin enrichment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Mail, Send, Copy, Edit, Plus, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Lead } from "@/types/lead"

interface EmailTemplatesProps {
  leads: Lead[]
}

export function EmailTemplates({ leads }: EmailTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("cold-outreach")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [customTemplate, setCustomTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const templates = {
    "cold-outreach": {
      name: "Cold Outreach",
      subject: "Quick question about {{company}}",
      body: `Hi there,

I noticed {{company}} is in the {{industry}} space and thought you might be interested in how we've helped similar companies increase their revenue by 30%.

Would you be open to a brief 15-minute call this week to discuss how we could potentially help {{company}} achieve similar results?

Best regards,
[Your Name]`,
    },
    "follow-up": {
      name: "Follow-up",
      subject: "Following up on {{company}}",
      body: `Hi,

I wanted to follow up on my previous email about helping {{company}} with [specific solution].

I understand you're probably busy, but I believe we could add significant value to your {{industry}} operations.

Would next Tuesday or Wednesday work for a quick call?

Best,
[Your Name]`,
    },
    "value-proposition": {
      name: "Value Proposition",
      subject: "How {{company}} can save money annually",
      body: `Hello,

Companies in the {{industry}} sector like {{company}} typically see significant cost savings when they optimize their operations.

Based on your company size and industry, I estimate {{company}} could save approximately {{revenue_savings}} annually with our solution.

Would you be interested in a brief case study showing how we achieved this for a similar company?

Regards,
[Your Name]`,
    },
  }

  const generatePersonalizedEmail = (template: any, lead: Lead) => {
    if (!lead) return template

    const revenueSavings = "$" + Math.round((lead.revenue || 100000) * 0.1).toLocaleString()

    const personalizedSubject = template.subject
      .replace(/\{\{company\}\}/g, lead.companyName)
      .replace(/\{\{industry\}\}/g, lead.industry || "your industry")
      .replace(/\{\{revenue_savings\}\}/g, revenueSavings)

    const personalizedBody = template.body
      .replace(/\{\{company\}\}/g, lead.companyName)
      .replace(/\{\{industry\}\}/g, lead.industry || "your industry")
      .replace(/\{\{revenue_savings\}\}/g, revenueSavings)

    return {
      subject: personalizedSubject,
      body: personalizedBody,
    }
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      const companyName = selectedLead?.companyName || "Your Company"
      const industry = selectedLead?.industry || "technology"

      const aiTemplate = `Subject: Exclusive opportunity for ${companyName}

Hi there,

I've been researching companies in the ${industry} space and ${companyName} caught my attention.

Your recent growth trajectory suggests you might be facing [specific challenge]. We've helped similar companies overcome this exact challenge, resulting in:

• 40% increase in operational efficiency
• 25% reduction in costs
• Improved customer satisfaction scores

Would you be open to a 15-minute conversation about how we could potentially help ${companyName} achieve similar results?

I have some time available this Thursday or Friday afternoon. Which works better for you?

Best regards,
[Your Name]
[Your Title]
[Your Company]`

      setCustomTemplate(aiTemplate)
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const highScoreLeads = leads.filter((lead) => lead.leadScore >= 70).slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Mail className="w-6 h-6 text-green-600" />
            <span>Email Templates</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Personalized email templates for your lead outreach campaigns
          </p>
        </div>
        <Button
          onClick={handleGenerateAI}
          disabled={!selectedLead || isGenerating}
          className="bg-gradient-to-r from-green-600 to-blue-600"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Lead</CardTitle>
            <CardDescription>Choose a high-scoring lead for personalization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {highScoreLeads.map((lead, index) => (
                <div
                  key={`${lead.companyName}-${index}`}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLead === lead
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
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
                    <Badge variant="default">{lead.leadScore}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Choose from pre-built templates or create custom ones</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="templates" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-3">
                {Object.entries(templates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === key
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedTemplate(key)}
                  >
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{template.subject}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="custom" className="space-y-3">
                <Textarea
                  placeholder="Create your custom email template..."
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  rows={10}
                />
                <Button size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
            <CardDescription>
              {selectedLead ? `Personalized for ${selectedLead.companyName}` : "Select a lead to see personalization"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-4">
                {customTemplate ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Custom Template:</label>
                      <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                        <pre className="text-sm whitespace-pre-wrap">{customTemplate}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const template = templates[selectedTemplate as keyof typeof templates]
                    const personalized = generatePersonalizedEmail(template, selectedLead)
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Subject:</label>
                          <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded border">
                            {personalized.subject}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Body:</label>
                          <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                            <pre className="text-sm whitespace-pre-wrap">{personalized.body}</pre>
                          </div>
                        </div>
                      </div>
                    )
                  })()
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        customTemplate ||
                          generatePersonalizedEmail(templates[selectedTemplate as keyof typeof templates], selectedLead)
                            .body,
                      )
                    }
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="default">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a lead to preview personalized email</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

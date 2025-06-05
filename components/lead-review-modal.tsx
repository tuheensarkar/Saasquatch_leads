"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building,
  Mail,
  Phone,
  DollarSign,
  Star,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Edit,
  Save,
  X,
} from "lucide-react"
import type { Lead } from "@/types/lead"
import { getLeadPriority } from "@/lib/lead-utils"

interface LeadReviewModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void
  onAddActivity: (activity: any) => void
}

export function LeadReviewModal({ lead, isOpen, onClose, onUpdateLead, onAddActivity }: LeadReviewModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({})
  const [notes, setNotes] = useState("")
  const [followUpAction, setFollowUpAction] = useState("")
  const [priority, setPriority] = useState("")

  if (!lead) return null

  const leadPriority = getLeadPriority(lead.leadScore)

  const handleSave = () => {
    if (Object.keys(editedLead).length > 0) {
      onUpdateLead(lead.companyName, editedLead)
    }

    if (notes || followUpAction) {
      onAddActivity({
        leadId: lead.companyName.toLowerCase().replace(/\s+/g, "-"),
        type: "note",
        title: "Lead Review Completed",
        description: `Notes: ${notes}\nFollow-up: ${followUpAction}`,
        date: new Date().toISOString(),
        status: "completed",
      })
    }

    setIsEditing(false)
    setNotes("")
    setFollowUpAction("")
    onClose()
  }

  const getValidationStatus = (isValid: boolean, score?: number) => {
    if (!isValid) return { icon: <X className="w-4 h-4 text-red-500" />, text: "Invalid", color: "red" }
    if (score && score >= 80)
      return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: "Excellent", color: "green" }
    if (score && score >= 60)
      return { icon: <CheckCircle className="w-4 h-4 text-yellow-500" />, text: "Good", color: "yellow" }
    return { icon: <CheckCircle className="w-4 h-4 text-blue-500" />, text: "Valid", color: "blue" }
  }

  const emailStatus = getValidationStatus(lead.emailValid, (lead as any).emailScore)
  const phoneStatus = getValidationStatus(lead.phoneValid, (lead as any).phoneScore)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span>{lead.companyName}</span>
                  <Badge
                    variant={
                      leadPriority.level === "Critical"
                        ? "destructive"
                        : leadPriority.level === "High"
                          ? "default"
                          : "secondary"
                    }
                    className="ml-3"
                  >
                    {leadPriority.level} Priority
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                Lead Score: {lead.leadScore}/100 • {leadPriority.action}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              {isEditing && (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Company Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Company Name</Label>
                    <div className="text-lg font-semibold">{lead.companyName}</div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600">Industry</Label>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <Select
                          value={editedLead.industry || lead.industry}
                          onValueChange={(value) => setEditedLead({ ...editedLead, industry: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Software">Software</SelectItem>
                            <SelectItem value="SaaS">SaaS</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Professional Services">Professional Services</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{lead.industry || "Not specified"}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600">Annual Revenue</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-semibold">
                        {lead.revenue ? `$${(lead.revenue / 1000000).toFixed(1)}M` : "Not available"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Scoring Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Lead Score Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{lead.leadScore}</div>
                    <Progress value={lead.leadScore} className="h-3" />
                    <div className="text-sm text-slate-600 mt-2">{leadPriority.timeline}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Quality</span>
                      <div className="flex items-center space-x-2">
                        {emailStatus.icon}
                        <span className="text-sm font-medium">{(lead as any).emailScore || 70}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Phone Quality</span>
                      <div className="flex items-center space-x-2">
                        {phoneStatus.icon}
                        <span className="text-sm font-medium">{(lead as any).phoneScore || 70}%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue Score</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {lead.revenue ? Math.min(Math.round((lead.revenue / 10000000) * 20), 20) : 0}/20
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Industry Score</span>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">{lead.industry ? "8/10" : "0/10"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Email Address</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm">{lead.email}</span>
                      {emailStatus.icon}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600">Validation Status</Label>
                    <Badge variant={emailStatus.color === "green" ? "default" : "secondary"}>{emailStatus.text}</Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600">Deliverability Score</Label>
                    <div className="flex items-center space-x-2">
                      <Progress value={(lead as any).emailScore || 70} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{(lead as any).emailScore || 70}%</span>
                    </div>
                  </div>

                  {(lead as any).emailReason && (
                    <div>
                      <Label className="text-sm font-medium text-slate-600">Notes</Label>
                      <div className="text-sm text-slate-600">{(lead as any).emailReason}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Phone Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Phone Number</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm">{lead.phone || "Not provided"}</span>
                      {lead.phone && phoneStatus.icon}
                    </div>
                  </div>

                  {lead.phone && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-slate-600">Validation Status</Label>
                        <Badge variant={phoneStatus.color === "green" ? "default" : "secondary"}>
                          {phoneStatus.text}
                        </Badge>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-600">Phone Type</Label>
                        <Badge variant="outline">{(lead as any).phoneType || "Unknown"}</Badge>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-600">Reachability Score</Label>
                        <div className="flex items-center space-x-2">
                          <Progress value={(lead as any).phoneScore || 70} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{(lead as any).phoneScore || 70}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {lead.leadScore >= 80 ? "25%" : lead.leadScore >= 60 ? "15%" : "5%"}
                    </div>
                    <div className="text-sm text-slate-600">Estimated Conversion Probability</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Completeness</span>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (((lead.emailValid ? 1 : 0) +
                            (lead.phoneValid ? 1 : 0) +
                            (lead.industry ? 1 : 0) +
                            (lead.revenue ? 1 : 0)) /
                            4) *
                            100,
                        )}
                        %
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Contact Quality</span>
                      <span className="text-sm font-medium">
                        {lead.emailValid && lead.phoneValid
                          ? "Excellent"
                          : lead.emailValid || lead.phoneValid
                            ? "Good"
                            : "Poor"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm">Revenue Potential</span>
                      <span className="text-sm font-medium">
                        {lead.revenue && lead.revenue > 1000000
                          ? "High"
                          : lead.revenue && lead.revenue > 100000
                            ? "Medium"
                            : "Low"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lead.leadScore >= 80 && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-red-800 dark:text-red-200">Urgent Action Required</div>
                          <div className="text-sm text-red-600 dark:text-red-300">
                            Contact within 1 hour for best results
                          </div>
                        </div>
                      </div>
                    )}

                    {!lead.emailValid && (
                      <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">
                            Email Validation Needed
                          </div>
                          <div className="text-sm text-yellow-600 dark:text-yellow-300">
                            Verify email before outreach
                          </div>
                        </div>
                      </div>
                    )}

                    {!lead.phone && (
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">Phone Number Missing</div>
                          <div className="text-sm text-blue-600 dark:text-blue-300">Consider data enrichment</div>
                        </div>
                      </div>
                    )}

                    {lead.leadScore >= 60 && (
                      <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-200">High-Quality Lead</div>
                          <div className="text-sm text-green-600 dark:text-green-300">Prioritize for outreach</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>

                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>

                  <Button className="w-full justify-start" variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Add to CRM
                  </Button>

                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes & Follow-up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this lead..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="followup">Follow-up Action</Label>
                    <Select value={followUpAction} onValueChange={setFollowUpAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select follow-up action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Schedule phone call</SelectItem>
                        <SelectItem value="email">Send follow-up email</SelectItem>
                        <SelectItem value="meeting">Book meeting</SelectItem>
                        <SelectItem value="research">Research company further</SelectItem>
                        <SelectItem value="nurture">Add to nurture campaign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Set priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

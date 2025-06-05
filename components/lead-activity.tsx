"use client"

import { useState } from "react"
import { Calendar, Clock, MessageSquare, Phone, Mail, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import type { Lead } from "@/types/lead"

interface Activity {
  id: string
  leadId: string
  type: "call" | "email" | "meeting" | "note"
  title: string
  description: string
  date: string
  status: "completed" | "scheduled" | "cancelled"
}

interface LeadActivityProps {
  leads: Lead[]
  onAddActivity: (activity: Omit<Activity, "id">) => void
}

export function LeadActivity({ leads, onAddActivity }: LeadActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "1",
      leadId: "acme-corp",
      type: "call",
      title: "Initial Discovery Call",
      description: "Discussed their current challenges and potential solutions",
      date: "2024-01-15T10:00:00Z",
      status: "completed",
    },
    {
      id: "2",
      leadId: "beta-inc",
      type: "email",
      title: "Follow-up Email Sent",
      description: "Sent pricing information and case studies",
      date: "2024-01-14T14:30:00Z",
      status: "completed",
    },
    {
      id: "3",
      leadId: "acme-corp",
      type: "meeting",
      title: "Product Demo",
      description: "Scheduled product demonstration for next week",
      date: "2024-01-20T15:00:00Z",
      status: "scheduled",
    },
  ])

  const [selectedLead, setSelectedLead] = useState<string>("")
  const [activityType, setActivityType] = useState<"call" | "email" | "meeting" | "note">("call")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [status, setStatus] = useState<"completed" | "scheduled" | "cancelled">("scheduled")
  const [filterType, setFilterType] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddActivity = () => {
    if (!selectedLead || !title || !description || !date) return

    const newActivity: Omit<Activity, "id"> = {
      leadId: selectedLead,
      type: activityType,
      title,
      description,
      date,
      status,
    }

    const activityWithId = { ...newActivity, id: Date.now().toString() }
    setActivities([activityWithId, ...activities])
    onAddActivity(newActivity)

    // Reset form
    setTitle("")
    setDescription("")
    setDate("")
    setIsDialogOpen(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-blue-600" />
      case "email":
        return <Mail className="w-4 h-4 text-green-600" />
      case "meeting":
        return <Calendar className="w-4 h-4 text-purple-600" />
      case "note":
        return <MessageSquare className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredActivities = activities.filter((activity) => filterType === "all" || activity.type === filterType)

  const getLeadName = (leadId: string) => {
    const lead = leads.find((l) => l.companyName.toLowerCase().replace(/\s+/g, "-") === leadId)
    return lead?.companyName || leadId
  }

  const upcomingActivities = activities
    .filter((activity) => activity.status === "scheduled" && new Date(activity.date) > new Date())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span>Lead Activity Tracking</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Track all interactions and activities with your leads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Activity</DialogTitle>
              <DialogDescription>Record a new interaction or schedule future activity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lead">Lead</Label>
                <Select value={selectedLead} onValueChange={setSelectedLead}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead, index) => (
                      <SelectItem key={index} value={lead.companyName.toLowerCase().replace(/\s+/g, "-")}>
                        {lead.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Activity Type</Label>
                <Select value={activityType} onValueChange={(value: any) => setActivityType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Activity title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Activity details"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddActivity} className="w-full">
                Add Activity
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Upcoming Activities</span>
            </CardTitle>
            <CardDescription>Your scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => (
                  <div key={activity.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium text-sm">{activity.title}</span>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{getLeadName(activity.leadId)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(activity.date).toLocaleDateString()} at{" "}
                      {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No upcoming activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Activity Timeline</CardTitle>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Calls</SelectItem>
                  <SelectItem value="email">Emails</SelectItem>
                  <SelectItem value="meeting">Meetings</SelectItem>
                  <SelectItem value="note">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{getLeadName(activity.leadId)}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{activity.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(activity.date).toLocaleDateString()} at{" "}
                        {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

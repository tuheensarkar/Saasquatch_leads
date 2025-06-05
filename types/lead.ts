export interface Lead {
  companyName: string
  email: string
  phone: string
  industry: string
  revenue: number
  emailValid: boolean
  phoneValid: boolean
  leadScore: number
  emailScore?: number
  phoneScore?: number
  emailReason?: string
  phoneType?: string
}

export interface LeadFilters {
  industry: string
  minRevenue: number
  maxRevenue: number
  minScore: number
  maxScore: number
  emailValid: boolean
  phoneValid: boolean
}

export interface LeadAnalytics {
  totalLeads: number
  validEmails: number
  validPhones: number
  duplicatesRemoved: number
  emailValidityRate: number
  phoneValidityRate: number
  averageScore: number
}

export interface LeadPriority {
  level: "Critical" | "High" | "Medium" | "Low" | "Cold"
  color: string
  action: string
  timeline: string
}

export interface LeadActivity {
  id: string
  leadId: string
  type: "call" | "email" | "meeting" | "note"
  title: string
  description: string
  date: string
  status: "completed" | "scheduled" | "cancelled"
  priority?: "critical" | "high" | "medium" | "low"
}

export interface LeadEnrichmentData {
  companyInfo?: {
    website?: string
    description?: string
    employees?: string
    founded?: string
    headquarters?: string
    socialMedia?: {
      linkedin?: string
      twitter?: string
    }
  }
  contactInfo?: {
    alternativeEmails?: string[]
    directPhone?: string
    departments?: string[]
  }
  businessIntel?: {
    recentNews?: string[]
    competitors?: string[]
    technologies?: string[]
  }
}

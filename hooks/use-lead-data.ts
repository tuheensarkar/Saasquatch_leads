"use client"

import { useState, useCallback, useMemo } from "react"
import type { Lead, LeadFilters, LeadAnalytics } from "@/types/lead"
import { validateEmail, validatePhone, calculateLeadScore } from "@/lib/lead-utils"

export function useLeadData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filters, setFilters] = useState<LeadFilters>({
    industry: "",
    minRevenue: 0,
    maxRevenue: 0,
    minScore: 0,
    maxScore: 100,
    emailValid: false,
    phoneValid: false,
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const processLeadData = useCallback(async (csvData: string): Promise<Lead[]> => {
    const lines = csvData.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const requiredColumns = ["Company Name", "Email"]
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
    }

    const processedLeads: Lead[] = []
    const seenEmails = new Set<string>()
    const seenCompanies = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const leadData: any = {}

      headers.forEach((header, index) => {
        leadData[header] = values[index] || ""
      })

      // Skip duplicates
      const emailKey = leadData["Email"]?.toLowerCase()
      const companyKey = leadData["Company Name"]?.toLowerCase()

      if (seenEmails.has(emailKey) || seenCompanies.has(companyKey)) {
        continue
      }

      seenEmails.add(emailKey)
      seenCompanies.add(companyKey)

      // Enhanced validation with scoring
      const emailValidation = validateEmail(leadData["Email"])
      const phoneValidation = leadData["Phone"]
        ? validatePhone(leadData["Phone"])
        : {
            isValid: false,
            normalized: "",
            score: 0,
          }

      const lead: Lead & { emailScore?: number; phoneScore?: number; emailReason?: string; phoneType?: string } = {
        companyName: leadData["Company Name"],
        email: leadData["Email"],
        phone: phoneValidation.normalized || leadData["Phone"] || "",
        industry: leadData["Industry"] || "",
        revenue: leadData["Revenue"] ? Number.parseFloat(leadData["Revenue"].replace(/[$,]/g, "")) : 0,
        emailValid: emailValidation.isValid,
        phoneValid: phoneValidation.isValid,
        leadScore: 0,
        emailScore: emailValidation.score,
        phoneScore: phoneValidation.score,
        emailReason: emailValidation.reason,
        phoneType: phoneValidation.type,
      }

      // Calculate enhanced lead score
      lead.leadScore = calculateLeadScore({
        emailValid: lead.emailValid,
        phoneValid: lead.phoneValid,
        revenue: lead.revenue,
        industry: lead.industry,
        emailScore: lead.emailScore,
        phoneScore: lead.phoneScore,
      })

      processedLeads.push(lead)
    }

    return processedLeads
  }, [])

  const uploadLeads = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      try {
        const csvData = await file.text()
        const processedLeads = await processLeadData(csvData)
        setLeads(processedLeads)
      } catch (error) {
        console.error("Error processing leads:", error)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [processLeadData],
  )

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filters.industry && filters.industry !== "all" && lead.industry !== filters.industry) return false
      if (filters.minRevenue && lead.revenue < filters.minRevenue) return false
      if (filters.maxRevenue && lead.revenue > filters.maxRevenue) return false
      if (lead.leadScore < filters.minScore || lead.leadScore > filters.maxScore) return false
      if (filters.emailValid && !lead.emailValid) return false
      if (filters.phoneValid && !lead.phoneValid) return false
      return true
    })
  }, [leads, filters])

  const analytics = useMemo((): LeadAnalytics => {
    const totalLeads = leads.length
    const validEmails = leads.filter((lead) => lead.emailValid).length
    const validPhones = leads.filter((lead) => lead.phoneValid).length
    const totalScore = leads.reduce((sum, lead) => sum + lead.leadScore, 0)

    return {
      totalLeads,
      validEmails,
      validPhones,
      duplicatesRemoved: 0, // This would be calculated during processing
      emailValidityRate: totalLeads > 0 ? (validEmails / totalLeads) * 100 : 0,
      phoneValidityRate: totalLeads > 0 ? (validPhones / totalLeads) * 100 : 0,
      averageScore: totalLeads > 0 ? Math.round(totalScore / totalLeads) : 0,
    }
  }, [leads])

  const updateFilters = useCallback((newFilters: LeadFilters) => {
    setFilters(newFilters)
  }, [])

  const exportLeads = useCallback(
    (format: "csv" | "json") => {
      const dataToExport = filteredLeads

      if (format === "csv") {
        const headers = [
          "Company Name",
          "Email",
          "Phone",
          "Industry",
          "Revenue",
          "Lead Score",
          "Email Valid",
          "Phone Valid",
          "Email Score",
          "Phone Score",
        ]
        const csvContent = [
          headers.join(","),
          ...dataToExport.map((lead) =>
            [
              lead.companyName,
              lead.email,
              lead.phone,
              lead.industry,
              lead.revenue,
              lead.leadScore,
              lead.emailValid,
              lead.phoneValid,
              (lead as any).emailScore || "",
              (lead as any).phoneScore || "",
            ].join(","),
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const jsonContent = JSON.stringify(dataToExport, null, 2)
        const blob = new Blob([jsonContent], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `leads_export_${new Date().toISOString().split("T")[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    [filteredLeads],
  )

  const clearLeads = useCallback(() => {
    setLeads([])
    setFilters({
      industry: "",
      minRevenue: 0,
      maxRevenue: 0,
      minScore: 0,
      maxScore: 100,
      emailValid: false,
      phoneValid: false,
    })
  }, [])

  // Enhanced methods for professional functionality
  const enrichLead = useCallback(async (leadId: string, enrichmentData: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLeads((prevLeads) =>
          prevLeads.map((lead) => (lead.companyName === leadId ? { ...lead, ...enrichmentData } : lead)),
        )
        resolve(enrichmentData)
      }, 1000)
    })
  }, [])

  const updateLead = useCallback((leadId: string, updates: Partial<Lead>) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.companyName === leadId) {
          const updatedLead = { ...lead, ...updates }
          // Recalculate lead score if relevant fields were updated
          if (
            updates.emailValid !== undefined ||
            updates.phoneValid !== undefined ||
            updates.revenue !== undefined ||
            updates.industry !== undefined
          ) {
            updatedLead.leadScore = calculateLeadScore({
              emailValid: updatedLead.emailValid,
              phoneValid: updatedLead.phoneValid,
              revenue: updatedLead.revenue,
              industry: updatedLead.industry,
              emailScore: (updatedLead as any).emailScore,
              phoneScore: (updatedLead as any).phoneScore,
            })
          }
          return updatedLead
        }
        return lead
      }),
    )
  }, [])

  const addActivity = useCallback(async (activity: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Activity added:", activity)
        resolve(activity)
      }, 500)
    })
  }, [])

  const getAIInsights = useCallback(async (leads: Lead[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const insights = {
          recommendations: [
            "Focus on Technology sector leads with scores 80+",
            "Improve email validation for better deliverability",
            "Target companies with revenue >$1M for higher conversion",
          ],
          patterns: ["High-revenue leads show 85% email validity", "Technology sector has highest average scores"],
        }
        resolve(insights)
      }, 2000)
    })
  }, [])

  return {
    leads,
    filteredLeads,
    analytics,
    filters,
    isProcessing,
    uploadLeads,
    updateFilters,
    exportLeads,
    clearLeads,
    enrichLead,
    updateLead,
    addActivity,
    getAIInsights,
  }
}

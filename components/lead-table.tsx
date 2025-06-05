"use client"

import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, Mail, Phone, Building, DollarSign, Search, Plus, Zap, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadReviewModal } from "@/components/lead-review-modal"
import type { Lead } from "@/types/lead"
import { getLeadPriority } from "@/lib/lead-utils"

interface LeadTableProps {
  leads: Lead[]
  onEnrichLead?: (lead: Lead) => void
  onAddActivity?: (lead: Lead) => void
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => void
}

type SortField = keyof Lead
type SortDirection = "asc" | "desc"

export function LeadTable({ leads, onEnrichLead, onAddActivity, onUpdateLead }: LeadTableProps) {
  const [sortField, setSortField] = useState<SortField>("leadScore")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const itemsPerPage = 10

  const sortedAndFilteredLeads = useMemo(() => {
    const filtered = leads.filter(
      (lead) =>
        lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.industry && lead.industry.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  }, [leads, searchTerm, sortField, sortDirection])

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedAndFilteredLeads.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedAndFilteredLeads, currentPage])

  const totalPages = Math.ceil(sortedAndFilteredLeads.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "destructive" // Critical
    if (score >= 80) return "default" // High
    if (score >= 60) return "secondary" // Medium
    if (score >= 40) return "outline" // Low
    return "outline" // Cold
  }

  const getValidationIcon = (isValid: boolean, type: "email" | "phone", score?: number) => {
    const Icon = type === "email" ? Mail : Phone

    if (!isValid) {
      return <Icon className="w-4 h-4 text-red-500" />
    }

    if (score && score >= 80) {
      return <Icon className="w-4 h-4 text-green-600" />
    } else if (score && score >= 60) {
      return <Icon className="w-4 h-4 text-yellow-600" />
    } else {
      return <Icon className="w-4 h-4 text-blue-600" />
    }
  }

  const handleReviewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsReviewModalOpen(true)
  }

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    if (onUpdateLead) {
      onUpdateLead(leadId, updates)
    }
  }

  const handleAddActivity = (activity: any) => {
    if (onAddActivity && selectedLead) {
      onAddActivity(selectedLead)
    }
  }

  return (
    <>
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Lead Management ({sortedAndFilteredLeads.length})</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              {/* Lead Statistics */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{leads.filter((l) => l.leadScore >= 90).length} Critical</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{leads.filter((l) => l.leadScore >= 80 && l.leadScore < 90).length} High</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>{leads.filter((l) => l.leadScore >= 60 && l.leadScore < 80).length} Medium</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="w-20">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("leadScore")}
                      className="h-auto p-0 font-semibold"
                    >
                      Score
                      {sortField === "leadScore" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("companyName")}
                      className="h-auto p-0 font-semibold"
                    >
                      Company
                      {sortField === "companyName" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>Contact Quality</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("industry")} className="h-auto p-0 font-semibold">
                      Industry
                      {sortField === "industry" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("revenue")} className="h-auto p-0 font-semibold">
                      Revenue
                      {sortField === "revenue" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead, index) => {
                  const priority = getLeadPriority(lead.leadScore)
                  return (
                    <TableRow
                      key={`${lead.companyName}-${lead.email}-${index}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col items-center space-y-1">
                          <Badge variant={getScoreBadgeVariant(lead.leadScore)} className="font-bold text-sm px-3 py-1">
                            {lead.leadScore}
                          </Badge>
                          {lead.leadScore >= 90 && (
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              priority.level === "Critical"
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : priority.level === "High"
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600"
                                  : priority.level === "Medium"
                                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                          >
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{lead.companyName}</div>
                            <div className="text-sm text-slate-500">{priority.action}</div>
                            {priority.level === "Critical" && (
                              <Badge variant="destructive" className="text-xs mt-1 animate-pulse">
                                🚨 URGENT
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getValidationIcon(lead.emailValid, "email", (lead as any).emailScore)}
                            <span className="text-sm font-medium">{lead.email}</span>
                            <Badge variant={lead.emailValid ? "default" : "destructive"} className="text-xs">
                              {lead.emailValid
                                ? (lead as any).emailScore >= 80
                                  ? "Excellent"
                                  : (lead as any).emailScore >= 60
                                    ? "Good"
                                    : "Valid"
                                : "Invalid"}
                            </Badge>
                          </div>
                          {lead.phone && (
                            <div className="flex items-center space-x-2">
                              {getValidationIcon(lead.phoneValid, "phone", (lead as any).phoneScore)}
                              <span className="text-sm">{lead.phone}</span>
                              <Badge variant={lead.phoneValid ? "default" : "destructive"} className="text-xs">
                                {lead.phoneValid ? (lead as any).phoneType || "Valid" : "Invalid"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.industry && (
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700"
                          >
                            {lead.industry}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.revenue && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">
                              {lead.revenue >= 1000000
                                ? `$${(lead.revenue / 1000000).toFixed(1)}M`
                                : `$${(lead.revenue / 1000).toFixed(0)}K`}
                            </span>
                            {lead.revenue >= 10000000 && (
                              <Badge variant="default" className="text-xs">
                                Enterprise
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewLead(lead)}
                            className="h-8 px-2"
                            title="Review Lead Details"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {onEnrichLead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEnrichLead(lead)}
                              className="h-8 px-2"
                              title="Enrich Lead Data"
                            >
                              <Zap className="w-3 h-3" />
                            </Button>
                          )}
                          {onAddActivity && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAddActivity(lead)}
                              className="h-8 px-2"
                              title="Add Activity"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, sortedAndFilteredLeads.length)} of {sortedAndFilteredLeads.length}{" "}
                leads
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadReviewModal
        lead={selectedLead}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false)
          setSelectedLead(null)
        }}
        onUpdateLead={handleUpdateLead}
        onAddActivity={handleAddActivity}
      />
    </>
  )
}

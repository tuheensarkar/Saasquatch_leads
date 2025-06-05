"use client"

import { useState } from "react"
import { Download, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Lead, LeadFilters as Filters } from "@/types/lead"

interface LeadFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  leads: Lead[]
  onExport: (format: "csv" | "json") => void
}

export function LeadFilters({ filters, onFiltersChange, leads, onExport }: LeadFiltersProps) {
  const [exportColumns, setExportColumns] = useState<string[]>([
    "companyName",
    "email",
    "phone",
    "industry",
    "revenue",
    "leadScore",
  ])

  const industries = Array.from(new Set(leads.map((lead) => lead.industry).filter(Boolean))) as string[]
  const availableColumns = [
    "companyName",
    "email",
    "phone",
    "industry",
    "revenue",
    "leadScore",
    "emailValid",
    "phoneValid",
  ]

  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      industry: "",
      minRevenue: 0,
      maxRevenue: 0,
      minScore: 0,
      maxScore: 100,
      emailValid: false,
      phoneValid: false,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== 0 && value !== 100 && value !== false,
  ).length

  const handleColumnToggle = (column: string) => {
    setExportColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
              </CardTitle>
              <CardDescription>Filter leads based on various criteria</CardDescription>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Industry Filter */}
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={filters.industry} onValueChange={(value) => updateFilter("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Revenue Range */}
            <div className="space-y-2">
              <Label>Min Revenue ($)</Label>
              <Input
                type="number"
                value={filters.minRevenue || ""}
                onChange={(e) => updateFilter("minRevenue", Number(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Max Revenue ($)</Label>
              <Input
                type="number"
                value={filters.maxRevenue || ""}
                onChange={(e) => updateFilter("maxRevenue", Number(e.target.value) || 0)}
                placeholder="No limit"
              />
            </div>

            {/* Score Range */}
            <div className="space-y-2">
              <Label>Min Lead Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => updateFilter("minScore", Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Lead Score</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) => updateFilter("maxScore", Number(e.target.value))}
              />
            </div>
          </div>

          {/* Validation Filters */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Validation Requirements</Label>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailValid"
                  checked={filters.emailValid}
                  onCheckedChange={(checked) => updateFilter("emailValid", checked)}
                />
                <Label htmlFor="emailValid">Valid Email Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="phoneValid"
                  checked={filters.phoneValid}
                  onCheckedChange={(checked) => updateFilter("phoneValid", checked)}
                />
                <Label htmlFor="phoneValid">Valid Phone Only</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Options</span>
          </CardTitle>
          <CardDescription>Choose columns and format for export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Columns to Export</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableColumns.map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={exportColumns.includes(column)}
                    onCheckedChange={() => handleColumnToggle(column)}
                  />
                  <Label htmlFor={column} className="text-sm">
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, " $1")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={() => onExport("csv")} disabled={exportColumns.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" onClick={() => onExport("json")} disabled={exportColumns.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Selected columns: {exportColumns.length} of {availableColumns.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useCallback, useState, useEffect } from "react"
import {
  Upload,
  Download,
  BarChart3,
  Users,
  Mail,
  Phone,
  Sparkles,
  Bell,
  Search,
  TrendingUp,
  AlertCircle,
  Shield,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LeadUpload } from "@/components/lead-upload"
import { LeadTable } from "@/components/lead-table"
import { LeadAnalytics } from "@/components/lead-analytics"
import { LeadFilters } from "@/components/lead-filters"
import { AIInsights } from "@/components/ai-insights"
import { LeadEnrichment } from "@/components/lead-enrichment"
import { EmailTemplates } from "@/components/email-templates"
import { LeadActivity } from "@/components/lead-activity"
import { useLeadData } from "@/hooks/use-lead-data"
import { useTheme } from "@/hooks/use-theme"

export default function LeadPrioritizerPro() {
  const {
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
  } = useLeadData()

  const { theme, toggleTheme } = useTheme()
  const [globalSearch, setGlobalSearch] = useState("")
  const [notifications, setNotifications] = useState(0)
  const [activeTab, setActiveTab] = useState("leads")
  const [dashboardMetrics, setDashboardMetrics] = useState({
    trendsData: [] as any[],
    alerts: [] as any[],
    recentActivity: [] as any[],
    dataQuality: 0,
    conversionPotential: 0,
  })

  // Enhanced dashboard updates with professional metrics
  useEffect(() => {
    if (leads.length > 0) {
      const trends = generateTrendData(leads)
      const alerts = generateAlerts(leads, analytics)
      const recentActivity = generateRecentActivity(leads)
      const dataQuality = calculateDataQuality(leads)
      const conversionPotential = calculateConversionPotential(leads)

      setNotifications(alerts.filter((alert) => alert.priority === "high").length)

      setDashboardMetrics({
        trendsData: trends,
        alerts: alerts,
        recentActivity: recentActivity,
        dataQuality,
        conversionPotential,
      })
    }
  }, [leads, analytics])

  const calculateDataQuality = (leads: any[]) => {
    if (leads.length === 0) return 0

    const validEmails = leads.filter((lead) => lead.emailValid).length
    const validPhones = leads.filter((lead) => lead.phoneValid).length
    const hasRevenue = leads.filter((lead) => lead.revenue > 0).length
    const hasIndustry = leads.filter((lead) => lead.industry).length

    return Math.round(((validEmails + validPhones + hasRevenue + hasIndustry) / (leads.length * 4)) * 100)
  }

  const calculateConversionPotential = (leads: any[]) => {
    if (leads.length === 0) return 0

    const highScoreLeads = leads.filter((lead) => lead.leadScore >= 80).length
    const mediumScoreLeads = leads.filter((lead) => lead.leadScore >= 60 && lead.leadScore < 80).length

    // Weighted conversion potential
    return Math.round(((highScoreLeads * 0.25 + mediumScoreLeads * 0.15) / leads.length) * 100)
  }

  const generateTrendData = (leads: any[]) => {
    const industries = [...new Set(leads.map((lead) => lead.industry).filter(Boolean))]
    return industries.slice(0, 5).map((industry) => {
      const industryLeads = leads.filter((lead) => lead.industry === industry)
      const avgScore = industryLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / industryLeads.length
      const emailValidRate = (industryLeads.filter((lead) => lead.emailValid).length / industryLeads.length) * 100

      return {
        name: industry,
        value: Math.round(avgScore),
        change: Math.round((emailValidRate - 70) * 0.5), // Simulate trend based on email validity
        count: industryLeads.length,
        emailValidRate: Math.round(emailValidRate),
      }
    })
  }

  const generateAlerts = (leads: any[], analytics: any) => {
    const alerts = []

    // Critical priority leads
    const criticalLeads = leads.filter((lead) => lead.leadScore >= 90)
    if (criticalLeads.length > 0) {
      alerts.push({
        id: 1,
        type: "critical",
        priority: "high",
        title: "Critical Priority Leads Detected",
        message: `${criticalLeads.length} leads require immediate attention (Score 90+)`,
        timestamp: new Date().toISOString(),
        action: "Contact now",
        count: criticalLeads.length,
      })
    }

    // High-priority leads
    const highScoreLeads = leads.filter((lead) => lead.leadScore >= 80 && lead.leadScore < 90)
    if (highScoreLeads.length > 0) {
      alerts.push({
        id: 2,
        type: "opportunity",
        priority: "high",
        title: "High-Priority Leads Available",
        message: `${highScoreLeads.length} leads with excellent conversion potential`,
        timestamp: new Date().toISOString(),
        action: "Review leads",
        count: highScoreLeads.length,
      })
    }

    // Data quality issues
    if (analytics.emailValidityRate < 70) {
      alerts.push({
        id: 3,
        type: "warning",
        priority: "medium",
        title: "Email Deliverability Risk",
        message: `${Math.round(100 - analytics.emailValidityRate)}% of emails may bounce`,
        timestamp: new Date().toISOString(),
        action: "Validate emails",
      })
    }

    // Revenue opportunity
    const highRevenueLeads = leads.filter((lead) => lead.revenue > 5000000)
    if (highRevenueLeads.length > 0) {
      alerts.push({
        id: 4,
        type: "revenue",
        priority: "medium",
        title: "Enterprise Opportunities",
        message: `${highRevenueLeads.length} leads with $5M+ revenue identified`,
        timestamp: new Date().toISOString(),
        action: "Prioritize outreach",
        count: highRevenueLeads.length,
      })
    }

    return alerts
  }

  const generateRecentActivity = (leads: any[]) => {
    return [
      {
        id: 1,
        type: "upload",
        message: `${leads.length} leads processed with advanced validation`,
        timestamp: new Date().toISOString(),
        icon: "📊",
        details: `${leads.filter((l) => l.emailValid).length} valid emails, ${leads.filter((l) => l.phoneValid).length} valid phones`,
      },
      {
        id: 2,
        type: "scoring",
        message: `Lead scoring completed - ${Math.round(analytics.averageScore)} average score`,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        icon: "🎯",
        details: `${leads.filter((l) => l.leadScore >= 80).length} high-priority leads identified`,
      },
      {
        id: 3,
        type: "validation",
        message: `Data quality analysis: ${dashboardMetrics.dataQuality}% complete`,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        icon: "✅",
        details: `Email: ${analytics.emailValidityRate.toFixed(1)}%, Phone: ${analytics.phoneValidityRate.toFixed(1)}%`,
      },
    ]
  }

  const handleFileUpload = useCallback(
    (file: File) => {
      uploadLeads(file)
    },
    [uploadLeads],
  )

  const searchFilteredLeads = filteredLeads.filter(
    (lead) =>
      lead.companyName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      lead.email.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (lead.industry && lead.industry.toLowerCase().includes(globalSearch.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Professional Header */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LeadPrioritizer Pro
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise Lead Intelligence Platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Data Quality Indicator */}
              {leads.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Quality: {dashboardMetrics.dataQuality}%</span>
                </div>
              )}

              {/* Global Search */}
              {leads.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search leads..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-10 w-64 bg-white/50 dark:bg-slate-800/50"
                  />
                </div>
              )}

              {/* Enhanced Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs animate-pulse bg-red-500">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* Theme Toggle */}
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? "🌞" : "🌙"}
              </Button>

              {/* Professional Action Buttons */}
              {leads.length > 0 && (
                <>
                  <Button variant="outline" onClick={() => exportLeads("csv")} className="shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="destructive" onClick={clearLeads} className="shadow-sm">
                    Clear Data
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Enterprise Lead Intelligence Platform
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Upload your lead data and leverage our advanced AI-powered platform for comprehensive validation,
                intelligent scoring, data enrichment, and strategic prioritization.
              </p>
              <LeadUpload onUpload={handleFileUpload} isProcessing={isProcessing} />
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Advanced AI Scoring</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Real-time Validation</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Intelligent Enrichment</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Professional Alert System */}
            {dashboardMetrics.alerts.length > 0 && (
              <div className="space-y-3">
                {dashboardMetrics.alerts.slice(0, 2).map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={alert.priority === "high" ? "destructive" : "default"}
                    className="border-l-4 border-l-blue-500"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <strong>{alert.title}:</strong> {alert.message}
                        {alert.count && (
                          <Badge variant="outline" className="ml-2">
                            {alert.count} leads
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        {alert.action}
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Enhanced Professional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Leads</CardTitle>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalLeads}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Processing complete</span>
                  </div>
                  <Progress value={100} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Email Quality
                  </CardTitle>
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.validEmails}</div>
                  <Progress value={analytics.emailValidityRate} className="mt-2 h-2" />
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {analytics.emailValidityRate.toFixed(1)}% deliverable
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Phone Quality
                  </CardTitle>
                  <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{analytics.validPhones}</div>
                  <Progress value={analytics.phoneValidityRate} className="mt-2 h-2" />
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {analytics.phoneValidityRate.toFixed(1)}% reachable
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Score</CardTitle>
                  <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {analytics.averageScore}
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={
                        analytics.averageScore >= 70
                          ? "default"
                          : analytics.averageScore >= 50
                            ? "secondary"
                            : "destructive"
                      }
                      className="shadow-sm animate-pulse"
                    >
                      {analytics.averageScore >= 70
                        ? "🔥 Hot Leads"
                        : analytics.averageScore >= 50
                          ? "⚡ Warm Leads"
                          : "❄️ Cold Leads"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Conversion</CardTitle>
                  <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                    {dashboardMetrics.conversionPotential}%
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge variant="default" className="shadow-sm">
                      Potential
                    </Badge>
                  </div>
                  <Progress value={dashboardMetrics.conversionPotential} className="h-2 mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Professional Tabs Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg">
                <TabsTrigger
                  value="leads"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  📊 Lead Management
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  📈 Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="ai-insights"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  🤖 AI Insights
                </TabsTrigger>
                <TabsTrigger
                  value="enrichment"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  🔍 Enrichment
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  📧 Templates
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
                >
                  📋 Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leads" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Lead Management ({searchFilteredLeads.length})
                  </h3>
                  <LeadFilters filters={filters} onFiltersChange={updateFilters} leads={leads} onExport={exportLeads} />
                </div>
                <LeadTable
                  leads={searchFilteredLeads}
                  onEnrichLead={enrichLead}
                  onAddActivity={addActivity}
                  onUpdateLead={updateLead}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <LeadAnalytics leads={searchFilteredLeads} analytics={analytics} />
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                <AIInsights leads={searchFilteredLeads} onGetInsights={getAIInsights} />
              </TabsContent>

              <TabsContent value="enrichment" className="space-y-6">
                <LeadEnrichment leads={searchFilteredLeads} onEnrichLead={enrichLead} />
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <EmailTemplates leads={searchFilteredLeads} />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <LeadActivity leads={searchFilteredLeads} onAddActivity={addActivity} />
              </TabsContent>
            </Tabs>

            {/* Professional Activity Feed */}
            {dashboardMetrics.recentActivity.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>System Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardMetrics.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="text-lg">{activity.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.message}</div>
                          <div className="text-xs text-slate-500">{activity.details}</div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Target, Zap, Award } from "lucide-react"
import type { Lead, LeadAnalytics as Analytics } from "@/types/lead"

interface LeadAnalyticsProps {
  leads: Lead[]
  analytics: Analytics
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

export function LeadAnalytics({ leads, analytics }: LeadAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("all")
  const [chartType, setChartType] = useState("overview")

  // Score Distribution Data
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "0-20", min: 0, max: 20, color: "#EF4444" },
      { name: "21-40", min: 21, max: 40, color: "#F97316" },
      { name: "41-60", min: 41, max: 60, color: "#F59E0B" },
      { name: "61-80", min: 61, max: 80, color: "#10B981" },
      { name: "81-100", min: 81, max: 100, color: "#3B82F6" },
    ]

    return ranges.map((range) => ({
      name: range.name,
      count: leads.filter((lead) => lead.leadScore >= range.min && lead.leadScore <= range.max).length,
      percentage: (
        (leads.filter((lead) => lead.leadScore >= range.min && lead.leadScore <= range.max).length / leads.length) *
        100
      ).toFixed(1),
      color: range.color,
    }))
  }, [leads])

  // Industry Analysis
  const industryData = useMemo(() => {
    const industryStats = leads.reduce(
      (acc, lead) => {
        const industry = lead.industry || "Unknown"
        if (!acc[industry]) {
          acc[industry] = { count: 0, totalScore: 0, totalRevenue: 0, validEmails: 0, validPhones: 0 }
        }
        acc[industry].count += 1
        acc[industry].totalScore += lead.leadScore
        acc[industry].totalRevenue += lead.revenue || 0
        if (lead.emailValid) acc[industry].validEmails += 1
        if (lead.phoneValid) acc[industry].validPhones += 1
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.entries(industryStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count),
        avgRevenue: Math.round(stats.totalRevenue / stats.count),
        emailRate: Math.round((stats.validEmails / stats.count) * 100),
        phoneRate: Math.round((stats.validPhones / stats.count) * 100),
        value: stats.count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  // Revenue vs Score Correlation
  const revenueScoreData = useMemo(() => {
    return leads
      .filter((lead) => lead.revenue > 0)
      .map((lead) => ({
        revenue: lead.revenue,
        score: lead.leadScore,
        company: lead.companyName,
        industry: lead.industry || "Unknown",
      }))
  }, [leads])

  // Conversion Funnel Data
  const funnelData = useMemo(() => {
    const totalLeads = leads.length
    const validEmails = leads.filter((lead) => lead.emailValid).length
    const validPhones = leads.filter((lead) => lead.phoneValid).length
    const highScore = leads.filter((lead) => lead.leadScore >= 70).length
    const qualified = leads.filter((lead) => lead.emailValid && lead.phoneValid && lead.leadScore >= 60).length

    return [
      { stage: "Total Leads", count: totalLeads, percentage: 100 },
      { stage: "Valid Email", count: validEmails, percentage: Math.round((validEmails / totalLeads) * 100) },
      { stage: "Valid Phone", count: validPhones, percentage: Math.round((validPhones / totalLeads) * 100) },
      { stage: "High Score (70+)", count: highScore, percentage: Math.round((highScore / totalLeads) * 100) },
      { stage: "Qualified Leads", count: qualified, percentage: Math.round((qualified / totalLeads) * 100) },
    ]
  }, [leads])

  // Performance Metrics
  const performanceMetrics = useMemo(() => {
    const highQualityLeads = leads.filter((lead) => lead.leadScore >= 80).length
    const mediumQualityLeads = leads.filter((lead) => lead.leadScore >= 60 && lead.leadScore < 80).length
    const lowQualityLeads = leads.filter((lead) => lead.leadScore < 60).length

    const avgRevenueHighScore =
      leads.filter((lead) => lead.leadScore >= 80 && lead.revenue > 0).reduce((sum, lead) => sum + lead.revenue, 0) /
        leads.filter((lead) => lead.leadScore >= 80 && lead.revenue > 0).length || 0

    return {
      qualityDistribution: [
        { name: "High Quality (80+)", value: highQualityLeads, color: "#10B981" },
        { name: "Medium Quality (60-79)", value: mediumQualityLeads, color: "#F59E0B" },
        { name: "Low Quality (<60)", value: lowQualityLeads, color: "#EF4444" },
      ],
      avgRevenueHighScore: Math.round(avgRevenueHighScore),
      conversionPotential: Math.round((highQualityLeads / leads.length) * 100),
    }
  }, [leads])

  // Radar Chart Data for Lead Quality
  const radarData = useMemo(() => {
    return [
      {
        metric: "Email Quality",
        value: analytics.emailValidityRate,
        fullMark: 100,
      },
      {
        metric: "Phone Quality",
        value: analytics.phoneValidityRate,
        fullMark: 100,
      },
      {
        metric: "Avg Score",
        value: analytics.averageScore,
        fullMark: 100,
      },
      {
        metric: "High Value Leads",
        value: (leads.filter((lead) => lead.revenue > 1000000).length / leads.length) * 100,
        fullMark: 100,
      },
      {
        metric: "Industry Diversity",
        value: (new Set(leads.map((lead) => lead.industry)).size / leads.length) * 100,
        fullMark: 100,
      },
    ]
  }, [leads, analytics])

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lead Analytics Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Comprehensive insights into your lead data</p>
        </div>
        <div className="flex space-x-4">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {performanceMetrics.conversionPotential}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Avg Revenue (High Score)</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ${(performanceMetrics.avgRevenueHighScore / 1000).toFixed(0)}K
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Data Quality</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {Math.round((analytics.emailValidityRate + analytics.phoneValidityRate) / 2)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Industries</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {new Set(leads.map((lead) => lead.industry)).size}
                </p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="industry">Industry</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Score Distribution</CardTitle>
                <CardDescription>How your leads are distributed across score ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Score Range: ${label}`}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Breakdown</CardTitle>
                <CardDescription>Lead quality distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceMetrics.qualityDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceMetrics.qualityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Industry Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown by industry sector</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={industryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => `Industry: ${label}`}
                  />
                  <Bar dataKey="count" fill="#3B82F6" name="Lead Count" />
                  <Bar dataKey="avgScore" fill="#10B981" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Lead Score Correlation</CardTitle>
              <CardDescription>Relationship between company revenue and lead scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={revenueScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="revenue"
                    name="Revenue"
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <YAxis dataKey="score" name="Score" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `$${(value as number).toLocaleString()}` : value,
                      name === "revenue" ? "Revenue" : "Lead Score",
                    ]}
                    labelFormatter={() => ""}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 border rounded shadow-lg">
                            <p className="font-semibold">{data.company}</p>
                            <p>Industry: {data.industry}</p>
                            <p>Revenue: ${data.revenue.toLocaleString()}</p>
                            <p>Score: {data.score}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter dataKey="score" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Qualification Funnel</CardTitle>
              <CardDescription>Conversion rates through qualification stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-6">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ width: `${stage.percentage}%` }}
                          >
                            {stage.percentage}%
                          </div>
                        </div>
                        <div className="text-sm font-medium w-16">{stage.count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Radar</CardTitle>
              <CardDescription>Overall data quality assessment across multiple dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Quality Score"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Quality Score"]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

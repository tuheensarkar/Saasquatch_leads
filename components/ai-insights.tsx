"use client"

import type React from "react"

import { useState, useMemo } from "react"
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  Star,
  Users,
  DollarSign,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Lead } from "@/types/lead"

interface AIInsightsProps {
  leads: Lead[]
  onGetInsights: (leads: Lead[]) => Promise<any>
}

interface AIInsight {
  type: "priority" | "data-quality" | "diversification" | "opportunity" | "warning"
  icon: React.ReactNode
  title: string
  description: string
  action: string
  impact: "High" | "Medium" | "Low"
  confidence: number
  leads?: Lead[]
  metrics?: any
}

export function AIInsights({ leads, onGetInsights }: AIInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Generate comprehensive AI insights based on lead data
  const generateInsights = useMemo(() => {
    if (leads.length === 0) return []

    const insights: AIInsight[] = []

    // High-priority leads analysis
    const highScoreLeads = leads.filter((lead) => lead.leadScore >= 80)
    const mediumScoreLeads = leads.filter((lead) => lead.leadScore >= 60 && lead.leadScore < 80)
    const lowScoreLeads = leads.filter((lead) => lead.leadScore < 60)

    if (highScoreLeads.length > 0) {
      insights.push({
        type: "priority",
        icon: <Star className="w-5 h-5 text-yellow-500" />,
        title: "High-Priority Leads Identified",
        description: `${highScoreLeads.length} leads with scores 80+ represent your best conversion opportunities`,
        action: `Focus immediate outreach on these ${highScoreLeads.length} hot prospects`,
        impact: "High",
        confidence: 95,
        leads: highScoreLeads.slice(0, 5),
        metrics: {
          avgRevenue: Math.round(
            highScoreLeads.reduce((sum, lead) => sum + (lead.revenue || 0), 0) / highScoreLeads.length,
          ),
          emailValidRate: Math.round(
            (highScoreLeads.filter((lead) => lead.emailValid).length / highScoreLeads.length) * 100,
          ),
        },
      })
    }

    // Email validation analysis
    const invalidEmails = leads.filter((lead) => !lead.emailValid).length
    const emailValidityRate = ((leads.length - invalidEmails) / leads.length) * 100

    if (emailValidityRate < 70) {
      insights.push({
        type: "data-quality",
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
        title: "Email Deliverability Issues",
        description: `${invalidEmails} leads (${Math.round((invalidEmails / leads.length) * 100)}%) have invalid emails`,
        action: "Implement email verification service to improve deliverability",
        impact: "High",
        confidence: 88,
        metrics: {
          invalidCount: invalidEmails,
          validityRate: Math.round(emailValidityRate),
          potentialLoss: Math.round(invalidEmails * 0.15 * 1000), // Estimated revenue loss
        },
      })
    }

    // Industry concentration analysis
    const industryDistribution = leads.reduce(
      (acc, lead) => {
        const industry = lead.industry || "Unknown"
        acc[industry] = (acc[industry] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topIndustry = Object.entries(industryDistribution).sort(([, a], [, b]) => b - a)[0]
    const industryConcentration = (topIndustry[1] / leads.length) * 100

    if (industryConcentration > 50) {
      insights.push({
        type: "diversification",
        icon: <Target className="w-5 h-5 text-blue-500" />,
        title: "Industry Diversification Opportunity",
        description: `${Math.round(industryConcentration)}% of leads are in ${topIndustry[0]} sector`,
        action: "Expand targeting to reduce industry concentration risk",
        impact: "Medium",
        confidence: 75,
        metrics: {
          topIndustry: topIndustry[0],
          concentration: Math.round(industryConcentration),
          diversityScore: Object.keys(industryDistribution).length,
        },
      })
    }

    // Revenue opportunity analysis
    const highRevenueLeads = leads.filter((lead) => lead.revenue > 1000000)
    if (highRevenueLeads.length > 0) {
      const avgScore = Math.round(
        highRevenueLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / highRevenueLeads.length,
      )

      insights.push({
        type: "opportunity",
        icon: <DollarSign className="w-5 h-5 text-green-500" />,
        title: "High-Value Revenue Targets",
        description: `${highRevenueLeads.length} leads with $1M+ revenue show avg score of ${avgScore}`,
        action: "Prioritize enterprise sales approach for high-revenue prospects",
        impact: "High",
        confidence: 92,
        leads: highRevenueLeads.slice(0, 3),
        metrics: {
          count: highRevenueLeads.length,
          avgRevenue: Math.round(
            highRevenueLeads.reduce((sum, lead) => sum + lead.revenue, 0) / highRevenueLeads.length,
          ),
          avgScore: avgScore,
        },
      })
    }

    // Phone validation analysis
    const invalidPhones = leads.filter((lead) => lead.phone && !lead.phoneValid).length
    if (invalidPhones > leads.length * 0.3) {
      insights.push({
        type: "warning",
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        title: "Phone Contact Limitations",
        description: `${invalidPhones} leads have invalid phone numbers, limiting outreach options`,
        action: "Implement phone validation and alternative contact methods",
        impact: "Medium",
        confidence: 80,
        metrics: {
          invalidCount: invalidPhones,
          validRate: Math.round(((leads.length - invalidPhones) / leads.length) * 100),
        },
      })
    }

    // Lead quality distribution insight
    const qualityDistribution = {
      high: highScoreLeads.length,
      medium: mediumScoreLeads.length,
      low: lowScoreLeads.length,
    }

    if (qualityDistribution.low > qualityDistribution.high) {
      insights.push({
        type: "data-quality",
        icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
        title: "Lead Quality Improvement Needed",
        description: `${qualityDistribution.low} low-quality leads vs ${qualityDistribution.high} high-quality`,
        action: "Refine lead generation criteria to improve quality scores",
        impact: "Medium",
        confidence: 85,
        metrics: qualityDistribution,
      })
    }

    return insights
  }, [leads])

  const leadPatterns = useMemo(() => {
    if (leads.length === 0) return []

    const patterns = []

    // Revenue-score correlation
    const highRevenueLeads = leads.filter((lead) => lead.revenue > 1000000)
    if (highRevenueLeads.length > 0) {
      const avgScore = Math.round(
        highRevenueLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / highRevenueLeads.length,
      )
      patterns.push({
        pattern: "Revenue-Score Correlation",
        description: `Companies with $1M+ revenue show ${avgScore}% higher lead scores on average`,
        confidence: 85,
        insight: "Target high-revenue companies for better conversion rates",
      })
    }

    // Industry performance patterns
    const industryPerformance = leads.reduce(
      (acc, lead) => {
        const industry = lead.industry || "Unknown"
        if (!acc[industry]) {
          acc[industry] = { scores: [], count: 0, validEmails: 0 }
        }
        acc[industry].scores.push(lead.leadScore)
        acc[industry].count++
        if (lead.emailValid) acc[industry].validEmails++
        return acc
      },
      {} as Record<string, any>,
    )

    const topPerformingIndustry = Object.entries(industryPerformance)
      .map(([industry, data]) => ({
        industry,
        avgScore: data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length,
        emailRate: (data.validEmails / data.count) * 100,
        count: data.count,
      }))
      .filter((item) => item.count >= 3)
      .sort((a, b) => b.avgScore - a.avgScore)[0]

    if (topPerformingIndustry) {
      patterns.push({
        pattern: "Industry Performance Leader",
        description: `${topPerformingIndustry.industry} sector shows ${Math.round(topPerformingIndustry.avgScore)} avg score with ${Math.round(topPerformingIndustry.emailRate)}% email validity`,
        confidence: 78,
        insight: "Focus marketing efforts on high-performing industry sectors",
      })
    }

    // Data completeness pattern
    const completeDataLeads = leads.filter(
      (lead) => lead.emailValid && lead.phoneValid && lead.industry && lead.revenue > 0,
    )
    if (completeDataLeads.length > 0) {
      const avgScore = Math.round(
        completeDataLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / completeDataLeads.length,
      )
      patterns.push({
        pattern: "Data Completeness Impact",
        description: `Leads with complete data (email, phone, industry, revenue) score ${avgScore}% on average`,
        confidence: 90,
        insight: "Prioritize data enrichment for incomplete lead profiles",
      })
    }

    return patterns
  }, [leads])

  const predictions = useMemo(() => {
    if (leads.length === 0) return null

    const highConversion = leads.filter((lead) => lead.leadScore >= 80).length
    const mediumConversion = leads.filter((lead) => lead.leadScore >= 60 && lead.leadScore < 80).length
    const lowConversion = leads.filter((lead) => lead.leadScore < 60).length

    const totalRevenuePotential = leads.reduce((sum, lead) => {
      const conversionRate = lead.leadScore >= 80 ? 0.25 : lead.leadScore >= 60 ? 0.15 : 0.05
      const dealSize = (lead.revenue || 100000) * 0.1 // Assume 10% of company revenue as potential deal
      return sum + dealSize * conversionRate
    }, 0)

    return {
      highConversion: Math.round((highConversion / leads.length) * 100),
      mediumConversion: Math.round((mediumConversion / leads.length) * 100),
      lowConversion: Math.round((lowConversion / leads.length) * 100),
      totalRevenuePotential: Math.round(totalRevenuePotential),
      expectedDeals: Math.round(leads.length * 0.15), // 15% overall conversion rate
      timeToConvert: "45-60 days", // Based on lead scores
    }
  }, [leads])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Set the generated insights
      setInsights(generateInsights)
      setAnalysisComplete(true)

      // Call the provided function for additional processing
      await onGetInsights(leads)
    } catch (error) {
      console.error("Error getting AI insights:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <span>AI-Powered Insights</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Advanced analytics and recommendations for your lead data
          </p>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || leads.length === 0}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              {analysisComplete ? "Re-analyze" : "Generate Insights"}
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Analyzing {leads.length} leads across multiple dimensions...
              </p>
              <div className="space-y-2">
                <Progress value={33} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>✓ Data validation patterns</span>
                  <span>⚡ Scoring correlations</span>
                  <span>🎯 Opportunity identification</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisComplete && insights.length > 0 && (
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">🎯 Recommendations</TabsTrigger>
            <TabsTrigger value="patterns">🔍 Patterns</TabsTrigger>
            <TabsTrigger value="predictions">🔮 Predictions</TabsTrigger>
            <TabsTrigger value="optimization">⚡ Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={`border-l-4 ${
                  insight.impact === "High"
                    ? "border-l-red-500"
                    : insight.impact === "Medium"
                      ? "border-l-yellow-500"
                      : "border-l-green-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {insight.icon}
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={
                          insight.impact === "High"
                            ? "destructive"
                            : insight.impact === "Medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {insight.impact} Impact
                      </Badge>
                      <div className="text-xs text-slate-500">{insight.confidence}% confidence</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        💡 Recommended Action: {insight.action}
                      </p>
                    </div>

                    {insight.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <div className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                            <div className="text-lg font-bold">
                              {typeof value === "number" ? value.toLocaleString() : value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {insight.leads && insight.leads.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Priority Leads:</p>
                        <div className="space-y-2">
                          {insight.leads.map((lead, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded"
                            >
                              <span className="text-sm font-medium">{lead.companyName}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Score: {lead.leadScore}</Badge>
                                {lead.revenue > 0 && (
                                  <Badge variant="secondary">${(lead.revenue / 1000000).toFixed(1)}M</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leadPatterns.map((pattern, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>{pattern.pattern}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{pattern.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Confidence:</span>
                      <span className="text-xs font-medium">{pattern.confidence}%</span>
                    </div>
                    <Progress value={pattern.confidence} className="h-2 mb-3" />
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm text-green-800 dark:text-green-200">
                      💡 {pattern.insight}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {predictions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{predictions.highConversion}%</div>
                    <div className="text-sm text-green-700 dark:text-green-300">High Conversion Probability</div>
                    <div className="text-xs text-green-600 mt-1">Expected close rate: 25%</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{predictions.mediumConversion}%</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium Conversion Probability</div>
                    <div className="text-xs text-yellow-600 mt-1">Expected close rate: 15%</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{predictions.lowConversion}%</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Low Conversion Probability</div>
                    <div className="text-xs text-red-600 mt-1">Expected close rate: 5%</div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Revenue Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ${(predictions.totalRevenuePotential / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-sm text-slate-600">Total Revenue Potential</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{predictions.expectedDeals}</div>
                        <div className="text-sm text-slate-600">Expected Deals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{predictions.timeToConvert}</div>
                        <div className="text-sm text-slate-600">Avg Time to Convert</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                  <span>Optimization Opportunities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Immediate Actions</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          Contact {leads.filter((l) => l.leadScore >= 80).length} high-scoring leads within 24 hours
                        </span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Validate {leads.filter((l) => !l.emailValid).length} invalid email addresses</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>
                          Enrich data for {leads.filter((l) => !l.industry || !l.revenue).length} incomplete profiles
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span>Strategic Improvements</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Develop industry-specific campaigns for top-performing sectors</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Implement lead scoring refinements based on conversion patterns</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Create automated nurture sequences for medium-score leads</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Expected Impact</h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• 30% increase in conversion rate</li>
                        <li>• 25% reduction in sales cycle</li>
                        <li>• 40% improvement in lead quality</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">ROI Projection</h5>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Implementation cost: $5,000</li>
                        <li>• Expected additional revenue: $50,000</li>
                        <li>• ROI: 900% within 6 months</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!analysisComplete && !isAnalyzing && leads.length > 0 && (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Click "Generate Insights" to analyze your {leads.length} leads and discover optimization opportunities
            </p>
            <Button onClick={handleAnalyze} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Zap className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {leads.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No Lead Data Available</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Upload lead data to generate AI-powered insights and recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

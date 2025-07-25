"use client"

import { useState, useEffect } from "react"
import {
  Target,
  X,
  TrendingUp,
  Lightbulb,
  Clock,
  DollarSign,
  Shield,
  BarChart3,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useCompanyUpdates } from "../../store/companyUpdatesStore"
import { useApolloClient } from "@apollo/client"

interface ValueMetric {
  id: string
  title: string
  value: number
  unit: string
  change: number
  changeDirection: "up" | "down"
  timeframe: string
  icon: any
  color: string
  description: string
}

interface TimeframeStat {
  period: string
  insights: number
  timeSaved: number
  actionPoints: number
  risksAvoided: number
  opportunitiesSpotted: number
}

export default function Insights({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "value-breakdown">("overview")

  const { getAllCompanyUpdates } = useCompanyUpdates()
  const client = useApolloClient()

  // Key value metrics
  const valueMetrics: ValueMetric[] = [
    {
      id: "insights-generated",
      title: "Insights Generated",
      value: 127,
      unit: "insights",
      change: 27,
      changeDirection: "up",
      timeframe: "last 7 days",
      icon: Lightbulb,
      color: "text-blue-600",
      description: "AI-powered insights delivered to your dashboard"
    },
    {
      id: "time-saved",
      title: "Time Saved",
      value: 48,
      unit: "hours",
      change: 12,
      changeDirection: "up",
      timeframe: "this month",
      icon: Clock,
      color: "text-green-600",
      description: "Research time saved through automated monitoring"
    },
    {
      id: "action-points",
      title: "Action Points Given",
      value: 34,
      unit: "actionable items",
      change: 8,
      changeDirection: "up",
      timeframe: "this month",
      icon: Target,
      color: "text-purple-600",
      description: "Strategic recommendations provided"
    },
    {
      id: "risks-avoided",
      title: "Risks Identified",
      value: 16,
      unit: "potential risks",
      change: 3,
      changeDirection: "up",
      timeframe: "this month",
      icon: Shield,
      color: "text-red-600",
      description: "Competitive threats and market risks flagged"
    },
    {
      id: "opportunities-spotted",
      title: "Opportunities Spotted",
      value: 23,
      unit: "market opportunities",
      change: 5,
      changeDirection: "up",
      timeframe: "this month",
      icon: TrendingUp,
      color: "text-emerald-600",
      description: "Growth and expansion opportunities identified"
    },
    {
      id: "estimated-value",
      title: "Estimated Value Created",
      value: 285000,
      unit: "USD",
      change: 47000,
      changeDirection: "up",
      timeframe: "this quarter",
      icon: DollarSign,
      color: "text-amber-600",
      description: "Estimated business value from actionable insights"
    }
  ]

  // Historical data for trends
  const timeframeStats: TimeframeStat[] = [
    { period: "This Week", insights: 27, timeSaved: 12, actionPoints: 8, risksAvoided: 3, opportunitiesSpotted: 5 },
    { period: "Last Week", insights: 23, timeSaved: 10, actionPoints: 6, risksAvoided: 2, opportunitiesSpotted: 4 },
    { period: "2 Weeks Ago", insights: 31, timeSaved: 15, actionPoints: 9, risksAvoided: 4, opportunitiesSpotted: 7 },
    { period: "3 Weeks Ago", insights: 28, timeSaved: 13, actionPoints: 7, risksAvoided: 2, opportunitiesSpotted: 6 },
  ]

  // Category breakdown
  const categoryBreakdown = [
    { name: "Product Intelligence", value: 35, percentage: 28, color: "bg-blue-500" },
    { name: "Competitive Analysis", value: 42, percentage: 33, color: "bg-purple-500" },
    { name: "Market Opportunities", value: 23, percentage: 18, color: "bg-green-500" },
    { name: "Risk Assessment", value: 16, percentage: 13, color: "bg-red-500" },
    { name: "Pricing Intelligence", value: 11, percentage: 8, color: "bg-yellow-500" },
  ]

  // Impact metrics
  const impactMetrics = [
    {
      title: "Strategic Decisions Influenced",
      value: 12,
      description: "Major business decisions supported by insights",
      icon: Target,
      trend: "+3 this month"
    },
    {
      title: "Market Share Protected",
      value: "2.3%",
      description: "Estimated market share preserved through risk mitigation",
      icon: Shield,
      trend: "+0.5% this quarter"
    },
    {
      title: "Revenue Opportunities",
      value: "$1.2M",
      description: "Potential revenue from identified opportunities",
      icon: DollarSign,
      trend: "+$400K this month"
    },
    {
      title: "Competitive Advantage",
      value: "18 days",
      description: "Average lead time advantage over competitors",
      icon: Zap,
      trend: "+5 days improvement"
    }
  ]

  useEffect(() => {
    getAllCompanyUpdates(client)
  }, [])

  const formatValue = (value: number, unit: string) => {
    if (unit === "USD") {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `${value} ${unit}`
  }

  const getChangeColor = (direction: "up" | "down") => {
    return direction === "up" ? "text-green-600" : "text-red-600"
  }

  const getTotalInsights = () => {
    return valueMetrics.find(m => m.id === "insights-generated")?.value || 0
  }

  const getTotalActionPoints = () => {
    return valueMetrics.find(m => m.id === "action-points")?.value || 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-transform duration-300 ease-in-out">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Insights Value Dashboard</h2>
                <p className="text-blue-100">
                  {getTotalInsights()} insights generated • {getTotalActionPoints()} action points delivered
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Value Overview", icon: BarChart3 },
              { id: "trends", label: "Trends & Analytics", icon: TrendingUp },
              { id: "value-breakdown", label: "Value Breakdown", icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {valueMetrics.map((metric) => (
                  <Card key={metric.id} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${metric.color === 'text-blue-600' ? 'bg-blue-100' : 
                                         metric.color === 'text-green-600' ? 'bg-green-100' :
                                         metric.color === 'text-purple-600' ? 'bg-purple-100' :
                                         metric.color === 'text-red-600' ? 'bg-red-100' :
                                         metric.color === 'text-emerald-600' ? 'bg-emerald-100' :
                                         'bg-amber-100'}`}>
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{metric.title}</CardTitle>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-gray-900">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                          {metric.unit !== "USD" && (
                            <span className="text-sm text-gray-500">{metric.unit}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.changeDirection === "up" ? (
                            <ArrowUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${getChangeColor(metric.changeDirection)}`}>
                            +{formatValue(metric.change, metric.unit)} {metric.timeframe}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Impact Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Business Impact Metrics
                  </CardTitle>
                  <CardDescription>
                    Measurable business value created through insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {impactMetrics.map((impact, index) => (
                      <div key={index} className="text-center">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-gray-100 rounded-full">
                            <impact.icon className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {impact.value}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          {impact.title}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {impact.description}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {impact.trend}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              {/* Weekly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Weekly Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Track your insights value over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeframeStats.map((stat, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{stat.period}</h4>
                          <Badge variant="outline">{stat.insights} insights</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Time Saved</div>
                            <div className="font-medium">{stat.timeSaved} hours</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Action Points</div>
                            <div className="font-medium">{stat.actionPoints}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Risks Identified</div>
                            <div className="font-medium">{stat.risksAvoided}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Opportunities</div>
                            <div className="font-medium">{stat.opportunitiesSpotted}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "value-breakdown" && (
            <div className="space-y-6">
              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Insights by Category
                  </CardTitle>
                  <CardDescription>
                    Distribution of insights across different business areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {category.value} insights ({category.percentage}%)
                            </span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* ROI Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Return on Investment
                  </CardTitle>
                  <CardDescription>
                    Estimated financial impact of insights delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">$285K</div>
                      <div className="text-sm text-gray-600">Total Value Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">540%</div>
                      <div className="text-sm text-gray-600">Estimated ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">48h</div>
                      <div className="text-sm text-gray-600">Time Saved This Month</div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Calculation Methodology:</strong>
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Time saved valued at $150/hour (market research rate)</li>
                      <li>• Risk mitigation valued at potential revenue impact</li>
                      <li>• Opportunities valued at 10% probability of capture</li>
                      <li>• Strategic decisions valued at competitive advantage gained</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

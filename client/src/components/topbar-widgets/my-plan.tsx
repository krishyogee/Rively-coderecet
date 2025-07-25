"use client"

import { useState } from "react"
import {
  CreditCard,
  X,
  Check,
  Crown,
  Star,
  Calendar,
  Users,
  Building,
  Zap,
  Shield,
  TrendingUp,
  Settings,
  Download,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface PlanFeature {
  id: string
  name: string
  included: boolean
  limit?: string
}

interface Plan {
  id: string
  name: string
  price: number
  interval: string
  description: string
  features: PlanFeature[]
  isCurrentPlan: boolean
  isPopular?: boolean
}

interface Usage {
  feature: string
  current: number
  limit: number
  unit: string
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "failed"
  downloadUrl: string
}

export default function MyPlan({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "billing" | "usage">("overview")
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Current subscription data
  const currentPlan = {
    name: "Professional",
    price: 49,
    interval: "month",
    nextBillingDate: "Jan 15, 2025",
    status: "active",
  }

  // Available plans
  const plans: Plan[] = [
    {
      id: "starter",
      name: "Starter",
      price: 0,
      interval: "month",
      description: "Perfect for individuals getting started",
      isCurrentPlan: false,
      features: [
        { id: "1", name: "5 tracked companies", included: true, limit: "5" },
        { id: "2", name: "Basic analytics", included: true },
        { id: "3", name: "Email notifications", included: true },
        { id: "4", name: "Advanced filters", included: false },
        { id: "5", name: "Custom integrations", included: false },
        { id: "6", name: "Priority support", included: false },
      ],
    },
    {
      id: "professional",
      name: "Professional",
      price: 49,
      interval: "month",
      description: "Best for growing teams and businesses",
      isCurrentPlan: true,
      isPopular: true,
      features: [
        { id: "1", name: "50 tracked companies", included: true, limit: "50" },
        { id: "2", name: "Advanced analytics", included: true },
        { id: "3", name: "Email & SMS notifications", included: true },
        { id: "4", name: "Advanced filters", included: true },
        { id: "5", name: "Custom integrations", included: true },
        { id: "6", name: "Priority support", included: false },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 149,
      interval: "month",
      description: "For large organizations with custom needs",
      isCurrentPlan: false,
      features: [
        { id: "1", name: "Unlimited tracked companies", included: true, limit: "Unlimited" },
        { id: "2", name: "Advanced analytics", included: true },
        { id: "3", name: "All notification types", included: true },
        { id: "4", name: "Advanced filters", included: true },
        { id: "5", name: "Custom integrations", included: true },
        { id: "6", name: "Priority support", included: true },
      ],
    },
  ]

  // Usage data
  const usageData: Usage[] = [
    { feature: "Tracked Companies", current: 32, limit: 50, unit: "companies" },
    { feature: "API Calls", current: 8420, limit: 10000, unit: "calls" },
    { feature: "Data Export", current: 145, limit: 500, unit: "exports" },
    { feature: "Team Members", current: 3, limit: 10, unit: "members" },
  ]

  // Recent invoices
  const invoices: Invoice[] = [
    {
      id: "INV-2024-001",
      date: "Dec 15, 2024",
      amount: 49.00,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-002",
      date: "Nov 15, 2024",
      amount: 49.00,
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-003",
      date: "Oct 15, 2024",
      amount: 49.00,
      status: "paid",
      downloadUrl: "#",
    },
  ]

  const handleUpgrade = (planId: string) => {
    setIsUpgrading(true)
    setTimeout(() => {
      setIsUpgrading(false)
      console.log(`Upgrading to plan: ${planId}`)
    }, 2000)
  }

  const handleDowngrade = (planId: string) => {
    console.log(`Downgrading to plan: ${planId}`)
  }

  const handleCancelSubscription = () => {
    console.log("Canceling subscription")
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    console.log(`Downloading invoice: ${invoice.id}`)
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return (current / limit) * 100
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-transform duration-300 ease-in-out">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">My Plan</h2>
                <p className="text-blue-100">Manage your subscription and billing</p>
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
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "billing", label: "Billing", icon: CreditCard },
              { id: "usage", label: "Usage", icon: Building },
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
              {/* Current Plan Card */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-blue-800">Current Plan: {currentPlan.name}</CardTitle>
                        <CardDescription className="text-blue-600">
                          ${currentPlan.price}/{currentPlan.interval} • Next billing: {currentPlan.nextBillingDate}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setActiveTab("billing")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Billing
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("usage")}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Usage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative ${
                        plan.isCurrentPlan
                          ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20"
                          : "border-gray-200 hover:border-gray-300"
                      } transition-all duration-200`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          {plan.isCurrentPlan && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-gray-500">/{plan.interval}</span>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature) => (
                            <li key={feature.id} className="flex items-center space-x-2">
                              {feature.included ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span
                                className={`text-sm ${
                                  feature.included ? "text-gray-900" : "text-gray-500"
                                }`}
                              >
                                {feature.name}
                                {feature.limit && (
                                  <span className="text-gray-400 ml-1">({feature.limit})</span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-2">
                          {plan.isCurrentPlan ? (
                            <Button variant="outline" className="w-full" disabled>
                              Current Plan
                            </Button>
                          ) : plan.price > currentPlan.price ? (
                            <Button
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={isUpgrading}
                            >
                              {isUpgrading ? "Upgrading..." : "Upgrade"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleDowngrade(plan.id)}
                            >
                              Downgrade
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Billing Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Payment Method</h4>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Billing Address</h4>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">123 Business Street</p>
                        <p className="text-sm">Suite 100</p>
                        <p className="text-sm">San Francisco, CA 94105</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Payment Method
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Billing Address
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Recent Invoices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-gray-500">{invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : invoice.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : invoice.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cancel Subscription */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>Cancel Subscription</span>
                  </CardTitle>
                  <CardDescription>
                    Cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "usage" && (
            <div className="space-y-6">
              {/* Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Usage Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor your usage across different features and limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {usageData.map((usage) => {
                      const percentage = getUsagePercentage(usage.current, usage.limit)
                      const colorClass = getUsageColor(percentage)
                      
                      return (
                        <div key={usage.feature} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{usage.feature}</span>
                            <span className={`text-sm font-medium ${colorClass}`}>
                              {usage.current.toLocaleString()} / {usage.limit.toLocaleString()} {usage.unit}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <Progress value={percentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{percentage.toFixed(1)}% used</span>
                              <span>{(usage.limit - usage.current).toLocaleString()} {usage.unit} remaining</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Usage History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Usage History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Usage history will be displayed here</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Track your usage patterns over time
                    </p>
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
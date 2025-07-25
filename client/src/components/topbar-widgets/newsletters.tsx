"use client"

import { useState } from "react"
import {
  Mail,
  X,
  Search,
  Eye,
  Download,
  Share,
  Filter,
  ChevronDown,
  FileText,
  Calendar,
  Settings,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface Newsletter {
  id: string
  title: string
  description: string
  department: string
  dateCreated: string
  size: string
  format: string
  thumbnail?: string
}

interface Integration {
  id: string
  name: string
  icon: string
  connected: boolean
  description: string
}

export default function Newsletters({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([])
  const [showIntegrations, setShowIntegrations] = useState(false)

  const departmentOptions = ["Leadership", "Product", "Marketing&Sales", "Finance", "HR", "General"]
  const dateRangeOptions = ["Last 30 days", "Last 3 months", "Last 6 months", "Over 6 months"]

  // Integration state
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "slack",
      name: "Slack",
      icon: "/assets/slack-logo.svg",
      connected: true,
      description: "Send newsletters directly to Slack channels",
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      icon: "/assets/ms-teams-logo.svg",
      connected: false,
      description: "Send newsletters in Teams channels",
    },
  ])

  // Dummy newsletters data
  const [newsletters] = useState<Newsletter[]>([
    {
      id: "1",
      title: "Q4 Leadership Insights",
      description: "Key strategic insights and leadership updates for the fourth quarter",
      department: "Leadership",
      dateCreated: "Dec 15, 2024",
      size: "2.1 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-1.jpg",
    },
    {
      id: "2",
      title: "Product Launch Newsletter",
      description: "Comprehensive overview of our latest product features and roadmap",
      department: "Product",
      dateCreated: "Nov 28, 2024",
      size: "1.8 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-2.jpg",
    },
    {
      id: "3",
      title: "Marketing Campaign Results",
      description: "Analysis of recent marketing campaigns and sales performance metrics",
      department: "Marketing&Sales",
      dateCreated: "Nov 10, 2024",
      size: "3.2 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-3.jpg",
    },
    {
      id: "4",
      title: "Financial Performance Report",
      description: "Monthly financial highlights and budget analysis",
      department: "Finance",
      dateCreated: "Oct 30, 2024",
      size: "1.5 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-4.jpg",
    },
    {
      id: "5",
      title: "HR Policy Updates",
      description: "Important updates to company policies and employee benefits",
      department: "HR",
      dateCreated: "Oct 15, 2024",
      size: "892 KB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-5.jpg",
    },
    {
      id: "6",
      title: "Company News Digest",
      description: "Monthly roundup of company news, achievements, and announcements",
      department: "General",
      dateCreated: "Sep 25, 2024",
      size: "2.7 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-6.jpg",
    },
    {
      id: "7",
      title: "Tech Stack Newsletter",
      description: "Latest technology updates and development insights",
      department: "Product",
      dateCreated: "Sep 12, 2024",
      size: "1.9 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-7.jpg",
    },
    {
      id: "8",
      title: "Sales Performance Update",
      description: "Quarterly sales results and team performance highlights",
      department: "Marketing&Sales",
      dateCreated: "Aug 28, 2024",
      size: "2.3 MB",
      format: "PDF",
      thumbnail: "/newsletter-thumb-8.jpg",
    },
  ])

  const handleViewNewsletter = (newsletter: Newsletter) => {
    console.log("Viewing newsletter:", newsletter.title)
  }

  const handleDownloadNewsletter = (newsletter: Newsletter) => {
    console.log("Downloading newsletter:", newsletter.title)
  }

  const handleShareNewsletter = (newsletter: Newsletter) => {
    console.log("Sharing newsletter:", newsletter.title)
  }

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  // Helper function to check date match
  const checkDateMatch = (dateCreated: string, ranges: string[]): boolean => {
    if (ranges.length === 0) return true

    const newsletterDate = new Date(dateCreated)
    const now = new Date()
    const diffInMonths =
      (now.getFullYear() - newsletterDate.getFullYear()) * 12 + (now.getMonth() - newsletterDate.getMonth())

    for (const range of ranges) {
      if (range === "Last 30 days" && diffInMonths <= 1) return true
      if (range === "Last 3 months" && diffInMonths <= 3) return true
      if (range === "Last 6 months" && diffInMonths <= 6) return true
      if (range === "Over 6 months" && diffInMonths > 6) return true
    }
    return false
  }

  // Filter newsletters based on search query and filters
  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesDepartments = selectedDepartments.length === 0 || selectedDepartments.includes(newsletter.department)

    const matchesDateRanges =
      selectedDateRanges.length === 0 || checkDateMatch(newsletter.dateCreated, selectedDateRanges)

    const matchesSearch =
      searchQuery === "" ||
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.department.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDepartments && matchesDateRanges && matchesSearch
  })

  const connectedIntegrations = integrations.filter((i) => i.connected).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-transform duration-300 ease-in-out">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#040924] text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Mail className="w-7 h-7 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Newsletters</h2>
                <p className="text-blue-200 text-sm mt-1">{newsletters.length} newsletters available</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Integrations Section */}
          {showIntegrations && (
            <div className="mb-6 bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
                  <p className="text-sm text-gray-600">Connect your favorite tools to share newsletters</p>
                </div>
                <div className="text-sm text-gray-500">
                  {connectedIntegrations} of {integrations.length} connected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img
                            src={integration.icon}
                            alt={`${integration.name} logo`}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "/assets/rively-logo.svg"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{integration.name}</h4>
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full ${integration.connected ? "bg-green-500" : "bg-gray-400"}`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  integration.connected ? "text-green-700" : "text-gray-500"
                                }`}
                              >
                                {integration.connected ? "Connected" : "Not Connected"}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleToggleIntegration(integration.id)}
                          variant={integration.connected ? "outline" : "default"}
                          size="sm"
                          className={
                            integration.connected
                              ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              : "bg-[#040924] hover:bg-[#040924]/90"
                          }
                        >
                          {integration.connected ? (
                            <>
                              <X className="w-3 h-3 mr-1" />
                              Disconnect
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar and Filters */}
          <div className="relative mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search newsletters by title, description, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Department
                  {selectedDepartments.length > 0 && (
                    <span className="ml-1 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {selectedDepartments.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {departmentOptions.map((dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={selectedDepartments.includes(dept)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDepartments([...selectedDepartments, dept])
                      } else {
                        setSelectedDepartments(selectedDepartments.filter((d) => d !== dept))
                      }
                    }}
                  >
                    {dept}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="w-4 h-4" />
                  Date
                  {selectedDateRanges.length > 0 && (
                    <span className="ml-1 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {selectedDateRanges.length}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dateRangeOptions.map((range) => (
                  <DropdownMenuCheckboxItem
                    key={range}
                    checked={selectedDateRanges.includes(range)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDateRanges([...selectedDateRanges, range])
                      } else {
                        setSelectedDateRanges(selectedDateRanges.filter((r) => r !== range))
                      }
                    }}
                  >
                    {range}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Integrations Button */}
            <Button
              onClick={() => setShowIntegrations(!showIntegrations)}
              variant="outline"
              className={`flex items-center gap-2 bg-transparent ${
                showIntegrations
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-black hover:border-black"
              }`}
            >
              <Settings className="w-4 h-4" />
              Integrations
            </Button>
          </div>

          {/* Newsletters Grid */}
          <div className={`overflow-y-auto ${showIntegrations ? "max-h-[45vh]" : "max-h-[60vh]"}`}>
            {filteredNewsletters.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletters found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedDepartments.length > 0 || selectedDateRanges.length > 0
                    ? "Try adjusting your search or filters"
                    : "Start creating some newsletters to see them here!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredNewsletters.map((newsletter) => (
                  <div
                    key={newsletter.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Newsletter Icon and Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg truncate">{newsletter.title}</h4>
                          <p className="text-sm text-gray-500 truncate">{newsletter.description}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className="text-xs text-gray-400">{newsletter.format}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{newsletter.size}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Department and Date */}
                      <div className="flex items-center space-x-8 flex-1 justify-center">
                        <div className="text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                            {newsletter.department}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-700 font-medium">{newsletter.dateCreated}</p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                          aria-label={`View ${newsletter.title}`}
                          onClick={() => handleViewNewsletter(newsletter)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700 transition-colors p-2 hover:bg-green-50 rounded-lg"
                          aria-label={`Download ${newsletter.title}`}
                          onClick={() => handleDownloadNewsletter(newsletter)}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-700 transition-colors p-2 hover:bg-purple-50 rounded-lg"
                          aria-label={`Share ${newsletter.title}`}
                          onClick={() => handleShareNewsletter(newsletter)}
                        >
                          <Share className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Card } from "@/components/ui/card"
import { ArrowUpDown, ListFilter, Maximize2, Minimize2, Bookmark, Share2, BookmarkPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCompanyUpdates, CompanyUpdate } from "../store/companyUpdatesStore"
import { useApolloClient } from "@apollo/client"

export default function InsightsSection() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [isSaved, setIsSaved] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [sortOrder, setSortOrder] = useState<"none" | "recent" | "oldest">("none")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [savedInsights, setSavedInsights] = useState<Set<string>>(new Set())
  const filters = ["All", "Product", "HR", "Finance", "Marketing & Sales"]
  const { companyUpdates, getAllCompanyUpdates, saveOrUnsaveCompanyUpdate } = useCompanyUpdates()
  const client = useApolloClient()

  // Available filter options
  const updateTypes = ["Key Insight", "Risk", "Opportunity"]
  const updateCategories = [
    "Pricing", "Product Offering", "Market Entry", "Hiring", "Layoffs", 
    "Management Changes", "Fundraising", "Mergers & Acquisitions (M&A)", 
    "Content Marketing", "Vendors", "Tech Stack", "Specs", 
    "Event Participation", "Partnerships", "Clients", "Media Mentions", 
    "Corporate Filings"
  ]

  useEffect(() => {
    getAllCompanyUpdates(client)
  }, [getAllCompanyUpdates, client])

  // Filter updates based on activeFilter
  const getFilteredUpdates = () => {
    let filtered = companyUpdates

    // Apply saved filter
    if (isSaved) {
      filtered = filtered.filter(update => update.IsSaved)
    }

    // Apply category group filter (All, Product, HR, etc.)
    if (activeFilter !== "All") {
      const filterMap: Record<"Product" | "HR" | "Finance" | "Marketing & Sales", string[]> = {
        "Product": ["Product Offering", "Tech Stack", "Specs"],
        "HR": ["Hiring", "Layoffs", "Management Changes"],
        "Finance": ["Pricing", "Fundraising", "Mergers & Acquisitions (M&A)", "Corporate Filings"],
        "Marketing & Sales": ["Market Entry", "Content Marketing", "Event Participation", "Partnerships", "Clients", "Media Mentions", "Vendors"]
      }
      
      const categories = filterMap[activeFilter as keyof typeof filterMap] || []
      filtered = filtered.filter(update => categories.includes(update.UpdateCategory))
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(update => selectedTypes.includes(update.UpdateType))
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(update => selectedCategories.includes(update.UpdateCategory))
    }

    return filtered
  }

  // Handle type filter toggle
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Handle category filter toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedCategories([])
  }

  // Check if any advanced filters are active
  const hasActiveFilters = selectedTypes.length > 0 || selectedCategories.length > 0
  
  // Sort updates based on sortOrder
  const getSortedUpdates = (updates: CompanyUpdate[]) => {
    if (sortOrder === "none") {
      return updates
    }
    
    return [...updates].sort((a, b) => {
      const dateA = new Date(a.PostedAt).getTime()
      const dateB = new Date(b.PostedAt).getTime()
      
      if (sortOrder === "recent") {
        return dateB - dateA // Most recent first
      } else {
        return dateA - dateB // Oldest first
      }
    })
  }
  
  const filteredUpdates = getSortedUpdates(getFilteredUpdates())

  // Toggle sort order: none -> recent -> oldest -> none
  const handleSortToggle = () => {
    setSortOrder(prev => {
      if (prev === "none") return "recent"
      if (prev === "recent") return "oldest"
      return "none"
    })
  }

  // Get sort button text based on current state
  const getSortButtonText = () => {
    if (sortOrder === "recent") return "Recent"
    if (sortOrder === "oldest") return "Oldest"
    return "Sort"
  }

  // Toggle maximize state
  const handleMaximize = () => {
    setIsMaximized((prev) => !prev)
  }

  // Handle save insight
  const handleSaveInsight = async (insight: CompanyUpdate) => {
    try {
      await saveOrUnsaveCompanyUpdate(client, insight.CompanyUpdateUID, !insight.IsSaved);
    } catch (error) {
      console.error('Failed to save/unsave insight:', error);
    }
  }

  // Handle share insight
  const handleShareInsight = (insight: CompanyUpdate) => {
    // Do nothing - placeholder for future implementation
  }

  return (
    <div className="relative">
      {/* Background overlay when maximized */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isMaximized ? "opacity-50 z-40" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Main card with maximize transition */}
      <Card
        className={`bg-white border-0 p-6 shadow-sm transition-all duration-300 ease-in-out relative ${
          isMaximized
            ? "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl h-[90vh] z-50"
            : "w-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-[#040924] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Right-side Buttons */}
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved((prev) => !prev)}
              className={`flex gap-1.5 items-center text-sm px-3 py-1.5 transition-all rounded-md
                ${isSaved ? "bg-[#040924] text-white" : "bg-gray-100 text-gray-700"}
                hover:bg-[#040924] hover:text-white`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSortToggle}
              className={`flex gap-1.5 items-center text-sm px-3 py-1.5 transition-all rounded-md
                ${sortOrder !== "none" ? "bg-[#040924] text-white" : "bg-gray-100 text-gray-700"}
                hover:bg-[#040924] hover:text-white`}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{getSortButtonText()}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex gap-1.5 items-center text-sm px-3 py-1.5 transition-all rounded-md
                ${hasActiveFilters || showFilters ? "bg-[#040924] text-white" : "bg-gray-100 text-gray-700"}
                hover:bg-[#040924] hover:text-white`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            <Button variant="ghost" size="icon" className="p-2" onClick={handleMaximize}>
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Filters */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Update Type</h4>
                <div className="flex flex-wrap gap-2">
                  {updateTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeToggle(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedTypes.includes(type)
                          ? "bg-[#040924] text-white shadow-sm"
                          : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Update Category</h4>
                <div className="flex flex-wrap gap-2">
                  {updateCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        selectedCategories.includes(category)
                          ? "bg-[#040924] text-white shadow-sm"
                          : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Content Area */}
        <div
          className={`bg-[#000080]/5 rounded-lg p-4 pb-6 ${
            isMaximized ? "max-h-[78vh]" : "max-h-[380px]"
          } overflow-y-auto`}
        >

          {filteredUpdates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                {isSaved ? "No saved insights found" : `No updates found for ${activeFilter}`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUpdates.map((update: CompanyUpdate) => (
                <div
                  key={update.CompanyUpdateUID}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                >
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={`https://cdn.brandfetch.io/${encodeURIComponent(update.Domain)}/icon?c=1idyJSKpER3b8yHqXHV`}
                      alt={`${update.Title} logo`}
                      className="w-12 h-12 object-contain rounded-md border border-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/48?text=Logo"
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title, Category, and Status Dot */}
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{update.Title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {update.UpdateType !== "Key Insight" && (
                          <div
                            className={`w-3 h-3 rounded-full border-2 border-white ${
                              update.UpdateType === "Opportunity" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        )}
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium whitespace-nowrap">
                          {update.UpdateCategory}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{update.Description}</p>

                    {/* Action Point */}
                    {update.ActionPoint && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700"> ⚡Action Point</p>
                        <p className="text-xs text-gray-500 mt-1">{update.ActionPoint}</p>
                      </div>
                    )}

                    {/* Source and Date */}
                    <div className="flex items-center justify-between">
                      <a
                        href={update.SourceURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate"
                      >
                        {update.SourceType}
                      </a>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveInsight(update)}
                            className={`p-1.5 rounded-full transition-all duration-200 ${
                              update.IsSaved 
                                ? "bg-[#040924] text-white" 
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                            title={update.IsSaved ? "Unsave insight" : "Save insight"}
                          >
                            {update.IsSaved ? (
                              <Bookmark className="w-3.5 h-3.5" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleShareInsight(update)}
                            className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all duration-200"
                            title="Share insight"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(update.PostedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
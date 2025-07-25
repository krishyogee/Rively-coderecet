'use client'
import { Card } from "@/components/ui/card"
import { ExternalLink, Calendar, Tag, Zap } from 'lucide-react'
import { useCompanyUpdateStore, CompanyUpdate } from "../store/companyUpdatesStore"
import { useApolloClient } from "@apollo/client"
import { useEffect, useState, useRef } from "react"

// Custom Flame SVG component
const FlameIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 1707 1707" 
    className={className}
  >
    <defs>
      <linearGradient id="flame-gradient-1" gradientUnits="userSpaceOnUse" x1="853.327" y1="-0.393701" x2="853.327" y2="1707.06">
        <stop offset="0" style={{ stopOpacity: 1, stopColor: '#FF9911' }} />
        <stop offset="1" style={{ stopOpacity: 1, stopColor: '#FF6600' }} />
      </linearGradient>
      <linearGradient id="flame-gradient-2" gradientUnits="userSpaceOnUse" x1="594.335" y1="182.724" x2="594.335" y2="1240.37">
        <stop offset="0" style={{ stopOpacity: 1, stopColor: '#F6581A' }} />
        <stop offset="1" style={{ stopOpacity: 1, stopColor: '#F64013' }} />
      </linearGradient>
      <linearGradient id="flame-gradient-3" gradientUnits="userSpaceOnUse" x1="828.114" y1="658.677" x2="828.114" y2="1706.82">
        <stop offset="0" style={{ stopOpacity: 1, stopColor: '#F6581A' }} />
        <stop offset="1" style={{ stopOpacity: 1, stopColor: '#F64013' }} />
      </linearGradient>
    </defs>
    <g>
      <path fill="url(#flame-gradient-1)" fillRule="nonzero" d="M384 546c3,-4 7,-6 12,-7 12,-4 25,4 28,17 22,90 54,126 76,142 -16,-530 402,-687 428,-697 5,-2 10,-2 16,0 12,3 19,16 15,29 -46,155 11,238 72,327 46,66 94,135 110,237 57,-74 118,-81 134,-81 16,5 23,18 19,30 -28,87 11,155 52,226 58,102 120,210 31,386 37,-3 97,-55 102,-60 6,-5 15,-8 23,-5 12,3 19,16 16,29 -85,289 -238,457 -410,535 -107,48 -221,62 -331,48 -110,-14 -216,-55 -307,-116 -157,-104 -270,-268 -282,-455l0 0c0,-7 3,-15 9,-20 10,-7 25,-6 33,5 24,32 45,42 60,44 -148,-352 93,-614 94,-614l0 0z" />
      <path fill="url(#flame-gradient-2)" fillRule="nonzero" d="M810 188c10,-8 24,-7 32,3 9,10 7,25 -2,33 -100,83 -150,173 -173,273 -23,101 -19,213 -11,336 0,13 -9,24 -22,25 -1,0 -2,0 -4,0 -12,-1 -24,-1 -36,-1 -68,0 -127,0 -188,-48 -22,72 -23,133 -11,192 13,67 43,131 78,206 6,12 1,26 -11,31 -12,6 -26,1 -31,-11 -37,-78 -68,-145 -82,-217 -14,-72 -11,-148 20,-239 1,-2 2,-4 2,-6l3 -5 0 0c1,-3 3,-6 5,-9 9,-9 24,-8 33,1 3,3 6,5 9,8 3,3 6,6 9,8 50,42 103,43 164,43l14 0c-8,-117 -9,-224 14,-324 25,-110 80,-209 188,-299z" />
      <path fill="url(#flame-gradient-3)" fillRule="nonzero" d="M682 1188c-31,-327 169,-508 186,-523 5,-4 11,-7 18,-6 13,1 23,12 22,25 -13,148 36,357 88,464 13,27 25,46 36,56 3,2 5,2 5,1 12,-14 21,-54 26,-128 0,-10 7,-20 17,-22 12,-4 25,4 28,16 77,285 42,461 -40,553 -68,77 -167,97 -263,74 -94,-23 -185,-86 -242,-178 -77,-124 -90,-299 42,-491 5,-7 13,-12 23,-11 13,2 22,13 20,26 -11,96 13,131 34,144z" />
    </g>
  </svg>
)

export default function HotInsight() {
  const [selectedInsight, setSelectedInsight] = useState<CompanyUpdate | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const { companyUpdates, getAllCompanyUpdates } = useCompanyUpdateStore()
  const client = useApolloClient()

  useEffect(() => {
    getAllCompanyUpdates(client)
  }, [getAllCompanyUpdates, client])

  useEffect(() => {
    if (companyUpdates.length > 0) {
      // Filter insights that have action points
      const insightsWithActionPoints = companyUpdates.filter(
        insight => insight.ActionPoint && insight.ActionPoint.trim() !== ""
      )
      
      if (insightsWithActionPoints.length > 0) {
        // Select a random insight from filtered list
        const randomIndex = Math.floor(Math.random() * insightsWithActionPoints.length)
        const insight = insightsWithActionPoints[randomIndex]
        setSelectedInsight(insight)
      }
    }
  }, [companyUpdates])

  // Check if content is overflowing
  const checkOverflow = () => {
    if (contentRef.current) {
      const element = contentRef.current
      // Add a small buffer to account for any rendering differences
      const hasOverflow = element.scrollHeight > element.clientHeight + 1
      setIsOverflowing(hasOverflow)
    }
  }

  useEffect(() => {
    if (selectedInsight && contentRef.current) {
      // Use multiple checks to ensure accurate overflow detection
      const timeouts = [
        setTimeout(() => checkOverflow(), 0),
        setTimeout(() => checkOverflow(), 100),
        setTimeout(() => checkOverflow(), 300)
      ]
      
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [selectedInsight])

  // Add resize observer to handle window resizing
  useEffect(() => {
    let resizeObserver: ResizeObserver
    
    if (contentRef.current) {
      resizeObserver = new ResizeObserver(() => {
        // Debounce the overflow check
        setTimeout(() => checkOverflow(), 100)
      })
      
      resizeObserver.observe(contentRef.current)
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [selectedInsight])

  const refreshInsight = () => {
    if (companyUpdates.length > 0) {
      // Filter insights that have action points
      const insightsWithActionPoints = companyUpdates.filter(
        insight => insight.ActionPoint && insight.ActionPoint.trim() !== ""
      )
      
      if (insightsWithActionPoints.length > 0) {
        const randomIndex = Math.floor(Math.random() * insightsWithActionPoints.length)
        const insight = insightsWithActionPoints[randomIndex]
        setIsOverflowing(false) // Reset overflow state
        setSelectedInsight(insight)
      }
    }
  }

  if (!selectedInsight) {
    return (
      <Card className="bg-white border-0 shadow-sm p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            {companyUpdates.length === 0 ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm">Loading hot insight...</p>
              </>
            ) : (
              <>
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No insights with action points available</p>
              </>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-0 shadow-sm p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <FlameIcon className="w-5 h-5" />
          </div>
          <h2 className="text-md font-semibold text-gray-900">Hot Insight</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshInsight}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-all duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Insight Content */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div ref={contentRef} className={`insight-content space-y-4 h-full ${isOverflowing ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2' : 'overflow-y-hidden'}`}>
          {/* Company Header */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={`https://cdn.brandfetch.io/${encodeURIComponent(selectedInsight.Domain)}/icon?c=1idyJSKpER3b8yHqXHV`}
              alt={`${selectedInsight.Title} logo`}
              className="w-10 h-10 object-contain rounded-md border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/40?text=Logo"
              }}
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{selectedInsight.Title}</h3>
              <p className="text-xs text-gray-500">{selectedInsight.Domain}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedInsight.UpdateType !== "Key Insight" && (
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white ${
                    selectedInsight.UpdateType === "Opportunity" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              )}
              <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded-md font-medium border">
                {selectedInsight.UpdateCategory}
              </span>
            </div>
          </div>

          {/* Insight Description */}
          <div className="space-y-3">
            <p className="text-sm text-gray-700 leading-relaxed">{selectedInsight.Description}</p>
            
            {/* Action Point */}
            {selectedInsight.ActionPoint && (
              <div className="bg-orange-50 p-3 rounded-lg border-orange-500">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Action Point</span>
                </div>
                <p className="text-sm text-orange-800">{selectedInsight.ActionPoint}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(selectedInsight.PostedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{selectedInsight.UpdateType}</span>
              </div>
            </div>
            <a
              href={selectedInsight.SourceURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-orange-800 transition-colors"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        
        {/* Fade gradient at bottom when scrollable */}
        {isOverflowing && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        )}
      </div>
    </Card>
  )
}

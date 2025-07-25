"use client"

import { Building2, X, Edit, Trash2, ToggleLeft, ToggleRight, Plus, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useTrackedCompanies } from "../../store/trackedCompanyStore"
import { useApolloClient } from "@apollo/client"
import { UpdateTrackedCompanyInput, DeleteTrackedCompanyInput } from '@/graphql/tracked-company/mutation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export default function CompaniesTracked({ onClose }: { onClose: () => void }) {
  const { trackedCompanies, getAllTrackedCompanies, updateTrackedCompany, deleteTrackedCompany, createTrackedCompany } = useTrackedCompanies();
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [newCompanyQuery, setNewCompanyQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<{ domain: string; name: string; icon: string } | null>(null);
  const [companyType, setCompanyType] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<{ domain: string; name: string; icon: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingCompanies, setUpdatingCompanies] = useState<Set<string>>(new Set());
  const client = useApolloClient();
  const clientId = '1idyJSKpER3b8yHqXHV';

  const interestsOptions = [
    'Product Offering', 'Pricing', 'M&A', 'Layoffs',
    'Content Marketing', 'Tech stack', 'Vendors',
    'Market Entry', 'Management changes', 'Fundraising',
    'Specs', 'Event Participation', 'Media Mentions',
    'Partnerships, Clients', 'Hiring', 'Corporate Filings'
  ]

  useEffect(() => {
    getAllTrackedCompanies(client)
  }, [getAllTrackedCompanies, client])

  const tags = ["Competitors", "Investors", "Clients", "Partner", "Regulator", "Supplier", "Target Account"]

  const handleToggleActive = async (trackedCompanyUID: string, currentStatus: boolean) => {
    // Prevent multiple simultaneous updates for the same company
    if (updatingCompanies.has(trackedCompanyUID)) {
      return;
    }

    setUpdatingCompanies(prev => new Set(prev).add(trackedCompanyUID));

    try {
      // Find the current company to preserve its type and interests
      const currentCompany = trackedCompanies.find(c => c.TrackedCompanyUID === trackedCompanyUID);
      
      const input: UpdateTrackedCompanyInput = {
        trackedCompanyUID,
        type: currentCompany?.Type || '',
        interests: currentCompany?.Interests || [],
        isActive: !currentStatus,
      };
      console.log('Toggling company with input:', input);
      await updateTrackedCompany(client, input);
      toast({
        title: 'Success',
        description: `Company ${currentStatus ? 'deactivated' : 'activated'} successfully.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling company status:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle company status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingCompanies(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackedCompanyUID);
        return newSet;
      });
    }
  };

  const handleDeleteCompany = async (trackedCompanyUID: string) => {
    try {
      const input: DeleteTrackedCompanyInput = {
        trackedCompanyUID: trackedCompanyUID
      }
      await deleteTrackedCompany(client, input)
      // Remove the refetch since the store should handle the state update
      toast({
        title: 'Success',
        description: 'Company deleted successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error("Error deleting company:", error)
      toast({
        title: 'Error',
        description: 'Failed to delete company. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const handleSearchNewCompany = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setNewCompanyQuery(query)
    setError(null)

    if (query.length > 2) {
      setLoading(true)
      setShowResults(true)
      try {
        const response = await fetch(
          `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}?c=${clientId}`
        )
        const data = await response.json()
        setSearchResults(data.slice(0, 3))
        setLoading(false)
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message)
        setLoading(false)
      }
    } else {
      setSearchResults([])
      setShowResults(false)
      setLoading(false)
    }
  }

  const handleSelectNewCompany = (brand: { domain: string; name: string; icon: string }) => {
    setSelectedCompany(brand)
    setNewCompanyQuery(brand.domain)
    setShowResults(false)
  }

  const handleInputFocus = () => {
    if (newCompanyQuery.length > 2 && searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest))
    } else {
      setSelectedInterests([...selectedInterests, interest])
    }
  }

  const handleAddCompany = () => {
    setShowAddModal(true)
  }

  const handleConfirmAddCompany = async () => {
    if (!selectedCompany || !companyType || selectedInterests.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please select a company, type, and at least one interest.',
        duration: 5000,
        variant: 'destructive',
      })
      setError('Please select a company, type, and at least one interest.')
      return
    }

    try {
      const input = [{
        name: selectedCompany.name,
        domain: selectedCompany.domain,
        type: companyType,
        interests: selectedInterests,
      }]
      await createTrackedCompany(client, input)
      toast({
        title: 'Success!',
        description: 'Company has been tracked successfully.',
        variant: 'default',
      })
      setShowAddModal(false)
      setSelectedCompany(null)
      setNewCompanyQuery('')
      setCompanyType('')
      setSelectedInterests([])
      setSearchResults([])
      setShowResults(false)
      setError(null)
    } catch (error: any) {
      console.error('Error tracking company:', error)
      toast({
        title: 'Error',
        description: 'Failed to track company. Please try again.',
        duration: 5000,
        variant: 'destructive',
      })
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setSelectedCompany(null)
    setNewCompanyQuery('')
    setCompanyType('')
    setSelectedInterests([])
    setSearchResults([])
    setShowResults(false)
    setError(null)
  }

  const handleEditCompany = (company: any) => {
    setEditingCompany(company)
    setCompanyType(company.Type || '')
    setSelectedInterests(company.Interests || [])
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingCompany(null)
    setCompanyType('')
    setSelectedInterests([])
    setError(null)
  }

  const handleConfirmEditCompany = async () => {
    if (!editingCompany || !companyType || selectedInterests.length === 0) {
      toast({
        title: 'Missing information',
        description: 'Please select a company type and at least one interest.',
        duration: 5000,
        variant: 'destructive',
      })
      setError('Please select a company type and at least one interest.')
      return
    }

    try {
      const input: UpdateTrackedCompanyInput = {
        trackedCompanyUID: editingCompany.TrackedCompanyUID,
        type: companyType,
        interests: selectedInterests,
        isActive: editingCompany.IsActive,
      }
      await updateTrackedCompany(client, input)
      toast({
        title: 'Success!',
        description: 'Company has been updated successfully.',
        variant: 'default',
      })
      handleCloseEditModal()
    } catch (error: any) {
      console.error('Error updating company:', error)
      toast({
        title: 'Error',
        description: 'Failed to update company. Please try again.',
        duration: 5000,
        variant: 'destructive',
      })
    }
  }

  // Remove duplicates client-side as an additional safeguard
  const uniqueCompanies = trackedCompanies.filter((company, index, self) => 
    index === self.findIndex(c => c.TrackedCompanyUID === company.TrackedCompanyUID)
  );

  // Improved filtering logic: companies must match all selected tags and search query
  const filteredCompanies = uniqueCompanies.filter((company) => {
    const matchesTags =
      searchTags.length === 0 ||
      searchTags.every((tag) => company.Type?.includes(tag) || company.Interests?.includes(tag))

    const matchesSearch =
      searchQuery === "" ||
      company.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.Domain.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTags && matchesSearch
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-transform duration-300 ease-in-out">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#040924] text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Building2 className="w-7 h-7 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Tracked Companies</h2>
                <p className="text-blue-200 text-sm mt-1">{uniqueCompanies.length} companies being monitored</p>
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
          {/* Search Bar */}
          <div className="relative mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies by name or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAddCompany}
              className="bg-[#040924] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>
          </div>

          {/* Filter Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    searchTags.includes(tag)
                      ? "bg-[#040924] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-sm"
                  }`}
                  onClick={() =>
                    setSearchTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Companies Grid */}
          <div className="overflow-y-auto max-h-[55vh]">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-500">
                  {searchQuery || searchTags.length > 0
                    ? "Try adjusting your search or filters"
                    : "Start tracking some companies to see them here!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.TrackedCompanyUID}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          <img
                            src={`https://cdn.brandfetch.io/${company.Domain}/w/400/h/400?c=1idyJSKpER3b8yHqXHV`}
                            alt={`${company.Name} logo`}
                            className="w-14 h-14 object-contain rounded-lg border border-gray-100"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=56&width=56"
                            }}
                          />
                          <div
                            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              company.IsActive ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg truncate">{company.Name}</h4>
                          <p className="text-sm text-gray-500 truncate">{company.Domain}</p>
                          <div className="mt-2">
                            <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                              {company.Type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    {company.Interests && company.Interests.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Interests:</p>
                        <div className="flex flex-wrap gap-1">
                          {company.Interests.slice(0, 3).map((interest, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {interest}
                            </span>
                          ))}
                          {company.Interests.length > 3 && (
                            <span className="text-xs text-gray-400">+{company.Interests.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                          aria-label={`Edit ${company.Name}`}
                          onClick={() => handleEditCompany(company)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          aria-label={`Delete ${company.Name}`}
                          onClick={() => handleDeleteCompany(company.TrackedCompanyUID)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-sm text-gray-600">{company.IsActive ? "Active" : "Inactive"}</span>
                        <input
                          type="checkbox"
                          checked={company.IsActive}
                          onChange={() => handleToggleActive(company.TrackedCompanyUID, company.IsActive)}
                          className="hidden"
                          disabled={updatingCompanies.has(company.TrackedCompanyUID)}
                        />
                        {company.IsActive ? (
                          <ToggleRight className={`w-8 h-8 text-green-500 transition-colors ${
                            updatingCompanies.has(company.TrackedCompanyUID) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:text-green-600'
                          }`} />
                        ) : (
                          <ToggleLeft className={`w-8 h-8 text-gray-400 transition-colors ${
                            updatingCompanies.has(company.TrackedCompanyUID) 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:text-gray-500'
                          }`} />
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Company Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md">
                <Card className="border-none shadow-xl text-[13px]">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-center text-[#040924]">
                      Add New Company
                    </CardTitle>
                    <CardDescription className="text-center text-[#040924]/80 text-sm">
                      Enter details to track a new company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-[#040924]" htmlFor="website">
                        Company website
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="website"
                          placeholder="https://company.com"
                          className="pl-10 text-[#040924] border-[#040924]/20 focus:border-[#040924]/50 text-sm h-10"
                          value={newCompanyQuery}
                          onChange={handleSearchNewCompany}
                          onFocus={handleInputFocus}
                        />
                      </div>

                      {showResults && (
                        <div className="relative z-10">
                          <div className="absolute w-full bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-lg">
                            {searchResults.length > 0 ? (
                              <div className="max-h-44 overflow-y-auto">
                                {searchResults.map((brand, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                                    onClick={() => handleSelectNewCompany(brand)}
                                  >
                                    {brand.icon && (
                                      <img
                                        src={brand.icon}
                                        alt={`${brand.name} logo`}
                                        className="w-5 h-5 mr-3"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium text-[#040924] text-sm">{brand.name}</p>
                                      <p className="text-xs text-[#040924]/70">{brand.domain}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              newCompanyQuery.length > 2 && (
                                <div className="p-4 text-center text-xs text-[#040924]/70">
                                  No results found
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {selectedCompany && (
                        <div className="flex items-center gap-2 p-2 border rounded-lg mt-1">
                          {selectedCompany.icon && (
                            <img
                              src={selectedCompany.icon}
                              alt={`${selectedCompany.name} logo`}
                              className="w-6 h-6 rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-[#040924] text-sm">{selectedCompany.name}</p>
                            <p className="text-xs text-[#040924]/70">{selectedCompany.domain}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-[#040924]" htmlFor="company-type">
                        Choose company type
                      </label>
                      <Select
                        value={companyType}
                        onValueChange={(value) => setCompanyType(value)}
                      >
                        <SelectTrigger
                          id="company-type"
                          className="text-[#040924] border-[#040924]/20 focus:border-[#040924]/50 text-sm h-10"
                        >
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52 overflow-y-auto text-[#040924] text-sm">
                          <SelectItem value="Competitor">Competitor</SelectItem>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Target Account">Target Account</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                          <SelectItem value="Investor">Investor</SelectItem>
                          <SelectItem value="Regulator">Regulator</SelectItem>
                          <SelectItem value="Own Company">Own Company</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-[#040924]">
                        Choose top interests
                      </label>
                      <div className="overflow-y-auto" style={{ height: '80px' }}>
                        <div className="flex flex-wrap gap-2">
                          {interestsOptions.map((interest) => (
                            <Button
                              key={interest}
                              variant="outline"
                              className={`text-[#040924] border-[#040924]/20 text-xs py-1 px-2 h-7 ${
                                selectedInterests.includes(interest)
                                  ? 'border-[#040924] border-2'
                                  : 'hover:border-[#040924]/50'
                              }`}
                              onClick={() => handleInterestToggle(interest)}
                            >
                              {interest}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-500">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white text-sm py-2 h-10"
                        onClick={handleConfirmAddCompany}
                        disabled={!selectedCompany || !companyType || selectedInterests.length === 0 || loading}
                      >
                        {loading ? 'Tracking...' : 'Track Company'}
                      </Button>
                      <Button
                        className="w-full bg-gray-200 hover:bg-gray-300 text-[#040924] text-sm py-2 h-10"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Edit Company Modal */}
          {showEditModal && editingCompany && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md">
                <Card className="border-none shadow-xl text-[13px]">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-center text-[#040924]">
                      Edit Company
                    </CardTitle>
                    <CardDescription className="text-center text-[#040924]/80 text-sm">
                      Update the details of the tracked company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {/* Company Display */}
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                      <img
                        src={`https://cdn.brandfetch.io/${editingCompany.Domain}/w/400/h/400?c=1idyJSKpER3b8yHqXHV`}
                        alt={`${editingCompany.Name} logo`}
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                        }}
                      />
                      <div>
                        <p className="font-medium text-[#040924] text-sm">{editingCompany.Name}</p>
                        <p className="text-xs text-[#040924]/70">{editingCompany.Domain}</p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-[#040924]" htmlFor="edit-company-type">
                        Company type
                      </label>
                      <Select
                        value={companyType}
                        onValueChange={(value) => setCompanyType(value)}
                      >
                        <SelectTrigger className="text-[#040924] border-[#040924]/20 focus:border-[#040924]/50 text-sm h-10">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52 overflow-y-auto text-[#040924] text-sm">
                          <SelectItem value="Competitor">Competitor</SelectItem>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Target Account">Target Account</SelectItem>
                          <SelectItem value="Partner">Partner</SelectItem>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                          <SelectItem value="Investor">Investor</SelectItem>
                          <SelectItem value="Regulator">Regulator</SelectItem>
                          <SelectItem value="Own Company">Own Company</SelectItem>
                          </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-[#040924]">
                        Company interests
                      </label>
                      <div className="overflow-y-auto" style={{ height: '80px' }}>
                        <div className="flex flex-wrap gap-2">
                          {interestsOptions.map((interest) => (
                            <Button
                              key={interest}
                              variant="outline"
                              className={`text-[#040924] border-[#040924]/20 text-xs py-1 px-2 h-7 ${
                                selectedInterests.includes(interest)
                                  ? 'border-[#040924] border-2'
                                  : 'hover:border-[#040924]/50'
                              }`}
                              onClick={() => handleInterestToggle(interest)}
                            >
                              {interest}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-xs text-red-500">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        className="w-full bg-[#040924] hover:bg-[#040924]/90 text-white text-sm py-2 h-10"
                        onClick={handleConfirmEditCompany}
                        disabled={!editingCompany || !companyType || selectedInterests.length === 0 || loading}
                      >
                        {loading ? 'Updating...' : 'Update Company'}
                      </Button>
                      <Button
                        className="w-full bg-gray-200 hover:bg-gray-300 text-[#040924] text-sm py-2 h-10"
                        onClick={handleCloseEditModal}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { UsersIcon, X, Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Filter, ChevronDown, UserPlus, Copy, Check, Link } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDepartments } from "@/store/departmentStore"
import { useEmailRecipients, type EmailRecipient } from "@/store/emailRecipientStore"

interface User {
  id: string
  name: string
  email: string
  department: string
  departmentUID: string
  emailRecipientUID: string
  dateAdded: string
  isActive: boolean
  avatar?: string
}

export default function Users({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([])
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedInviteDepartment, setSelectedInviteDepartment] = useState("")
  const [inviteLink, setInviteLink] = useState("")
  const [linkCopied, setLinkCopied] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Get departments from the store
  const { departments } = useDepartments()
  // Get email recipients functionality from the store
  const { 
    emailRecipients, 
    getAllEmailRecipients, 
    inviteEmailRecipient, 
    updateEmailRecipient, 
    deleteEmailRecipient, 
    isLoading: emailRecipientLoading, 
    error: emailRecipientError 
  } = useEmailRecipients()

  // Use ref to track if data has been loaded to prevent infinite loops
  const hasLoadedRef = useRef(false)

  // Load email recipients on component mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      getAllEmailRecipients()
    }
    
    // Cleanup function to reset ref when component unmounts
    return () => {
      hasLoadedRef.current = false
    }
  }, [])

  // Convert EmailRecipient to User format
  const users: User[] = emailRecipients.map((recipient: EmailRecipient) => {
    const department = departments?.find(dept => dept.departmentUID === recipient.departmentUID)
    return {
      id: recipient.id.toString(),
      name: recipient.name,
      email: recipient.email,
      department: department?.name || 'Unknown',
      departmentUID: recipient.departmentUID,
      emailRecipientUID: recipient.emailRecipientUID,
      dateAdded: new Date(recipient.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      isActive: recipient.isActive,
      avatar: undefined // You might want to add an avatar field to your EmailRecipient model
    }
  })
  
  const statusOptions = ["Active", "Inactive"]
  const dateRangeOptions = ["Last 30 days", "Last 3 months", "Last 6 months", "Over 6 months"]

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    if (updatingUsers.has(userId)) {
      return
    }
    
    // Find the user to get their emailRecipientUID
    const user = users.find(u => u.id === userId)
    if (!user) {
      console.error("User not found")
      return
    }

    setUpdatingUsers((prev) => new Set(prev).add(userId))
    try {
      const updatedUser = await updateEmailRecipient({
        emailRecipientUID: user.emailRecipientUID,
        isActive: !currentStatus
      })
      
      if (updatedUser) {
        console.log(`Successfully toggled user ${userId} from ${currentStatus} to ${!currentStatus}`)
      } else {
        console.error(`Failed to toggle user ${userId} status`)
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
    } finally {
      setUpdatingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleDeleteUser = async (emailRecipientUID: string) => {
    try {
      const success = await deleteEmailRecipient({ emailRecipientUID })
      if (success) {
        console.log(`Successfully deleted email recipient ${emailRecipientUID}`)
      } else {
        console.error(`Failed to delete email recipient ${emailRecipientUID}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUser = async (userData: { name: string; email: string; departmentUID: string; isActive: boolean }) => {
    if (!editingUser) return
    
    try {
      const updatedUser = await updateEmailRecipient({
        emailRecipientUID: editingUser.emailRecipientUID,
        name: userData.name,
        email: userData.email,
        departmentUID: userData.departmentUID,
        isActive: userData.isActive
      })
      
      if (updatedUser) {
        console.log('Successfully updated user:', updatedUser)
        setShowEditModal(false)
        setEditingUser(null)
      } else {
        console.error('Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleAddUser = () => {
    console.log("Add user clicked")
  }

  const handleInviteUsers = () => {
    setShowInviteModal(true)
  }

  const generateInviteLink = async () => {
    if (!selectedInviteDepartment) return
    
    setIsGeneratingLink(true)
    
    try {
      const inviteToken = await inviteEmailRecipient({
        departmentUID: selectedInviteDepartment
      })
      
      if (inviteToken) {
        const baseUrl = window.location.origin
        const link = `${baseUrl}/invite/${inviteToken}`
        setInviteLink(link)
      } else {
        console.error('Failed to generate invite token')
      }
    } catch (error) {
      console.error('Error generating invite link:', error)
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const closeInviteModal = () => {
    setShowInviteModal(false)
    setSelectedInviteDepartment("")
    setInviteLink("")
    setLinkCopied(false)
    setIsGeneratingLink(false)
  }

  // Helper function to check date match
  const checkDateMatch = (dateAdded: string, ranges: string[]): boolean => {
    if (ranges.length === 0) return true

    const userDate = new Date(dateAdded)
    const now = new Date()
    const diffInMonths = (now.getFullYear() - userDate.getFullYear()) * 12 + (now.getMonth() - userDate.getMonth())

    for (const range of ranges) {
      if (range === "Last 30 days" && diffInMonths <= 1) return true
      if (range === "Last 3 months" && diffInMonths <= 3) return true
      if (range === "Last 6 months" && diffInMonths <= 6) return true
      if (range === "Over 6 months" && diffInMonths > 6) return true
    }
    return false
  }

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(user.department)
    const matchesStatus =
      selectedStatuses.length === 0 ||
      (selectedStatuses.includes("Active") && user.isActive) ||
      (selectedStatuses.includes("Inactive") && !user.isActive)
    const matchesDateRange = checkDateMatch(user.dateAdded, selectedDateRanges)
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDepartment && matchesStatus && matchesDateRange && matchesSearch
  })

  // Get active filter count
  const activeFilterCount = selectedDepartments.length + selectedStatuses.length + selectedDateRanges.length

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedDepartments([])
    setSelectedStatuses([])
    setSelectedDateRanges([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-transform duration-300 ease-in-out">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#040924] text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <UsersIcon className="w-7 h-7 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Email Recipients</h2>
                <p className="text-blue-200 text-sm mt-1">{users.length} email recipients in the system</p>
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
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search email recipients by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              {/* Department Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Department
                    {selectedDepartments.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {selectedDepartments.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {departments && departments.length > 0 ? (
                    departments.map((dept) => (
                      <DropdownMenuCheckboxItem
                        key={dept.departmentUID}
                        checked={selectedDepartments.includes(dept.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDepartments([...selectedDepartments, dept.name])
                          } else {
                            setSelectedDepartments(selectedDepartments.filter((d) => d !== dept.name))
                          }
                        }}
                      >
                        {dept.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-sm text-gray-500">Loading departments...</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 bg-transparent">
                    Status
                    {selectedStatuses.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {selectedStatuses.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {statusOptions.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStatuses([...selectedStatuses, status])
                        } else {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
                        }
                      }}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date Range Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-4 bg-transparent">
                    Date Added
                    {selectedDateRanges.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {selectedDateRanges.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Date Added</DropdownMenuLabel>
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

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="h-12 px-4 text-gray-600 hover:text-gray-800"
                >
                  Clear ({activeFilterCount})
                </Button>
              )}
            </div>

            {/* Add User Button */}
            <Button
              onClick={handleInviteUsers}
              className="bg-blue-600 text-white h-12 px-6 flex items-center space-x-2 transition-colors font-medium whitespace-nowrap hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Email Recipients</span>
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-[#040924] text-white h-12 px-6 flex items-center space-x-2 transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Email Recipient</span>
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedDepartments.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md"
                >
                  {dept}
                  <button
                    onClick={() => setSelectedDepartments(selectedDepartments.filter((d) => d !== dept))}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedStatuses.map((status) => (
                <span
                  key={status}
                  className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md"
                >
                  {status}
                  <button
                    onClick={() => setSelectedStatuses(selectedStatuses.filter((s) => s !== status))}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedDateRanges.map((range) => (
                <span
                  key={range}
                  className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-md"
                >
                  {range}
                  <button
                    onClick={() => setSelectedDateRanges(selectedDateRanges.filter((r) => r !== range))}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Users Grid */}
          <div className="overflow-y-auto max-h-[60vh]">
            {/* Error State */}
            {emailRecipientError && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading users</h3>
                <p className="text-gray-500 mb-4">{emailRecipientError}</p>
                <Button 
                  onClick={() => {
                    hasLoadedRef.current = false
                    getAllEmailRecipients()
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading State */}
            {emailRecipientLoading && !emailRecipientError && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <UsersIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading users...</h3>
                <p className="text-gray-500">Please wait while we fetch your users</p>
              </div>
            )}

            {/* Users List */}
            {!emailRecipientLoading && !emailRecipientError && (
              <>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">
                      {searchQuery || activeFilterCount > 0
                        ? "Try adjusting your search or filters"
                        : "Start adding some users to see them here!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Avatar and User Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={user.avatar || "https://avatar.iran.liara.run/public"}
                              alt="User Avatar"
                            />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                              user.isActive ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-lg truncate">{user.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Middle: Department, Date Added, Active Status */}
                      <div className="flex items-center space-x-8 flex-1 justify-center">
                        <div className="text-center">
                          <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                            {user.department}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-700 font-medium">{user.dateAdded}</p>
                        </div>
                        <div className="text-center">
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-md font-medium ${
                              user.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            aria-label={`Edit ${user.name}`}
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            aria-label={`Delete ${user.name}`}
                            onClick={() => handleDeleteUser(user.emailRecipientUID)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={user.isActive}
                            onChange={() => handleToggleActive(user.id, user.isActive)}
                            className="hidden"
                            disabled={updatingUsers.has(user.id)}
                          />
                          {user.isActive ? (
                            <ToggleRight
                              className={`w-8 h-8 text-green-500 transition-colors ${
                                updatingUsers.has(user.id) ? "opacity-50 cursor-not-allowed" : "hover:text-green-600"
                              }`}
                            />
                          ) : (
                            <ToggleLeft
                              className={`w-8 h-8 text-gray-400 transition-colors ${
                                updatingUsers.has(user.id) ? "opacity-50 cursor-not-allowed" : "hover:text-gray-500"
                              }`}
                            />
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invite Users Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#040924] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserPlus className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Invite Users</h3>
                </div>
                <button
                  onClick={closeInviteModal}
                  className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!inviteLink ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Select a department to generate an invite link. Users with this link will be able to join your subscription and receive email newsletters with for that department.
                  </p>
                  
                  {/* Department Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Department
                    </label>
                    <select
                      value={selectedInviteDepartment}
                      onChange={(e) => setSelectedInviteDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a department...</option>
                      {departments && departments.length > 0 ? (
                        departments.map((dept) => (
                          <option key={dept.departmentUID} value={dept.departmentUID}>
                            {dept.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading departments...</option>
                      )}
                    </select>
                  </div>

                  {/* Generate Link Button */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={closeInviteModal}
                      variant="outline"
                      className="px-4 py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={generateInviteLink}
                      disabled={!selectedInviteDepartment || isGeneratingLink || emailRecipientLoading}
                      className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      {isGeneratingLink || emailRecipientLoading ? 'Generating...' : 'Generate Link'}
                    </Button>
                  </div>
                  
                  {/* Error Display */}
                  {emailRecipientError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        Error: {emailRecipientError}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Invite link generated for <strong>{departments.find(dept => dept.departmentUID === selectedInviteDepartment)?.name}</strong> department:
                  </p>
                  
                  {/* Generated Link Display */}
                  <div className="mb-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate mr-3 flex-1">
                        {inviteLink}
                      </span>
                      <Button
                        onClick={copyInviteLink}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 shrink-0"
                      >
                        {linkCopied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> This link will allow users to join your organization in the {departments.find(dept => dept.departmentUID === selectedInviteDepartment)?.name} department. Share it only with trusted individuals.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <Button
                      onClick={closeInviteModal}
                      variant="outline"
                      className="px-4 py-2"
                    >
                      Done
                    </Button>
                    <Button
                      onClick={() => {
                        setInviteLink("")
                        setSelectedInviteDepartment("")
                        setLinkCopied(false)
                      }}
                      className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Generate Another
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const name = formData.get('name') as string
                const email = formData.get('email') as string
                const departmentUID = formData.get('departmentUID') as string
                const isActive = formData.get('isActive') === 'true'
                handleUpdateUser({ name, email, departmentUID, isActive })
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingUser.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={editingUser.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="departmentUID" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="departmentUID"
                  name="departmentUID"
                  defaultValue={editingUser.departmentUID}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {departments?.map((dept) => (
                    <option key={dept.departmentUID} value={dept.departmentUID}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="isActive"
                  name="isActive"
                  defaultValue={editingUser.isActive.toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                  }}
                  variant="outline"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                  disabled={emailRecipientLoading}
                >
                  {emailRecipientLoading ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

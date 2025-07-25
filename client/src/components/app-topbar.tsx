"use client"

import { Bell, Search, Framer, ChevronDown, User, Settings, LogOut, Bot } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export function AppTopbar() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const router = useRouter()

  // Fallback values in case user data is not available
  const userName = user?.publicMetadata.userName || 'User'
  const role = user?.publicMetadata?.role || 'member'

  // Capitalize the first letter of the role
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1) 

  return (
    <div className="fixed top-2 left-2 right-2 z-50 bg-[#040924] text-white p-2 rounded-full">
      <div className="max-w-[1450px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/dashboard/home')}>
          <Framer className="h-6 w-6" />
          <span className="text-lg font-bold">RIVELY</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-3 w-3" />
            <Input 
              type="search" 
              placeholder="Search..." 
              className="w-full pl-8 rounded-full bg-[#0e162a] text-white border-none"
            />
          </div>

          <Button 
            size="icon" 
            className="text-white rounded-full p-1 hover:bg-[#0e162a] transition-colors"
            title="Agent Marketplace"
            onClick={() => router.push('/dashboard/agent-marketplace')}
          >
            <Bot className="h-4 w-4" />
          </Button>

          <Button size="icon" className="text-white rounded-full p-1">
            <Bell className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative flex items-center text-white rounded-full p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://avatar.iran.liara.run/public/38" alt="User Avatar" />
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left ml-2">
                  <div className="text-sm">{userName}</div>
                  <div className="text-xs opacity-70">{capitalizedRole}</div>
                </div>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
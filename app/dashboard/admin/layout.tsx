'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bot, BarChart, User, MessageCircle, ChartNoAxesCombined, LogOut, Menu, X,
  Bell, Upload, Users, CreditCard
} from 'lucide-react'

import ProfilePage from '@/components/ProfilePage'
import ChatsPage from '@/components/ChattingPage'
import ChatbotPage from '@/components/ChatBotPage'
import MyAccountPage from '@/components/AccountPage'
import NotificationsPage from '@/components/NotificationPage'
import AdminUserManagementPage from '@/components/AdminUserManagementPage'
import ExcelUploadPage from '@/components/ExcelUploadPage'
import AdminWithdrawalsPage from '@/components/ManageWithdrawalRequest'
import ImprovedAdminDashboard from '@/components/AdminAnalyticsPage'

const SidebarItem = ({ icon: Icon, label, onClick, isActive }: {
  icon: any
  label: string
  onClick: () => void
  isActive: boolean
}) => (
  <div
    className={`
      group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer 
      transition-all duration-300 ease-in-out transform hover:scale-[1.02]
      ${isActive 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-600 hover:text-blue-600'
      }
    `}
    onClick={onClick}
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
    <span className="text-sm font-medium tracking-wide">{label}</span>
    {isActive && (
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
    )}
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin w-12 h-12 border-4 border-gradient-to-r from-blue-500 to-purple-600 border-t-transparent rounded-full"></div>
        <div className="absolute inset-0 animate-pulse w-12 h-12 border-4 border-blue-200 rounded-full"></div>
      </div>
      <p className="text-gray-600 font-medium">Loading dashboard...</p>
    </div>
  </div>
)

export default function AdminDashboardLayout() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('About')
  const [profileSubmitted, setProfileSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleProfileSubmit = () => {
    setProfileSubmitted(true)
    setActiveTab('Analytics')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/auth/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/auth/get-profile')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to fetch user')

        setUserRole(data.role || null)
        setProfileSubmitted(data.onboarded || false)

        if (data.onboarded) {
          setActiveTab('Analytics')
        } else {
          setActiveTab('About')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        router.push('/auth/admin/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (profileSubmitted && activeTab === 'About') {
      setActiveTab('Analytics')
    }
  }, [profileSubmitted, activeTab])

  const renderContent = () => {
    if (!profileSubmitted && activeTab === 'About') {
      return <ProfilePage onSubmit={handleProfileSubmit} />
    }

    switch (activeTab) {
      case 'Analytics':
        return <ImprovedAdminDashboard />
      case 'ManageUser':
        return <AdminUserManagementPage />
      case 'AdminWithdrawalsPage':
        return <AdminWithdrawalsPage />
      case 'UploadData':
        return <ExcelUploadPage />
      case 'Chatbot':
        return <ChatbotPage />
      case 'Chats':
        return <ChatsPage />
      case 'Account':
        return <MyAccountPage />
      case 'Notifications':
        return <NotificationsPage />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <ChartNoAxesCombined className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Admin Dashboard</h3>
              <p className="text-gray-600">Select a tab from the sidebar to get started</p>
            </div>
          </div>
        )
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-500 capitalize">{userRole || 'User'}</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {!profileSubmitted && (
          <SidebarItem
            icon={User}
            label="Onboarding"
            onClick={() => { setActiveTab('About'); setSidebarOpen(false) }}
            isActive={activeTab === 'About'}
          />
        )}
        
        <SidebarItem
          icon={ChartNoAxesCombined}
          label="Analytics"
          onClick={() => { setActiveTab('Analytics'); setSidebarOpen(false) }}
          isActive={activeTab === 'Analytics'}
        />

        {userRole === 'admin' && (
          <div className="space-y-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Admin Tools
            </div>
            <SidebarItem
              icon={Users}
              label="Manage Users"
              onClick={() => { setActiveTab('ManageUser'); setSidebarOpen(false) }}
              isActive={activeTab === 'ManageUser'}
            />
            <SidebarItem
              icon={CreditCard}
              label="Withdrawal Requests"
              onClick={() => { setActiveTab('AdminWithdrawalsPage'); setSidebarOpen(false) }}
              isActive={activeTab === 'AdminWithdrawalsPage'}
            />
            <SidebarItem
              icon={Upload}
              label="Upload Data"
              onClick={() => { setActiveTab('UploadData'); setSidebarOpen(false) }}
              isActive={activeTab === 'UploadData'}
            />
          </div>
        )}

        <div className="space-y-2 pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            General
          </div>
          <SidebarItem
            icon={Bot}
            label="Chatbot"
            onClick={() => { setActiveTab('Chatbot'); setSidebarOpen(false) }}
            isActive={activeTab === 'Chatbot'}
          />
          <SidebarItem
            icon={MessageCircle}
            label="Chats"
            onClick={() => { setActiveTab('Chats'); setSidebarOpen(false) }}
            isActive={activeTab === 'Chats'}
          />
          <SidebarItem
            icon={User}
            label="Account"
            onClick={() => { setActiveTab('Account'); setSidebarOpen(false) }}
            isActive={activeTab === 'Account'}
          />
          <SidebarItem
            icon={Bell}
            label="Notifications"
            onClick={() => { setActiveTab('Notifications'); setSidebarOpen(false) }}
            isActive={activeTab === 'Notifications'}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl cursor-pointer 
                     bg-gradient-to-r from-red-500 to-pink-500 text-white 
                     hover:from-red-600 hover:to-pink-600 
                     transition-all duration-300 transform hover:scale-[1.02] 
                     shadow-lg shadow-red-500/25"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center px-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-800" />
        </button>
        <div className="ml-4 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 shadow-xl shadow-gray-900/5">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full pt-16 md:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 h-full">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-200/50 h-full overflow-auto">
              <div className="p-6 lg:p-8 h-full">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
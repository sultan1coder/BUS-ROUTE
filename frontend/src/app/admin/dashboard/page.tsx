"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bus,
  MapPin,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  UserCheck,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalBuses: number;
  totalDrivers: number;
  totalStudents: number;
  activeTrips: number;
  activeAlerts: number;
}

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Load dashboard stats (mock data for now)
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Mock data - replace with actual API call
    setStats({
      totalUsers: 245,
      totalBuses: 12,
      totalDrivers: 15,
      totalStudents: 180,
      activeTrips: 8,
      activeAlerts: 2,
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 font-medium">
                  Welcome back, {user.firstName}! 👋
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/settings")}
                className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-blue-700 font-medium">Settings</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-red-700 font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Total Users
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                +12% from last month
              </p>
            </CardContent>
          </Card>

          {/* Active Buses */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Buses
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bus className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalBuses || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                All operational
              </p>
            </CardContent>
          </Card>

          {/* Active Trips */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-violet-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Trips
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <MapPin className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.activeTrips || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Currently running
              </p>
            </CardContent>
          </Card>

          {/* Total Students */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Total Students
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Enrolled this year
              </p>
            </CardContent>
          </Card>

          {/* Active Drivers */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Drivers
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalDrivers || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                On duty today
              </p>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Alerts
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.activeAlerts || 0}
              </div>
              <p className="text-xs text-white/80 flex items-center">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/users")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-purple-800">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-3 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">User Management</span>
              </CardTitle>
              <CardDescription className="text-purple-600">
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>

          {/* Bus Management */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/buses")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-blue-800">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Bus Management</span>
              </CardTitle>
              <CardDescription className="text-blue-600">
                Monitor and manage fleet operations
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>

          {/* Route Management */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/routes")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-emerald-800">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mr-3 shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Route Management</span>
              </CardTitle>
              <CardDescription className="text-emerald-600">
                Plan and optimize bus routes
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>

          {/* Student Management */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 hover:border-rose-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/students")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-rose-800">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl mr-3 shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Student Management</span>
              </CardTitle>
              <CardDescription className="text-rose-600">
                Track student information and assignments
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>

          {/* Reports & Analytics */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/reports")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-indigo-800">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl mr-3 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Reports & Analytics</span>
              </CardTitle>
              <CardDescription className="text-indigo-600">
                View detailed system reports
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>

          {/* Alerts & Safety */}
          <Card
            className="group cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
            onClick={() => router.push("/admin/alerts")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-amber-800">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mr-3 shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold">Alerts & Safety</span>
              </CardTitle>
              <CardDescription className="text-amber-600">
                Monitor system alerts and safety issues
              </CardDescription>
            </CardHeader>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="flex items-center text-slate-800">
              <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mr-3 shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Recent Activity</span>
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">
              Latest system events and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800">
                    🚍 Bus #001 started trip to Downtown School
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    2 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-800">
                    👤 Driver John Smith checked in
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    5 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-200">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    🔧 Maintenance scheduled for Bus #003
                  </p>
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    1 hour ago
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-purple-800">
                    📊 New student registered for Route A
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    3 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

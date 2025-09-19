"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Shield, Bus, Users, UserCheck } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      // Redirect to appropriate dashboard based on user role
      if (user) {
        switch (user.role) {
          case "ADMIN":
            router.replace("/admin/dashboard");
            break;
          case "DRIVER":
            router.replace("/driver/dashboard");
            break;
          case "PARENT":
            router.replace("/parent/dashboard");
            break;
          case "SCHOOL_STAFF":
            router.replace("/staff/dashboard");
            break;
          default:
            // If role is unknown, redirect to admin dashboard as fallback
            router.replace("/admin/dashboard");
        }
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading state while determining where to redirect
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-gray-500">
            Redirecting to your personalized dashboard
          </p>
        </div>
      </div>
    );
  }

  // Show role-based dashboard preview while redirecting
  if (isAuthenticated && user) {
    const getRoleInfo = (role: string) => {
      switch (role) {
        case "ADMIN":
          return {
            title: "Administrator Dashboard",
            description: "Manage the entire school bus tracking system",
            icon: Shield,
            color: "from-purple-500 to-purple-600",
            bgColor: "from-purple-50 to-purple-100",
          };
        case "DRIVER":
          return {
            title: "Driver Dashboard",
            description: "Manage your routes and communicate with parents",
            icon: Bus,
            color: "from-blue-500 to-blue-600",
            bgColor: "from-blue-50 to-blue-100",
          };
        case "PARENT":
          return {
            title: "Parent Dashboard",
            description: "Track your child's bus location and get updates",
            icon: Users,
            color: "from-green-500 to-green-600",
            bgColor: "from-green-50 to-green-100",
          };
        case "SCHOOL_STAFF":
          return {
            title: "School Staff Dashboard",
            description: "Monitor school transportation and manage students",
            icon: UserCheck,
            color: "from-orange-500 to-orange-600",
            bgColor: "from-orange-50 to-orange-100",
          };
        default:
          return {
            title: "Dashboard",
            description: "Access your personalized dashboard",
            icon: Shield,
            color: "from-gray-500 to-gray-600",
            bgColor: "from-gray-50 to-gray-100",
          };
      }
    };

    const roleInfo = getRoleInfo(user.role);

    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${roleInfo.bgColor} flex items-center justify-center`}
      >
        <div className="max-w-md mx-auto text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${roleInfo.color} mb-6 shadow-lg`}
          >
            <roleInfo.icon className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {roleInfo.title}
          </h1>

          <p className="text-gray-600 mb-8">{roleInfo.description}</p>

          <div className="space-y-4">
            <div className="animate-pulse bg-white/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                <span className="text-gray-700">Redirecting...</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Welcome back,{" "}
              <span className="font-semibold text-gray-700">
                {user.firstName}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <Shield className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          Please log in to access your dashboard
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

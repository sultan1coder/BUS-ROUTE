"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        switch (user?.role) {
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          case "DRIVER":
            router.push("/driver/dashboard");
            break;
          case "PARENT":
            router.push("/parent/dashboard");
            break;
          case "SCHOOL_STAFF":
            router.push("/staff/dashboard");
            break;
          default:
            router.push("/dashboard");
        }
        return;
      }
    }
  }, [user, isLoading, isAuthenticated, requiredRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for protecting entire pages
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  options: { requiredRole?: UserRole; fallbackPath?: string } = {}
) {
  const ProtectedComponent = (props: T) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return ProtectedComponent;
}

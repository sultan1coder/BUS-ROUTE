"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import { AdminApiService } from "@/lib/admin-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  Eye,
  Settings,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  UserMinus,
  Crown,
  GraduationCap,
  Car,
  Home,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "SCHOOL_STAFF" | "DRIVER" | "PARENT";
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: { role: string; count: number }[];
  recentRegistrations: number;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  topActiveUsers: any[];
}

function UserManagementContent() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Toast states
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "PARENT" as User["role"],
    password: "",
  });

  // Toast helper
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToastMessage(message);
      setToastType(type);
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000);
    },
    []
  );

  // Load users data
  const loadUsers = useCallback(
    async (page = 1) => {
      try {
        setIsRefreshing(true);
        setError(null);

        const filters: Record<string, unknown> = {
          page,
          limit: 10,
        };

        if (searchTerm) filters.search = searchTerm;
        if (roleFilter !== "all") filters.role = roleFilter;
        if (statusFilter !== "all")
          filters.isActive = statusFilter === "active";

        const response = await AdminApiService.getAllUsers(filters);

        setUsers(response.data || []);
        setCurrentPage(response.meta?.page || 1);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (err: unknown) {
        console.error("Failed to load users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
        showToast("Failed to load users", "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, roleFilter, statusFilter, showToast]
  );

  // Load user statistics
  const loadUserStats = useCallback(async () => {
    try {
      const response = await AdminApiService.getUserAnalytics();
      setStats(response);
    } catch (err: unknown) {
      console.error("Failed to load user stats:", err);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, [loadUsers, loadUserStats]);

  // Handle search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter, loadUsers]);

  // Form handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "PARENT",
      password: "",
    });
  };

  // Create user
  const handleCreateUser = async () => {
    console.log("Create user button clicked!"); // Debug log
    try {
      // Note: User creation would typically be handled by a separate API
      // For now, we'll show a placeholder
      showToast(
        "User creation functionality would be implemented here",
        "success"
      );
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err: unknown) {
      showToast("Failed to create user", "error");
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await AdminApiService.updateUser(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      });

      showToast("User updated successfully", "success");
      setIsEditDialogOpen(false);
      resetForm();
      loadUsers(currentPage);
    } catch (err: unknown) {
      showToast("Failed to update user", "error");
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await AdminApiService.deactivateUser(userId);
        showToast("User deactivated", "success");
      } else {
        await AdminApiService.reactivateUser(userId);
        showToast("User reactivated", "success");
      }
      loadUsers(currentPage);
      loadUserStats();
    } catch (err: unknown) {
      showToast(
        `Failed to ${isActive ? "deactivate" : "reactivate"} user`,
        "error"
      );
    }
  };

  // Delete user
  const handleDeleteUser = async (_userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      // Note: Delete functionality would be implemented
      showToast("User deletion would be implemented here", "success");
    } catch (err: unknown) {
      showToast("Failed to delete user", "error");
    }
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    try {
      // Implement bulk activation
      showToast("Bulk activation would be implemented here", "success");
      setSelectedUsers([]);
      loadUsers(currentPage);
    } catch (err: unknown) {
      showToast("Failed to activate selected users", "error");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      // Implement bulk deactivation
      showToast("Bulk deactivation would be implemented here", "success");
      setSelectedUsers([]);
      loadUsers(currentPage);
    } catch (err: unknown) {
      showToast("Failed to deactivate selected users", "error");
    }
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      role: user.role,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "SCHOOL_STAFF":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DRIVER":
        return "bg-green-100 text-green-800 border-green-200";
      case "PARENT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-full">
              <RefreshCw className="h-12 w-12 animate-spin text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Loading Users...
            </h2>
            <p className="text-gray-600">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative bg-white/70 backdrop-blur-xl shadow-2xl border-b border-white/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <p className="text-gray-600 font-medium text-lg">
                    Manage system users, roles, and permissions with ease
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => loadUsers(currentPage)}
                  disabled={isRefreshing}
                  className="border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 transition-transform duration-200 ${
                      isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                    }`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
                      <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl border-0 shadow-2xl overflow-hidden flex flex-col">
                    <DialogHeader className="space-y-4 pb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-30"></div>
                          <div className="relative p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl shadow-lg">
                            <UserPlus className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-cyan-700 bg-clip-text text-transparent">
                            Create New User
                          </DialogTitle>
                          <DialogDescription className="text-slate-600 text-lg font-medium">
                            Add a new user to the system with appropriate role
                            and permissions
                          </DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>

                    <div className="space-y-8 py-4 flex-1 overflow-y-auto">
                      {/* Personal Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700">
                            Personal Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="firstName"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              First Name
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              placeholder="Enter first name"
                              className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="lastName"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              Last Name
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              placeholder="Enter last name"
                              className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
                          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <Mail className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700">
                            Contact Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="email"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <Mail className="h-4 w-4 mr-2 text-purple-500" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              placeholder="Enter email address"
                              className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="phone"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <Phone className="h-4 w-4 mr-2 text-purple-500" />
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                handleInputChange("phone", e.target.value)
                              }
                              placeholder="Enter phone number"
                              className="h-12 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Role & Security Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
                          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                            <Shield className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700">
                            Role & Security
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="role"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <Crown className="h-4 w-4 mr-2 text-orange-500" />
                              User Role
                            </Label>
                            <Select
                              value={formData.role}
                              onValueChange={(value) =>
                                handleInputChange("role", value)
                              }
                            >
                              <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900">
                                <SelectValue placeholder="Select user role" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-0 shadow-xl">
                                <SelectItem value="PARENT" className="py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-purple-100 rounded-lg">
                                      <Home className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <span className="font-medium">Parent</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="DRIVER" className="py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-green-100 rounded-lg">
                                      <Car className="h-4 w-4 text-green-600" />
                                    </div>
                                    <span className="font-medium">Driver</span>
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value="SCHOOL_STAFF"
                                  className="py-3"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-blue-100 rounded-lg">
                                      <GraduationCap className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium">
                                      School Staff
                                    </span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADMIN" className="py-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-1 bg-red-100 rounded-lg">
                                      <Crown className="h-4 w-4 text-red-600" />
                                    </div>
                                    <span className="font-medium">
                                      Administrator
                                    </span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="password"
                              className="text-sm font-semibold text-slate-700 flex items-center"
                            >
                              <Shield className="h-4 w-4 mr-2 text-orange-500" />
                              Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                handleInputChange("password", e.target.value)
                              }
                              placeholder="Enter secure password"
                              className="h-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-200 space-x-4 bg-white/80 backdrop-blur-sm -mx-6 -mb-6 px-6 pb-6 sticky bottom-0 z-30">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          resetForm();
                        }}
                        className="h-12 px-8 border-2 border-slate-300 hover:border-slate-400 hover:bg-red-400 transition-all duration-300 rounded-xl font-semibold bg-red-500 shadow-md hover:shadow-lg z-10 relative cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateUser}
                        className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl font-semibold text-white z-20 relative border-2 border-emerald-400 hover:border-emerald-500 min-w-[140px]"
                        type="button"
                        style={{ pointerEvents: "auto" }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Total Users
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalUsers || 0}
              </div>
              <div className="flex items-center text-sm text-white/80">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Active Users
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.activeUsers || 0}
              </div>
              <div className="flex items-center text-sm text-white/80">
                <Activity className="h-4 w-4 mr-1" />
                <span>Currently online</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Inactive Users
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <XCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {(stats?.totalUsers || 0) - (stats?.activeUsers || 0)}
              </div>
              <div className="flex items-center text-sm text-white/80">
                <Clock className="h-4 w-4 mr-1" />
                <span>Offline</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-white/90">
                Administrators
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Crown className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.usersByRole?.find((r) => r.role === "ADMIN")?.count ||
                  0}
              </div>
              <div className="flex items-center text-sm text-white/80">
                <Shield className="h-4 w-4 mr-1" />
                <span>Admin access</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Filters and Search */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Filters & Search
            </CardTitle>
            <CardDescription className="text-gray-600">
              Find and filter users with advanced search options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="search"
                  className="text-sm font-semibold text-gray-700"
                >
                  Search Users
                </Label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="role"
                  className="text-sm font-semibold text-gray-700"
                >
                  User Role
                </Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        All Roles
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center">
                        <Crown className="h-4 w-4 mr-2 text-red-500" />
                        Administrator
                      </div>
                    </SelectItem>
                    <SelectItem value="SCHOOL_STAFF">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                        School Staff
                      </div>
                    </SelectItem>
                    <SelectItem value="DRIVER">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-green-500" />
                        Driver
                      </div>
                    </SelectItem>
                    <SelectItem value="PARENT">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-purple-500" />
                        Parent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-700"
                >
                  Account Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        All Status
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Bulk Actions
                </Label>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUsers([])}
                    disabled={selectedUsers.length === 0}
                    className="justify-start text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Clear Selection ({selectedUsers.length})
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleBulkActivate}
                      disabled={selectedUsers.length === 0}
                      className="flex-1 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBulkDeactivate}
                      disabled={selectedUsers.length === 0}
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Users Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Users ({users.length})
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Manage all system users and their permissions
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200 bg-gray-50/50">
                    <TableHead className="w-12 p-4">
                      <Checkbox
                        checked={
                          selectedUsers.length === users.length &&
                          users.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(users.map((u) => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      User
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      Contact
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      Role
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      Activity
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 p-4">
                      Created
                    </TableHead>
                    <TableHead className="w-12 p-4 text-right font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200 group"
                    >
                      <TableCell className="p-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedUsers((prev) =>
                                prev.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                user.isActive ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge
                          className={`${getRoleColor(
                            user.role
                          )} font-medium px-3 py-1`}
                        >
                          <div className="flex items-center">
                            {user.role === "ADMIN" && (
                              <Crown className="h-3 w-3 mr-1" />
                            )}
                            {user.role === "SCHOOL_STAFF" && (
                              <GraduationCap className="h-3 w-3 mr-1" />
                            )}
                            {user.role === "DRIVER" && (
                              <Car className="h-3 w-3 mr-1" />
                            )}
                            {user.role === "PARENT" && (
                              <Home className="h-3 w-3 mr-1" />
                            )}
                            {user.role.replace("_", " ")}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={`font-medium px-3 py-1 ${
                              user.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center">
                              {user.isActive ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {user.isActive ? "Active" : "Inactive"}
                            </div>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString()
                              : "Never"}
                          </div>
                          <div className="text-xs text-gray-400">
                            Last login
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(user.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-gray-700 font-semibold">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(user)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-500" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleUserStatus(user.id, user.isActive)
                              }
                              className="cursor-pointer"
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4 text-red-500" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 bg-gray-50/50 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => loadUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadUsers(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <span>Next</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modern Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
            <DialogHeader className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                    Edit User
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Update user information and permissions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label
                    htmlFor="edit-firstName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="edit-lastName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
                  className="border-gray-200 bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-phone"
                  className="text-sm font-semibold text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="edit-role"
                  className="text-sm font-semibold text-gray-700"
                >
                  User Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARENT">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-purple-500" />
                        Parent
                      </div>
                    </SelectItem>
                    <SelectItem value="DRIVER">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-green-500" />
                        Driver
                      </div>
                    </SelectItem>
                    <SelectItem value="SCHOOL_STAFF">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                        School Staff
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center">
                        <Crown className="h-4 w-4 mr-2 text-red-500" />
                        Administrator
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="border-gray-300 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modern Toast Notification */}
        {isToastVisible && (
          <Toast
            className={`shadow-2xl border-0 backdrop-blur-sm ${
              toastType === "error"
                ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
            }`}
          >
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                {toastType === "error" ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <ToastTitle
                  className={`font-semibold ${
                    toastType === "error" ? "text-red-900" : "text-green-900"
                  }`}
                >
                  {toastType === "error" ? "Error" : "Success"}
                </ToastTitle>
              </div>
              <ToastDescription
                className={`${
                  toastType === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {toastMessage}
              </ToastDescription>
            </div>
          </Toast>
        )}
      </div>
    </div>
  );
}

export default function UserManagement() {
  return (
    <ToastProvider>
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout>
          <UserManagementContent />
        </AdminLayout>
      </ProtectedRoute>
      <ToastViewport />
    </ToastProvider>
  );
}

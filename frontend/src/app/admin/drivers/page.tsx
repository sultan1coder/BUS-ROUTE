"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminLayout } from "@/components/layout/admin-layout";
import {
  AdminApiService,
  Driver,
  DriverStats,
  CreateDriverData,
  UpdateDriverData,
  AvailableUser,
} from "@/lib/admin-api";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Car,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  MoreHorizontal,
  RefreshCw,
  Calendar,
  Phone,
  IdCard,
  AlertTriangle,
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

function DriverManagementContent() {
  // State management
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsRefreshing] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  // Toast states
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateDriverData>({
    userId: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseType: "",
    experienceYears: 0,
    emergencyContact: "",
    emergencyPhone: "",
    medicalInfo: "",
  });

  // Available users for driver creation
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);

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

  // Load drivers data
  const loadDrivers = useCallback(
    async (page = 1) => {
      try {
        setIsRefreshing(true);

        const filters: Record<string, unknown> = {
          page,
          limit: 10,
        };

        if (searchTerm) filters.search = searchTerm;
        if (statusFilter !== "all")
          filters.isActive = statusFilter === "active";
        if (experienceFilter !== "all") {
          const [min, max] = experienceFilter.split("-").map(Number);
          if (min !== undefined) filters.minExperience = min;
          if (max !== undefined) filters.maxExperience = max;
        }

        const response = await AdminApiService.getAllDrivers(filters);

        setDrivers(response.data || []);
        setCurrentPage(response.meta?.page || 1);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (err: unknown) {
        console.error("Failed to load drivers:", err);
        showToast("Failed to load drivers", "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, statusFilter, experienceFilter, showToast]
  );

  // Load driver statistics
  const loadDriverStats = useCallback(async () => {
    try {
      const response = await AdminApiService.getDriverAnalytics();
      setStats(response);
    } catch (_err: unknown) {
      console.error("Failed to load driver stats:", _err);
    }
  }, []);

  // Load available users
  const loadAvailableUsers = useCallback(async () => {
    try {
      const response = await AdminApiService.getAvailableUsers();
      setAvailableUsers(response.data || []);
    } catch (_err: unknown) {
      console.error("Failed to load available users:", _err);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadDrivers();
    loadDriverStats();
    loadAvailableUsers();
  }, [loadDrivers, loadDriverStats, loadAvailableUsers]);

  // Handle search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDrivers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, experienceFilter, loadDrivers]);

  // Form handlers
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      licenseNumber: "",
      licenseExpiry: "",
      licenseType: "",
      experienceYears: 0,
      emergencyContact: "",
      emergencyPhone: "",
      medicalInfo: "",
    });
  };

  // Create driver
  const handleCreateDriver = async () => {
    try {
      await AdminApiService.createDriver(formData);
      showToast("Driver created successfully", "success");
      setIsCreateDialogOpen(false);
      resetForm();
      loadDrivers();
      loadDriverStats();
    } catch (_err: unknown) {
      showToast("Failed to create driver", "error");
    }
  };

  // Update driver
  const handleUpdateDriver = async () => {
    if (!selectedDriver) return;

    try {
      const updateData: UpdateDriverData = {
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        licenseType: formData.licenseType,
        experienceYears: formData.experienceYears,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        medicalInfo: formData.medicalInfo,
      };

      await AdminApiService.updateDriver(selectedDriver.id, updateData);
      showToast("Driver updated successfully", "success");
      setIsEditDialogOpen(false);
      resetForm();
      loadDrivers();
      loadDriverStats();
    } catch (_err: unknown) {
      showToast("Failed to update driver", "error");
    }
  };

  // Toggle driver status
  const handleToggleDriverStatus = async (
    driverId: string,
    isActive: boolean
  ) => {
    try {
      if (isActive) {
        await AdminApiService.deactivateDriver(driverId);
        showToast("Driver deactivated successfully", "success");
      } else {
        // Note: Reactivation would need a separate API endpoint
        showToast("Driver reactivation would be implemented here", "success");
      }
      loadDrivers();
      loadDriverStats();
    } catch (_err: unknown) {
      showToast("Failed to update driver status", "error");
    }
  };

  // Edit driver
  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      userId: driver.userId,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      licenseType: driver.licenseType,
      experienceYears: driver.experienceYears || 0,
      emergencyContact: driver.emergencyContact,
      emergencyPhone: driver.emergencyPhone,
      medicalInfo: driver.medicalInfo || "",
    });
    setIsEditDialogOpen(true);
  };

  // Delete driver
  const handleDeleteDriver = async (_driverId: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;

    try {
      // Note: Delete functionality would be implemented
      showToast("Driver deletion would be implemented here", "success");
    } catch (_err: unknown) {
      showToast("Failed to delete driver", "error");
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadDrivers();
    loadDriverStats();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if license is expiring soon (within 30 days)
  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Driver Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage driver profiles and licenses
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Drivers
            </CardTitle>
            <Car className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="text-white">
            <div className="text-2xl font-bold">{stats?.totalDrivers || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active Drivers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="text-white">
            <div className="text-2xl font-bold">
              {stats?.activeDrivers || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Inactive Drivers
            </CardTitle>
            <UserX className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="text-white">
            <div className="text-2xl font-bold">
              {stats?.inactiveDrivers || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Licenses Expiring Soon
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="text-white">
            <div className="text-2xl font-bold">
              {stats?.licenseExpiringSoon || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="6-10">6-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
          <CardDescription>
            Manage driver profiles and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedDrivers.length === drivers.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedDrivers(drivers.map((d) => d.id));
                        } else {
                          setSelectedDrivers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>License Info</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Bus</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDrivers.includes(driver.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDrivers([...selectedDrivers, driver.id]);
                          } else {
                            setSelectedDrivers(
                              selectedDrivers.filter((id) => id !== driver.id)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {driver.user?.firstName?.[0]}
                          {driver.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">
                            {driver.user?.firstName} {driver.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {driver.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm">
                            {driver.licenseNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {formatDate(driver.licenseExpiry)}
                          </span>
                          {isLicenseExpiringSoon(driver.licenseExpiry) && (
                            <Badge variant="destructive" className="text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.licenseType}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {driver.experienceYears || 0} years
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {driver.emergencyContact}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {driver.emergencyPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={driver.isActive ? "default" : "secondary"}
                        className={
                          driver.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {driver.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {driver.bus ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {driver.bus.plateNumber}
                          </div>
                          <div className="text-gray-500">
                            {driver.bus.model}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEditDriver(driver)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleDriverStatus(
                                driver.id,
                                driver.isActive
                              )
                            }
                          >
                            {driver.isActive ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-gray-500">
              Showing {drivers.length} of {stats?.totalDrivers || 0} drivers
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrivers(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDrivers(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Driver Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Driver</DialogTitle>
            <DialogDescription>
              Create a new driver profile. The user must already exist with
              DRIVER role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => handleInputChange("userId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                placeholder="DL123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">License Expiry</Label>
              <Input
                id="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) =>
                  handleInputChange("licenseExpiry", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseType">License Type</Label>
              <Input
                id="licenseType"
                value={formData.licenseType}
                onChange={(e) =>
                  handleInputChange("licenseType", e.target.value)
                }
                placeholder="Commercial Driver's License"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input
                id="experienceYears"
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={(e) =>
                  handleInputChange(
                    "experienceYears",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) =>
                  handleInputChange("emergencyContact", e.target.value)
                }
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Phone</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  handleInputChange("emergencyPhone", e.target.value)
                }
                placeholder="+1234567890"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="medicalInfo">Medical Information</Label>
              <Textarea
                id="medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) =>
                  handleInputChange("medicalInfo", e.target.value)
                }
                placeholder="Any medical conditions or notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDriver}>Create Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>
              Update driver information and license details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-licenseNumber">License Number</Label>
              <Input
                id="edit-licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                placeholder="DL123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseExpiry">License Expiry</Label>
              <Input
                id="edit-licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) =>
                  handleInputChange("licenseExpiry", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-licenseType">License Type</Label>
              <Input
                id="edit-licenseType"
                value={formData.licenseType}
                onChange={(e) =>
                  handleInputChange("licenseType", e.target.value)
                }
                placeholder="Commercial Driver's License"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-experienceYears">Experience (Years)</Label>
              <Input
                id="edit-experienceYears"
                type="number"
                min="0"
                max="50"
                value={formData.experienceYears}
                onChange={(e) =>
                  handleInputChange(
                    "experienceYears",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
              <Input
                id="edit-emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) =>
                  handleInputChange("emergencyContact", e.target.value)
                }
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyPhone">Emergency Phone</Label>
              <Input
                id="edit-emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) =>
                  handleInputChange("emergencyPhone", e.target.value)
                }
                placeholder="+1234567890"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-medicalInfo">Medical Information</Label>
              <Textarea
                id="edit-medicalInfo"
                value={formData.medicalInfo}
                onChange={(e) =>
                  handleInputChange("medicalInfo", e.target.value)
                }
                placeholder="Any medical conditions or notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDriver}>Update Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {isToastVisible && (
        <Toast>
          <ToastTitle>
            {toastType === "success" ? "Success" : "Error"}
          </ToastTitle>
          <ToastDescription>{toastMessage}</ToastDescription>
        </Toast>
      )}
    </div>
  );
}

export default function DriverManagement() {
  return (
    <ToastProvider>
      <ProtectedRoute requiredRole="ADMIN">
        <AdminLayout>
          <DriverManagementContent />
        </AdminLayout>
      </ProtectedRoute>
      <ToastViewport />
    </ToastProvider>
  );
}

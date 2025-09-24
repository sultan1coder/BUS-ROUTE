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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  Settings,
  Route,
  Navigation,
  Shield,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  Upload,
  RefreshCw,
  UserCheck,
  UserPlus,
  UserMinus,
  Bus,
  MapPin,
  Gauge,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface BusDriverAssignment {
  id: string;
  busId: string;
  driverId: string;
  assignedAt: Date;
  isActive: boolean;
  notes: string;
  bus?: {
    id: string;
    plateNumber: string;
    model: string;
    capacity: number;
    schoolId: string;
    school?: {
      name: string;
    };
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseExpiry: Date;
    experience: number;
  };
}

interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  isActive: boolean;
  schoolId: string;
  school?: {
    name: string;
  };
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: Date;
  experience: number;
  isActive: boolean;
}

export default function BusDriverAssignmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState<BusDriverAssignment[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<BusDriverAssignment | null>(null);
  const [formData, setFormData] = useState({
    busId: "",
    driverId: "",
    isActive: true,
    notes: "",
  });

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getBusDriverAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      toast.error("Failed to load driver assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBuses = useCallback(async () => {
    try {
      const response = await AdminApiService.getBuses();
      setBuses(response.data || []);
    } catch (error) {
      console.error("Failed to load buses:", error);
    }
  }, []);

  const loadDrivers = useCallback(async () => {
    try {
      const response = await AdminApiService.getDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Failed to load drivers:", error);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
    loadBuses();
    loadDrivers();
  }, [loadAssignments, loadBuses, loadDrivers]);

  const handleCreateAssignment = async () => {
    try {
      await AdminApiService.createBusDriverAssignment(formData);
      toast.success("Driver assignment created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      loadAssignments();
    } catch (error: any) {
      console.error("Failed to create assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
    }
  };

  const handleEditAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await AdminApiService.updateBusDriverAssignment(
        selectedAssignment.id,
        formData
      );
      toast.success("Driver assignment updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedAssignment(null);
      resetForm();
      loadAssignments();
    } catch (error: any) {
      console.error("Failed to update assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to update assignment"
      );
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this driver assignment?"))
      return;

    try {
      await AdminApiService.deleteBusDriverAssignment(assignmentId);
      toast.success("Driver assignment deleted successfully!");
      loadAssignments();
    } catch (error: any) {
      console.error("Failed to delete assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete assignment"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      busId: "",
      driverId: "",
      isActive: true,
      notes: "",
    });
  };

  const openEditDialog = (assignment: BusDriverAssignment) => {
    setSelectedAssignment(assignment);
    setFormData({
      busId: assignment.busId,
      driverId: assignment.driverId,
      isActive: assignment.isActive,
      notes: assignment.notes,
    });
    setIsEditDialogOpen(true);
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.bus?.plateNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.driver?.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.driver?.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assignment.bus?.school?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && assignment.isActive) ||
      (statusFilter === "inactive" && !assignment.isActive);

    const matchesBus = busFilter === "all" || assignment.busId === busFilter;

    const matchesDriver =
      driverFilter === "all" || assignment.driverId === driverFilter;

    return matchesSearch && matchesStatus && matchesBus && matchesDriver;
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getLicenseStatus = (expiryDate: Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          Expired
        </Badge>
      );
    } else if (daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          Expires Soon
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Valid
        </Badge>
      );
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Driver Assignments
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage bus driver assignments and schedules
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Driver
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assignments
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Driver-bus assignments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Assignments
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    assignments.filter((assignment) => assignment.isActive)
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unassigned Buses
                </CardTitle>
                <Bus className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    buses.filter(
                      (bus) =>
                        !assignments.some(
                          (assignment) =>
                            assignment.busId === bus.id && assignment.isActive
                        )
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Need driver assignment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Drivers
                </CardTitle>
                <UserCheck className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    drivers.filter(
                      (driver) =>
                        !assignments.some(
                          (assignment) =>
                            assignment.driverId === driver.id &&
                            assignment.isActive
                        )
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Not currently assigned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bus">Bus</Label>
                  <Select value={busFilter} onValueChange={setBusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Buses</SelectItem>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select value={driverFilter} onValueChange={setDriverFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drivers</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setBusFilter("all");
                      setDriverFilter("all");
                    }}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Driver Assignments ({filteredAssignments.length})
              </CardTitle>
              <CardDescription>
                Manage bus driver assignments and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading assignments...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>License Status</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Assigned Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {assignment.bus?.plateNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.bus?.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {assignment.driver?.firstName}{" "}
                              {assignment.driver?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.driver?.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.bus?.school?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {assignment.driver?.licenseExpiry ? (
                            getLicenseStatus(assignment.driver.licenseExpiry)
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {assignment.driver?.experience || 0} years
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assignment.isActive)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(assignment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admin/drivers/${assignment.driverId}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Create Assignment Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Driver to Bus</DialogTitle>
                <DialogDescription>
                  Create a new driver assignment for a bus
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bus">Bus</Label>
                  <Select
                    value={formData.busId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, busId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.plateNumber} - {bus.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select
                    value={formData.driverId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, driverId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} -{" "}
                          {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Assignment notes (optional)"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active Assignment</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAssignment}>
                  Create Assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Assignment Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Driver Assignment</DialogTitle>
                <DialogDescription>
                  Update driver assignment information
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editBus">Bus</Label>
                  <Select
                    value={formData.busId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, busId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.plateNumber} - {bus.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDriver">Driver</Label>
                  <Select
                    value={formData.driverId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, driverId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName} -{" "}
                          {driver.licenseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editNotes">Notes</Label>
                  <Input
                    id="editNotes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Assignment notes (optional)"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="editIsActive">Active Assignment</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditAssignment}>
                  Update Assignment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

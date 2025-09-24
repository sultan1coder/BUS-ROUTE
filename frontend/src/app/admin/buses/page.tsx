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
import { Textarea } from "@/components/ui/textarea";
import {
  Bus,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Fuel,
  Gauge,
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
} from "lucide-react";
import { toast } from "sonner";

interface BusData {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  schoolId: string;
  driverId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  school?: {
    id: string;
    name: string;
    address: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  maintenance?: {
    lastService: Date;
    nextService: Date;
    mileage: number;
    status: string;
  };
  route?: {
    id: string;
    name: string;
    stops: number;
  };
}

interface School {
  id: string;
  name: string;
  address: string;
}

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
}

export default function BusesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
    schoolId: "",
    driverId: "",
    isActive: true,
  });

  const loadBuses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getBuses();
      setBuses(response.data || []);
    } catch (error) {
      console.error("Failed to load buses:", error);
      toast.error("Failed to load buses");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSchools = useCallback(async () => {
    try {
      const response = await AdminApiService.getSchools();
      setSchools(response.data || []);
    } catch (error) {
      console.error("Failed to load schools:", error);
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
    loadBuses();
    loadSchools();
    loadDrivers();
  }, [loadBuses, loadSchools, loadDrivers]);

  const handleCreateBus = async () => {
    try {
      const busData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        isActive: formData.isActive,
        driverId: formData.driverId === "none" ? undefined : formData.driverId,
      };

      await AdminApiService.createBus(busData);
      toast.success("Bus created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      loadBuses();
    } catch (error: any) {
      console.error("Failed to create bus:", error);
      toast.error(error.response?.data?.message || "Failed to create bus");
    }
  };

  const handleEditBus = async () => {
    if (!selectedBus) return;

    try {
      const busData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        isActive: formData.isActive,
        driverId: formData.driverId === "none" ? undefined : formData.driverId,
      };

      await AdminApiService.updateBus(selectedBus.id, busData);
      toast.success("Bus updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedBus(null);
      resetForm();
      loadBuses();
    } catch (error: any) {
      console.error("Failed to update bus:", error);
      toast.error(error.response?.data?.message || "Failed to update bus");
    }
  };

  const handleDeleteBus = async (busId: string) => {
    if (!confirm("Are you sure you want to delete this bus?")) return;

    try {
      await AdminApiService.deleteBus(busId);
      toast.success("Bus deleted successfully!");
      loadBuses();
    } catch (error: any) {
      console.error("Failed to delete bus:", error);
      toast.error(error.response?.data?.message || "Failed to delete bus");
    }
  };

  const resetForm = () => {
    setFormData({
      plateNumber: "",
      model: "",
      capacity: "",
      schoolId: "",
      driverId: "",
      isActive: true,
    });
  };

  const openEditDialog = (bus: BusData) => {
    setSelectedBus(bus);
    setFormData({
      plateNumber: bus.plateNumber,
      model: bus.model,
      capacity: bus.capacity.toString(),
      schoolId: bus.schoolId,
      driverId: bus.driverId || "none",
      isActive: bus.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.school?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && bus.isActive) ||
      (statusFilter === "inactive" && !bus.isActive);

    const matchesSchool =
      schoolFilter === "all" || bus.schoolId === schoolFilter;

    return matchesSearch && matchesStatus && matchesSchool;
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

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bus Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your fleet of school buses
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bus
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Buses
                </CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{buses.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Buses
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {buses.filter((bus) => bus.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (buses.filter((bus) => bus.isActive).length /
                      buses.length) *
                      100
                  )}
                  % of total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assigned Drivers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {buses.filter((bus) => bus.driverId).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(
                    (buses.filter((bus) => bus.driverId).length /
                      buses.length) *
                      100
                  )}
                  % assigned
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Maintenance Due
                </CardTitle>
                <Wrench className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Buses need service
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search buses..."
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
                  <Label htmlFor="school">School</Label>
                  <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Schools</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
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
                      setSchoolFilter("all");
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

          {/* Buses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Buses ({filteredBuses.length})</CardTitle>
              <CardDescription>
                Manage your bus fleet and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading buses...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuses.map((bus) => (
                      <TableRow key={bus.id}>
                        <TableCell className="font-medium">
                          {bus.plateNumber}
                        </TableCell>
                        <TableCell>{bus.model}</TableCell>
                        <TableCell>{bus.capacity} seats</TableCell>
                        <TableCell>
                          {bus.school?.name || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          {bus.driver ? (
                            <div>
                              <div className="font-medium">
                                {bus.driver.firstName} {bus.driver.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bus.driver.phone}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              No driver assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(bus.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(bus)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/admin/buses/${bus.id}`)
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBus(bus.id)}
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

          {/* Create Bus Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Bus</DialogTitle>
                <DialogDescription>
                  Create a new bus in your fleet
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plateNumber">Plate Number</Label>
                  <Input
                    id="plateNumber"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, plateNumber: e.target.value })
                    }
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="Ford Transit"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="school">School</Label>
                  <Select
                    value={formData.schoolId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, schoolId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver (Optional)</Label>
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
                      <SelectItem value="none">No driver assigned</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateBus}>Create Bus</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Bus Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Bus</DialogTitle>
                <DialogDescription>Update bus information</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPlateNumber">Plate Number</Label>
                  <Input
                    id="editPlateNumber"
                    value={formData.plateNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, plateNumber: e.target.value })
                    }
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <Label htmlFor="editModel">Model</Label>
                  <Input
                    id="editModel"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    placeholder="Ford Transit"
                  />
                </div>
                <div>
                  <Label htmlFor="editCapacity">Capacity</Label>
                  <Input
                    id="editCapacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="editSchool">School</Label>
                  <Select
                    value={formData.schoolId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, schoolId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
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
                      <SelectItem value="none">No driver assigned</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.firstName} {driver.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditBus}>Update Bus</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

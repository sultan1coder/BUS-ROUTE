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
import { Textarea } from "@/components/ui/textarea";
import {
  Wrench,
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
  DollarSign,
  Gauge,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface MaintenanceRecord {
  id: string;
  busId: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  nextService: Date;
  status: string;
  technician: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  bus?: {
    plateNumber: string;
    model: string;
  };
}

interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  isActive: boolean;
}

export default function BusMaintenancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [busFilter, setBusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MaintenanceRecord | null>(null);
  const [formData, setFormData] = useState({
    busId: "",
    date: "",
    type: "",
    description: "",
    cost: "",
    mileage: "",
    nextService: "",
    status: "",
    technician: "",
    notes: "",
  });

  const loadMaintenanceRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getMaintenanceRecords();
      setMaintenanceRecords(response.data || []);
    } catch (error) {
      console.error("Failed to load maintenance records:", error);
      toast.error("Failed to load maintenance records");
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

  useEffect(() => {
    loadMaintenanceRecords();
    loadBuses();
  }, [loadMaintenanceRecords, loadBuses]);

  const handleCreateRecord = async () => {
    try {
      const recordData = {
        ...formData,
        cost: parseFloat(formData.cost),
        mileage: parseInt(formData.mileage),
        date: new Date(formData.date),
        nextService: new Date(formData.nextService),
      };

      await AdminApiService.createMaintenanceRecord(recordData);
      toast.success("Maintenance record created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      loadMaintenanceRecords();
    } catch (error: any) {
      console.error("Failed to create maintenance record:", error);
      toast.error(
        error.response?.data?.message || "Failed to create maintenance record"
      );
    }
  };

  const handleEditRecord = async () => {
    if (!selectedRecord) return;

    try {
      const recordData = {
        ...formData,
        cost: parseFloat(formData.cost),
        mileage: parseInt(formData.mileage),
        date: new Date(formData.date),
        nextService: new Date(formData.nextService),
      };

      await AdminApiService.updateMaintenanceRecord(
        selectedRecord.id,
        recordData
      );
      toast.success("Maintenance record updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      loadMaintenanceRecords();
    } catch (error: any) {
      console.error("Failed to update maintenance record:", error);
      toast.error(
        error.response?.data?.message || "Failed to update maintenance record"
      );
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?"))
      return;

    try {
      await AdminApiService.deleteMaintenanceRecord(recordId);
      toast.success("Maintenance record deleted successfully!");
      loadMaintenanceRecords();
    } catch (error: any) {
      console.error("Failed to delete maintenance record:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete maintenance record"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      busId: "",
      date: "",
      type: "",
      description: "",
      cost: "",
      mileage: "",
      nextService: "",
      status: "",
      technician: "",
      notes: "",
    });
  };

  const openEditDialog = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      busId: record.busId,
      date: new Date(record.date).toISOString().split("T")[0],
      type: record.type,
      description: record.description,
      cost: record.cost.toString(),
      mileage: record.mileage.toString(),
      nextService: new Date(record.nextService).toISOString().split("T")[0],
      status: record.status,
      technician: record.technician,
      notes: record.notes,
    });
    setIsEditDialogOpen(true);
  };

  const filteredRecords = maintenanceRecords.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.bus?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      record.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" ||
      record.type.toLowerCase() === typeFilter.toLowerCase();

    const matchesBus = busFilter === "all" || record.busId === busFilter;

    return matchesSearch && matchesStatus && matchesType && matchesBus;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      Good: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <Badge
        className={
          statusColors[status as keyof typeof statusColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeIcons = {
      "Oil Change": "🛢️",
      "Brake Service": "🛑",
      "Engine Repair": "🔧",
      "Tire Replacement": "🛞",
      Inspection: "🔍",
      "General Service": "⚙️",
    };

    return typeIcons[type as keyof typeof typeIcons] || "🔧";
  };

  const maintenanceTypes = [
    "Oil Change",
    "Brake Service",
    "Engine Repair",
    "Tire Replacement",
    "Inspection",
    "General Service",
    "Transmission Service",
    "Electrical Repair",
    "Body Work",
    "Other",
  ];

  const statusOptions = ["Good", "Warning", "Critical"];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bus Maintenance
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage bus maintenance records
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Records
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maintenanceRecords.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  All maintenance records
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Good Status
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    maintenanceRecords.filter(
                      (record) => record.status === "Good"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Buses in good condition
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warning</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    maintenanceRecords.filter(
                      (record) => record.status === "Warning"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Need attention soon
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    maintenanceRecords.filter(
                      (record) => record.status === "Critical"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Immediate attention required
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
                      placeholder="Search records..."
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
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {maintenanceTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
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
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setBusFilter("all");
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

          {/* Maintenance Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Maintenance Records ({filteredRecords.length})
              </CardTitle>
              <CardDescription>
                Track maintenance history and upcoming services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  Loading maintenance records...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.bus?.plateNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.bus?.model}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{getTypeIcon(record.type)}</span>
                            <span>{record.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.description}
                        </TableCell>
                        <TableCell>${record.cost.toFixed(2)}</TableCell>
                        <TableCell>
                          {record.mileage.toLocaleString()} km
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{record.technician}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecord(record.id)}
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

          {/* Create Maintenance Record Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Maintenance Record</DialogTitle>
                <DialogDescription>
                  Record a new maintenance service for a bus
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="nextService">Next Service</Label>
                  <Input
                    id="nextService"
                    type="date"
                    value={formData.nextService}
                    onChange={(e) =>
                      setFormData({ ...formData, nextService: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="technician">Technician</Label>
                  <Input
                    id="technician"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({ ...formData, technician: e.target.value })
                    }
                    placeholder="Technician name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the maintenance work performed..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateRecord}>Create Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Maintenance Record Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Maintenance Record</DialogTitle>
                <DialogDescription>
                  Update maintenance record information
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
                  <Label htmlFor="editDate">Date</Label>
                  <Input
                    id="editDate"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editType">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editCost">Cost ($)</Label>
                  <Input
                    id="editCost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="editMileage">Mileage (km)</Label>
                  <Input
                    id="editMileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      setFormData({ ...formData, mileage: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="editNextService">Next Service</Label>
                  <Input
                    id="editNextService"
                    type="date"
                    value={formData.nextService}
                    onChange={(e) =>
                      setFormData({ ...formData, nextService: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editTechnician">Technician</Label>
                  <Input
                    id="editTechnician"
                    value={formData.technician}
                    onChange={(e) =>
                      setFormData({ ...formData, technician: e.target.value })
                    }
                    placeholder="Technician name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the maintenance work performed..."
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editNotes">Notes</Label>
                  <Textarea
                    id="editNotes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditRecord}>Update Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

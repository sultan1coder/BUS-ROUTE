"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bus,
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
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  Eye,
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
    phone: string;
    email: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    licenseNumber: string;
    licenseExpiry: Date;
  };
  maintenance?: {
    lastService: Date;
    nextService: Date;
    mileage: number;
    status: string;
    notes: string;
  };
  route?: {
    id: string;
    name: string;
    stops: number;
    distance: number;
    estimatedDuration: number;
  };
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    pickupTime: string;
    dropTime: string;
  }>;
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  nextService: Date;
  status: string;
}

interface TripRecord {
  id: string;
  date: Date;
  route: string;
  driver: string;
  startTime: string;
  endTime: string;
  students: number;
  status: string;
}

export default function BusDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const busId = params.id as string;

  const [bus, setBus] = useState<BusData | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [tripRecords, setTripRecords] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBusDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getBusById(busId);
      setBus(response.data);
    } catch (error) {
      console.error("Failed to load bus details:", error);
      toast.error("Failed to load bus details");
    } finally {
      setLoading(false);
    }
  }, [busId]);

  const loadMaintenanceRecords = useCallback(async () => {
    try {
      const response = await AdminApiService.getBusMaintenance(busId);
      setMaintenanceRecords(response.data || []);
    } catch (error) {
      console.error("Failed to load maintenance records:", error);
    }
  }, [busId]);

  const loadTripRecords = useCallback(async () => {
    try {
      const response = await AdminApiService.getBusTrips(busId);
      setTripRecords(response.data || []);
    } catch (error) {
      console.error("Failed to load trip records:", error);
    }
  }, [busId]);

  useEffect(() => {
    if (busId) {
      loadBusDetails();
      loadMaintenanceRecords();
      loadTripRecords();
    }
  }, [busId, loadBusDetails, loadMaintenanceRecords, loadTripRecords]);

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

  const getMaintenanceStatusBadge = (status: string) => {
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

  const getTripStatusBadge = (status: string) => {
    const statusColors = {
      Completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "In Progress":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Delayed:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading bus details...
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!bus) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="text-center py-8">
            <Bus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bus not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The bus you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/admin/buses")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Buses
            </Button>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/buses")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {bus.plateNumber}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {bus.model} • {bus.capacity} seats
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(bus.isActive)}
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/buses/${bus.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">School</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {bus.school?.name || "Unassigned"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bus.school?.address || "No address"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Driver</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {bus.driver
                    ? `${bus.driver.firstName} ${bus.driver.lastName}`
                    : "Unassigned"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bus.driver?.phone || "No phone"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Route</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {bus.route?.name || "No route"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bus.route
                    ? `${bus.route.stops} stops • ${bus.route.distance}km`
                    : "Not assigned"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {bus.students?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently assigned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bus Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bus Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Plate Number
                        </label>
                        <p className="text-lg font-semibold">
                          {bus.plateNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Model
                        </label>
                        <p className="text-lg font-semibold">{bus.model}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Capacity
                        </label>
                        <p className="text-lg font-semibold">
                          {bus.capacity} seats
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Status
                        </label>
                        <div className="mt-1">
                          {getStatusBadge(bus.isActive)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* School Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>School Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bus.school ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Name
                          </label>
                          <p className="text-lg font-semibold">
                            {bus.school.name}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Address
                          </label>
                          <p className="text-sm">{bus.school.address}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="text-sm">{bus.school.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Email
                            </label>
                            <p className="text-sm">{bus.school.email}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No school assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* Driver Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bus.driver ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Name
                          </label>
                          <p className="text-lg font-semibold">
                            {bus.driver.firstName} {bus.driver.lastName}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="text-sm">{bus.driver.phone}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Email
                            </label>
                            <p className="text-sm">{bus.driver.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              License Number
                            </label>
                            <p className="text-sm">
                              {bus.driver.licenseNumber}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              License Expiry
                            </label>
                            <p className="text-sm">
                              {new Date(
                                bus.driver.licenseExpiry
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No driver assigned</p>
                    )}
                  </CardContent>
                </Card>

                {/* Route Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Route Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bus.route ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Route Name
                          </label>
                          <p className="text-lg font-semibold">
                            {bus.route.name}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Stops
                            </label>
                            <p className="text-sm">{bus.route.stops} stops</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Distance
                            </label>
                            <p className="text-sm">{bus.route.distance} km</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Estimated Duration
                          </label>
                          <p className="text-sm">
                            {bus.route.estimatedDuration} minutes
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No route assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Records</CardTitle>
                  <CardDescription>
                    Track maintenance history and upcoming services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{record.type}</TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>${record.cost}</TableCell>
                          <TableCell>
                            {record.mileage.toLocaleString()} km
                          </TableCell>
                          <TableCell>
                            {getMaintenanceStatusBadge(record.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Trip Records</CardTitle>
                  <CardDescription>
                    View recent trips and route history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tripRecords.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            {new Date(trip.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{trip.route}</TableCell>
                          <TableCell>{trip.driver}</TableCell>
                          <TableCell>{trip.startTime}</TableCell>
                          <TableCell>{trip.endTime}</TableCell>
                          <TableCell>{trip.students}</TableCell>
                          <TableCell>
                            {getTripStatusBadge(trip.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>
                    Students currently assigned to this bus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bus.students && bus.students.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Pickup Time</TableHead>
                          <TableHead>Drop Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bus.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.grade}</TableCell>
                            <TableCell>{student.pickupTime}</TableCell>
                            <TableCell>{student.dropTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No students assigned to this bus
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

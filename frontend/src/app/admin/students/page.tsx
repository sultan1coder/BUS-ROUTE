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
  GraduationCap,
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
  Car,
  Home,
  User,
  School,
  MapPin,
  Bus,
  Users,
  BookOpen,
  Award,
  Heart,
  AlertTriangle,
  Star,
  Target,
  BarChart3,
  PieChart,
  TrendingDown,
  UserCheck2,
  UserX2,
  FileText,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Bus as BusIcon,
  GraduationCap as GraduationCapIcon,
  BookOpen as BookOpenIcon,
  Award as AwardIcon,
  Heart as HeartIcon,
  AlertTriangle as AlertTriangleIcon,
  Star as StarIcon,
  Target as TargetIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  TrendingDown as TrendingDownIcon,
  UserCheck2 as UserCheck2Icon,
  UserX2 as UserX2Icon,
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

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  studentId: string;
  rfidTag?: string;
  nfcTag?: string;
  schoolId: string;
  parentId?: string;
  photo?: string;
  medicalInfo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  school?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
  routes?: Array<{
    id: string;
    name: string;
    bus?: {
      plateNumber: string;
    };
  }>;
}

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  studentsByGrade: Array<{ grade: string; count: number }>;
  studentsWithTags: number;
  studentsWithoutTags: number;
  recentEnrollments: number;
  attendanceRate: number;
  studentsBySchool: Array<{ school: string; count: number }>;
}

function StudentManagementContent() {
  // State management
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all"); // all, with-tags, without-tags
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name"); // name, grade, dateOfBirth, createdAt
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Attendance states
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");

  // Schools state
  const [schools, setSchools] = useState<any[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false); // all, present, absent, late

  // Toast states
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    grade: "",
    studentId: "",
    rfidTag: "",
    nfcTag: "",
    schoolId: "",
    parentId: "",
    parentEmail: "",
    parentPhone: "",
    photo: "",
    medicalInfo: "",
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

  // Load schools data
  const loadSchools = useCallback(async () => {
    try {
      setIsLoadingSchools(true);
      const response = await AdminApiService.getAllSchools();
      setSchools(response.data || []);
    } catch (err: any) {
      console.error("Failed to load schools:", err);
      // Set mock schools data for demonstration
      setSchools([
        {
          id: "cmfsjrr4e0000ivlwjml45boe",
          name: "Greenwood Elementary School",
          address: "123 School Street",
          city: "Springfield",
          state: "IL",
        },
        {
          id: "school2",
          name: "Washington Middle School",
          address: "456 Education Ave",
          city: "Springfield",
          state: "IL",
        },
        {
          id: "school3",
          name: "Roosevelt High School",
          address: "789 Learning Blvd",
          city: "Springfield",
          state: "IL",
        },
      ]);
    } finally {
      setIsLoadingSchools(false);
    }
  }, []);

  // Load students data
  const loadStudents = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        const response = await AdminApiService.getAllStudents({
          page,
          limit: 10,
          search: searchTerm || undefined,
          grade: gradeFilter !== "all" ? gradeFilter : undefined,
          isActive:
            statusFilter !== "all" ? statusFilter === "active" : undefined,
          schoolId: schoolFilter !== "all" ? schoolFilter : undefined,
          hasTags:
            tagFilter === "with-tags"
              ? true
              : tagFilter === "without-tags"
              ? false
              : undefined,
          routeId: routeFilter !== "all" ? routeFilter : undefined,
          sortBy: sortBy !== "name" ? sortBy : undefined,
          sortOrder: sortOrder,
        });
        setStudents(response.data);
        setTotalPages(response.meta.totalPages);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("Failed to load students:", err);
        setError(err.message || "Failed to load students");
        // Set mock data for demonstration
        setStudents([
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "2010-05-15",
            grade: "8",
            studentId: "STU001",
            rfidTag: "RFID123",
            nfcTag: "NFC456",
            schoolId: "school1",
            parentId: "parent1",
            photo: "",
            medicalInfo: "No known allergies",
            isActive: true,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
            school: { id: "school1", name: "Lincoln Elementary" },
            parent: {
              id: "parent1",
              user: {
                firstName: "Jane",
                lastName: "Doe",
                email: "jane.doe@email.com",
                phone: "+1234567890",
              },
            },
            routes: [
              {
                id: "route1",
                name: "Route A",
                bus: { plateNumber: "BUS001" },
              },
            ],
          },
          {
            id: "2",
            firstName: "Sarah",
            lastName: "Smith",
            dateOfBirth: "2012-03-22",
            grade: "6",
            studentId: "STU002",
            rfidTag: "RFID789",
            nfcTag: "",
            schoolId: "school1",
            parentId: "parent2",
            photo: "",
            medicalInfo: "",
            isActive: true,
            createdAt: "2024-01-16T10:00:00Z",
            updatedAt: "2024-01-16T10:00:00Z",
            school: { id: "school1", name: "Lincoln Elementary" },
            parent: {
              id: "parent2",
              user: {
                firstName: "Mike",
                lastName: "Smith",
                email: "mike.smith@email.com",
                phone: "+1234567891",
              },
            },
            routes: [],
          },
        ]);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        setIsLoading(false);
      }
    },
    [
      searchTerm,
      gradeFilter,
      statusFilter,
      schoolFilter,
      tagFilter,
      routeFilter,
      sortBy,
      sortOrder,
    ]
  );

  // Load student stats
  const loadStudentStats = useCallback(async () => {
    try {
      const response = await AdminApiService.getStudentAnalytics();
      setStats(response.data);
    } catch (err: any) {
      console.error("Failed to load student stats:", err);
      // Set fallback stats if API fails
      setStats({
        totalStudents: 2,
        activeStudents: 2,
        studentsByGrade: [
          { grade: "8", count: 1 },
          { grade: "6", count: 1 },
        ],
        studentsWithTags: 2,
        studentsWithoutTags: 0,
        recentEnrollments: 2,
        attendanceRate: 95,
        studentsBySchool: [{ school: "Lincoln Elementary", count: 2 }],
      });
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadSchools();
    loadStudents();
    loadStudentStats();
    // Load attendance data after functions are defined
    const loadAttendance = async () => {
      try {
        const response = await AdminApiService.getStudentAttendance(
          attendanceDate
        );
        setAttendanceData(response || []);
      } catch (error) {
        console.error("Failed to load attendance data:", error);
        // Set mock attendance data for demonstration
        setAttendanceData([
          {
            id: "1",
            studentId: "STU001",
            studentName: "John Doe",
            grade: "8",
            status: "present",
            checkInTime: "08:15",
            checkOutTime: "15:30",
            notes: "",
          },
          {
            id: "2",
            studentId: "STU002",
            studentName: "Sarah Smith",
            grade: "6",
            status: "late",
            checkInTime: "08:45",
            checkOutTime: "15:30",
            notes: "Late due to traffic",
          },
        ]);
      }
    };

    const loadAttendanceStats = async () => {
      try {
        const response = await AdminApiService.getAttendanceStats();
        setAttendanceStats(response || {});
      } catch (error) {
        console.error("Failed to load attendance stats:", error);
        // Set mock attendance stats
        setAttendanceStats({
          totalStudents: 2,
          presentToday: 2,
          absentToday: 0,
          lateToday: 1,
          attendanceRate: 100,
          averageCheckInTime: "08:30",
        });
      }
    };

    loadAttendance();
    loadAttendanceStats();
  }, [loadStudents, loadStudentStats, attendanceDate]);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents(1);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    gradeFilter,
    statusFilter,
    schoolFilter,
    tagFilter,
    routeFilter,
    sortBy,
    sortOrder,
    loadStudents,
  ]);

  // Handle search
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadStudents(1);
  }, [loadStudents]);

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
    loadStudents(1);
  }, [loadStudents]);

  // Reset form
  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      grade: "",
      studentId: "",
      rfidTag: "",
      nfcTag: "",
      schoolId: "",
      parentId: "",
      parentEmail: "",
      parentPhone: "",
      photo: "",
      medicalInfo: "",
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setGradeFilter("all");
    setStatusFilter("all");
    setSchoolFilter("all");
    setTagFilter("all");
    setRouteFilter("all");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
    loadStudents(1);
  };

  // Load attendance data
  const loadAttendanceData = useCallback(async (date: string) => {
    try {
      const response = await AdminApiService.getStudentAttendance(date);
      setAttendanceData(response.data || []);
    } catch (error) {
      console.error("Failed to load attendance data:", error);
      // Set mock attendance data for demonstration
      setAttendanceData([
        {
          id: "1",
          studentId: "STU001",
          studentName: "John Doe",
          grade: "8",
          status: "present",
          checkInTime: "08:15",
          checkOutTime: "15:30",
          notes: "",
        },
        {
          id: "2",
          studentId: "STU002",
          studentName: "Sarah Smith",
          grade: "6",
          status: "late",
          checkInTime: "08:45",
          checkOutTime: "15:30",
          notes: "Late due to traffic",
        },
      ]);
    }
  }, []);

  // Load attendance stats
  const loadAttendanceStats = useCallback(async () => {
    try {
      const response = await AdminApiService.getAttendanceStats();
      setAttendanceStats(response.data || {});
    } catch (error) {
      console.error("Failed to load attendance stats:", error);
      // Set mock attendance stats
      setAttendanceStats({
        totalStudents: 2,
        presentToday: 2,
        absentToday: 0,
        lateToday: 1,
        attendanceRate: 100,
        averageCheckInTime: "08:30",
      });
    }
  }, []);

  // Mark attendance
  const handleMarkAttendance = async (
    studentId: string,
    status: "present" | "absent" | "late",
    notes?: string
  ) => {
    try {
      const response = await AdminApiService.markAttendance({
        studentId,
        date: attendanceDate,
        status,
        checkInTime:
          status === "present" || status === "late"
            ? new Date().toTimeString().slice(0, 5)
            : undefined,
        notes,
      });
      showToast(`Attendance marked as ${status}`, "success");
      loadAttendanceData(attendanceDate);
      loadAttendanceStats();
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      showToast("Failed to mark attendance", "error");
    }
  };

  // Bulk mark attendance
  const handleBulkMarkAttendance = async (
    status: "present" | "absent" | "late"
  ) => {
    try {
      if (selectedStudents.length === 0) {
        showToast("Please select students to mark attendance", "error");
        return;
      }

      const promises = selectedStudents.map(async (studentId) => {
        try {
          return await AdminApiService.markAttendance({
            studentId,
            date: attendanceDate,
            status,
            checkInTime:
              status === "present" || status === "late"
                ? new Date().toTimeString().slice(0, 5)
                : undefined,
          });
        } catch (error) {
          console.error(
            `Failed to mark attendance for student ${studentId}:`,
            error
          );
          return { success: false, studentId };
        }
      });

      await Promise.all(promises);
      showToast(
        `Attendance marked as ${status} for ${selectedStudents.length} students`,
        "success"
      );
      setSelectedStudents([]);
      loadAttendanceData(attendanceDate);
      loadAttendanceStats();
    } catch (error) {
      console.error("Failed to bulk mark attendance:", error);
      showToast("Failed to mark attendance", "error");
    }
  };

  // Create student
  const handleCreateStudent = async () => {
    try {
      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.dateOfBirth ||
        !formData.grade ||
        !formData.studentId ||
        !formData.schoolId
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      // Validate email format if provided
      if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
        showToast("Please enter a valid email address", "error");
        return;
      }

      // Validate phone format if provided
      if (
        formData.parentPhone &&
        !/^\+?[\d\s\-\(\)]+$/.test(formData.parentPhone)
      ) {
        showToast("Please enter a valid phone number", "error");
        return;
      }

      // Prepare student data
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        grade: formData.grade,
        studentId: formData.studentId,
        rfidTag: formData.rfidTag || undefined,
        nfcTag: formData.nfcTag || undefined,
        schoolId: formData.schoolId,
        parentId: formData.parentId || undefined,
        photo: formData.photo || undefined,
        medicalInfo: formData.medicalInfo || undefined,
      };

      const response = await AdminApiService.createStudent(studentData);
      showToast("Student created successfully!", "success");
      setIsCreateDialogOpen(false);
      resetForm();
      loadStudents(); // Refresh the student list
    } catch (error: any) {
      console.error("Failed to create student:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create student";
      showToast(errorMessage, "error");
    }
  };

  // Update student
  const handleUpdateStudent = async () => {
    try {
      if (!editingStudent) return;

      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.dateOfBirth ||
        !formData.grade ||
        !formData.studentId ||
        !formData.schoolId
      ) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      // Validate email format if provided
      if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
        showToast("Please enter a valid email address", "error");
        return;
      }

      // Validate phone format if provided
      if (
        formData.parentPhone &&
        !/^\+?[\d\s\-\(\)]+$/.test(formData.parentPhone)
      ) {
        showToast("Please enter a valid phone number", "error");
        return;
      }

      // Prepare student data
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        grade: formData.grade,
        studentId: formData.studentId,
        rfidTag: formData.rfidTag || undefined,
        nfcTag: formData.nfcTag || undefined,
        schoolId: formData.schoolId,
        parentId: formData.parentId || undefined,
        photo: formData.photo || undefined,
        medicalInfo: formData.medicalInfo || undefined,
      };

      const response = await AdminApiService.updateStudent(
        editingStudent.id,
        studentData
      );
      showToast("Student updated successfully!", "success");
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      loadStudents(); // Refresh the student list
    } catch (error: any) {
      console.error("Failed to update student:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update student";
      showToast(errorMessage, "error");
    }
  };

  // Bulk operations
  const handleBulkActivate = async () => {
    try {
      if (selectedStudents.length === 0) {
        showToast("Please select students to activate", "error");
        return;
      }

      const promises = selectedStudents.map((studentId) =>
        AdminApiService.reactivateStudent(studentId)
      );

      await Promise.all(promises);
      showToast(
        `${selectedStudents.length} students activated successfully!`,
        "success"
      );
      setSelectedStudents([]);
      loadStudents(currentPage);
    } catch (err: unknown) {
      showToast("Failed to activate selected students", "error");
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      if (selectedStudents.length === 0) {
        showToast("Please select students to deactivate", "error");
        return;
      }

      const promises = selectedStudents.map((studentId) =>
        AdminApiService.deactivateStudent(studentId)
      );

      await Promise.all(promises);
      showToast(
        `${selectedStudents.length} students deactivated successfully!`,
        "success"
      );
      setSelectedStudents([]);
      loadStudents(currentPage);
    } catch (err: unknown) {
      showToast("Failed to deactivate selected students", "error");
    }
  };

  // Toggle student status
  const handleToggleStudentStatus = async (
    studentId: string,
    isActive: boolean
  ) => {
    try {
      if (isActive) {
        await AdminApiService.deactivateStudent(studentId);
        showToast("Student deactivated", "success");
      } else {
        await AdminApiService.reactivateStudent(studentId);
        showToast("Student reactivated", "success");
      }
      loadStudents(currentPage);
      loadStudentStats();
    } catch (err: unknown) {
      showToast(
        `Failed to ${isActive ? "deactivate" : "reactivate"} student`,
        "error"
      );
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await AdminApiService.deleteStudent(studentId);
      showToast("Student deleted successfully", "success");
      loadStudents(currentPage);
      loadStudentStats();
    } catch (err: unknown) {
      showToast("Failed to delete student", "error");
    }
  };

  // Open edit dialog
  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      studentId: student.studentId,
      rfidTag: student.rfidTag || "",
      nfcTag: student.nfcTag || "",
      schoolId: student.schoolId,
      parentId: student.parentId || "",
      parentEmail: student.parent?.user?.email || "",
      parentPhone: student.parent?.user?.phone || "",
      photo: student.photo || "",
      medicalInfo: student.medicalInfo || "",
    });
    setIsEditDialogOpen(true);
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      "Pre-K": "bg-purple-100 text-purple-800 border-purple-200",
      K: "bg-blue-100 text-blue-800 border-blue-200",
      "1": "bg-green-100 text-green-800 border-green-200",
      "2": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "3": "bg-orange-100 text-orange-800 border-orange-200",
      "4": "bg-red-100 text-red-800 border-red-200",
      "5": "bg-pink-100 text-pink-800 border-pink-200",
      "6": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "7": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "8": "bg-teal-100 text-teal-800 border-teal-200",
      "9": "bg-lime-100 text-lime-800 border-lime-200",
      "10": "bg-amber-100 text-amber-800 border-amber-200",
      "11": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "12": "bg-violet-100 text-violet-800 border-violet-200",
    };
    return gradeColors[grade] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="text-slate-600 text-lg font-medium mt-1">
                  Manage student records, attendance, and transportation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => loadStudents(currentPage)}
                className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 group">
                <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Export
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 group">
                    <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <UserPlus className="h-6 w-6 text-white" />
                      </div>
                      Add New Student
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-base">
                      Create a new student profile. All required fields are
                      marked with an asterisk (*).
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Personal Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="firstName"
                            className="text-sm font-semibold text-gray-700"
                          >
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                firstName: e.target.value,
                              })
                            }
                            placeholder="Enter student's first name"
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="lastName"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                lastName: e.target.value,
                              })
                            }
                            placeholder="Enter student's last name"
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="dateOfBirth"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Date of Birth *
                          </Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dateOfBirth: e.target.value,
                              })
                            }
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="studentId"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Student ID *
                          </Label>
                          <Input
                            id="studentId"
                            value={formData.studentId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                studentId: e.target.value,
                              })
                            }
                            placeholder="Enter unique student ID"
                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Academic Information Section */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Academic Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="grade"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Grade Level *
                          </Label>
                          <Select
                            value={formData.grade}
                            onValueChange={(value) =>
                              setFormData({ ...formData, grade: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:border-green-300 transition-all duration-200 shadow-sm text-black">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-green-600" />
                                <SelectValue placeholder="Select grade level" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-green-200 shadow-lg rounded-lg text-black">
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                (grade) => (
                                  <SelectItem
                                    key={grade}
                                    value={grade.toString()}
                                    className="hover:bg-green-50 focus:bg-green-50 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 py-1">
                                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-green-700">
                                          {grade}
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        Grade {grade}
                                      </span>
                                    </div>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="schoolId"
                            className="text-sm font-semibold text-gray-700"
                          >
                            School *
                          </Label>
                          <Select
                            value={formData.schoolId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, schoolId: value })
                            }
                          >
                            <SelectTrigger className="h-12 bg-white border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:border-green-300 transition-all duration-200 shadow-sm">
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4 text-green-600" />
                                <SelectValue placeholder="Select school" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-green-200 shadow-lg rounded-lg max-h-60">
                              {isLoadingSchools ? (
                                <SelectItem
                                  value=""
                                  disabled
                                  className="cursor-not-allowed"
                                >
                                  <div className="flex items-center gap-3 py-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                    <span className="text-gray-600">
                                      Loading schools...
                                    </span>
                                  </div>
                                </SelectItem>
                              ) : schools.length > 0 ? (
                                schools.map((school) => (
                                  <SelectItem
                                    key={school.id}
                                    value={school.id}
                                    className="hover:bg-green-50 focus:bg-green-50 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 py-2">
                                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <School className="h-4 w-4 text-green-600" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">
                                          {school.name}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {school.city}, {school.state}
                                        </span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem
                                  value=""
                                  disabled
                                  className="cursor-not-allowed"
                                >
                                  <div className="flex items-center gap-3 py-2">
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-500">
                                      No schools available
                                    </span>
                                  </div>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Phone className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Parent Contact Information
                        </h3>
                        <span className="text-sm text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="parentEmail"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Parent Email
                          </Label>
                          <Input
                            id="parentEmail"
                            type="email"
                            value={formData.parentEmail}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                parentEmail: e.target.value,
                              })
                            }
                            placeholder="parent@example.com"
                            className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="parentPhone"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Parent Phone
                          </Label>
                          <Input
                            id="parentPhone"
                            value={formData.parentPhone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                parentPhone: e.target.value,
                              })
                            }
                            placeholder="(555) 123-4567"
                            className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Identification Tags Section */}
                    <div className="bg-orange-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Shield className="h-5 w-5 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Identification Tags
                        </h3>
                        <span className="text-sm text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="rfidTag"
                            className="text-sm font-semibold text-gray-700"
                          >
                            RFID Tag
                          </Label>
                          <Input
                            id="rfidTag"
                            value={formData.rfidTag}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rfidTag: e.target.value,
                              })
                            }
                            placeholder="Enter RFID tag ID"
                            className="h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="nfcTag"
                            className="text-sm font-semibold text-gray-700"
                          >
                            NFC Tag
                          </Label>
                          <Input
                            id="nfcTag"
                            value={formData.nfcTag}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nfcTag: e.target.value,
                              })
                            }
                            placeholder="Enter NFC tag ID"
                            className="h-11 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Additional Information
                        </h3>
                        <span className="text-sm text-gray-500 font-normal">
                          (Optional)
                        </span>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="photo"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Student Photo URL
                          </Label>
                          <Input
                            id="photo"
                            value={formData.photo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                photo: e.target.value,
                              })
                            }
                            placeholder="https://example.com/photo.jpg"
                            className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="medicalInfo"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Medical Information & Allergies
                          </Label>
                          <textarea
                            id="medicalInfo"
                            value={formData.medicalInfo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                medicalInfo: e.target.value,
                              })
                            }
                            placeholder="Enter any medical conditions, allergies, or special requirements..."
                            className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateStudent}
                      disabled={isCreatingStudent}
                      className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isCreatingStudent ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating Student...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Student
                        </div>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.totalStudents || 0}
              </div>
              <div className="flex items-center text-sm text-blue-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>All enrolled students</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Active Students
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.activeStudents || 0}
              </div>
              <div className="flex items-center text-sm text-green-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Currently enrolled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                With Tags
              </CardTitle>
              <Award className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.studentsWithTags || 0}
              </div>
              <div className="flex items-center text-sm text-purple-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>RFID/NFC enabled</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Attendance Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.attendanceRate || 0}%
              </div>
              <div className="flex items-center text-sm text-orange-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-100">
                Recent Enrollments
              </CardTitle>
              <UserPlus className="h-4 w-4 text-indigo-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.recentEnrollments || 0}
              </div>
              <div className="flex items-center text-sm text-indigo-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">
                Without Tags
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-teal-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {stats?.studentsWithoutTags || 0}
              </div>
              <div className="flex items-center text-sm text-teal-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Need RFID/NFC</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-100">
                Average Age
              </CardTitle>
              <Calendar className="h-4 w-4 text-rose-200" />
            </CardHeader>
            <CardContent className="relative text-white">
              <div className="text-3xl font-bold mb-1">
                {(() => {
                  if (!students.length) return "0";
                  const totalAge = students.reduce((sum, student) => {
                    const birthDate = new Date(student.dateOfBirth);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }
                    return sum + age;
                  }, 0);
                  return Math.round(totalAge / students.length);
                })()}
                y
              </div>
              <div className="flex items-center text-sm text-rose-200">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Student age</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution Chart */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-blue-500" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.studentsByGrade?.map((grade: any) => (
                <div
                  key={grade.grade}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={`${getGradeColor(
                        grade.grade
                      )} font-medium px-3 py-1`}
                    >
                      {grade.grade}
                    </Badge>
                    <span className="text-sm font-medium text-slate-700">
                      {grade.count} students
                    </span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (grade.count / (stats?.totalStudents || 1)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 w-12 text-right">
                    {Math.round(
                      (grade.count / (stats?.totalStudents || 1)) * 100
                    )}
                    %
                  </span>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No grade distribution data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Distribution */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
              <School className="h-6 w-6 mr-3 text-green-500" />
              School Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.studentsBySchool?.map((school: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {school.school.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {school.school}
                      </p>
                      <p className="text-sm text-slate-600">
                        {school.count} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (school.count / (stats?.totalStudents || 1)) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 w-12 text-right">
                      {Math.round(
                        (school.count / (stats?.totalStudents || 1)) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-slate-500">
                  <School className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No school distribution data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Management Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-blue-500" />
                Daily Attendance Management
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="attendanceDate"
                    className="text-sm font-medium text-slate-700"
                  >
                    Date:
                  </Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => {
                      setAttendanceDate(e.target.value);
                      // Load attendance data for the new date
                      const loadAttendanceForDate = async () => {
                        try {
                          const response =
                            await AdminApiService.getStudentAttendance(
                              e.target.value
                            );
                          setAttendanceData(response || []);
                        } catch (error) {
                          console.error(
                            "Failed to load attendance data:",
                            error
                          );
                          // Set mock attendance data for demonstration
                          setAttendanceData([
                            {
                              id: "1",
                              studentId: "STU001",
                              studentName: "John Doe",
                              grade: "8",
                              status: "present",
                              checkInTime: "08:15",
                              checkOutTime: "15:30",
                              notes: "",
                            },
                            {
                              id: "2",
                              studentId: "STU002",
                              studentName: "Sarah Smith",
                              grade: "6",
                              status: "late",
                              checkInTime: "08:45",
                              checkOutTime: "15:30",
                              notes: "Late due to traffic",
                            },
                          ]);
                        }
                      };
                      loadAttendanceForDate();
                    }}
                    className="w-40 h-10 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900"
                  />
                </div>
                <Button
                  onClick={() => setIsAttendanceDialogOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Present Today
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {attendanceStats?.presentToday || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Absent Today
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {attendanceStats?.absentToday || 0}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Late Today
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {attendanceStats?.lateToday || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Attendance Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {attendanceStats?.attendanceRate || 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4 mb-6">
              <Button
                onClick={() => handleBulkMarkAttendance("present")}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={selectedStudents.length === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Selected as Present
              </Button>
              <Button
                onClick={() => handleBulkMarkAttendance("absent")}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={selectedStudents.length === 0}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark Selected as Absent
              </Button>
              <Button
                onClick={() => handleBulkMarkAttendance("late")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={selectedStudents.length === 0}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark Selected as Late
              </Button>
            </div>

            {/* Attendance Filter */}
            <div className="flex items-center space-x-4 mb-4">
              <Label
                htmlFor="attendanceFilter"
                className="text-sm font-medium text-slate-700"
              >
                Filter by status:
              </Label>
              <Select
                value={attendanceFilter}
                onValueChange={setAttendanceFilter}
              >
                <SelectTrigger className="w-48 h-12 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-blue-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Activity className="h-3 w-3 text-blue-600" />
                    </div>
                    <SelectValue placeholder="All statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-blue-200 shadow-2xl rounded-xl">
                  <SelectItem
                    value="all"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-2"
                  >
                    <div className="flex items-center gap-2 text-black">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">
                          A
                        </span>
                      </div>
                      <span className="font-medium">All Statuses</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="present"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-2"
                  >
                    <div className="flex items-center gap-2 text-black">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-medium">Present</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="absent"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-2"
                  >
                    <div className="flex items-center gap-2 text-black">
                      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="font-medium">Absent</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="late"
                    className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer py-2"
                  >
                    <div className="flex items-center gap-2 text-black">
                      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-3 w-3 text-yellow-600" />
                      </div>
                      <span className="font-medium">Late</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Search & Filter Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="search"
                  className="text-sm font-semibold text-slate-700 flex items-center"
                >
                  <Search className="h-4 w-4 mr-2 text-blue-500" />
                  Search Students
                </Label>
                <Input
                  id="search"
                  placeholder="Search by name, ID, or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="grade"
                  className="text-sm font-semibold text-slate-700 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2 text-green-500" />
                  Grade Level
                </Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger className="h-14 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 hover:border-green-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      <SelectValue placeholder="All grades" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-green-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto">
                    <SelectItem
                      value="all"
                      className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700">
                            A
                          </span>
                        </div>
                        <span className="font-medium">All Grades</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="K"
                      className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center ">
                          <span className="text-xs font-bold text-green-700">
                            K
                          </span>
                        </div>
                        <span className="font-medium">Kindergarten</span>
                      </div>
                    </SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem
                        key={i + 1}
                        value={(i + 1).toString()}
                        className="hover:bg-green-50 focus:bg-green-50 cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-3 text-black">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700">
                              {i + 1}
                            </span>
                          </div>
                          <span className="font-medium">Grade {i + 1}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-slate-700 flex items-center"
                >
                  <UserCheck className="h-4 w-4 mr-2 text-purple-500" />
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-14 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 hover:border-purple-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                    <div className="flex items-center gap-3 ">
                      <div className="p-2 bg-purple-100 rounded-lg ">
                        <UserCheck className="h-4 w-4 text-purple-600" />
                      </div>
                      <SelectValue placeholder="All statuses" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-purple-200 shadow-2xl rounded-xl">
                    <SelectItem
                      value="all"
                      className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-700">
                            A
                          </span>
                        </div>
                        <span className="font-medium">All Statuses</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="active"
                      className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="font-medium">Active</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="hover:bg-purple-50 focus:bg-purple-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3 text-black">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="h-3 w-3 text-red-600" />
                        </div>
                        <span className="font-medium">Inactive</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="school"
                  className="text-sm font-semibold text-slate-700 flex items-center"
                >
                  <School className="h-4 w-4 mr-2 text-orange-500" />
                  School
                </Label>
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger className="h-14 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <School className="h-4 w-4 text-orange-600" />
                      </div>
                      <SelectValue placeholder="All schools" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-orange-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto">
                    <SelectItem
                      value="all"
                      className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <School className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-medium">All Schools</span>
                      </div>
                    </SelectItem>
                    {schools.map((school) => (
                      <SelectItem
                        key={school.id}
                        value={school.id}
                        className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <School className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">
                              {school.name}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {school.city}, {school.state}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-500" />
                  Advanced Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Tag Filter */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="tagFilter"
                      className="text-sm font-semibold text-slate-700 flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-2 text-indigo-500" />
                      Tag Status
                    </Label>
                    <Select value={tagFilter} onValueChange={setTagFilter}>
                      <SelectTrigger className="h-14 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Shield className="h-4 w-4 text-indigo-600" />
                          </div>
                          <SelectValue placeholder="All tag statuses" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-indigo-200 shadow-2xl rounded-xl">
                        <SelectItem
                          value="all"
                          className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-indigo-700">
                                A
                              </span>
                            </div>
                            <span className="font-medium">
                              All Tag Statuses
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="with-tags"
                          className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="font-medium">With Tags</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="without-tags"
                          className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                              <XCircle className="h-3 w-3 text-red-600" />
                            </div>
                            <span className="font-medium">Without Tags</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Route Filter */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="routeFilter"
                      className="text-sm font-semibold text-slate-700 flex items-center"
                    >
                      <Bus className="h-4 w-4 mr-2 text-cyan-500" />
                      Route Assignment
                    </Label>
                    <Select value={routeFilter} onValueChange={setRouteFilter}>
                      <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900">
                        <SelectValue placeholder="All routes" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        <SelectItem value="all">All Routes</SelectItem>
                        <SelectItem value="assigned">
                          Assigned to Route
                        </SelectItem>
                        <SelectItem value="unassigned">Not Assigned</SelectItem>
                        {/* Route options will be populated from API */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="sortBy"
                      className="text-sm font-semibold text-slate-700 flex items-center"
                    >
                      <Activity className="h-4 w-4 mr-2 text-emerald-500" />
                      Sort By
                    </Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-14 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 rounded-xl text-slate-900 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Settings className="h-4 w-4 text-emerald-600" />
                          </div>
                          <SelectValue placeholder="Sort by" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-emerald-200 shadow-2xl rounded-xl">
                        <SelectItem
                          value="name"
                          className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="font-medium">Name</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="grade"
                          className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="font-medium">Grade</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="dateOfBirth"
                          className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Calendar className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="font-medium">Date of Birth</span>
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="createdAt"
                          className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Clock className="h-3 w-3 text-emerald-600" />
                            </div>
                            <span className="font-medium">Enrollment Date</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="sortOrder"
                      className="text-sm font-semibold text-slate-700 flex items-center"
                    >
                      <TrendingUp className="h-4 w-4 mr-2 text-rose-500" />
                      Sort Order
                    </Label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        setSortOrder(value)
                      }
                    >
                      <SelectTrigger className="h-12 border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all duration-300 rounded-xl bg-white/90 backdrop-blur-sm text-slate-900">
                        <SelectValue placeholder="Sort order" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-0 shadow-xl">
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleBulkActivate}
                  disabled={selectedStudents.length === 0}
                  className="border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate Selected
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBulkDeactivate}
                  disabled={selectedStudents.length === 0}
                  className="border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">
              Students List
            </CardTitle>
            <CardDescription>
              Manage student records, attendance, and transportation assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200 bg-slate-50/50">
                    <TableHead className="w-12 p-4">
                      <Checkbox
                        checked={selectedStudents.length === students.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudents(students.map((s) => s.id));
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Student
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Grade & Age
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      School
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Parent
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Tags
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 p-4">
                      Routes
                    </TableHead>
                    <TableHead className="w-12 p-4 text-right font-semibold text-slate-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200 group"
                    >
                      <TableCell className="p-4">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents([
                                ...selectedStudents,
                                student.id,
                              ]);
                            } else {
                              setSelectedStudents(
                                selectedStudents.filter(
                                  (id) => id !== student.id
                                )
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {student.firstName.charAt(0)}
                              {student.lastName.charAt(0)}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                student.isActive
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-slate-500">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <Badge
                            className={`${getGradeColor(
                              student.grade
                            )} font-medium px-3 py-1`}
                          >
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Grade {student.grade}
                            </div>
                          </Badge>
                          <div className="text-sm text-slate-500">
                            Age: {calculateAge(student.dateOfBirth)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-2">
                          <School className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-slate-700">
                            {student.school?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        {student.parent ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">
                              {student.parent.user.firstName}{" "}
                              {student.parent.user.lastName}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Mail className="h-3 w-3" />
                              <span>{student.parent.user.email}</span>
                            </div>
                            {student.parent.user.phone && (
                              <div className="flex items-center space-x-2 text-xs text-slate-500">
                                <Phone className="h-3 w-3" />
                                <span>{student.parent.user.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">
                            No parent assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          {student.rfidTag && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium px-2 py-1 text-xs">
                              RFID: {student.rfidTag}
                            </Badge>
                          )}
                          {student.nfcTag && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 font-medium px-2 py-1 text-xs">
                              NFC: {student.nfcTag}
                            </Badge>
                          )}
                          {!student.rfidTag && !student.nfcTag && (
                            <span className="text-xs text-slate-500">
                              No tags
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={student.isActive ? "default" : "secondary"}
                            className={`font-medium px-3 py-1 ${
                              student.isActive
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            <div className="flex items-center">
                              {student.isActive ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {student.isActive ? "Active" : "Inactive"}
                            </div>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          {student.routes && student.routes.length > 0 ? (
                            student.routes.map((route, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 text-xs"
                              >
                                <Bus className="h-3 w-3 text-blue-500" />
                                <span className="text-slate-700">
                                  {route.name}
                                </span>
                                {route.bus && (
                                  <span className="text-slate-500">
                                    ({route.bus.plateNumber})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">
                              No routes assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-slate-700 font-semibold">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(student)}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleStudentStatus(
                                    student.id,
                                    student.isActive
                                  )
                                }
                                className="cursor-pointer"
                              >
                                {student.isActive ? (
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
                                onClick={() => handleDeleteStudent(student.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => loadStudents(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 px-4 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadStudents(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                >
                  Next
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      <Toast open={isToastVisible} onOpenChange={setIsToastVisible}>
        <ToastProvider>
          <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]" />
          <Toast className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 bg-white p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full">
            <div className="grid gap-1">
              <ToastTitle className="text-sm font-semibold">
                {toastType === "success" ? "Success" : "Error"}
              </ToastTitle>
              <ToastDescription className="text-sm opacity-90">
                {toastMessage}
              </ToastDescription>
            </div>
            {toastType === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
          </Toast>
        </ToastProvider>
      </Toast>
    </div>
  );
}

export default function StudentManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SCHOOL_STAFF"]}>
      <AdminLayout>
        <StudentManagementContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}

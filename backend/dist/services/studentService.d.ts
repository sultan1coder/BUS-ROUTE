export interface CreateStudentData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    grade: string;
    studentId: string;
    rfidTag?: string;
    nfcTag?: string;
    schoolId: string;
    parentId?: string;
    photo?: string;
    medicalInfo?: string;
}
export interface UpdateStudentData {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    grade?: string;
    studentId?: string;
    rfidTag?: string;
    nfcTag?: string;
    parentId?: string;
    photo?: string;
    medicalInfo?: string;
    isActive?: boolean;
}
export interface StudentFilters {
    schoolId?: string;
    grade?: string;
    isActive?: boolean;
    parentId?: string;
    routeId?: string;
}
export interface RFIDAttendanceData {
    rfidTag: string;
    busId: string;
    tripId?: string;
    timestamp?: Date;
    action: "pickup" | "drop";
}
export interface NFCAttendanceData {
    nfcTag: string;
    busId: string;
    tripId?: string;
    timestamp?: Date;
    action: "pickup" | "drop";
}
export declare class StudentService {
    static createStudent(studentData: CreateStudentData): Promise<any>;
    static getStudentById(studentId: string): Promise<any>;
    static updateStudent(studentId: string, updateData: UpdateStudentData): Promise<any>;
    static deleteStudent(studentId: string): Promise<void>;
    static getStudents(filters: StudentFilters, page?: number, limit?: number): Promise<{
        students: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static assignToRoute(studentId: string, routeId: string, stopId: string): Promise<any>;
    static unassignFromRoute(studentId: string, routeId: string): Promise<void>;
    static recordRFIDAttendance(rfidData: RFIDAttendanceData, recordedBy?: string): Promise<any>;
    static recordNFCAttendance(nfcData: NFCAttendanceData, recordedBy?: string): Promise<any>;
    static getStudentAttendance(studentId: string, startDate?: Date, endDate?: Date, page?: number, limit?: number): Promise<{
        attendance: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    static getAttendanceStats(schoolId: string, startDate?: Date, endDate?: Date): Promise<{
        totalStudents: number;
        presentToday: number;
        absentToday: number;
        notRecordedToday: number;
        attendanceRate: number;
    }>;
    static getStudentsWithoutTags(schoolId?: string): Promise<any[]>;
    static bulkAssignTags(assignments: {
        studentId: string;
        rfidTag?: string;
        nfcTag?: string;
    }[]): Promise<any[]>;
    static getStudentManifest(busId: string, tripId?: string): Promise<any[]>;
}
//# sourceMappingURL=studentService.d.ts.map
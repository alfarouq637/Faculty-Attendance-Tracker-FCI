export type UserRole = 'student' | 'lecturer' | 'admin' | 'super_admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string; // Academic ID
  courses?: string[]; // Array of Course IDs
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturerId: string;
  description?: string;
  materialLinks?: ResourceLink[];
}

export interface ResourceLink {
  title: string;
  url: string;
  dateAdded: number;
}

export interface Session {
  id: string;
  courseId: string;
  lecturerId: string;
  startTime: number;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
  radius: number; // in meters
  currentToken: string; // Rotates for QR
}

export interface AttendanceLog {
  id?: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  timestamp: number;
  location: {
    lat: number;
    lng: number;
  };
  verified: boolean;
}


export enum AppView {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  COURSES = 'COURSES',
  CALENDAR = 'CALENDAR', // New Pro Feature
  STATS = 'STATS',       // New Pro Feature
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS',
  AI_ADVISOR = 'AI_ADVISOR'
}

export interface Student {
  id: string;
  name: string;
  age: number;
  avatarColor: string; // Hex code
}

export enum PaymentType {
  PREPAID_AMOUNT = 'PREPAID_AMOUNT', // Stored value (e.g., $1000 balance)
  PREPAID_CLASS = 'PREPAID_CLASS',   // Class count (e.g., 10 classes)
  PAY_PER_CLASS = 'PAY_PER_CLASS'    // Pay as you go
}

export interface Course {
  id: string;
  studentId: string;
  name: string; // e.g., "Piano", "Swimming"
  institution: string; // e.g., "Yamaha Music School"
  paymentType: PaymentType;
  costPerClass: number;
  totalClassesPurchased: number; // For PREPAID_CLASS
  balanceClasses: number; // Remaining classes
  balanceMoney: number; // Remaining money (For PREPAID_AMOUNT)
  color: string;
}

export enum RecordType {
  ATTENDANCE = 'ATTENDANCE', // Class taken
  TOPUP = 'TOPUP',           // Money/Classes added
  REFUND = 'REFUND'
}

export interface Record {
  id: string;
  courseId: string;
  studentId: string;
  type: RecordType;
  amount: number; // Money involved or 0
  classCount: number; // Classes deducted/added
  date: string; // ISO String
  note: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // Simple storage for demo
  isPremium: boolean;
  licenseKey?: string;
  expiryDate?: string;
}

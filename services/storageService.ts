
import { Student, Course, Record, RecordType, PaymentType, UserProfile } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'edutrack_students',
  COURSES: 'edutrack_courses',
  RECORDS: 'edutrack_records',
  USER: 'edutrack_user',
  AUTH_CREDS: 'edutrack_auth',
  LAST_BACKUP: 'edutrack_last_backup'
};

// --- Security & Environment ---

// Helper to safely access environment variables across different build tools (Vite, CRA, Next, etc.)
export const getEnvSafe = (key: string): string | undefined => {
  // 1. Try Vite standard (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env[`VITE_${key}`] || import.meta.env[key];
      if (val) return val;
    }
  } catch (e) {}

  // 2. Try React App / Node standard (process.env)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      const val = process.env[`REACT_APP_${key}`] || process.env[key];
      if (val) return val;
    }
  } catch (e) {}

  return undefined;
};

// Salt for simple checksum generation (Anti-tamper)
// SECURITY UPDATE: Use environment variable so the secret isn't exposed in GitHub code
const SALT = getEnvSafe("LICENSE_SALT") || "DEFAULT_DEV_SALT_DO_NOT_USE_IN_PROD"; 

export const isWeChatBrowser = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
};

export const tryPersistStorage = async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persisted storage granted: ${isPersisted}`);
        return isPersisted;
    }
    return false;
};

export const isStoragePersisted = async (): Promise<boolean> => {
    if (navigator.storage && navigator.storage.persisted) {
        return await navigator.storage.persisted();
    }
    return false;
};

// --- Auth & License ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// Simple checksum algorithm
const generateChecksum = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(4, '0');
};

export const generateLicenseKey = (userEmail: string) => {
    if (!userEmail) return "ERROR-NO-EMAIL";
    
    // Normalize email
    const cleanEmail = userEmail.trim().toLowerCase();

    // Generate a random 8-char string
    const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Calculate checksum based on random part AND specific user email
    // Key = VIP - Random - Checksum(Random + Email + Salt)
    const checksum = generateChecksum(randomPart + cleanEmail + SALT);
    
    // Combine
    return `VIP-${randomPart}-${checksum}`;
};

export const registerUser = (name: string, email: string, password: string): boolean => {
    const cleanEmail = email.trim().toLowerCase(); // Normalize to lowercase
    const existing = localStorage.getItem(STORAGE_KEYS.AUTH_CREDS);
    if (existing) {
        const users = JSON.parse(existing);
        if (users[cleanEmail]) return false; // Already exists
        users[cleanEmail] = { name, password, isPremium: false }; // Default free
        localStorage.setItem(STORAGE_KEYS.AUTH_CREDS, JSON.stringify(users));
    } else {
        localStorage.setItem(STORAGE_KEYS.AUTH_CREDS, JSON.stringify({
            [cleanEmail]: { name, password, isPremium: false }
        }));
    }
    return true;
};

export const loginUser = (email: string, password: string): UserProfile | null => {
    const cleanEmail = email.trim().toLowerCase(); // Normalize to lowercase
    const existing = localStorage.getItem(STORAGE_KEYS.AUTH_CREDS);
    if (!existing) return null;
    
    const users = JSON.parse(existing);
    const user = users[cleanEmail];
    
    if (user && user.password === password) {
        // Create session user profile
        const profile: UserProfile = {
            name: user.name,
            email: cleanEmail,
            isPremium: user.isPremium,
            licenseKey: user.licenseKey
        };
        saveUserProfile(profile);
        
        // Attempt to make storage persistent on login
        tryPersistStorage();
        
        return profile;
    }
    return null;
};

export const validateLicense = (key: string, userEmail: string): boolean => {
    const normalizedKey = key.trim().toUpperCase();
    const cleanEmail = userEmail.trim().toLowerCase();
    
    // 1. Backdoor for Demo/Admin
    if (normalizedKey === 'VIP-DEMO-8888') {
        activatePremium(normalizedKey);
        return true;
    }

    // 2. Standard Validation
    // Format: VIP-RANDOM-CHECKSUM
    const parts = normalizedKey.split('-');
    if (parts.length !== 3 || parts[0] !== 'VIP') return false;
    
    const randomPart = parts[1];
    const providedChecksum = parts[2];
    
    // Re-calculate checksum using the hidden SALT AND the current user's email
    // This ensures the key only works for THIS specific email
    const calculatedChecksum = generateChecksum(randomPart + cleanEmail + SALT);
    
    const isValid = (providedChecksum === calculatedChecksum);
    
    if (isValid) {
        activatePremium(normalizedKey);
    }
    return isValid;
};

const activatePremium = (key: string) => {
    const user = getUserProfile();
    if (user) {
        user.isPremium = true;
        user.licenseKey = key;
        saveUserProfile(user);

        const existing = localStorage.getItem(STORAGE_KEYS.AUTH_CREDS);
        if (existing) {
            const users = JSON.parse(existing);
            if (users[user.email]) {
                users[user.email].isPremium = true;
                users[user.email].licenseKey = key;
                localStorage.setItem(STORAGE_KEYS.AUTH_CREDS, JSON.stringify(users));
            }
        }
    }
};

// --- Students ---
export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (student: Omit<Student, 'id'> & { id?: string }) => {
  const students = getStudents();
  if (student.id) {
    const index = students.findIndex(s => s.id === student.id);
    if (index !== -1) students[index] = student as Student;
  } else {
    students.push({ ...student, id: generateId() } as Student);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const deleteStudent = (id: string) => {
  // 1. Delete all courses associated with this student
  const courses = getCourses().filter(c => c.studentId === id);
  courses.forEach(c => deleteCourse(c.id));

  // 2. Cleanup any stray records
  let records = getRecords();
  records = records.filter(r => r.studentId !== id);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));

  // 3. Delete the student
  const students = getStudents().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

// --- Courses ---
export const getCourses = (): Course[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  return data ? JSON.parse(data) : [];
};

export const saveCourse = (course: Omit<Course, 'id'> & { id?: string }) => {
  const courses = getCourses();
  // Ensure numbers are numbers
  course.costPerClass = Number(course.costPerClass);
  course.totalClassesPurchased = Number(course.totalClassesPurchased);
  course.balanceClasses = Number(course.balanceClasses);
  course.balanceMoney = Number(course.balanceMoney);

  if (course.id) {
    const index = courses.findIndex(c => c.id === course.id);
    if (index !== -1) courses[index] = course as Course;
  } else {
    courses.push({ ...course, id: generateId() } as Course);
  }
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
};

export const deleteCourse = (id: string) => {
  // 1. Delete all records associated with this course
  let records = getRecords();
  records = records.filter(r => r.courseId !== id);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));

  // 2. Delete the course
  const courses = getCourses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
};

// --- Records & Transactions ---
export const getRecords = (): Record[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
};

export const addRecord = (record: Omit<Record, 'id'>) => {
  const records = getRecords();
  const courses = getCourses();
  const courseIndex = courses.findIndex(c => c.id === record.courseId);

  if (courseIndex === -1) throw new Error("Course not found");

  const course = courses[courseIndex];
  const newRecord = { ...record, id: generateId(), date: record.date || new Date().toISOString() };

  // Parse inputs safely
  const countInput = Math.max(0, Number(record.classCount) || 0);
  const moneyInput = Math.max(0, Number(record.amount) || 0); // Usually amount user typed
  const costPerClass = Number(course.costPerClass) || 0;

  if (record.type === RecordType.ATTENDANCE) {
    // --- ATTENDANCE (消课/打卡) ---
    
    if (course.paymentType === PaymentType.PREPAID_CLASS) {
        // 按课时包：
        // 1. 扣减剩余课时
        const currentClasses = Number(course.balanceClasses) || 0;
        course.balanceClasses = Math.max(0, currentClasses - countInput);
        
        // 2. 记录：amount 为“消耗的价值”(Estimated Value)，方便统计花了多少钱的课
        newRecord.classCount = countInput;
        newRecord.amount = countInput * costPerClass; 

    } else if (course.paymentType === PaymentType.PREPAID_AMOUNT) {
        // 按余额包：
        // 1. 扣减余额
        const currentMoney = Number(course.balanceMoney) || 0;
        
        // 如果用户输入了特定扣款金额，用输入的；否则自动计算
        const deductAmount = moneyInput > 0 ? moneyInput : (countInput * costPerClass);
        
        course.balanceMoney = Math.max(0, currentMoney - deductAmount);
        
        // 2. 记录
        newRecord.classCount = countInput;
        newRecord.amount = deductAmount; // 实际扣除的金额

    } else {
        // 按次付 (Pay Per Class)：
        // 1. 不扣余额
        // 2. 记录家长实际支付的金额
        const payAmount = moneyInput > 0 ? moneyInput : (countInput * costPerClass);
        newRecord.classCount = countInput;
        newRecord.amount = payAmount;
    }

  } else if (record.type === RecordType.TOPUP) {
    // --- TOPUP (充值/续费) ---
    
    if (course.paymentType === PaymentType.PREPAID_CLASS) {
        // 买课时包：
        course.balanceClasses = Number(course.balanceClasses) + countInput;
        course.totalClassesPurchased = Number(course.totalClassesPurchased) + countInput;
        newRecord.classCount = countInput;
        newRecord.amount = moneyInput;

    } else if (course.paymentType === PaymentType.PREPAID_AMOUNT) {
        // 充值余额：
        course.balanceMoney = Number(course.balanceMoney) + moneyInput;
        newRecord.classCount = 0;
        newRecord.amount = moneyInput;
    } else {
        course.balanceMoney = Number(course.balanceMoney) + moneyInput;
        newRecord.amount = moneyInput;
    }
  }

  // Save updates
  courses[courseIndex] = course;
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));

  records.unshift(newRecord as Record);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
};

// --- User & Backup ---

export const getUserProfile = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUserProfile = (user: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.COURSES);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  // We do NOT clear auth credentials so users can log back in
};

export const getLastBackupDate = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
};

export const exportBackupData = (): string => {
  const backup = {
    version: 1,
    timestamp: new Date().toISOString(),
    students: getStudents(),
    courses: getCourses(),
    records: getRecords(),
    user: getUserProfile()
  };
  localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
  return JSON.stringify(backup, null, 2);
};

export const importBackupData = (jsonString: string): boolean => {
  try {
    const backup = JSON.parse(jsonString);
    if (!Array.isArray(backup.students) || !Array.isArray(backup.courses)) {
      throw new Error("Invalid backup format");
    }

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(backup.students));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(backup.courses));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(backup.records || []));
    if (backup.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(backup.user));
    }
    // Update last backup to now since we just restored fresh data
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
    
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const seedData = () => {
  if (getStudents().length === 0) {
    const sId = generateId();
    const cId1 = generateId();
    const cId2 = generateId();

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([
      { id: sId, name: '乐乐', age: 8, avatarColor: '#3b82f6' }
    ]));

    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([
      { 
        id: cId1, studentId: sId, name: '钢琴课', institution: '星海音乐中心', 
        paymentType: PaymentType.PREPAID_CLASS, costPerClass: 200, 
        totalClassesPurchased: 40, balanceClasses: 12, balanceMoney: 0, color: '#8b5cf6' 
      },
      { 
        id: cId2, studentId: sId, name: '游泳私教', institution: '蓝波游泳馆', 
        paymentType: PaymentType.PREPAID_AMOUNT, costPerClass: 180, 
        totalClassesPurchased: 0, balanceClasses: 0, balanceMoney: 3500, color: '#06b6d4' 
      }
    ]));
  }
};


import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  History, 
  Settings, 
  BrainCircuit, 
  Plus, 
  Calendar as CalendarIcon,
  Check,
  X,
  Trash2,
  LogOut,
  Menu,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Edit2,
  Download,
  Upload,
  Save,
  AlertTriangle,
  Lock,
  PieChart,
  Crown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Wallet,
  Copy,
  ShieldCheck,
  ShieldAlert,
  Key,
  EyeOff
} from 'lucide-react';
import { 
  AppView, 
  Student, 
  Course, 
  Record, 
  PaymentType, 
  RecordType, 
  UserProfile 
} from './types';
import * as DB from './services/storageService';
import * as AI from './services/aiService';

// --- Components ---

const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  disabled = false,
  fullWidth = false
}: { 
  children: React.ReactNode; 
  onClick?: (e?: React.MouseEvent) => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'premium'; 
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "hover:bg-slate-100 text-slate-600",
    premium: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200 hover:brightness-110"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className} ${fullWidth ? 'w-full' : ''}`}>
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const FeatureLockOverlay = ({ onUnlock }: { onUnlock: () => void }) => (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl border-2 border-dashed border-slate-200">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
            <Lock size={24} />
        </div>
        <h3 className="font-bold text-slate-800 mb-1">专业版功能</h3>
        <p className="text-xs text-slate-500 mb-4 text-center max-w-[200px]">
            请升级到专业版以解锁图表分析、日历视图及更多高级功能。
        </p>
        <Button variant="premium" onClick={onUnlock}>
            <Crown size={16} /> 立即解锁
        </Button>
    </div>
);

const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  let currentAngle = 0;
  
  if (total === 0) return (
    <div className="w-48 h-48 rounded-full border-4 border-slate-100 flex items-center justify-center text-slate-400 text-xs mx-auto">
      暂无数据
    </div>
  );

  return (
    <div className="flex items-center gap-8 justify-center flex-wrap">
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((item, i) => {
            const angle = (item.value / total) * 360;
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
            const strokeDashoffset = -((currentAngle / 360) * circumference);
            
            currentAngle += angle;
            
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{item.label}: ¥{item.value}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-xs text-slate-500">总支出</span>
           <span className="font-bold text-lg text-slate-800">¥{total.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-2 min-w-[140px]">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
            <span className="text-slate-600 font-medium truncate max-w-[80px]">{item.label}</span>
            <span className="text-slate-400 text-xs ml-auto">¥{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Environment State
  const [isWeChat, setIsWeChat] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Modal States
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [isRecordModalOpen, setRecordModalOpen] = useState(false);
  const [isLicenseModalOpen, setLicenseModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
      isOpen: boolean;
      type: 'student' | 'course';
      id: string;
      name: string;
  }>({ isOpen: false, type: 'student', id: '', name: '' });

  // WeChat Backup Modal State
  const [weChatBackupModal, setWeChatBackupModal] = useState({ isOpen: false, data: '' });
  
  // Calendar State
  const today = new Date();
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Form States
  const [formData, setFormData] = useState<any>({});
  const [licenseKey, setLicenseKey] = useState('');
  
  // Admin / Agent Tools State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(''); 
  const [customerEmail, setCustomerEmail] = useState(''); 

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Settings State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  useEffect(() => {
    // Initialize
    DB.seedData();
    setIsWeChat(DB.isWeChatBrowser());
    
    // Check Login
    const savedUser = DB.getUserProfile();
    if (savedUser) {
        setUser(savedUser);
        setProfileForm(savedUser);
        refreshData();
        // Check persistence
        DB.isStoragePersisted().then(setIsPersisted);
    }
  }, []);

  const refreshData = () => {
    setStudents(DB.getStudents());
    setCourses(DB.getCourses());
    setRecords(DB.getRecords());
    const u = DB.getUserProfile();
    if(u) {
        setUser(u);
        setProfileForm(u);
    }
    setLastBackupDate(DB.getLastBackupDate());
  };

  // --- Auth ---

  const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      
      if (authMode === 'register') {
          if(!authForm.name || !authForm.email || !authForm.password) return setAuthError("请填写所有字段");
          const success = DB.registerUser(authForm.name, authForm.email, authForm.password);
          if(success) {
              alert("注册成功！请登录");
              setAuthMode('login');
          } else {
              setAuthError("该邮箱已被注册");
          }
      } else {
          if(!authForm.email || !authForm.password) return setAuthError("请输入邮箱和密码");
          const loggedInUser = DB.loginUser(authForm.email, authForm.password);
          if(loggedInUser) {
              setUser(loggedInUser);
              setProfileForm(loggedInUser);
              refreshData();
          } else {
              setAuthError("账号或密码错误");
          }
      }
  };

  const handleLogoutRequest = () => {
    setLogoutModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = () => {
      DB.logoutUser();
      setUser(null);
      setAuthForm({ name: '', email: '', password: '' });
      setIsAdminMode(false);
      setLogoutModalOpen(false);
  };

  const handleActivateLicense = () => {
      if(!user) return;
      const success = DB.validateLicense(licenseKey, user.email);
      if (success) {
          alert("恭喜！专业版功能已解锁。");
          setLicenseModalOpen(false);
          refreshData();
      } else {
          alert("激活失败！\n\n可能原因：\n1. 激活码输入错误\n2. 该激活码绑定的邮箱与您当前登录的邮箱不一致\n\n请联系代理商确认绑定的账号。");
      }
  };

  const handleGenerateKey = () => {
      if(!customerEmail) return alert("请输入客户邮箱");
      const key = DB.generateLicenseKey(customerEmail);
      setGeneratedKey(key);
  };
  
  const handleAdminAccess = () => {
      if (isAdminMode) {
          setIsAdminMode(false);
          return;
      }
      const password = prompt("请输入管理员访问密码:");
      
      // SECURITY: Use safe env helper
      const targetPassword = DB.getEnvSafe("ADMIN_PASSWORD");

      if (targetPassword && password === targetPassword) {
          setIsAdminMode(true);
          alert("已进入代理商管理模式");
      } else if (password) {
          alert("密码错误或未配置管理员密码");
      }
  };

  // --- Data Actions ---
  
  const handleExportData = () => {
      if (!user?.isPremium) {
          setLicenseModalOpen(true);
          return;
      }

      const dataStr = DB.exportBackupData();
      refreshData(); // Update last backup date UI

      // SPECIAL HANDLING FOR WECHAT
      if (isWeChat) {
          setWeChatBackupModal({ isOpen: true, data: dataStr });
          return;
      }

      // Standard Download
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `EduTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const handleCopyBackup = () => {
      navigator.clipboard.writeText(weChatBackupModal.data).then(() => {
          alert("数据已复制！请立即打开微信‘文件传输助手’并粘贴发送。");
      }).catch(() => {
          alert("复制失败，请手动全选复制文本框内容。");
      });
  };

  const handleImportClick = () => {
      if (!user?.isPremium) {
          setLicenseModalOpen(true);
          return;
      }
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target?.result as string;
          if (confirm("警告：导入备份将覆盖当前所有数据。确定要继续吗？")) {
              const success = DB.importBackupData(content);
              if (success) {
                  alert("数据恢复成功！");
                  refreshData();
                  if (fileInputRef.current) fileInputRef.current.value = "";
              } else {
                  alert("数据恢复失败：文件格式不正确。");
              }
          }
      };
      reader.readAsText(fileObj);
  };

  const handleResetApp = () => {
      const answer = prompt("危险操作：这将清除所有数据。此操作不可撤销！\n\n请输入 'DELETE' 确认：");
      if(answer === 'DELETE') { 
          DB.clearAllData();
          refreshData();
          alert("数据已重置");
      }
  };

  const handleUpdateProfile = () => {
      if(profileForm) {
          DB.saveUserProfile(profileForm);
          setUser(profileForm);
          setEditProfileMode(false);
          alert("个人资料已更新");
      }
  };

  // --- Entity Actions ---
  const handleSaveStudent = () => {
    if (!user?.isPremium && students.length >= 1 && !formData.id) {
        setStudentModalOpen(false);
        setLicenseModalOpen(true);
        return; // Free limit
    }
    if (!formData.name) return alert("请输入学生姓名");
    DB.saveStudent(formData);
    setStudentModalOpen(false);
    refreshData();
  };

  const handleDeleteStudent = (student: Student) => {
      setDeleteModal({
          isOpen: true,
          type: 'student',
          id: student.id,
          name: student.name
      });
  };

  const handleEditStudent = (student: Student) => {
    setFormData({ ...student });
    setStudentModalOpen(true);
  };

  const handleSaveCourse = () => {
    if (!formData.studentId || !formData.name) return alert("请完善课程信息");
    DB.saveCourse(formData);
    setCourseModalOpen(false);
    refreshData();
  };

  const handleDeleteCourse = (course: Course) => {
      setDeleteModal({
          isOpen: true,
          type: 'course',
          id: course.id,
          name: course.name
      });
  };

  const executeDelete = () => {
      if (deleteModal.type === 'student') {
          DB.deleteStudent(deleteModal.id);
      } else {
          DB.deleteCourse(deleteModal.id);
      }
      setDeleteModal({ ...deleteModal, isOpen: false });
      refreshData();
  };

  const handleEditCourse = (course: Course) => {
    setFormData({ ...course });
    setCourseModalOpen(true);
  };

  const handleSaveRecord = () => {
      if (!formData.courseId) return alert("请选择课程");
      
      // Validation
      if (formData.type === RecordType.ATTENDANCE) {
         if (!formData.classCount || Number(formData.classCount) <= 0) {
             return alert("请输入有效的课时数");
         }
      } else if (formData.type === RecordType.TOPUP) {
          if (!formData.amount || Number(formData.amount) <= 0) {
              return alert("请输入充值金额");
          }
      }
      
      DB.addRecord({
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0],
      });
      setRecordModalOpen(false);
      refreshData();
  };
  
  const openRecordModal = (type: RecordType) => {
      setFormData({
          type: type,
          date: new Date().toISOString().split('T')[0],
          classCount: type === RecordType.ATTENDANCE ? 1 : 0,
          amount: 0,
          courseId: courses.length > 0 ? courses[0].id : ''
      });
      setRecordModalOpen(true);
  };

  const runAIAnalysis = async () => {
    if (!user?.isPremium) {
        setLicenseModalOpen(true);
        return;
    }
    setIsAnalyzing(true);
    const result = await AI.analyzeEducationData(students, courses, records);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };
  
  const selectedCourseForRecord = courses.find(c => c.id === formData.courseId);

  const handleClassCountChange = (val: string) => {
      const count = Number(val);
      const updates: any = { classCount: val };
      
      if (formData.type === RecordType.ATTENDANCE && 
          selectedCourseForRecord?.paymentType === PaymentType.PREPAID_AMOUNT) {
             updates.amount = count * (Number(selectedCourseForRecord.costPerClass) || 0);
      }
      setFormData({ ...formData, ...updates });
  };

  // --- Render Views ---

  const renderLogin = () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl text-white mb-4 shadow-lg shadow-primary-200">
                <BookOpen size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">课外班小管家</h1>
            <p className="text-slate-500 mt-2">专业家庭教育投资管理系统</p>
        </div>

        <Card className="p-8">
            <div className="flex border-b border-slate-100 mb-6">
                <button 
                    onClick={() => setAuthMode('login')} 
                    className={`flex-1 pb-3 font-medium text-sm ${authMode === 'login' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}
                >
                    登录账号
                </button>
                <button 
                    onClick={() => setAuthMode('register')} 
                    className={`flex-1 pb-3 font-medium text-sm ${authMode === 'register' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}
                >
                    注册新用户
                </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'register' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">家长称呼</label>
                        <input 
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="例如：乐乐妈妈"
                            value={authForm.name}
                            onChange={e => setAuthForm({...authForm, name: e.target.value})}
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">电子邮箱</label>
                    <input 
                        type="email"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="用于找回密码"
                        value={authForm.email}
                        onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">登录密码</label>
                    <input 
                        type="password"
                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="6位以上字符"
                        value={authForm.password}
                        onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    />
                </div>

                {authError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {authError}</div>}

                <Button fullWidth className="py-3 text-base shadow-xl shadow-primary-200/50">
                    {authMode === 'login' ? '立即登录' : '注册账号'}
                </Button>
            </form>
        </Card>
        <p className="text-center text-slate-400 text-sm mt-8">© 2024 EduTrack Pro. All rights reserved.</p>
      </div>
    </div>
  );

  const SidebarItem = ({ icon: Icon, label, active, onClick, lock = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 relative overflow-hidden
        ${active 
          ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm ring-1 ring-primary-200' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon size={20} className={active ? 'text-primary-600' : 'text-slate-400'} />
      <span>{label}</span>
      {lock && !user?.isPremium && <Lock size={14} className="ml-auto text-amber-500" />}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full" />}
    </button>
  );

  if (!user) return renderLogin();

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans">
      {/* WeChat Warning Banner */}
      {isWeChat && (
          <div className="fixed top-0 left-0 right-0 bg-red-500 text-white z-[100] px-4 py-3 text-sm flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="shrink-0"/>
                  <span>
                      <strong>警告：</strong> 检测到微信环境。<strong>清理微信缓存会删除所有数据！</strong>
                  </span>
              </div>
              <button className="bg-white/20 px-3 py-1 rounded text-xs hover:bg-white/30 whitespace-nowrap ml-2">
                  请点右上角在浏览器打开
              </button>
          </div>
      )}

      {/* WeChat Backup Modal */}
      <Modal 
        isOpen={weChatBackupModal.isOpen} 
        onClose={() => setWeChatBackupModal({isOpen: false, data: ''})}
        title="微信数据备份"
      >
          <div className="space-y-4">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
                  <div>
                      由于微信限制文件下载，请复制下方代码，并发送给<strong>“文件传输助手”</strong>或保存到手机备忘录。
                  </div>
              </div>
              <textarea 
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all outline-none focus:ring-2 focus:ring-primary-500"
                  readOnly
                  value={weChatBackupModal.data}
                  onClick={(e) => e.currentTarget.select()}
              />
              <Button fullWidth onClick={handleCopyBackup} className="py-3">
                  <Copy size={18} /> 一键复制备份代码
              </Button>
              <p className="text-center text-xs text-slate-400">
                  恢复数据时，点击“恢复数据”并粘贴此代码即可（或选择保存的json文件）。
              </p>
          </div>
      </Modal>

      {/* Logout Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="退出登录"
      >
          <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <LogOut size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-800">
                  确定要退出当前账号吗？
              </h4>
              <p className="text-sm text-slate-500">
                  退出后需要重新登录才能查看数据。
              </p>
              <div className="flex gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setLogoutModalOpen(false)} fullWidth>取消</Button>
                  <Button variant="danger" onClick={handleLogoutConfirm} fullWidth>确认退出</Button>
              </div>
          </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        title={`删除${deleteModal.type === 'student' ? '学生' : '课程'}`}
      >
          <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle size={32} />
              </div>
              <h4 className="text-lg font-medium text-slate-800">
                  确定要删除 "{deleteModal.name}" 吗？
              </h4>
              <p className="text-sm text-slate-500">
                  {deleteModal.type === 'student' 
                      ? "这将同时删除该学生的所有课程和上课记录，且无法恢复。"
                      : "这将删除该课程的所有上课记录和缴费记录，且无法恢复。"}
              </p>
              <div className="flex gap-3 pt-4">
                  <Button variant="secondary" onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} fullWidth>取消</Button>
                  <Button variant="danger" onClick={executeDelete} fullWidth>确认删除</Button>
              </div>
          </div>
      </Modal>

      {/* License Modal */}
      <Modal isOpen={isLicenseModalOpen} onClose={() => setLicenseModalOpen(false)} title="升级到专业版">
          <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-200">
                  <Crown size={32} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-800">解锁全部高级功能</h3>
                  <p className="text-sm text-slate-500 mt-1">仅需一次性付费，永久使用</p>
              </div>
              <div className="text-left space-y-3 bg-slate-50 p-4 rounded-xl">
                  {[
                      "无限学生管理 (免费版限1人)",
                      "可视化图表分析支出",
                      "月度课程日历视图",
                      "AI 教育顾问智能分析",
                      "数据云备份与恢复"
                  ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <Check size={16} className="text-green-500" /> {feat}
                      </div>
                  ))}
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 text-left">输入激活码 (License Key)</label>
                  <div className="flex gap-2">
                      <input 
                          className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                          placeholder="VIP-XXXXXXXX"
                          value={licenseKey}
                          onChange={e => setLicenseKey(e.target.value)}
                      />
                      <Button variant="premium" onClick={handleActivateLicense}>激活</Button>
                  </div>
              </div>
          </div>
      </Modal>

      {/* Student Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setStudentModalOpen(false)} title={formData.id ? "编辑学生" : "添加新学生"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">学生姓名</label>
            <input 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">年龄</label>
            <input 
              type="number" 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
            />
          </div>
          <Button fullWidth onClick={handleSaveStudent}>保存</Button>
        </div>
      </Modal>

      {/* Course Modal */}
      {isCourseModalOpen && (
          <Modal 
            isOpen={isCourseModalOpen} 
            onClose={() => setCourseModalOpen(false)} 
            title={formData.id ? "编辑课程" : "添加新课程"}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">关联学生</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.studentId}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">请选择学生</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">课程名称</label>
                      <input 
                          className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="例如：钢琴"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">机构名称</label>
                      <input 
                          className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="例如：少年宫"
                          value={formData.institution}
                          onChange={e => setFormData({ ...formData, institution: e.target.value })}
                      />
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">付费模式</label>
                  <div className="grid grid-cols-3 gap-2">
                      {[
                          { id: PaymentType.PREPAID_CLASS, label: '按课时包', desc: '先买课，上一次扣一次' },
                          { id: PaymentType.PREPAID_AMOUNT, label: '充值余额', desc: '卡里充钱，按次扣费' },
                          { id: PaymentType.PAY_PER_CLASS, label: '按次结', desc: '上一节付一节' }
                      ].map(type => (
                          <button
                              key={type.id}
                              onClick={() => setFormData({ ...formData, paymentType: type.id })}
                              className={`p-2 rounded-lg text-xs border text-left transition-all
                                  ${formData.paymentType === type.id 
                                      ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500' 
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                          >
                              <div className="font-bold mb-1">{type.label}</div>
                              <div className="scale-90 origin-left opacity-80">{type.desc}</div>
                          </button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">单价 (元/节)</label>
                      <input 
                          type="number"
                          className="w-full p-3 border border-slate-200 rounded-xl"
                          value={formData.costPerClass}
                          onChange={e => setFormData({ ...formData, costPerClass: Number(e.target.value) })}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">代表色</label>
                      <input 
                          type="color"
                          className="w-full h-[50px] p-1 border border-slate-200 rounded-xl cursor-pointer"
                          value={formData.color || '#3b82f6'}
                          onChange={e => setFormData({ ...formData, color: e.target.value })}
                      />
                  </div>
              </div>

              {formData.paymentType === PaymentType.PREPAID_CLASS && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">初始数据</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">总购买课时</label>
                              <input 
                                  type="number"
                                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                  value={formData.totalClassesPurchased}
                                  onChange={e => setFormData({ ...formData, totalClassesPurchased: Number(e.target.value) })}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">剩余课时</label>
                              <input 
                                  type="number"
                                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                  value={formData.balanceClasses}
                                  onChange={e => setFormData({ ...formData, balanceClasses: Number(e.target.value) })}
                              />
                          </div>
                      </div>
                  </div>
              )}

              {formData.paymentType === PaymentType.PREPAID_AMOUNT && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">初始数据</h4>
                      <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">当前余额 (元)</label>
                          <input 
                              type="number"
                              className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                              value={formData.balanceMoney}
                              onChange={e => setFormData({ ...formData, balanceMoney: Number(e.target.value) })}
                          />
                      </div>
                  </div>
              )}

              <Button fullWidth onClick={handleSaveCourse}>保存课程</Button>
            </div>
          </Modal>
      )}
      
      {/* Record Modal */}
      <Modal 
        isOpen={isRecordModalOpen} 
        onClose={() => setRecordModalOpen(false)} 
        title={formData.type === RecordType.ATTENDANCE ? "上课打卡 (消课)" : "充值 / 续费"}
      >
        <div className="space-y-5">
          <div className="flex gap-3 bg-slate-50 p-1 rounded-xl">
               <button 
                  onClick={() => { setFormData({...formData, type: RecordType.ATTENDANCE}); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.type === RecordType.ATTENDANCE ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Check size={16} /> 上课打卡
               </button>
               <button 
                  onClick={() => { setFormData({...formData, type: RecordType.TOPUP, classCount: 0, amount: 0}); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.type === RecordType.TOPUP ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Wallet size={16} /> 充值续费
               </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">选择课程</label>
            <select 
              className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.courseId}
              onChange={e => setFormData({ ...formData, courseId: e.target.value, amount: 0, classCount: formData.type === RecordType.ATTENDANCE ? 1 : 0 })} 
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.institution} ({
                    c.paymentType === PaymentType.PREPAID_CLASS ? '按课时' : 
                    c.paymentType === PaymentType.PREPAID_AMOUNT ? '按余额' : '按次付'
                })</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
            <input 
              type="date" 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          {formData.type === RecordType.ATTENDANCE && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">本次消耗课时 (节)</label>
                      <div className="flex items-center gap-4">
                          <button onClick={() => handleClassCountChange(Math.max(1, Number(formData.classCount) - 1).toString())} className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-lg font-medium">-</button>
                          <input 
                              type="number" 
                              className="flex-1 p-3 text-center font-bold border border-slate-200 rounded-xl outline-none text-lg"
                              value={formData.classCount}
                              onChange={e => handleClassCountChange(e.target.value)}
                          />
                          <button onClick={() => handleClassCountChange((Number(formData.classCount) + 1).toString())} className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-lg font-medium">+</button>
                      </div>
                  </div>

                  {selectedCourseForRecord?.paymentType === PaymentType.PREPAID_AMOUNT && (
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">本次扣费金额 (元)</label>
                          <input 
                              type="number"
                              className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-bold"
                              value={formData.amount}
                              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                          />
                          <p className="text-xs text-slate-500 mt-1">
                              单价参考: ¥{selectedCourseForRecord.costPerClass}/节 × {formData.classCount}节 = ¥{Number(formData.classCount) * Number(selectedCourseForRecord.costPerClass)}
                          </p>
                      </div>
                  )}

                   {selectedCourseForRecord?.paymentType === PaymentType.PREPAID_CLASS && (
                       <div className="flex justify-between text-sm text-slate-500 pt-2 border-t border-blue-100">
                           <span>消耗价值 (统计用):</span>
                           <span className="font-medium">¥{Number(formData.classCount) * Number(selectedCourseForRecord.costPerClass)}</span>
                       </div>
                   )}
                   
                   {selectedCourseForRecord?.paymentType === PaymentType.PAY_PER_CLASS && (
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">本次实付金额 (元)</label>
                          <input 
                              type="number"
                              className="w-full p-3 border border-slate-200 rounded-xl"
                              value={formData.amount}
                              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                              placeholder={`单价: ${selectedCourseForRecord.costPerClass}`}
                          />
                      </div>
                   )}
              </div>
          )}

          {formData.type === RecordType.TOPUP && (
              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                  {selectedCourseForRecord?.paymentType === PaymentType.PREPAID_CLASS ? (
                      <>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">购买课时 (节)</label>
                                  <input 
                                      type="number"
                                      className="w-full p-3 border border-slate-200 rounded-xl"
                                      placeholder="0"
                                      value={formData.classCount || ''}
                                      onChange={e => setFormData({ ...formData, classCount: Number(e.target.value) })}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">支付金额 (元)</label>
                                  <input 
                                      type="number"
                                      className="w-full p-3 border border-slate-200 rounded-xl"
                                      placeholder="0"
                                      value={formData.amount || ''}
                                      onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                  />
                              </div>
                          </div>
                          <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
                              提示：充值后，剩余课时将增加，金额将计入总支出统计。
                          </p>
                      </>
                  ) : (
                      <>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">充值金额 (元)</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-3.5 text-slate-400">¥</span>
                                  <input 
                                      type="number"
                                      className="w-full pl-8 p-3 border border-slate-200 rounded-xl text-lg font-bold text-green-700"
                                      value={formData.amount || ''}
                                      placeholder="0.00"
                                      onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                  />
                              </div>
                          </div>
                          <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
                              提示：充值后，账户余额将增加。
                          </p>
                      </>
                  )}
              </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <input 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.note || ''}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="例如：双11活动充值 / 请假补课"
            />
          </div>

          <Button fullWidth onClick={handleSaveRecord} className="py-3">
              <Save size={18} /> 确认提交
          </Button>
        </div>
      </Modal>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isWeChat ? 'top-[50px]' : ''}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <BookOpen size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">EduTrack</span>
        </div>

        <div className="px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="总览" active={view === AppView.DASHBOARD} onClick={() => { setView(AppView.DASHBOARD); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={Users} label="学员管理" active={view === AppView.STUDENTS} onClick={() => { setView(AppView.STUDENTS); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={BookOpen} label="课程管理" active={view === AppView.COURSES} onClick={() => { setView(AppView.COURSES); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={CalendarIcon} label="课程日历" active={view === AppView.CALENDAR} lock onClick={() => { setView(AppView.CALENDAR); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={PieChart} label="统计分析" active={view === AppView.STATS} lock onClick={() => { setView(AppView.STATS); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={History} label="变动记录" active={view === AppView.LOGS} onClick={() => { setView(AppView.LOGS); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={BrainCircuit} label="AI 顾问" active={view === AppView.AI_ADVISOR} lock onClick={() => { setView(AppView.AI_ADVISOR); setIsMobileMenuOpen(false); }} />
          <SidebarItem icon={Settings} label="系统设置" active={view === AppView.SETTINGS} onClick={() => { setView(AppView.SETTINGS); setIsMobileMenuOpen(false); }} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50/50 pb-8">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                        {user.isPremium ? <span className="text-amber-500 flex items-center gap-0.5"><Crown size={10}/> 专业版</span> : "免费版"}
                    </div>
                </div>
            </div>
            <button onClick={handleLogoutRequest} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={14} /> 退出登录
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-screen overflow-hidden ${isWeChat ? 'pt-[50px]' : ''}`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm lg:shadow-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {view === AppView.DASHBOARD && "仪表盘"}
              {view === AppView.STUDENTS && "学员列表"}
              {view === AppView.COURSES && "课程管理"}
              {view === AppView.CALENDAR && "课程日历"}
              {view === AppView.STATS && "统计分析"}
              {view === AppView.LOGS && "变动记录"}
              {view === AppView.SETTINGS && "系统设置"}
              {view === AppView.AI_ADVISOR && "AI 教育顾问"}
            </h2>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => openRecordModal(RecordType.ATTENDANCE)}>
              <Check size={18} /> <span className="hidden md:inline">快速打卡</span>
            </Button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          
          {/* DASHBOARD */}
          {view === AppView.DASHBOARD && (
            <div className="space-y-8 max-w-6xl mx-auto">
              
              {/* Data Safety Alert Card (Shows if backup needed) */}
              {(!lastBackupDate || (new Date().getTime() - new Date(lastBackupDate).getTime()) > 7 * 24 * 60 * 60 * 1000) && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                              <ShieldAlert size={20} />
                          </div>
                          <div>
                              <h4 className="font-bold text-orange-800">数据安全提醒</h4>
                              <p className="text-sm text-orange-700">
                                  您已超过 7 天未备份数据。{isWeChat ? '微信清理缓存会删除数据' : '建议定期备份'}，以防丢失。
                              </p>
                          </div>
                      </div>
                      <Button variant="outline" className="text-orange-700 border-orange-200 hover:bg-orange-100" onClick={() => setView(AppView.SETTINGS)}>
                          去备份
                      </Button>
                  </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <div className="text-slate-500 text-sm mb-1">总课程数</div>
                  <div className="text-2xl font-bold text-slate-800">{courses.length}</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-green-500">
                  <div className="text-slate-500 text-sm mb-1">本月上课</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {records.filter(r => r.type === RecordType.ATTENDANCE && r.date.startsWith(new Date().toISOString().slice(0, 7))).length}
                    <span className="text-sm font-normal text-slate-400 ml-1">节</span>
                  </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-purple-500">
                  <div className="text-slate-500 text-sm mb-1">剩余总课时</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {courses.reduce((acc, c) => acc + Number(c.balanceClasses || 0), 0)}
                    <span className="text-sm font-normal text-slate-400 ml-1">节</span>
                  </div>
                </Card>
                <Card className="p-6 border-l-4 border-l-amber-500">
                  <div className="text-slate-500 text-sm mb-1">账户总余额</div>
                  <div className="text-2xl font-bold text-slate-800">
                    ¥{courses.reduce((acc, c) => acc + Number(c.balanceMoney || 0), 0).toLocaleString()}
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-slate-800">最近动态</h3>
                   <button onClick={() => setView(AppView.LOGS)} className="text-primary-600 text-sm hover:underline flex items-center">
                     查看全部 <ChevronRight size={16} />
                   </button>
                </div>
                <Card className="divide-y divide-slate-100">
                  {records.slice(0, 5).map(record => {
                    const course = courses.find(c => c.id === record.courseId);
                    return (
                      <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === RecordType.ATTENDANCE ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {record.type === RecordType.ATTENDANCE ? <Check size={18} /> : <Wallet size={18} />}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{course?.name || '未知课程'}</div>
                            <div className="text-xs text-slate-500">{record.date} · {record.type === RecordType.ATTENDANCE ? '上课打卡' : '充值续费'}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${record.type === RecordType.ATTENDANCE ? 'text-slate-600' : 'text-green-600'}`}>
                          {record.type === RecordType.ATTENDANCE ? `-${record.classCount}课时` : `+¥${record.amount}`}
                        </div>
                      </div>
                    );
                  })}
                  {records.length === 0 && (
                    <div className="p-8 text-center text-slate-400">暂无记录</div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* STUDENTS VIEW */}
          {view === AppView.STUDENTS && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex justify-end">
                <Button onClick={() => { setFormData({}); setStudentModalOpen(true); }}>
                  <Plus size={20} /> 添加学员
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map(student => (
                  <Card key={student.id} className="overflow-hidden group">
                    <div className="h-24 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                        <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-full p-1 shadow-md">
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500" style={{ color: student.avatarColor }}>
                                {student.name[0]}
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 px-6 pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                                <p className="text-sm text-slate-500">{student.age} 岁</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEditStudent(student)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeleteStudent(student)} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="text-xs text-slate-400 mb-2">在读课程</div>
                            <div className="flex flex-wrap gap-2">
                                {courses.filter(c => c.studentId === student.id).map(c => (
                                    <span key={c.id} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs" style={{ borderLeft: `2px solid ${c.color}`}}>
                                        {c.name}
                                    </span>
                                ))}
                                {courses.filter(c => c.studentId === student.id).length === 0 && <span className="text-xs text-slate-300">暂无课程</span>}
                            </div>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* COURSES VIEW */}
          {view === AppView.COURSES && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex justify-end">
                <Button onClick={() => { setFormData({ color: '#3b82f6', paymentType: PaymentType.PREPAID_CLASS }); setCourseModalOpen(true); }}>
                  <Plus size={20} /> 添加课程
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => {
                    const student = students.find(s => s.id === course.studentId);
                    return (
                        <Card key={course.id} className="p-5 hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: course.color }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{course.name}</h3>
                                        <div className="text-xs text-slate-500">{course.institution} · {student?.name}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                     <button onClick={() => handleEditCourse(course)} className="p-2 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit2 size={16}/></button>
                                     <button onClick={() => handleDeleteCourse(course)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">剩余课时</div>
                                    <div className={`font-bold text-lg ${course.balanceClasses < 3 ? 'text-red-500' : 'text-slate-800'}`}>
                                        {course.balanceClasses} <span className="text-xs font-normal text-slate-400">节</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-xs text-slate-500 mb-1">剩余余额</div>
                                    <div className={`font-bold text-lg ${course.balanceMoney < 200 ? 'text-red-500' : 'text-slate-800'}`}>
                                        ¥{course.balanceMoney}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="text-xs text-slate-400">
                                    {course.paymentType === PaymentType.PREPAID_CLASS && `总购: ${course.totalClassesPurchased}节`}
                                    {course.paymentType === PaymentType.PREPAID_AMOUNT && `按余额扣费`}
                                    {course.paymentType === PaymentType.PAY_PER_CLASS && `按次结算`}
                                </div>
                                <button 
                                    onClick={() => { setFormData({ type: RecordType.ATTENDANCE, classCount: 1, amount: 0, courseId: course.id, date: new Date().toISOString().split('T')[0] }); setRecordModalOpen(true); }}
                                    className="text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full hover:bg-primary-100"
                                >
                                    快速打卡
                                </button>
                            </div>
                        </Card>
                    );
                })}
              </div>
            </div>
          )}

          {/* CALENDAR VIEW (PRO) */}
          {view === AppView.CALENDAR && (
              <div className="relative min-h-[600px]">
                  {!user?.isPremium && <FeatureLockOverlay onUnlock={() => setLicenseModalOpen(true)} />}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full">
                      <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-slate-800">
                              {currentCalendarMonth.toLocaleString('zh-CN', { year: 'numeric', month: 'long' })}
                          </h3>
                          <div className="flex gap-2">
                              <button onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
                              <button onClick={() => setCurrentCalendarMonth(new Date(currentCalendarMonth.setMonth(currentCalendarMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRightIcon size={20}/></button>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                              <div key={d} className="bg-slate-50 p-3 text-center text-sm font-medium text-slate-500">{d}</div>
                          ))}
                          {(() => {
                              const daysInMonth = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 0).getDate();
                              const firstDay = new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth(), 1).getDay();
                              const days = [];
                              
                              for(let i=0; i<firstDay; i++) days.push(<div key={`empty-${i}`} className="bg-white h-24 md:h-32" />);
                              
                              for(let i=1; i<=daysInMonth; i++) {
                                  const dateStr = `${currentCalendarMonth.getFullYear()}-${String(currentCalendarMonth.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                                  const dayRecords = records.filter(r => r.date === dateStr && r.type === RecordType.ATTENDANCE);
                                  
                                  days.push(
                                      <div key={i} className="bg-white h-24 md:h-32 p-2 border-t border-slate-50 hover:bg-slate-50 transition-colors relative">
                                          <span className={`text-sm ${dayRecords.length > 0 ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{i}</span>
                                          <div className="mt-1 space-y-1 overflow-y-auto max-h-[70%]">
                                              {dayRecords.map(r => {
                                                  const c = courses.find(c => c.id === r.courseId);
                                                  return (
                                                      <div key={r.id} className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 truncate border-l-2 border-blue-400">
                                                          {c?.name}
                                                      </div>
                                                  );
                                              })}
                                          </div>
                                      </div>
                                  );
                              }
                              return days;
                          })()}
                      </div>
                  </div>
              </div>
          )}

          {/* STATS VIEW (PRO) */}
          {view === AppView.STATS && (
             <div className="relative min-h-[600px] space-y-6 max-w-5xl mx-auto">
                 {!user?.isPremium && <FeatureLockOverlay onUnlock={() => setLicenseModalOpen(true)} />}
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="p-6">
                         <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChart size={18}/> 学科消费占比 (累计)</h3>
                         <DonutChart 
                            data={courses.map(c => {
                                // Calculate total spent on this course
                                const spent = records
                                    .filter(r => r.courseId === c.id && (r.type === RecordType.ATTENDANCE || r.type === RecordType.TOPUP))
                                    .reduce((acc, r) => acc + (r.type === RecordType.TOPUP ? r.amount : 0), 0); // We track Topup as "Spending"
                                return { label: c.name, value: spent, color: c.color };
                            })}
                         />
                     </Card>
                     
                     <Card className="p-6">
                         <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18}/> 投入 vs 消耗</h3>
                         <div className="space-y-6 mt-8">
                             <div>
                                 <div className="flex justify-between text-sm mb-2">
                                     <span className="text-slate-500">累计充值投入</span>
                                     <span className="font-bold text-green-600">
                                         ¥{records.filter(r => r.type === RecordType.TOPUP).reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                                     </span>
                                 </div>
                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-green-500 w-full opacity-80"></div>
                                 </div>
                             </div>
                             
                             <div>
                                 <div className="flex justify-between text-sm mb-2">
                                     <span className="text-slate-500">累计上课消耗价值</span>
                                     <span className="font-bold text-blue-600">
                                         ¥{records.filter(r => r.type === RecordType.ATTENDANCE).reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                                     </span>
                                 </div>
                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                     {/* Simple visual ratio */}
                                     <div 
                                        className="h-full bg-blue-500" 
                                        style={{ width: `${Math.min(100, (records.filter(r => r.type === RecordType.ATTENDANCE).reduce((acc,r) => acc+r.amount,0) / Math.max(1, records.filter(r => r.type === RecordType.TOPUP).reduce((acc,r)=>acc+r.amount,0))) * 100)}%` }}
                                     ></div>
                                 </div>
                             </div>
                             
                             <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 leading-relaxed">
                                 <strong className="text-slate-700">财务健康度：</strong> 
                                 蓝色条代表已经上掉的课的价值，绿色条代表您充值的总金额。蓝色条占比越高，说明预付款利用率越高，资金闲置越少。
                             </div>
                         </div>
                     </Card>
                 </div>
             </div>
          )}

          {/* LOGS VIEW */}
          {view === AppView.LOGS && (
            <div className="max-w-4xl mx-auto">
              <Card className="divide-y divide-slate-100">
                {records.map(record => {
                   const course = courses.find(c => c.id === record.courseId);
                   const student = students.find(s => s.id === course?.studentId);
                   return (
                     <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 w-2 h-2 rounded-full ${record.type === RecordType.ATTENDANCE ? 'bg-blue-500' : 'bg-green-500'}`} />
                            <div>
                                <div className="font-bold text-slate-800 text-sm">
                                    {course?.name} <span className="font-normal text-slate-500">({student?.name})</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">{record.date} · {record.note || '无备注'}</div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className={`font-bold ${record.type === RecordType.ATTENDANCE ? 'text-slate-700' : 'text-green-600'}`}>
                                 {record.type === RecordType.ATTENDANCE ? `-${record.classCount} 课时` : `+¥${record.amount}`}
                             </div>
                             {record.type === RecordType.ATTENDANCE && record.amount > 0 && (
                                 <div className="text-xs text-slate-400">价值 ¥{record.amount}</div>
                             )}
                        </div>
                     </div>
                   );
                })}
              </Card>
            </div>
          )}
          
          {/* AI ADVISOR VIEW (PRO) */}
          {view === AppView.AI_ADVISOR && (
              <div className="max-w-3xl mx-auto relative min-h-[400px]">
                  {!user?.isPremium && <FeatureLockOverlay onUnlock={() => setLicenseModalOpen(true)} />}
                  <div className="space-y-6">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                          <div className="flex items-start gap-4">
                              <div className="bg-white/20 p-3 rounded-xl">
                                  <BrainCircuit size={32} />
                              </div>
                              <div>
                                  <h3 className="text-2xl font-bold mb-2">AI 教育顾问</h3>
                                  <p className="text-indigo-100 mb-6">
                                      基于 Gemini 2.5 Flash 模型，为您分析家庭教育支出结构，提供个性化的预算优化建议和学习规划。
                                  </p>
                                  <Button variant="secondary" onClick={runAIAnalysis} disabled={isAnalyzing} className="shadow-none border-none">
                                      {isAnalyzing ? '正在思考中...' : '开始智能分析'}
                                  </Button>
                              </div>
                          </div>
                      </div>

                      {aiAnalysis && (
                          <div className="prose prose-slate max-w-none bg-white p-8 rounded-xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                  <TrendingUp className="text-indigo-500"/> 分析报告
                              </h4>
                              <div className="whitespace-pre-line text-slate-600 leading-relaxed text-sm">
                                  {aiAnalysis}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {/* SETTINGS VIEW */}
          {view === AppView.SETTINGS && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Profile Card */}
              <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-800">个人资料</h3>
                      <div className="flex items-center gap-3">
                        {!editProfileMode && (
                            <button onClick={() => setEditProfileMode(true)} className="text-sm text-primary-600 hover:underline">修改</button>
                        )}
                      </div>
                  </div>
                  {editProfileMode ? (
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm text-slate-600 mb-1">昵称</label>
                              <input 
                                  className="w-full p-2 border border-slate-200 rounded-lg"
                                  value={profileForm?.name}
                                  onChange={e => setProfileForm({...profileForm!, name: e.target.value})}
                              />
                          </div>
                          <div className="flex gap-2">
                              <Button onClick={handleUpdateProfile}>保存</Button>
                              <Button variant="ghost" onClick={() => { setEditProfileMode(false); setProfileForm(user); }}>取消</Button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
                              {user.name[0]}
                          </div>
                          <div>
                              <div className="font-bold text-slate-800">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                          <div className="ml-auto">
                              {user.isPremium ? 
                                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-200">
                                      <Crown size={12}/> PRO 会员
                                  </span> 
                                  : 
                                  <Button variant="premium" onClick={() => setLicenseModalOpen(true)} className="px-3 py-1 text-xs h-8">
                                      升级专业版
                                  </Button>
                              }
                          </div>
                      </div>
                  )}

                  {!editProfileMode && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                          <Button variant="outline" onClick={handleLogoutRequest} fullWidth className="justify-center border-red-200 text-red-600 hover:bg-red-50">
                              <LogOut size={18} /> 退出登录
                          </Button>
                      </div>
                  )}
              </Card>

              {/* Data Management Card */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">数据管理</h3>
                
                <div className="space-y-4">
                    {/* Persistent Storage Status */}
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <div className="mt-0.5">
                            {isPersisted ? <ShieldCheck className="text-blue-600" size={20}/> : <AlertCircle className="text-blue-400" size={20}/>}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-800">数据存储状态</h4>
                            <p className="text-xs text-blue-600 mt-1">
                                {isPersisted 
                                    ? "已启用持久化存储。浏览器在空间不足时不会自动清理您的数据。" 
                                    : "未启用持久化保护。如果手机空间不足，浏览器可能会自动清理缓存。建议定期备份。"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExportData} fullWidth className="h-12">
                            <Download size={18} /> {isWeChat ? '备份数据 (复制)' : '导出备份文件'}
                        </Button>
                        <div className="w-full relative">
                            <Button variant="outline" onClick={handleImportClick} fullWidth className="h-12">
                                <Upload size={18} /> 恢复数据
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept=".json" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    
                    {lastBackupDate && (
                        <p className="text-center text-xs text-slate-400">
                            上次备份时间: {new Date(lastBackupDate).toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">危险区域</h4>
                    <Button variant="danger" onClick={handleResetApp} fullWidth className="justify-start">
                        <Trash2 size={18} /> 重置所有数据 (清空数据库)
                    </Button>
                </div>
              </Card>

              {/* Agent Tools (Only visible in Admin Mode) */}
              {isAdminMode && (
                  <Card className="p-6 border-2 border-amber-200 bg-amber-50/50 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2"><Key size={16}/> 代理商/开发者工具</h3>
                          <button onClick={() => setIsAdminMode(false)} className="text-xs text-amber-600 hover:underline flex items-center gap-1">
                              <EyeOff size={12} /> 退出管理
                          </button>
                      </div>
                      <div className="flex flex-col gap-3">
                          <div className="text-xs text-amber-700">
                              请输入客户的注册邮箱。生成的激活码将与该邮箱绑定。<br/>
                              <span className="font-bold">注意：</span>客户必须使用相同的邮箱注册登录，否则无法激活。
                          </div>
                          <div className="flex flex-col gap-2">
                              <input 
                                  className="w-full p-2 border border-amber-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                  placeholder="客户邮箱地址 (例如: user@example.com)"
                                  value={customerEmail}
                                  onChange={(e) => setCustomerEmail(e.target.value)}
                              />
                              <div className="flex gap-2">
                                  <Button onClick={handleGenerateKey} className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white border-none shadow-none">生成专属激活码</Button>
                                  <div className="flex-1 flex gap-2">
                                      <input 
                                          className="flex-1 p-2 border border-amber-200 rounded-lg bg-white font-mono text-sm"
                                          readOnly
                                          value={generatedKey}
                                          placeholder="点击按钮生成..."
                                          onClick={(e) => e.currentTarget.select()}
                                      />
                                      {generatedKey && (
                                          <Button variant="outline" onClick={() => {
                                              navigator.clipboard.writeText(generatedKey);
                                              alert("已复制到剪贴板");
                                          }} className="border-amber-200 text-amber-700 hover:bg-amber-100">
                                              <Copy size={16} />
                                          </Button>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </Card>
              )}

              {/* About Card */}
              <Card className="p-6 text-center">
                  <div className="text-slate-400 text-sm">
                      <p 
                        onClick={handleAdminAccess}
                        className="cursor-pointer hover:text-slate-500 transition-colors"
                      >
                        © 2024 EduTrack Pro v1.2.2
                      </p>
                      <p className="mt-2 text-xs">
                          {isWeChat ? '当前运行环境: 微信内置浏览器' : '当前运行环境: 标准 Web 浏览器'}
                      </p>
                  </div>
              </Card>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default App;

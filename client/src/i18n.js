// client/src/i18n.js
// Translation dictionary — covers navigation, labels, statuses, priorities, and UI copy.
export const translations = {
  ar: {
    dir: 'rtl',
    appName: 'سلاح التلميذ',
    appSubtitle: 'نظام إدارة الإنتاج',
    nav: {
      dashboard: 'لوحة التحكم', tasks: 'المهام', members: 'الفريق', phases: 'المراحل',
      gates: 'بوابات الجودة', activity: 'النشاط', settings: 'الإعدادات', users: 'المستخدمون',
    },
    totalProgress: 'الإنجاز الكلي',
    logout: 'تسجيل الخروج',
    welcome: 'مرحبًا',
    refresh: 'تحديث',
    save: 'حفظ', cancel: 'إلغاء', edit: 'تعديل', delete: 'حذف', add: 'إضافة',
    search: 'بحث', filter: 'تصفية', all: 'الكل',
    status: { 'لم يبدأ': 'لم يبدأ', 'جارٍ': 'جارٍ', 'في المراجعة': 'في المراجعة', 'مكتمل': 'مكتمل' },
    priority: { 'منخفضة': 'منخفضة', 'متوسطة': 'متوسطة', 'عالية': 'عالية' },
    gateStatus: { 'لم يفتح': 'لم يفتح', 'معلق': 'معلق', 'اجتاز': 'اجتاز', 'مرفوض': 'مرفوض' },
    dashboard: {
      totalProgress: 'الإنجاز الكلي', completedTasks: 'المهام المكتملة', activeTasks: 'المهام الجارية',
      overdueTasks: 'مهام متأخرة', teamMembers: 'أعضاء الفريق', phaseProgress: 'تقدّم المراحل',
      taskStatusDist: 'توزيع حالة المهام', upcomingDeadlines: 'مواعيد قريبة', recentActivity: 'آخر النشاطات',
      noTasks: 'لا توجد مهام بعد', noDeadlines: 'لا توجد مواعيد قادمة', noActivity: 'لا يوجد نشاط بعد',
    },
    tasks: {
      title: 'المهام', searchPlaceholder: 'بحث في المهام...', allStatuses: 'كل الحالات',
      allPhases: 'كل المراحل', allYears: 'كل الصفوف الدراسية', allDepts: 'كل الأقسام',
      newTask: 'مهمة جديدة', editTask: 'تعديل المهمة', noTasks: 'لا توجد مهام مطابقة',
      colTask: 'المهمة', colPhase: 'المرحلة', colAssignee: 'المسؤول', colStatus: 'الحالة',
      colPriority: 'الأولوية', colProgress: 'التقدم', colDue: 'الاستحقاق', colYear: 'الصف الدراسي',
      formTitle: 'عنوان المهمة', formDesc: 'الوصف', formPhase: 'المرحلة', formAssignee: 'المسؤول',
      formNoAssignee: '— غير محدد —', formStatus: 'الحالة', formPriority: 'الأولوية',
      formProgress: 'التقدم', formDue: 'تاريخ الاستحقاق', formNotes: 'ملاحظات', formYear: 'الصف الدراسي',
      formNoYear: '— غير محدد —',
    },
    members: {
      title: 'الفريق', searchPlaceholder: 'بحث بالاسم...', allDepts: 'كل الأقسام',
      newMember: 'عضو جديد', editMember: 'تعديل العضو', noMembers: 'لا يوجد أعضاء مطابقون',
      tasksLabel: 'المهام', completed: 'مكتملة',
      formNameEn: 'الاسم (إنجليزي)', formNameAr: 'الاسم (عربي)', formRole: 'الدور (role_id)',
      formEmail: 'البريد الإلكتروني', formPhone: 'الهاتف', formJobEn: 'الوظيفة (إنجليزي)',
      formJobAr: 'الوظيفة (عربي)', formNotes: 'ملاحظات',
      formDept: 'القسم (Department)', formSection: 'الشعبة (Section)',
      formDeptPlaceholder: 'مثل: Art Direction', formSectionPlaceholder: 'مثل: Illustration',
    },
    phases: { title: 'المراحل', noPhases: 'لا توجد مراحل', taskCount: 'مهمة' },
    gates: { title: 'بوابات الجودة', noGates: 'لا توجد بوابات جودة', approvedOn: 'اعتُمد بتاريخ' },
    activityPage: {
      title: 'النشاط', addPlaceholder: 'أضف ملاحظة أو نشاطًا...', noActivity: 'لا يوجد نشاط مسجل بعد',
    },
    settings: {
      title: 'الملف الشخصي', name: 'الاسم', username: 'اسم المستخدم', role: 'الدور',
      passwordNote: 'لتغيير كلمة المرور، تواصل مع مسؤول النظام.', language: 'اللغة', languageNote: 'اختر لغة واجهة النظام',
    },
    users: {
      title: 'المستخدمون', newUser: 'مستخدم جديد', editUser: 'تعديل المستخدم', noUsers: 'لا يوجد مستخدمون',
      formUsername: 'اسم المستخدم', formPassword: 'كلمة المرور', formPasswordEdit: 'كلمة مرور جديدة (اتركه فارغًا للإبقاء)',
      formName: 'الاسم الكامل', formEmail: 'البريد الإلكتروني', formRole: 'الدور',
      colUsername: 'اسم المستخدم', colName: 'الاسم', colEmail: 'البريد', colRole: 'الدور',
      colStatus: 'الحالة', active: 'مفعّل', inactive: 'معطّل', deactivate: 'إلغاء التفعيل',
      adminOnly: 'هذه الصفحة متاحة فقط للمسؤولين (admin).', cannotDeleteSelf: 'لا يمكنك إلغاء تفعيل حسابك الخاص',
      createdSuccess: 'تم إنشاء المستخدم بنجاح', errorPrefix: 'خطأ:',
    },
    grades: {
      'الصف الأول': 'الصف الأول', 'الصف الثاني': 'الصف الثاني', 'الصف الثالث': 'الصف الثالث',
      'الصف الرابع': 'الصف الرابع', 'الصف الخامس': 'الصف الخامس', 'الصف السادس': 'الصف السادس',
    },
  },

  en: {
    dir: 'ltr',
    appName: 'Silah Al-Tilmeez',
    appSubtitle: 'Production Management System',
    nav: {
      dashboard: 'Dashboard', tasks: 'Tasks', members: 'Team', phases: 'Phases',
      gates: 'Quality Gates', activity: 'Activity', settings: 'Settings', users: 'Users',
    },
    totalProgress: 'Overall Progress',
    logout: 'Log Out',
    welcome: 'Welcome',
    refresh: 'Refresh',
    save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', add: 'Add',
    search: 'Search', filter: 'Filter', all: 'All',
    status: { 'لم يبدأ': 'Not started', 'جارٍ': 'In progress', 'في المراجعة': 'In review', 'مكتمل': 'Completed' },
    priority: { 'منخفضة': 'Low', 'متوسطة': 'Medium', 'عالية': 'High' },
    gateStatus: { 'لم يفتح': 'Not opened', 'معلق': 'Pending', 'اجتاز': 'Passed', 'مرفوض': 'Rejected' },
    dashboard: {
      totalProgress: 'Overall Progress', completedTasks: 'Completed Tasks', activeTasks: 'Active Tasks',
      overdueTasks: 'Overdue Tasks', teamMembers: 'Team Members', phaseProgress: 'Phase Progress',
      taskStatusDist: 'Task Status Breakdown', upcomingDeadlines: 'Upcoming Deadlines', recentActivity: 'Recent Activity',
      noTasks: 'No tasks yet', noDeadlines: 'No upcoming deadlines', noActivity: 'No activity yet',
    },
    tasks: {
      title: 'Tasks', searchPlaceholder: 'Search tasks...', allStatuses: 'All statuses',
      allPhases: 'All phases', allYears: 'All grades', allDepts: 'All departments',
      newTask: 'New Task', editTask: 'Edit Task', noTasks: 'No matching tasks',
      colTask: 'Task', colPhase: 'Phase', colAssignee: 'Assignee', colStatus: 'Status',
      colPriority: 'Priority', colProgress: 'Progress', colDue: 'Due Date', colYear: 'Grade',
      formTitle: 'Task Title', formDesc: 'Description', formPhase: 'Phase', formAssignee: 'Assignee',
      formNoAssignee: '— Unassigned —', formStatus: 'Status', formPriority: 'Priority',
      formProgress: 'Progress', formDue: 'Due Date', formNotes: 'Notes', formYear: 'Grade',
      formNoYear: '— Not set —',
    },
    members: {
      title: 'Team', searchPlaceholder: 'Search by name...', allDepts: 'All departments',
      newMember: 'New Member', editMember: 'Edit Member', noMembers: 'No matching members',
      tasksLabel: 'Tasks', completed: 'completed',
      formNameEn: 'Name (English)', formNameAr: 'Name (Arabic)', formRole: 'Role (role_id)',
      formEmail: 'Email', formPhone: 'Phone', formJobEn: 'Job Title (English)',
      formJobAr: 'Job Title (Arabic)', formNotes: 'Notes',
      formDept: 'Department', formSection: 'Section',
      formDeptPlaceholder: 'e.g. Art Direction', formSectionPlaceholder: 'e.g. Illustration',
    },
    phases: { title: 'Phases', noPhases: 'No phases', taskCount: 'tasks' },
    gates: { title: 'Quality Gates', noGates: 'No quality gates', approvedOn: 'Approved on' },
    activityPage: {
      title: 'Activity', addPlaceholder: 'Add a note or activity...', noActivity: 'No activity logged yet',
    },
    settings: {
      title: 'Profile', name: 'Name', username: 'Username', role: 'Role',
      passwordNote: 'To change your password, contact your system administrator.',
      language: 'Language', languageNote: 'Choose the system interface language',
    },
    users: {
      title: 'Users', newUser: 'New User', editUser: 'Edit User', noUsers: 'No users found',
      formUsername: 'Username', formPassword: 'Password', formPasswordEdit: 'New password (leave blank to keep)',
      formName: 'Full Name', formEmail: 'Email', formRole: 'Role',
      colUsername: 'Username', colName: 'Name', colEmail: 'Email', colRole: 'Role',
      colStatus: 'Status', active: 'Active', inactive: 'Inactive', deactivate: 'Deactivate',
      adminOnly: 'This page is available to admins only.', cannotDeleteSelf: 'You cannot deactivate your own account',
      createdSuccess: 'User created successfully', errorPrefix: 'Error:',
    },
    grades: {
      'الصف الأول': 'Grade 1', 'الصف الثاني': 'Grade 2', 'الصف الثالث': 'Grade 3',
      'الصف الرابع': 'Grade 4', 'الصف الخامس': 'Grade 5', 'الصف السادس': 'Grade 6',
    },
  },
};

export const GRADE_KEYS = ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'];

export function useTranslate(lang) {
  return translations[lang] || translations.ar;
}

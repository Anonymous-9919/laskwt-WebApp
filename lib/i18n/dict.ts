export type Lang = "ar" | "en";

export type Dict = {
  app: { name: string; tagline: string };
  nav: {
    dashboard: string;
    customers: string;
    orders: string;
    newOrder: string;
    settings: string;
    signOut: string;
  };
  auth: {
    signIn: string;
    signInSubtitle: string;
    email: string;
    password: string;
    submitting: string;
    invalidCredentials: string;
    employeeLogin: string;
    or: string;
    forgotPassword: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    loading: string;
    noResults: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
    actions: string;
    optional: string;
    required: string;
    cm: string;
    kwd: string;
    total: string;
    subtotal: string;
    discount: string;
    customization: string;
    saveDraft: string;
    resumeDraft: string;
    add: string;
    remove: string;
    notes: string;
    status: string;
    date: string;
    yes: string;
    no: string;
    saving: string;
  };
  customer: {
    title: string;
    newCustomer: string;
    fullName: string;
    phone: string;
    whatsapp: string;
    whatsappSameAsPhone: string;
    email: string;
    notes: string;
    searchPlaceholder: string;
    noCustomers: string;
    createFirst: string;
    historyOrders: string;
    historyMeasurements: string;
    newOrderFor: string;
    lastVisit: string;
    search: string;
    new: string;
  };
  measurement: {
    title: string;
    diagram: string;
    form: string;
    label: string;
    labelHint: string;
    previous: string;
    noPrevious: string;
    load: string;
    editAsNew: string;
    autosavedAt: string;
    fields: {
      length: string;
      shoulder: string;
      chest: string;
      waist: string;
      hips: string;
      neck: string;
      sleeve_length: string;
      sleeve_width: string;
      wrist: string;
      collar_height: string;
      bicep: string;
      front_length: string;
      back_length: string;
      ankle_round: string;
    };
  };
  style: {
    title: string;
    collar: string;
    cuff: string;
    pocket: string;
    front: string;
    buttons: string;
    embroidery: string;
    selectOption: string;
    options: {
      collar_classic: string;
      collar_high_band: string;
      collar_masri: string;
      collar_none: string;
      cuff_plain: string;
      cuff_button: string;
      cuff_tarbush: string;
      cuff_cufflinks: string;
      pocket_none: string;
      pocket_single: string;
      pocket_double: string;
      pocket_hidden: string;
      front_flat_flat: string;
      front_flat_leaf: string;
      front_leaf_leaf: string;
      front_buttons_row: string;
      buttons_pearl: string;
      buttons_plain: string;
      buttons_gold: string;
      emb_none: string;
      emb_collar_tassel: string;
      emb_neckline_zari: string;
      emb_sleeves_zari: string;
    };
  };
  pricing: {
    title: string;
    basePrice: string;
    qty: string;
    percentDiscount: string;
    fixedDiscount: string;
    discountType: string;
    perUnit: string;
    pricePreview: string;
  };
  order: {
    title: string;
    all: string;
    newOrder: string;
    orderNumber: string;
    status_draft: string;
    status_quotation: string;
    status_confirmed: string;
    status_completed: string;
    status_cancelled: string;
    selectCustomer: string;
    selectCustomerHint: string;
    stepCustomer: string;
    stepMeasurement: string;
    stepStyle: string;
    stepReview: string;
    createOrder: string;
    completeOrder: string;
    createInvoice: string;
    generatePDF: string;
    sendWhatsApp: string;
    print: string;
    download: string;
    shopifySynced: string;
    shopifyPending: string;
    shopifyFailed: string;
    retrySync: string;
    syncToShopify: string;
    viewInShopify: string;
    shopifyNotConfigured: string;
    shopifySyncSuccess: string;
    productType: string;
    product_dascha: string;
    product_thobe: string;
    dueDate: string;
    notes: string;
    noOrders: string;
  };
  invoice: {
    businessName: string;
    customer: string;
    measurements: string;
    styles: string;
    summary: string;
    thankYou: string;
  };
  settings: {
    title: string;
    businessProfile: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
  };
};

const ar: Dict = {
  app: {
    name: "لاسكويت",
    tagline: "إدارة تفصيل الدرعية والثوب",
  },
  nav: {
    dashboard: "الرئيسية",
    customers: "العملاء",
    orders: "الطلبات",
    newOrder: "طلب جديد",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",
  },
  auth: {
    signIn: "تسجيل الدخول",
    signInSubtitle: "منطقة الموظفين — أدخل بياناتك للمتابعة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submitting: "جارٍ الدخول...",
    invalidCredentials: "بيانات الدخول غير صحيحة",
    employeeLogin: "دخول الموظفين",
    or: "أو",
    forgotPassword: "نسيت كلمة المرور؟",
  },
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    search: "بحث",
    loading: "جارٍ التحميل...",
    noResults: "لا توجد نتائج",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    close: "إغلاق",
    confirm: "تأكيد",
    actions: "إجراءات",
    optional: "اختياري",
    required: "مطلوب",
    cm: "سم",
    kwd: "د.ك",
    total: "الإجمالي",
    subtotal: "المجموع",
    discount: "الخصم",
    customization: "الإضافات",
    saveDraft: "حفظ المسودة",
    resumeDraft: "استئناف المسودة",
    add: "إضافة",
    remove: "إزالة",
    notes: "ملاحظات",
    status: "الحالة",
    date: "التاريخ",
    yes: "نعم",
    no: "لا",
    saving: "جاري الحفظ",
  },
  customer: {
    title: "العملاء",
    newCustomer: "عميل جديد",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    whatsapp: "واتساب",
    whatsappSameAsPhone: "نفس رقم الهاتف",
    email: "البريد الإلكتروني",
    notes: "ملاحظات",
    searchPlaceholder: "ابحث بالاسم أو الهاتف أو الواتساب...",
    noCustomers: "لا يوجد عملاء بعد",
    createFirst: "أضف أول عميل",
    historyOrders: "سجل الطلبات",
    historyMeasurements: "سجل القياسات",
    newOrderFor: "طلب جديد لـ",
    lastVisit: "آخر زيارة",
    search: "بحث",
    new: "جديد",
  },
  measurement: {
    title: "القياسات",
    diagram: "الرسم التوضيحي",
    form: "النموذج",
    label: "وسم القياس",
    labelHint: "مثال: الثوب الرمضاني الأول",
    previous: "قياسات سابقة",
    noPrevious: "لا توجد قياسات سابقة لهذا العميل",
    load: "تحميل",
    editAsNew: "تعديل كجديد",
    autosavedAt: "تم الحفظ التلقائي",
    fields: {
      length: "الطول الكلي",
      shoulder: "الكتف",
      chest: "الصدر",
      waist: "الخصر",
      hips: "الأرداف",
      neck: "الرقبة",
      sleeve_length: "طول الكم",
      sleeve_width: "عرض الكم",
      wrist: "المعصم",
      collar_height: "ارتفاع الياقة",
      bicep: "العضد",
      front_length: "الطول الأمامي",
      back_length: "الطول الخلفي",
      ankle_round: "محيط الذيل",
    },
  },
  style: {
    title: "الستايل",
    collar: "الياقة",
    cuff: "الكُم",
    pocket: "الجيب",
    front: "الأمام",
    buttons: "الأزرار",
    embroidery: "التطريز",
    selectOption: "اختر",
    options: {
      collar_classic: "كلاسيكية",
      collar_high_band: "ياقة عالية",
      collar_masri: "ياقة مصري",
      collar_none: "بدون",
      cuff_plain: "سادة",
      cuff_button: "بزر",
      cuff_tarbush: "طربوش",
      cuff_cufflinks: "كفلكس",
      pocket_none: "بدون",
      pocket_single: "جيب يسار",
      pocket_double: "جيبان",
      pocket_hidden: "جيب مخفي",
      front_flat_flat: "مسطح/مسطح",
      front_flat_leaf: "مسطح/وريقة",
      front_leaf_leaf: "وريقة/وريقة",
      front_buttons_row: "صف أزرار",
      buttons_pearl: "لؤلؤ",
      buttons_plain: "سادة",
      buttons_gold: "ذهبية",
      emb_none: "بدون",
      emb_collar_tassel: "هدب على الياقة",
      emb_neckline_zari: "زري على الصدر",
      emb_sleeves_zari: "زري على الأكمام",
    },
  },
  pricing: {
    title: "التسعير",
    basePrice: "السعر الأساسي",
    qty: "الكمية",
    percentDiscount: "خصم %",
    fixedDiscount: "خصم ثابت",
    discountType: "نوع الخصم",
    perUnit: "للقطعة",
    pricePreview: "ملخص السعر",
  },
  order: {
    title: "الطلبات",
    all: "الكل",
    newOrder: "طلب جديد",
    orderNumber: "رقم الطلب",
    status_draft: "مسودة",
    status_quotation: "عرض سعر",
    status_confirmed: "مؤكد",
    status_completed: "مكتمل",
    status_cancelled: "ملغي",
    selectCustomer: "اختر العميل",
    selectCustomerHint: "اختر العميل لبدء الطلب الجديد",
    stepCustomer: "العميل",
    stepMeasurement: "القياس والستايل",
    stepStyle: "الستايل",
    stepReview: "المراجعة والتسعير",
    createOrder: "إنشاء الطلب",
    completeOrder: "إكمال الطلب ومزامنته",
    createInvoice: "إنشاء الفاتورة",
    generatePDF: "إنشاء PDF",
    sendWhatsApp: "إرسال عبر واتساب",
    print: "طباعة",
    download: "تحميل",
    shopifySynced: "تمت المزامنة مع شوبيفاي",
    shopifyPending: "بانتظار المزامنة",
    shopifyFailed: "فشلت المزامنة",
    retrySync: "إعادة المحاولة",
    syncToShopify: "مزامنة مع شوبيفاي",
    viewInShopify: "عرض في شوبيفاي",
    shopifyNotConfigured: "شوبيفاي غير مهيأ بعد — أضف بيانات الاعتماد في الإعدادات",
    shopifySyncSuccess: "تمت مزامنة الطلب مع شوبيفاي",
    productType: "نوع المنتج",
    product_dascha: "درعية",
    product_thobe: "ثوب",
    dueDate: "تاريخ التسليم",
    notes: "ملاحظات",
    noOrders: "لا توجد طلبات بعد",
  },
  invoice: {
    businessName: "لاسكويت",
    customer: "العميل",
    measurements: "القياسات",
    styles: "الستايل المختار",
    summary: "الملخص",
    thankYou: "شكراً لاختياركم لاسكويت",
  },
  settings: {
    title: "الإعدادات",
    businessProfile: "بيانات المنشأة",
    language: "اللغة",
    theme: "المظهر",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSystem: "النظام",
  },
};

const en: Dict = {
  app: {
    name: "Laskwt",
    tagline: "Dascha & Thobe tailoring management",
  },
  nav: {
    dashboard: "Dashboard",
    customers: "Customers",
    orders: "Orders",
    newOrder: "New Order",
    settings: "Settings",
    signOut: "Sign out",
  },
  auth: {
    signIn: "Sign in",
    signInSubtitle: "Employee area — sign in to continue",
    email: "Email",
    password: "Password",
    submitting: "Signing in...",
    invalidCredentials: "Invalid email or password",
    employeeLogin: "Employee sign in",
    or: "or",
    forgotPassword: "Forgot password?",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    loading: "Loading...",
    noResults: "No results",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    confirm: "Confirm",
    actions: "Actions",
    optional: "Optional",
    required: "Required",
    cm: "cm",
    kwd: "KWD",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    customization: "Customization",
    saveDraft: "Save draft",
    resumeDraft: "Resume draft",
    add: "Add",
    remove: "Remove",
    notes: "Notes",
    status: "Status",
    date: "Date",
    yes: "Yes",
    no: "No",
    saving: "Saving...",
  },
  customer: {
    title: "Customers",
    newCustomer: "New Customer",
    fullName: "Full Name",
    phone: "Phone",
    whatsapp: "WhatsApp",
    whatsappSameAsPhone: "Same as phone",
    email: "Email",
    notes: "Notes",
    searchPlaceholder: "Search by name, phone or WhatsApp...",
    noCustomers: "No customers yet",
    createFirst: "Add your first customer",
    historyOrders: "Order History",
    historyMeasurements: "Measurement History",
    newOrderFor: "New order for",
    lastVisit: "Last visit",
    search: "Search",
    new: "New",
  },
  measurement: {
    title: "Measurements",
    diagram: "Diagram",
    form: "Form",
    label: "Measurement label",
    labelHint: "e.g. First Ramadan Thobe",
    previous: "Previous measurements",
    noPrevious: "No previous measurements for this customer",
    load: "Load",
    editAsNew: "Edit as new",
    autosavedAt: "Autosaved",
    fields: {
      length: "Overall Length",
      shoulder: "Shoulder",
      chest: "Chest",
      waist: "Waist",
      hips: "Hips",
      neck: "Neck",
      sleeve_length: "Sleeve Length",
      sleeve_width: "Sleeve Width",
      wrist: "Wrist",
      collar_height: "Collar Height",
      bicep: "Bicep",
      front_length: "Front Length",
      back_length: "Back Length",
      ankle_round: "Ankle Round",
    },
  },
  style: {
    title: "Style",
    collar: "Collar",
    cuff: "Cuff",
    pocket: "Pocket",
    front: "Front",
    buttons: "Buttons",
    embroidery: "Embroidery",
    selectOption: "Select",
    options: {
      collar_classic: "Classic",
      collar_high_band: "High Band",
      collar_masri: "Masri Ribbon",
      collar_none: "None",
      cuff_plain: "Plain",
      cuff_button: "Button Cuff",
      cuff_tarbush: "Tarbush",
      cuff_cufflinks: "Cufflinks",
      pocket_none: "None",
      pocket_single: "Single Left",
      pocket_double: "Double",
      pocket_hidden: "Hidden",
      front_flat_flat: "Flat / Flat",
      front_flat_leaf: "Flat / Leaf",
      front_leaf_leaf: "Leaf / Leaf",
      front_buttons_row: "Buttons Row",
      buttons_pearl: "Pearl",
      buttons_plain: "Plain",
      buttons_gold: "Gold-Wrapped",
      emb_none: "None",
      emb_collar_tassel: "Collar Tassel",
      emb_neckline_zari: "Neckline Zari",
      emb_sleeves_zari: "Sleeves Zari",
    },
  },
  pricing: {
    title: "Pricing",
    basePrice: "Base price",
    qty: "Quantity",
    percentDiscount: "Discount %",
    fixedDiscount: "Fixed discount",
    discountType: "Discount type",
    perUnit: "per piece",
    pricePreview: "Price summary",
  },
  order: {
    title: "Orders",
    all: "All",
    newOrder: "New Order",
    orderNumber: "Order #",
    status_draft: "Draft",
    status_quotation: "Quotation",
    status_confirmed: "Confirmed",
    status_completed: "Completed",
    status_cancelled: "Cancelled",
    selectCustomer: "Select a customer",
    selectCustomerHint: "Select the customer to start the new order",
    stepCustomer: "Customer",
    stepMeasurement: "Measurement & Style",
    stepStyle: "Style",
    stepReview: "Review & Price",
    createOrder: "Create Order",
    completeOrder: "Complete & Sync Order",
    createInvoice: "Create Invoice",
    generatePDF: "Generate PDF",
    sendWhatsApp: "Send via WhatsApp",
    print: "Print",
    download: "Download",
    shopifySynced: "Synced with Shopify",
    shopifyPending: "Sync pending",
    shopifyFailed: "Sync failed",
    retrySync: "Retry sync",
    syncToShopify: "Sync to Shopify",
    viewInShopify: "View in Shopify",
    shopifyNotConfigured: "Shopify not configured — add credentials in Settings",
    shopifySyncSuccess: "Order synced with Shopify",
    productType: "Product type",
    product_dascha: "Dascha",
    product_thobe: "Thobe",
    dueDate: "Due date",
    notes: "Notes",
    noOrders: "No orders yet",
  },
  invoice: {
    businessName: "Laskwt",
    customer: "Customer",
    measurements: "Measurements",
    styles: "Selected Styles",
    summary: "Summary",
    thankYou: "Thank you for choosing Laskwt",
  },
  settings: {
    title: "Settings",
    businessProfile: "Business Profile",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
  },
};

export const dictionaries: Record<Lang, Dict> = { ar, en };

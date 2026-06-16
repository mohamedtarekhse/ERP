import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      app: {
        title: "AMICI ERP",
        tagline: "Oil & Gas Resource Planning"
      },
      nav: {
        hr: "Human Resources",
        crm: "CRM",
        assets: "Assets",
        supply_chain: "Supply Chain",
        dashboard: "Dashboard"
      },
      hr: {
        new_employee: "New Employee",
        employee_id: "Employee ID",
        first_name: "First Name",
        last_name: "Last Name",
        department: "Department",
        designation: "Designation",
        status: "Status"
      },
      crm: {
        new_account: "New Account",
        org_name: "Organization Name",
        industry: "Industry",
        rating: "Rating",
        revenue: "Annual Revenue",
        owner: "Account Owner"
      },
      assets: {
        new_cert: "New Certificate",
        asset_name: "Equipment",
        asset_tag: "Asset Tag",
        cert_type: "Certificate Type",
        authority: "Issuing Authority",
        expiry: "Expiry Date",
        days: "Days Remaining",
        status: "Status"
      },
      sc: {
        new_po: "New Purchase Order",
        po_name: "PO Number",
        supplier: "Supplier",
        total: "Grand Total",
        priority: "Priority",
        inventory: "Inventory Management",
        item: "Item",
        qty: "Actual Qty",
        reorder: "Reorder Level"
      },
      common: {
        search: "Search...",
        notifications: "Notifications",
        user_profile: "User Profile",
        logout: "Logout",
        language: "Language"
      }
    }
  },
  ar: {
    translation: {
      app: {
        title: "أميسي ERP",
        tagline: "تخطيط موارد النفط والغاز"
      },
      nav: {
        hr: "الموارد البشرية",
        crm: "إدارة علاقات العملاء",
        assets: "الأصول",
        supply_chain: "سلسلة التوريد",
        dashboard: "لوحة القيادة"
      },
      hr: {
        new_employee: "موظف جديد",
        employee_id: "رقم الموظف",
        first_name: "الاسم الأول",
        last_name: "اسم العائلة",
        department: "القسم",
        designation: "المسمى الوظيفي",
        status: "الحالة"
      },
      crm: {
        new_account: "حساب جديد",
        org_name: "اسم المؤسسة",
        industry: "الصناعة",
        rating: "التقييم",
        revenue: "الإيرادات السنوية",
        owner: "صاحب الحساب"
      },
      assets: {
        new_cert: "شهادة جديدة",
        asset_name: "المعدة",
        asset_tag: "رقم الأصل",
        cert_type: "نوع الشهادة",
        authority: "جهة الإصدار",
        expiry: "تاريخ الانتهاء",
        days: "الأيام المتبقية",
        status: "الحالة"
      },
      sc: {
        new_po: "امر شراء جديد",
        po_name: "رقم امر الشراء",
        supplier: "المورد",
        total: "الإجمالي الكلي",
        priority: "الأولوية",
        inventory: "إدارة المخزون",
        item: "الصنف",
        qty: "الكمية الفعلية",
        reorder: "مستوى إعادة الطلب"
      },
      common: {
        search: "بحث...",
        notifications: "التنبيهات",
        user_profile: "ملف المستخدم",
        logout: "تسجيل الخروج",
        language: "اللغة"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

// Handle RTL
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;

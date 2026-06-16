import { create } from 'zustand';

type Language = 'en' | 'ar';
export type AppType = 'launchpad' | 'hr' | 'crm' | 'certificates' | 'supply_chain';

interface GlobalState {
  // i18n
  language: Language;
  toggleLanguage: () => void;

  // Navigation
  currentApp: AppType;
  navigate: (app: AppType) => void;

  // Object Page State (Replaces Detail Panel)
  objectPageOpen: boolean;
  activeRecordId: string | null;
  activeObjectType: string | null;
  openObjectPage: (type: string, recordId: string) => void;
  closeObjectPage: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  language: 'en',
  toggleLanguage: () => set((state) => {
    const newLang = state.language === 'en' ? 'ar' : 'en';
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    return { language: newLang };
  }),

  currentApp: 'launchpad',
  navigate: (app) => set({ currentApp: app, objectPageOpen: false, activeRecordId: null, activeObjectType: null }),

  objectPageOpen: false,
  activeRecordId: null,
  activeObjectType: null,
  openObjectPage: (type, recordId) => set({ objectPageOpen: true, activeRecordId: recordId, activeObjectType: type }),
  closeObjectPage: () => set({ objectPageOpen: false, activeRecordId: null, activeObjectType: null })
}));

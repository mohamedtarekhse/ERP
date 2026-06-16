import { create } from 'zustand';
import { crudService } from '../db/crudService';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  employment_type: string;
  start_date: string;
  location: string;
  status: string;
}

export interface Account {
  id: string;
  account_id: string;
  name: string;
  industry: string;
  rating: string;
  status: string;
}

export interface Certificate {
  id: string;
  certificate_id: string;
  equipment_name: string;
  category: string;
  expiry_date: string;
  status: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  total_value: number;
  status: string;
}

interface DataState {
  employees: Employee[];
  accounts: Account[];
  certificates: Certificate[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  
  // HR CRUD
  addEmployee: (emp: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // CRM CRUD
  addAccount: (acc: Partial<Account>) => Promise<void>;
  updateAccount: (id: string, acc: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  employees: [],
  accounts: [],
  certificates: [],
  purchaseOrders: [],
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const [employees, accounts, certificates, purchaseOrders] = await Promise.all([
        crudService.fetchAll('employees'),
        crudService.fetchAll('accounts'),
        crudService.fetchAll('certificates'),
        crudService.fetchAll('purchase_orders')
      ]);

      set({ 
        employees: employees || [],
        accounts: accounts || [],
        certificates: certificates || [],
        purchaseOrders: purchaseOrders || [],
        loading: false 
      });
    } catch (error: any) {
      console.error("Error fetching data from Supabase:", error);
      set({ error: error.message, loading: false });
    }
  },

  addEmployee: async (emp) => {
    const newEmp = await crudService.insert('employees', emp);
    set((state) => ({ employees: [newEmp, ...state.employees] }));
  },
  updateEmployee: async (id, emp) => {
    const updated = await crudService.update('employees', id, emp);
    set((state) => ({ employees: state.employees.map(e => e.id === id ? updated : e) }));
  },
  deleteEmployee: async (id) => {
    await crudService.deleteRecord('employees', id);
    set((state) => ({ employees: state.employees.filter(e => e.id !== id) }));
  },

  addAccount: async (acc) => {
    const newAcc = await crudService.insert('accounts', acc);
    set((state) => ({ accounts: [newAcc, ...state.accounts] }));
  },
  updateAccount: async (id, acc) => {
    const updated = await crudService.update('accounts', id, acc);
    set((state) => ({ accounts: state.accounts.map(a => a.id === id ? updated : a) }));
  },
  deleteAccount: async (id) => {
    await crudService.deleteRecord('accounts', id);
    set((state) => ({ accounts: state.accounts.filter(a => a.id !== id) }));
  }
}));

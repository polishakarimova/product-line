'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProductLineState, GoalsData, MonthlyData, SalesData, CalendarData,
  AudienceData, ProductsData, PricingData, AssemblyData, TasksData, AnalyticsData,
  Product, ProductPricing, AudienceGroup, Goal, Expense,
} from './types';
import { createInitialState, createDefaultProduct, createDefaultPricing, getMonthsFromStart } from './defaults';

type UpdaterFn<T> = (prev: T) => T;

type Store = ProductLineState & {
  setWorkspaceName: (name: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'pastel') => void;
  setStartMonth: (n: number) => void;
  setCalendarYear: (y: number) => void;
  setGoals: (u: UpdaterFn<GoalsData>) => void;
  setMonthly: (u: UpdaterFn<MonthlyData>) => void;
  setSales: (u: UpdaterFn<SalesData>) => void;
  setCalendar: (u: UpdaterFn<CalendarData>) => void;
  setAudience: (u: UpdaterFn<AudienceData>) => void;
  setProducts: (u: UpdaterFn<ProductsData>) => void;
  setPricing: (u: UpdaterFn<PricingData>) => void;
  setAssembly: (u: UpdaterFn<AssemblyData>) => void;
  setTasks: (u: UpdaterFn<TasksData>) => void;
  setAnalytics: (u: UpdaterFn<AnalyticsData>) => void;
  // convenience
  addPersonalGoal: () => void;
  addCompanyGoal: () => void;
  addAudienceGroup: () => void;
  addProduct: () => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  updatePricing: (productId: string, patch: Partial<ProductPricing>) => void;
  importState: (data: Partial<ProductLineState>) => void;
  resetState: () => void;
};

const genId = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      setWorkspaceName: (name) => set({ workspaceName: name }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
        }
      },
      setCalendarYear: (y) => set({ calendarYear: y }),
      setStartMonth: (n) => {
        const monthNames = getMonthsFromStart(n);
        set(state => ({
          startMonth: n,
          monthly: state.monthly.map((m, i) => ({ ...m, month: monthNames[i] })),
          sales: { ...state.sales, months: state.sales.months.map((m, i) => ({ ...m, month: monthNames[i] })) },
          assembly: {
            ...state.assembly,
            finalDecomposition: state.assembly.finalDecomposition.map((r, i) => ({ ...r, month: monthNames[i] })),
          },
          tasks: { ...state.tasks, months: state.tasks.months.map((m, i) => ({ ...m, month: monthNames[i] })) },
        }));
      },
      setGoals: (u) => set(state => ({ goals: u(state.goals) })),
      setMonthly: (u) => set(state => ({ monthly: u(state.monthly) })),
      setSales: (u) => set(state => ({ sales: u(state.sales) })),
      setCalendar: (u) => set(state => ({ calendar: u(state.calendar) })),
      setAudience: (u) => set(state => ({ audience: u(state.audience) })),
      setProducts: (u) => set(state => ({ products: u(state.products) })),
      setPricing: (u) => set(state => ({ pricing: u(state.pricing) })),
      setAssembly: (u) => set(state => ({ assembly: u(state.assembly) })),
      setTasks: (u) => set(state => ({ tasks: u(state.tasks) })),
      setAnalytics: (u) => set(state => ({ analytics: u(state.analytics) })),

      addPersonalGoal: () => set(state => ({
        goals: { ...state.goals, personalGoals: [...state.goals.personalGoals, { id: genId(), name: '', amount: 0 }] },
      })),
      addCompanyGoal: () => set(state => ({
        goals: { ...state.goals, companyGoals: [...state.goals.companyGoals, { id: genId(), name: '', amount: 0 }] },
      })),
      addAudienceGroup: () => set(state => ({
        audience: [...state.audience, { id: genId(), summary: '', quotes: [] } as AudienceGroup],
      })),
      addProduct: () => {
        const prod = createDefaultProduct(get().products.products.length);
        const pr = createDefaultPricing(prod.id);
        set(state => ({
          products: { ...state.products, products: [...state.products.products, prod] },
          pricing: [...state.pricing, pr],
          assembly: {
            ...state.assembly,
            assembly: [...state.assembly.assembly, {
              productId: prod.id, position: state.assembly.assembly.length,
              functionInLineup: '', salesChannelsOpen: '', salesChannelsClosed: '',
              warmupDays: 0, sellingDaysOpen: 0, sellingDaysClosed: 0, developmentDays: 0,
              deliveryDays: 0, deliveryDates: '',
            }],
          },
        }));
      },
      removeProduct: (id) => set(state => ({
        products: { ...state.products, products: state.products.products.filter(p => p.id !== id) },
        pricing: state.pricing.filter(p => p.productId !== id),
        assembly: {
          ...state.assembly,
          assembly: state.assembly.assembly.filter(a => a.productId !== id),
        },
      })),
      updateProduct: (id, patch) => set(state => ({
        products: { ...state.products, products: state.products.products.map(p => p.id === id ? { ...p, ...patch } : p) },
      })),
      updatePricing: (productId, patch) => set(state => ({
        pricing: state.pricing.map(p => p.productId === productId ? { ...p, ...patch } : p),
      })),
      importState: (data) => set(state => ({ ...state, ...data })),
      resetState: () => set(createInitialState()),
    }),
    {
      name: 'product-line-storage',
      version: 1,
    }
  )
);

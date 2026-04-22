export type Approach = 'personal' | 'company' | 'both';

export type Goal = { id: string; name: string; amount: number };
export type Expense = { id: string; name: string; amount: number };

export interface GoalsData {
  approach: Approach;
  personalGoals: Goal[];
  companyGoals: Goal[];
  personalExpenses: Expense[];
  companyExpenses: Expense[];
  conclusion: string;
}

export interface MonthPlan {
  month: string;
  personalGoalsValues: number[];
  companyGoalsValues: number[];
  reserve: number;
}

export type MonthlyData = MonthPlan[];

export interface SalesAudience {
  reach: number;
  percent: number;
}

export interface SalesMonthPlan {
  month: string;
  salesCount: number;
  avgCheck: number;
}

export interface SalesData {
  audience: SalesAudience;
  months: SalesMonthPlan[];
}

export type DayType = 'weekend' | 'vacation' | 'event' | 'training' | 'selling_first' | 'selling_standard' | 'selling_final' | 'closed_sale' | 'reserved' | 'development';

export interface CalendarDay {
  date: string;
  types: DayType[];
  note?: string;
}

export interface CalendarData {
  days: CalendarDay[];
  vacations: { id: string; dates: string; plan: string }[];
  events: { id: string; dates: string; description: string }[];
  trainings: { id: string; dates: string; program: string }[];
}

export interface AudienceGroup {
  id: string;
  summary: string;
  quotes: string[];
}

export type AudienceData = AudienceGroup[];

export type RequestKind = 'key' | 'supporting';

export interface Product {
  id: string;
  name: string;
  format: string;
  audienceGroupId?: string;
  requestKind: RequestKind;
  result: string;
  extraValue: string;
  content: string[];
  theme: string;
  commonKeyRequests: string;
  commonSupportingRequests: string;
  schemaImage?: string;
}

export interface ProductsData {
  products: Product[];
  lineupStructure: string;
  lineupStructureReason: string;
}

export interface PricingStage {
  min: number;
  base: number;
  max: number;
}

export interface ProductPricing {
  productId: string;
  creationCosts: { id: string; name: string; amount: number }[];
  deliveryCosts: { id: string; name: string; amount: number }[];
  optimalParticipants: number;
  expertHourRate: number;
  expertHours: number;
  profitPercent: number;
  firstRight: PricingStage;
  standard: PricingStage;
  finalChance: PricingStage;
}

export type PricingData = ProductPricing[];

export interface AssemblyProduct {
  productId: string;
  position: number;
  functionInLineup: string;
  salesChannelsOpen: string;
  salesChannelsClosed: string;
  warmupDays: number;
  sellingDaysOpen: number;
  sellingDaysClosed: number;
  developmentDays: number;
  deliveryDays: number;
  deliveryDates: string;
}

export interface FinalDecompositionRow {
  month: string;
  targetRevenue: number;
  productId?: string;
  firstRight: { minPrice: number; minQty: number; basePrice: number; baseQty: number; maxPrice: number; maxQty: number };
  standard: { minPrice: number; minQty: number; basePrice: number; baseQty: number; maxPrice: number; maxQty: number };
  finalChance: { minPrice: number; minQty: number; basePrice: number; baseQty: number; maxPrice: number; maxQty: number };
}

export interface AssemblyData {
  assembly: AssemblyProduct[];
  schemaImage?: string;
  finalDecomposition: FinalDecompositionRow[];
}

export interface MonthTask {
  month: string;
  keyTask: string;
  keyTaskAssignee: string;
  subtasks: { id: string; task: string; assignee: string }[];
}

export interface CrisisMeasure {
  id: string;
  situation: string;
  response: string;
}

export interface TasksData {
  months: MonthTask[];
  crisis: CrisisMeasure[];
}

export interface DailyAnalytic {
  id: string;
  date: string;
  productName: string;
  sales: number;
  revenue: number;
  comment: string;
}

export interface FunnelStage {
  id: string;
  name: string;
  count: number;
}

export interface AnalyticsData {
  daily: DailyAnalytic[];
  funnel: FunnelStage[];
}

export interface ProductLineState {
  workspaceName: string;
  goals: GoalsData;
  monthly: MonthlyData;
  sales: SalesData;
  calendar: CalendarData;
  audience: AudienceData;
  products: ProductsData;
  pricing: PricingData;
  assembly: AssemblyData;
  tasks: TasksData;
  analytics: AnalyticsData;
  theme: 'light' | 'dark' | 'pastel';
  startMonth: number;
  calendarYear: number;
}

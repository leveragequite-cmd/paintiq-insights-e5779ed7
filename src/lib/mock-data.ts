// All dummy/sample chart data removed. Charts now render from live data
// added via the Data Entry Center, or show empty states until data exists.

export const months: string[] = [];
export const revenueTrend: { month: string; revenue: number; profit: number }[] = [];
export const monthlyProfit: { month: string; profit: number }[] = [];
export const inventoryMovement: { month: string; inflow: number; outflow: number }[] = [];
export const fastSlowProducts: { name: string; value: number; type: "fast" | "slow" }[] = [];
export const supplierPerformance: { metric: string; A: number; B: number }[] = [];
export const cashFlowProjection: { month: string; actual: number | null; forecast: number | null }[] = [];
export const revenueBreakdown: { name: string; value: number }[] = [];
export const expensesByMonth: { month: string; rent: number; salary: number; utilities: number; transport: number }[] = [];
export const gstRows: { month: string; taxable: number; collected: number; paid: number; net: number }[] = [];
export const profitabilityTrend: { month: string; gross: number; net: number }[] = [];

export const forecastData = (
  _base: number,
  _slope: number,
): { day: string; actual: number | null; forecast: number | null; lower: number | null; upper: number | null }[] => [];

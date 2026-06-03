export const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export const revenueTrend = months.map((m, i) => ({
  month: m,
  revenue: 380000 + i * 22000 + Math.round(Math.sin(i) * 35000),
  profit: 84000 + i * 6500 + Math.round(Math.cos(i) * 9000),
}));

export const monthlyProfit = revenueTrend.map((r) => ({ month: r.month, profit: r.profit }));

export const inventoryMovement = months.map((m, i) => ({
  month: m,
  inflow: 120 + i * 8 + Math.round(Math.sin(i * 1.3) * 18),
  outflow: 110 + i * 9 + Math.round(Math.cos(i * 1.1) * 15),
}));

export const fastSlowProducts = [
  { name: "Royale Luxury 4L", value: 184, type: "fast" },
  { name: "Weathercoat 20L", value: 142, type: "fast" },
  { name: "Impressions 10L", value: 96, type: "fast" },
  { name: "Opus Enamel 1L", value: 88, type: "fast" },
  { name: "Berger Primer 4L", value: 22, type: "slow" },
  { name: "Distemper White 20L", value: 14, type: "slow" },
  { name: "Opus Gloss 1L", value: 9, type: "slow" },
];

export const supplierPerformance = [
  { metric: "Price", A: 88, B: 72 },
  { metric: "Delivery", A: 92, B: 80 },
  { metric: "Quality", A: 85, B: 78 },
  { metric: "Support", A: 90, B: 65 },
  { metric: "Reliability", A: 94, B: 70 },
];

export const cashFlowProjection = months.concat(["Nov+", "Dec+", "Jan+"]).map((m, i) => ({
  month: m,
  actual: i < 12 ? 120000 + i * 9000 + Math.round(Math.sin(i) * 14000) : null,
  forecast: i >= 11 ? 230000 + (i - 11) * 14000 : null,
}));

export const revenueBreakdown = [
  { name: "Interior Paint", value: 42 },
  { name: "Exterior Paint", value: 28 },
  { name: "Enamel/Gloss", value: 14 },
  { name: "Primer", value: 9 },
  { name: "Accessories", value: 7 },
];

export const expensesByMonth = months.slice(-6).map((m) => ({
  month: m,
  rent: 45000,
  salary: 62000,
  utilities: 8400 + Math.round(Math.random() * 2000),
  transport: 4200 + Math.round(Math.random() * 1500),
}));

export const gstRows = months.slice(-6).map((m) => {
  const taxable = 380000 + Math.round(Math.random() * 80000);
  const collected = Math.round(taxable * 0.18);
  const paid = Math.round(collected * 0.62);
  return { month: m, taxable, collected, paid, net: collected - paid };
});

export const profitabilityTrend = months.map((m, i) => ({
  month: m,
  gross: 28 + Math.round(Math.sin(i) * 3),
  net: 12 + Math.round(Math.cos(i) * 2),
}));

export const forecastData = (base: number, slope: number) => {
  const arr: { day: string; actual: number | null; forecast: number | null; lower: number | null; upper: number | null }[] = [];
  for (let i = 0; i < 24; i++) {
    const day = `W${i + 1}`;
    if (i < 12) {
      const v = base + i * slope + Math.round(Math.sin(i) * base * 0.05);
      arr.push({ day, actual: v, forecast: null, lower: null, upper: null });
    } else {
      const f = base + i * slope;
      arr.push({ day, actual: null, forecast: f, lower: Math.round(f * 0.88), upper: Math.round(f * 1.12) });
    }
  }
  // bridge
  arr[11] = { ...arr[11], forecast: arr[11].actual, lower: arr[11].actual, upper: arr[11].actual };
  return arr;
};

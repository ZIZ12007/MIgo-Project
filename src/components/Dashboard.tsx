import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  Group, 
  AlertTriangle, 
  Wrench, 
  ArrowUpRight, 
  ShieldCheck, 
  Activity,
  Users
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import { DashboardStats } from "../types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalSales: data.totalSales,
          totalOrders: data.totalOrders,
          totalCustomers: data.totalCustomers,
          lowStockItems: data.lowStockItems,
          activeRepairs: data.activeRepairs
        });
        
        // Format chart data
        if (data.chartData && data.chartData.length > 0) {
          setChartData(data.chartData);
        } else {
          // Fallback static chart data if db starts empty
          setChartData([
            { date: "06-11", amount: 1560 },
            { date: "06-12", amount: 890 },
            { date: "06-13", amount: 2400 },
            { date: "06-14", amount: 1750 },
            { date: "06-15", amount: 3100 },
            { date: "06-16", amount: 1299 },
            { date: "06-17", amount: 480 },
          ]);
        }

        // Generate dynamic alerts based on database thresholds
        const alerts: string[] = [];
        if (data.lowStockItems > 0) {
          alerts.push(`${data.lowStockItems} popular cell products have dropped below safety thresholds (3 units).`);
        }
        if (data.activeRepairs > 2) {
          alerts.push(`High technician backlog noticed: ${data.activeRepairs} active bench repair jobs are pending completion.`);
        }
        setSystemAlerts(alerts);
      }
    } catch (e) {
      console.error("Failed to load dashboard statistics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono text-slate-500">Querying business ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="migo-dashboard" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-50/30">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time point-of-sale activities, hardware operations, and revenue flow.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Activity size={13} className="text-indigo-600 animate-pulse" />
          Synchronize Ledger
        </button>
      </div>

      {/* Bento Grid KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-slate-400 font-mono font-bold uppercase">Total Receipts</span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              ${stats?.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-emerald-600 font-semibold font-mono">100% Core</span> registered
            </span>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-slate-400 font-mono font-bold uppercase">Invoices Issued</span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {stats?.totalOrders || 0}
            </h3>
            <span className="text-xs text-slate-500">
              Retail and wholesale billing
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-xl">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Clients Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-slate-400 font-mono font-bold uppercase">Client Directory</span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {stats?.totalCustomers || 0}
            </h3>
            <span className="text-xs text-slate-500">
              Active ledger profiles
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-500 rounded-xl">
            <Users size={20} />
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-slate-400 font-mono font-bold uppercase">Low Stock Alerts</span>
            <h3 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {stats?.lowStockItems || 0}
            </h3>
            <span className={`text-xs ${stats?.lowStockItems && stats.lowStockItems > 0 ? "text-rose-600 font-semibold" : "text-green-600"}`}>
              {stats?.lowStockItems && stats.lowStockItems > 0 ? "Re-ordering required immediately" : "Inventory levels healthy"}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${stats?.lowStockItems && stats.lowStockItems > 0 ? "bg-rose-50 border-rose-100 text-rose-500 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Analytics Visualization and System Health Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-md font-bold text-slate-900 tracking-tight">Daily POS Settlement Revenue (Past 7 Days)</h2>
                <p className="text-xs text-slate-500 font-sans">Gross revenue generated across mobile phone sales and micro repair logs.</p>
              </div>
              <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-mono font-medium">USD ($)</span>
            </div>
            
            {/* Recharts Container */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950 text-slate-100 p-3 rounded-xl shadow-xl border border-slate-800 text-xs font-mono">
                            <p className="text-[10px] text-slate-400 mb-1">{payload[0].payload.date}</p>
                            <p className="font-bold text-indigo-400">${payload[0].value?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={35}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border-t border-slate-100/80 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Aggregated transaction streams are automatically locked to local database storage.</span>
            <span className="font-mono text-indigo-600 font-bold flex items-center gap-1">
              Active ledger audit compliant <ShieldCheck size={14} className="text-emerald-500 inline" />
            </span>
          </div>
        </div>

        {/* System Operations and Alerts Side Column */}
        <div className="space-y-6">
          <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col justify-between h-full min-h-[320px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="text-indigo-400" size={18} />
                <h3 className="text-sm font-extrabold tracking-wider uppercase font-mono text-slate-200">Hardware Service Queue</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6 font-sans">
                Real-time tracking of diagnostic boards, part replacements, and customer collection indicators.
              </p>

              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Received bench repairs:</span>
                  <span className="text-xs font-bold font-mono text-slate-200 bg-slate-800 px-2.5 py-1 rounded">
                    {stats?.activeRepairs || 0} assigned
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">Estimated turnaround:</span>
                  <span className="text-xs font-bold font-mono text-indigo-400">Same day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Repair diagnostics model:</span>
                  <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase flex items-center gap-1">
                    Gemini CoPilot <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mt-6 flex gap-3 items-center">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs font-bold text-slate-200 font-sans">Hardware Expert Copilot</p>
                <p className="text-[10px] text-slate-500 font-sans">Simulate bench work inside the Repairs view to get instant smart assistance.</p>
              </div>
            </div>
          </div>

          {/* Business Notifications and Warnings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase font-mono mb-3">Operator Actions Reminder</h3>
            {systemAlerts.length > 0 ? (
              <ul className="space-y-3">
                {systemAlerts.map((alert, idx) => (
                  <li key={idx} className="text-xs text-slate-600 bg-indigo-50/50 border border-indigo-100/60 p-3 rounded-xl flex gap-2.5 items-start">
                    <span className="text-indigo-600 font-bold">💡</span>
                    <span className="font-sans">{alert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex gap-1.5 items-center">
                <ShieldCheck size={14} />
                <span className="font-sans">All enterprise stores, stocks, and technician queues running normally.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

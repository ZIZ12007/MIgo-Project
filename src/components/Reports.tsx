import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Wrench, 
  Users, 
  FileSpreadsheet, 
  Printer, 
  TrendingDown, 
  Activity,
  Award,
  Wallet
} from "lucide-react";
import { Customer, Gadget, SalesOrder, RepairJob } from "../types";

export default function Reports() {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [sRes, rRes, cRes, gRes] = await Promise.all([
        fetch("/api/sales"),
        fetch("/api/repairs"),
        fetch("/api/customers"),
        fetch("/api/gadgets")
      ]);

      if (sRes.ok) setSales(await sRes.ok ? await sRes.json() : []);
      if (rRes.ok) setRepairs(await rRes.ok ? await rRes.json() : []);
      if (cRes.ok) setCustomers(await cRes.ok ? await cRes.json() : []);
      if (gRes.ok) setGadgets(await gRes.ok ? await gRes.json() : []);
    } catch (e) {
      console.error("Failed to load business reports metrics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Compute Top Selling Products Chart Data
  const getProductSalesData = () => {
    const counts: { [name: string]: number } = {};
    sales.forEach(order => {
      order.items.forEach(it => {
        counts[it.gadget_name] = (counts[it.gadget_name] || 0) + it.quantity_ordered;
      });
    });

    return Object.keys(counts).map(name => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      quantity: counts[name]
    })).sort((a, b) => b.quantity - a.quantity);
  };

  // 2. Compute Segment Sales Channel Chart Data (Wholesale vs Retail)
  const getChannelDistribution = () => {
    let wsSpends = 0;
    let rtSpends = 0;

    customers.forEach(c => {
      if (c.customer_type === "wholesale") {
        wsSpends += c.total_spent;
      } else {
        rtSpends += c.total_spent;
      }
    });

    return [
      { name: "Wholesale Channels", value: wsSpends, color: "#4f46e5" },
      { name: "Retail Walk-Ins", value: rtSpends, color: "#10b981" }
    ];
  };

  // 3. Repair diagnostics category stats
  const getRepairStatusCounts = () => {
    let ready = 0;
    let pending = 0;
    let compl = 0;

    repairs.forEach(r => {
      if (r.status === "delivered") compl++;
      else if (r.status === "ready") ready++;
      else pending++;
    });

    return [
      { name: "Completed", value: compl },
      { name: "Ready for Pickup", value: ready },
      { name: "In Diagnostics", value: pending }
    ];
  };

  const productChartData = getProductSalesData();
  const channelData = getChannelDistribution();
  const repairData = getRepairStatusCounts();

  const totalCompanyRevenue = sales
    .filter(o => o.payment)
    .reduce((sum, o) => sum + o.total_amount, 0);

  const totalPartsLiability = gadgets.reduce((sum, g) => sum + (g.unit_price * g.quantity_in_stock), 0);

  const colors = ["#6366f1", "#4f46e5", "#10b981", "#06b6d4", "#a855f7"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-xs font-mono text-slate-400">Compiling financial metrics ledger...</p>
      </div>
    );
  }

  return (
    <div id="migo-reports" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finances & Analytics Ledger</h1>
          <p className="text-sm text-slate-500 font-sans">Audit cashflow metrics, top registered client purchases, and inventory assets value.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer size={13} />
          Print Audit Report
        </button>
      </div>

      {/* Aggregate Financial Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-lg text-slate-100 space-y-2">
          <span className="text-[10px] tracking-wider font-mono text-indigo-400 font-bold uppercase block">Gross Settled Revenue</span>
          <h3 className="text-3xl font-extrabold font-sans tracking-tight">${totalCompanyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-slate-400 font-sans">Accumulated sales payments & cleared repair invoices.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] tracking-wider font-mono text-slate-400 font-bold uppercase block">Asset Valuation Liability</span>
          <h3 className="text-3xl font-bold font-sans tracking-tight text-slate-900">${totalPartsLiability.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <p className="text-[10px] text-slate-500 font-sans">Current wholesale value of phone stocks & replacement spares in holdings.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-[10px] tracking-wider font-mono text-slate-400 font-bold uppercase block">Avg Ticket Receipt</span>
          <h3 className="text-3xl font-bold font-sans tracking-tight text-slate-900">
            ${sales.length > 0 ? (totalCompanyRevenue / sales.length).toFixed(2) : "0.00"}
          </h3>
          <p className="text-[10px] text-slate-500 font-sans">Mean invoice size spanning across both general and bulk clients.</p>
        </div>
      </div>

      {/* Graphic Visualization panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel 1: Top sales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight">Highly Requested Devices (Sold Units)</h3>
            <p className="text-xs text-slate-400 font-sans">Total commercial units checked out through the checkout module.</p>
          </div>

          <div className="h-60 w-full pt-4">
            {productChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Assemble orders to generate graph metrics.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productChartData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" vertical={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} fontFamily="monospace" tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} fontFamily="sans-serif" tickLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: "#f8fafc" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-950 text-slate-50 p-2.5 rounded-lg text-[10px] font-mono border border-slate-800">
                            <span>Units: {payload[0].value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                    {productChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Panel 2: Revenue splits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight">Revenue Segment split channel</h3>
            <p className="text-xs text-slate-400 font-sans">Dispersed income mapped against bulk wholesale clients vs retail walk-ins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {channelData.map((d, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-xs font-semibold text-slate-800">{d.name}</span>
                  </div>
                  <p className="text-md font-extrabold font-mono text-slate-950 pl-4.5">${d.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Roster of top spending accounts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Award size={16} className="text-indigo-600" /> Top Client Spenders Board
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                <th className="py-2.5 px-4">Spender Name</th>
                <th className="py-2.5 px-4">Channel Group</th>
                <th className="py-2.5 px-4">Telephone</th>
                <th className="py-2.5 px-4 text-right">Sum Invoice Spendings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {customers.sort((a,b) => b.total_spent - a.total_spent).slice(0, 5).map(c => (
                <tr key={c.customer_id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.customer_name}</td>
                  <td className="py-3 px-4 font-mono uppercase text-[10px] text-slate-500">{c.customer_type}</td>
                  <td className="py-3 px-4 text-slate-500">{c.phone_number}</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-950">${c.total_spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wrench, 
  Users, 
  BarChart3, 
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentRole, setCurrentRole }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin"] },
    { id: "inventory", label: "Inventory", icon: Package, roles: ["admin", "sales"] },
    { id: "sales", label: "Sales Checkout", icon: ShoppingCart, roles: ["admin", "sales"] },
    { id: "repairs", label: "Repair Work", icon: Wrench, roles: ["admin", "technician", "sales"] },
    { id: "customers", label: "Customers", icon: Users, roles: ["admin", "sales"] },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3, roles: ["admin"] },
  ];

  const roles: { value: UserRole; label: string }[] = [
    { value: "admin", label: "MIGO Admin" },
    { value: "sales", label: "Sales Representative" },
    { value: "technician", label: "Bench Technician" },
    { value: "customer", label: "Guest Customer" },
  ];

  return (
    <aside id="migo-sidebar" className="w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 transition-all duration-300 shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
        <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-lg tracking-wider font-mono shadow-md shadow-indigo-600/15">
          MIGO
        </div>
        <div>
          <h1 className="font-sans font-bold text-sm tracking-tight leading-none text-slate-800">Mobile Tech</h1>
          <span className="text-[10px] text-indigo-600 font-mono font-semibold tracking-widest uppercase">System v2.5</span>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="p-4 bg-slate-50/80 border border-slate-100 m-3 rounded-xl flex flex-col gap-2 shadow-xs">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold flex items-center gap-1.5">
          <UserCheck size={11} className="text-indigo-600" /> Simulate System Role:
        </span>
        <select
          id="migo-role-selector"
          value={currentRole}
          onChange={(e) => {
            const newRole = e.target.value as UserRole;
            setCurrentRole(newRole);
            // Default to appropriate tab if current tab is restricted
            if (newRole === "technician") {
              setActiveTab("repairs");
            } else if (newRole === "customer") {
              setActiveTab("repairs");
            } else if (newRole === "sales" && activeTab === "dashboard") {
              setActiveTab("inventory");
            }
          }}
          className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 px-2.5 text-slate-700 font-sans cursor-pointer transition-all hover:border-indigo-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isAllowed = item.roles.includes(currentRole);
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (!isAllowed) return null;

          return (
            <button
              id={`nav-tab-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-150 border ${
                isActive
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold shadow-xs"
                  : "text-slate-600 bg-transparent border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* System Status Credit */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col gap-1 bg-slate-50/30">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine: Cloud Sandbox</span>
        </div>
        <p className="text-[10px] font-sans text-slate-400">Enterprise Device Solutions</p>
      </div>
    </aside>
  );
}

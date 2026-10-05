import React, { useState, useEffect } from "react";
import { UserCheck, Wifi, WifiOff } from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  activeTab: string;
  currentRole: UserRole;
}

export default function Header({ activeTab, currentRole }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Business Intelligence Board";
      case "inventory":
        return "Stock Ledger & Supplies catalog";
      case "sales":
        return "POS billing Checkout Terminal";
      case "repairs":
        return "Hardware Diagnostic & Repairs Desk";
      case "customers":
        return "MIGO Client Accounts Ledger";
      case "reports":
        return "Financial Analytics & Auditing";
      default:
        return "Management System";
    }
  };

  const currentUTC = "2026-06-17 14:34:30"; // Reference UTC time

  return (
    <header id="migo-header" className="h-16 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-slate-800 font-sans uppercase">
          {getTabTitle()}
        </h2>
        <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-mono px-1.5 py-0.5 rounded uppercase font-medium">
          {activeTab}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Connection Status Pill */}
        <div className="flex items-center">
          {isOnline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-mono uppercase font-bold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi size={11} className="text-emerald-500" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-mono uppercase font-bold shadow-xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <WifiOff size={11} className="text-amber-500" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>

        {/* System Time and Metadata */}
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-mono text-slate-400 font-medium">BENCH TIME (UTC)</p>
          <p className="text-xs font-mono text-slate-700 font-semibold">{currentUTC}</p>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 border-l border-gray-200 hidden sm:block"></div>

        {/* Current Active User Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-semibold uppercase block">
              {currentRole === "admin" && "SUPER USER [ADMIN]"}
              {currentRole === "sales" && "SALES ADVISOR"}
              {currentRole === "technician" && "BENCH TECHNICIAN"}
              {currentRole === "customer" && "GUEST CUSTOMER VIEW"}
            </span>
            <p className="text-xs font-sans font-medium text-slate-800">
              {currentRole === "admin" && "MIGO System Administrator"}
              {currentRole === "sales" && "Chidi Okonkwo (Front Desk)"}
              {currentRole === "technician" && "Bisi Adeleke (Main Bench)"}
              {currentRole === "customer" && "Guest Session"}
            </p>
          </div>
          <div className={`p-2 rounded-xl flex items-center justify-center border ${
            currentRole === "admin" 
              ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
              : currentRole === "sales"
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : currentRole === "technician"
              ? "bg-blue-50 border-blue-200 text-blue-600"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}>
            <UserCheck size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}

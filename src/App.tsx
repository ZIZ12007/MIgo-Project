import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import Sales from "./components/Sales";
import Repairs from "./components/Repairs";
import Customers from "./components/Customers";
import Reports from "./components/Reports";
import { UserRole } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "repairs":
        return <Repairs />;
      case "customers":
        return <Customers />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div id="migo-app-root" className="min-h-screen bg-slate-50 flex font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole} 
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Universal Status Header */}
        <Header activeTab={activeTab} currentRole={currentRole} />

        {/* Dynamic Workspace Container Section */}
        <main className="flex-1 overflow-hidden bg-slate-50/50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

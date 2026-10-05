import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Tag, 
  Phone, 
  Mail, 
  Send, 
  Trash2, 
  Edit, 
  DollarSign, 
  Calendar,
  X,
  Users
} from "lucide-react";
import { Customer, CustomerType } from "../types";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CustomerType>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [custType, setCustType] = useState<CustomerType>("retail");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error("Failed to load customer profiles:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCustType("retail");
    setPhone("");
    setEmail("");
    setTelegram("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (c: Customer) => {
    setEditingId(c.customer_id);
    setName(c.customer_name);
    setCustType(c.customer_type);
    setPhone(c.phone_number);
    setEmail(c.email || "");
    setTelegram(c.telegram || "");
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Name and phone number must be specified.");
      return;
    }

    const payload = {
      customer_name: name,
      customer_type: custType,
      phone_number: phone,
      email: email,
      telegram: telegram
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/customers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchCustomers();
        resetForm();
      } else {
        const err = await res.json();
        alert("Action failed: " + err.error);
      }
    } catch (e) {
      console.error("Error committing customer details:", e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this customer profile from the roster? This is irreversible.")) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (e) {
      console.error("Critical customer deletion error:", e);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone_number.includes(searchQuery) ||
                          (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || c.customer_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="migo-customers" className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Accounts Directory</h1>
          <p className="text-sm text-slate-500">Log new accounts, categorize buyer channels, and monitor historic transaction thresholds.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 font-semibold text-white px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus size={14} className="text-white stroke-[3]" />
          Enroll New Customer
        </button>
      </div>

      {/* Filter and search control board */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, contact phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Sort Pipeline:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("retail")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                typeFilter === "retail" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Retail Shop
            </button>
            <button
              onClick={() => setTypeFilter("wholesale")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                typeFilter === "wholesale" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Wholesale Client
            </button>
          </div>
        </div>
      </div>

      {/* Customer Addition/Modification form drawer (modal overlay style) */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-md">
                  {editingId ? "Modify Customer Profile" : "Register New Customer Profile"}
                </h3>
                <p className="text-xs text-slate-500">Configure core ledger details for tracking buyer orders and technical logs.</p>
              </div>
              <button 
                onClick={resetForm}
                className="p-1 rounded-full stroke-[3] text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Full Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alaba Wholesale Group or Chidimma Adele"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Client Category</label>
                  <select
                    value={custType}
                    onChange={(e) => setCustType(e.target.value as CustomerType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="retail">Retail Shop Guest</option>
                    <option value="wholesale">Wholesale Distributor</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 803 xxx xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Direct Email Address</label>
                  <input
                    type="email"
                    placeholder="name@server.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Telegram Channel Handle</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      placeholder="telegram_user"
                      value={telegram.startsWith("@") ? telegram.substring(1) : telegram}
                      onChange={(e) => setTelegram(e.target.value ? (e.target.value.startsWith("@") ? e.target.value : "@" + e.target.value) : "")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {editingId ? "Save Changes" : "Commit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main ledger list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-xs font-mono text-slate-400">Syncing customer ledgers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-12 rounded-2xl text-center space-y-2">
          <Users size={32} className="mx-auto text-slate-350" />
          <p className="text-sm font-semibold text-slate-800">No customer files match your criteria</p>
          <p className="text-xs text-slate-500">Clear filters or enroll a new profile above to begin tracking client billing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-3 px-6">ID Code</th>
                  <th className="py-3 px-6">Client Name</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Contact Channels</th>
                  <th className="py-3 px-6">Registered Date</th>
                  <th className="py-3 px-6 text-right">Sum Spent</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-xs text-slate-700 font-sans">
                {filteredCustomers.map(c => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-400">
                      MIGO-{c.customer_id.toString().slice(-4)}
                    </td>
                    
                    {/* Name */}
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {c.customer_name}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                        c.customer_type === "wholesale" 
                          ? "bg-blue-50 text-blue-600 border border-blue-100" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        <Tag size={10} />
                        {c.customer_type}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6 space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        <span>{c.phone_number}</span>
                      </div>
                      
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                      )}

                      {c.telegram && (
                        <div className="flex items-center gap-1.5 text-sky-600">
                          <Send size={12} className="text-sky-400" />
                          <span>{c.telegram}</span>
                        </div>
                      )}
                    </td>

                    {/* Reg date */}
                    <td className="py-4 px-6 text-slate-400 text-[11px] font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{c.date_registered.split("T")[0]}</span>
                      </div>
                    </td>

                    {/* Spent */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      <span className="text-[10px] text-slate-400 font-normal mr-0.5">$</span>
                      {c.total_spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Acts */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.customer_id)}
                          className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

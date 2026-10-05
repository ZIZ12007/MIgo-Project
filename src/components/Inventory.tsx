import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Tag, 
  Trash2, 
  Edit, 
  Warehouse, 
  AlertCircle, 
  DollarSign, 
  PackageCheck,
  UserCheck,
  Building,
  User,
  X
} from "lucide-react";
import { Gadget, Supplier } from "../types";

export default function Inventory() {
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out" | "low">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Ikeja Main");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [supplierId, setSupplierId] = useState<number>(0);

  // Supplier Add State
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supName, setSupName] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const [gadgetsRes, suppliersRes] = await Promise.all([
        fetch("/api/gadgets"),
        fetch("/api/suppliers")
      ]);

      if (gadgetsRes.ok) {
        const gadgetsData = await gadgetsRes.json();
        setGadgets(gadgetsData);
      }
      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      }
    } catch (e) {
      console.error("Critical error fetching inventory ledger:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setBranch("Ikeja Main");
    setModel("");
    setPrice("");
    setStock("");
    setSupplierId(0);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEditClick = (g: Gadget) => {
    setEditingId(g.gadget_id);
    setName(g.gadget_name);
    setBranch(g.branch);
    setModel(g.model);
    setPrice(g.unit_price.toString());
    setStock(g.quantity_in_stock.toString());
    setSupplierId(g.supplier_id);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stock) {
      alert("Name, price, and stock quantities are mandatory.");
      return;
    }

    const payload = {
      gadget_name: name,
      branch: branch,
      model: model || "Standard Edition",
      unit_price: parseFloat(price),
      quantity_in_stock: parseInt(stock),
      supplier_id: supplierId
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/gadgets/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/gadgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchInventory();
        resetForm();
      } else {
        const err = await res.json();
        alert("Operation failed: " + err.error);
      }
    } catch (e) {
      console.error("Error submitting gadget:", e);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim() || !supPhone.trim()) {
      alert("Supplier name and phone are required.");
      return;
    }

    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_name: supName,
          contact_number: supPhone,
          email: supEmail,
          address: supAddress
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuppliers([...suppliers, data]);
        setSupplierId(data.supplier_id);
        setSupName("");
        setSupPhone("");
        setSupEmail("");
        setSupAddress("");
        setShowSupplierForm(false);
      }
    } catch (e) {
      console.error("Error creating supplier record:", e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this hardware listing? It will remove it from catalog levels.")) {
      return;
    }

    try {
      const res = await fetch(`/api/gadgets/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchInventory();
      }
    } catch (e) {
      console.error("Error deleting gadget:", e);
    }
  };

  const filteredGadgets = gadgets.filter(g => {
    const matchesSearch = g.gadget_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.branch.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (stockFilter === "all") return matchesSearch;
    if (stockFilter === "in") return matchesSearch && g.quantity_in_stock > 3;
    if (stockFilter === "out") return matchesSearch && g.quantity_in_stock === 0;
    if (stockFilter === "low") return matchesSearch && g.quantity_in_stock > 0 && g.quantity_in_stock <= 3;
    return matchesSearch;
  });

  return (
    <div id="migo-inventory" className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top dashboard action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Ledger & Supplies</h1>
          <p className="text-sm text-slate-500 font-sans">Modify model catalogs, adjust prices, and link manufacturer components.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => { setShowSupplierForm(true); }}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            Register Supplier
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-white stroke-[3]" />
            Provision Stock
          </button>
        </div>
      </div>

      {/* Supplier Register Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-sans font-bold text-slate-900 text-sm">Register Manufacturer / Supplier</h3>
              <button onClick={() => setShowSupplierForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Supplier Enterprise Name *</label>
                <input
                  type="text" required value={supName} onChange={(e) => setSupName(e.target.value)}
                  placeholder="Shenzhen Star Supplies Co."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Direct Phone *</label>
                  <input
                    type="text" required value={supPhone} onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+86..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Email Contact</label>
                  <input
                    type="email" value={supEmail} onChange={(e) => setSupEmail(e.target.value)}
                    placeholder="sales@shenzhen.cn"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Physical Warehouse Address</label>
                <textarea
                  value={supAddress} onChange={(e) => setSupAddress(e.target.value)}
                  placeholder="Futian Logistics Square, CN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs h-16 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold font-mono text-xs py-2.5 rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Assemble Supplier File
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, branch store or models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-10 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Audit levels:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                stockFilter === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setStockFilter("in")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                stockFilter === "in" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Adequate Stock
            </button>
            <button
              onClick={() => setStockFilter("low")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                stockFilter === "low" ? "bg-white text-amber-600 shadow-xs animate-pulse" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Low Stock (≤3)
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase ${
                stockFilter === "out" ? "bg-white text-rose-600 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Exhausted (0)
            </button>
          </div>
        </div>
      </div>

      {/* Gadget Creation Drawer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-md">
                  {editingId ? "Update Inventory Listing" : "Register Catalog Inventory"}
                </h3>
                <p className="text-xs text-slate-500 font-sans">Provision quantities, assign physical branch, and connect verified supplier.</p>
              </div>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Gadget Commercial Name *</label>
                <input
                  type="text" required placeholder="e.g. iPhone 15 Pro Max" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Technical Model Label</label>
                  <input
                    type="text" placeholder="e.g. 256GB Platinum Gray" value={model} onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Store Branch</label>
                  <select
                    value={branch} onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  >
                    <option value="Ikeja Main">Ikeja Main Shop</option>
                    <option value="Lekki Hub">Lekki Tech Hub</option>
                    <option value="Alaba Depot">Alaba Logistics Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Unit Retail Price (USD) *</label>
                  <input
                    type="number" step="0.01" required placeholder="e.g. 1399.00" value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Quantity Initial Stock *</label>
                  <input
                    type="number" required placeholder="e.g. 25" value={stock} onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Linked Supplier Factory</label>
                <select
                  value={supplierId} onChange={(e) => setSupplierId(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-700 focus:outline-none"
                >
                  <option value={0}>Unassigned (No Supplier Card)</option>
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-150 flex items-center justify-end gap-3 font-mono">
                <button type="button" onClick={resetForm} className="bg-slate-100 px-4 py-2 text-xs rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">
                  Dismiss
                </button>
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-sm transition-colors"
                >
                  {editingId ? "Re-align Database Listing" : "Incorporate Stock Ledger"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory table */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-xs font-mono text-slate-400">Aggregating Stock records...</p>
        </div>
      ) : filteredGadgets.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-12 rounded-2xl text-center space-y-2">
          <Building size={32} className="mx-auto text-slate-400" />
          <p className="text-xs font-semibold text-slate-800">No storage listings align with requested criteria</p>
          <p className="text-[11px] text-slate-500">Add phone stock or equipment above to kickstart the sales list.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-3 px-6">Product Details</th>
                  <th className="py-3 px-6">Local Branch</th>
                  <th className="py-3 px-6">Manufacturer Spec</th>
                  <th className="py-3 px-6 text-right">Unit Price</th>
                  <th className="py-3 px-6 text-center">Remaining</th>
                  <th className="py-3 px-6">Supplier Source</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                {filteredGadgets.map(g => {
                  const supplier = suppliers.find(s => s.supplier_id === g.supplier_id);
                  const isDepleted = g.quantity_in_stock === 0;
                  const isLow = g.quantity_in_stock > 0 && g.quantity_in_stock <= 3;

                  return (
                    <tr key={g.gadget_id} className="hover:bg-slate-50/50 transition-all">
                      {/* Name */}
                      <td className="py-4 px-6 font-semibold text-slate-900 font-sans">
                        <div>
                          <p>{g.gadget_name}</p>
                          <span className="text-[9px] text-slate-400 font-mono font-medium uppercase tracking-wider block mt-0.5">ID: MIGO-{g.gadget_id.toString().slice(-4)}</span>
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-4 px-6 font-medium text-slate-600">
                        <span className="flex items-center gap-1">
                          <Warehouse size={12} className="text-slate-400" />
                          {g.branch}
                        </span>
                      </td>

                      {/* Model Spec */}
                      <td className="py-4 px-6 text-slate-500 italic">
                        {g.model}
                      </td>

                      {/* Unit Price */}
                      <td className="py-4 px-6 text-right font-mono font-extrabold text-slate-900">
                        <span className="text-[10px] text-slate-400 font-normal mr-0.5">$</span>
                        {g.unit_price.toFixed(2)}
                      </td>

                      {/* Remaining stock stats */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isDepleted 
                              ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" 
                              : isLow 
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {isDepleted && "OUT OF STOCK"}
                            {isLow && "LOW STOCK"}
                            {!isLow && !isDepleted && "ADEQUATE"}
                          </span>
                          <span className="text-xs font-mono font-bold mt-1 text-slate-800">
                            {g.quantity_in_stock} Units
                          </span>
                        </div>
                      </td>

                      {/* Supplier source */}
                      <td className="py-4 px-6 text-slate-500">
                        {supplier ? (
                          <div>
                            <p className="font-semibold text-slate-700 text-xs">{supplier.supplier_name}</p>
                            <p className="text-[10px] font-mono text-slate-400">{supplier.contact_number}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">DIRECT SOURCED</span>
                        )}
                      </td>

                      {/* Control list */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(g)}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Stock Info"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(g.gadget_id)}
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Stock"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

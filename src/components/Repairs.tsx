import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Wrench, 
  Cpu, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  RotateCw,
  Sparkles,
  Terminal,
  ShieldAlert,
  Printer,
  ChevronRight,
  X
} from "lucide-react";
import { Customer, Technician, RepairJob, RepairStatus } from "../types";

export default function Repairs() {
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [custId, setCustId] = useState("");
  const [devName, setDevName] = useState("");
  const [devModel, setDevModel] = useState("");
  const [defect, setDefect] = useState("");
  const [estCost, setEstCost] = useState("");
  const [techId, setTechId] = useState("");
  const [notes, setNotes] = useState("");

  // AI Diagnostic States
  const [aiDevice, setAiDevice] = useState("");
  const [aiDefect, setAiDefect] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Print Receipt View Block
  const [activeReceipt, setActiveReceipt] = useState<RepairJob | null>(null);

  useEffect(() => {
    fetchBase();
  }, []);

  const fetchBase = async () => {
    setIsLoading(true);
    try {
      const [rRes, tRes, cRes] = await Promise.all([
        fetch("/api/repairs"),
        fetch("/api/technicians"),
        fetch("/api/customers")
      ]);
      if (rRes.ok) setRepairs(await rRes.json());
      if (tRes.ok) setTechnicians(await tRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } catch (e) {
      console.error("Critical error aggregating workbench metrics:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custId || !devName || !defect) {
      alert("Please specify Customer account, Device description, and Defect reason.");
      return;
    }

    const payload = {
      customer_id: parseInt(custId),
      device_name: devName,
      device_model: devModel || "Standard",
      defect_description: defect,
      cost_estimate: parseFloat(estCost) || 0,
      assigned_technician_id: techId ? parseInt(techId) : undefined,
      notes: notes
    };

    try {
      const res = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        setCustId("");
        setDevName("");
        setDevModel("");
        setDefect("");
        setEstCost("");
        setTechId("");
        setNotes("");
        fetchBase();
      }
    } catch (e) {
      console.error("Critical error compiling repair card:", e);
    }
  };

  const shiftJobStatus = async (id: number, status: RepairStatus) => {
    try {
      const res = await fetch(`/api/repairs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBase();
      }
    } catch (e) {
      console.error("Failed to compile repair advancement:", e);
    }
  };

  const runAiDiagnostics = async () => {
    if (!aiDevice.trim() || !aiDefect.trim()) {
      alert("Please provide both the client model and the defect symptoms.");
      return;
    }

    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: aiDevice,
          defect_description: aiDefect
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.diagnosis);
      } else {
        setAiResponse("Diagnostic copilot failed to contact cloud core. Please verify API configurations.");
      }
    } catch (e) {
      console.error("AI diagnostics timeout :", e);
      setAiResponse("Diagnostic network pipeline timed out. Running on local in-memory fallback.");
    } finally {
      setAiLoading(false);
    }
  };

  const autofillFromAi = () => {
    setDevName(aiDevice);
    setDefect(aiDefect);
    setNotes(aiResponse.replace(/###/g, "").replace(/\*\*/g, ""));
    setShowAiModal(false);
    setShowForm(true);
  };

  return (
    <div id="migo-repairs" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Bench Workbench</h1>
          <p className="text-sm text-slate-500 font-sans">Inspect structural defect reports, delegate jobs to specialized bench staff, and checkout repair receipts.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => { setShowAiModal(true); }}
            className="bg-indigo-50 hover:bg-indigo-100 font-bold text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl text-xs font-mono shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles size={14} className="text-indigo-600 animate-pulse" />
            AI Diagnostic Copilot
          </button>
          <button
            onClick={() => { setShowForm(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 font-bold text-white px-4 py-2.5 rounded-xl text-xs font-mono shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-white stroke-[3]" />
            Admit Repair Device
          </button>
        </div>
      </div>

      {/* AI Copilot Advisor Dialog */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-800 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-400" />
                <div>
                  <h3 className="font-sans font-bold text-slate-100 text-md">Bench Diagnostics Assistant</h3>
                  <p className="text-xs text-slate-400 font-mono">Simulated Hardware CoPilot powered by Gemini Pro</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Form & outputs */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Device brand & model</label>
                  <input
                    type="text"
                    value={aiDevice}
                    onChange={(e) => setAiDevice(e.target.value)}
                    placeholder="e.g. Galaxy S22 or iPhone X"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Defect symptoms</label>
                  <input
                    type="text"
                    value={aiDefect}
                    onChange={(e) => setAiDefect(e.target.value)}
                    placeholder="e.g. Screen keeps flickering on bright light"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={runAiDiagnostics}
                disabled={aiLoading}
                className="w-full bg-indigo-600 text-white font-bold font-mono text-xs py-3 rounded-xl hover:bg-indigo-750 cursor-pointer disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <RotateCw size={14} className="animate-spin" />
                    INSPECTING SCHEMATICS CORES...
                  </>
                ) : (
                  <>
                    <Terminal size={14} />
                    INITIALISE EXPEDITIOUS HARDWARE DIAGNOSIS
                  </>
                )}
              </button>

              {/* Diagnosis box */}
              {aiResponse && (
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl font-mono text-xs prose prose-invert max-w-full overflow-y-auto max-h-[350px]">
                  <div className="flex items-center gap-2 mb-3 text-[10px] tracking-wider text-indigo-400 border-b border-slate-800 pb-2 uppercase">
                    <Terminal size={12} fill="#818cf8" /> Diagnostic workbench log report
                  </div>
                  <pre className="whitespace-pre-wrap text-slate-300 font-mono text-xs leading-relaxed">
                    {aiResponse}
                  </pre>
                  
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={autofillFromAi}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs font-mono tracking-tight flex items-center gap-1 cursor-pointer"
                    >
                      Autofill into repair ticket <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Repair Admission Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-slate-900 text-sm">Register Repair Device Ticket</h3>
                <p className="text-xs text-slate-500 font-sans">Enroll device defect specs, estimate costs, and assign dedicated technician.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

             <form onSubmit={handleCreateRepair} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Associate Customer Account *</label>
                <select
                  value={custId}
                  onChange={(e) => setCustId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 select-arrow"
                >
                  <option value="">-- Choose Account --</option>
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.phone_number})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Device Series / Name *</label>
                  <input
                    type="text" required placeholder="e.g. Galaxy Ultra S22" value={devName} onChange={(e) => setDevName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Model Chassis (A/SM-Code)</label>
                  <input
                    type="text" placeholder="e.g. SM-S901B" value={devModel} onChange={(e) => setDevModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Reported Defect reason *</label>
                <input
                  type="text" required placeholder="e.g. Charging port damage, board short, battery draining" value={defect} onChange={(e) => setDefect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Assigned technician</label>
                  <select
                    value={techId}
                    onChange={(e) => setTechId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="">Unassigned (Benchmark Queue)</option>
                    {technicians.filter(t => t.status === "active").map(t => (
                      <option key={t.technician_id} value={t.technician_id}>{t.name} ({t.specialization})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Solder / Estimate Cost (USD)</label>
                  <input
                    type="number" step="0.01" placeholder="e.g. 75.00" value={estCost} onChange={(e) => setEstCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Pre-diagnostic Notes & Diagnostics</label>
                <textarea
                  placeholder="Insert hardware diagnostics or parts notes..."
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs h-16 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-mono">
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 px-4 py-2 text-xs rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-colors">
                  Enroll Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Panel Block */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 font-mono text-slate-800 space-y-4">
            <div className="text-center border-b border-dashed border-slate-350 pb-4">
              <h2 className="font-extrabold text-slate-950 leading-none">MIGO MOBILE TECH</h2>
              <span className="text-[10px] font-semibold text-slate-500">Ikeja Central Service Hub</span>
              <p className="text-[9px] text-slate-400 mt-1">Lagos, Nigeria | +234 803 123 4567</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>RECEIPT CODE:</span>
                <span className="font-bold">MIGO-R-{activeReceipt.repair_job_id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{activeReceipt.date_created.split("T")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT NAME:</span>
                <span className="font-semibold text-slate-900">{activeReceipt.customer_name}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>REPAIRING UNIT:</span>
                <span className="font-bold text-slate-900">{activeReceipt.device_name}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CHASSIS MOD:</span>
                <span>{activeReceipt.device_model}</span>
              </div>
              <div>
                <span className="text-slate-400">DEFECT LOGGED:</span>
                <p className="text-[11px] font-sans mt-0.5 text-slate-700 italic">"{activeReceipt.defect_description}"</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>DIAGNOSTIC EST:</span>
                <span>${activeReceipt.cost_estimate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-950 text-sm">
                <span>TOTAL RECLAIMED:</span>
                <span>${(activeReceipt.actual_cost || activeReceipt.cost_estimate).toFixed(2)}</span>
              </div>
            </div>

            <div className="h-px bg-slate-200"></div>

            <div className="text-center text-[10px] text-slate-400 font-sans pb-2">
              <p>Device warranty covers replaced parts for 90 days.</p>
              <p className="mt-1">Thank you for choosing MIGO Quality repairs!</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); }}
                className="w-1/2 bg-slate-900 text-slate-100 py-2 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1 hover:bg-slate-800 cursor-pointer"
              >
                <Printer size={13} />
                Spool Print
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-1/2 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout: Technicians side + Repair listings queue adjacent */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Technicians list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-sans font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-1">
            <Cpu size={16} className="text-amber-500" /> Crew Technicians Roster
          </h3>

          <div className="space-y-4">
            {technicians.map(t => (
              <div key={t.technician_id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{t.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight font-medium uppercase block mt-0.5">{t.specialization}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${t.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
                </div>
                <div className="text-[11px] font-mono text-slate-500">{t.phone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Repairs list queue (Larger) */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">Active Repair Workbench</h3>

            {isLoading ? (
              <div className="text-center py-6 text-xs text-slate-400">Querying active work queue...</div>
            ) : repairs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No active device repair tickets.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repairs.map(job => {
                  const tech = technicians.find(t => t.technician_id === job.assigned_technician_id);
                  
                  return (
                    <div key={job.repair_job_id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between bg-white hover:border-slate-350 transition-colors">
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-bold font-medium block w-max mb-1.5">MIGO-{job.repair_job_id.toString().slice(-4)}</span>
                            <h4 className="font-sans font-bold text-slate-950 text-sm">{job.device_name}</h4>
                            <span className="text-[11px] text-slate-400 italic block">{job.device_model}</span>
                          </div>
                          
                          {/* status chip */}
                          <select
                            value={job.status}
                            onChange={(e) => shiftJobStatus(job.repair_job_id, e.target.value as RepairStatus)}
                            className={`font-mono font-bold text-[9px] px-2 py-1 rounded-full uppercase focus:outline-none cursor-pointer tracking-wider ${
                              job.status === "delivered"
                                ? "bg-slate-100 text-slate-800 border-slate-200"
                                : job.status === "ready"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse"
                                : job.status === "in_progress"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-amber-50 text-amber-600 border border-amber-200"
                            }`}
                          >
                            <option value="received">Received</option>
                            <option value="in_progress">In Progress</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>

                        {/* Defect */}
                        <div className="text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl font-sans text-slate-700 italic">
                          <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Reported defect:</span>
                          "{job.defect_description}"
                        </div>

                        {/* Assignee / Notes details */}
                        <div className="space-y-1.5 font-mono text-[10px] text-slate-500 pt-2">
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>Admitted: {job.date_created.split("T")[0]}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Assignee: {tech ? tech.name : "Unassigned Queue"}</span>
                          </div>
                          {job.notes && (
                            <div className="text-[10px] text-slate-400 truncate max-w-full">
                              Notes: {job.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* card Action footer */}
                      <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
                        <span className="font-mono text-xs font-extrabold text-slate-700">Estimate: <b className="text-slate-900">${job.cost_estimate}</b></span>
                        
                        <button
                          onClick={() => setActiveReceipt(job)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-mono tracking-tight font-bold flex items-center gap-1 cursor-pointer shadow-tiny"
                        >
                          <Receipt size={12} />
                          Repair Receipt
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

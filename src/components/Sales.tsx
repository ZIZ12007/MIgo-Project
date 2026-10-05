import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Tag, 
  Calculator, 
  CreditCard, 
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  ExternalLink
} from "lucide-react";
import { Customer, Gadget, SalesOrder, OrderItem, PaymentMethod } from "../types";

export default function Sales() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [recentOrders, setRecentOrders] = useState<SalesOrder[]>([]);
  
  // Checkout States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedGadgetId, setSelectedGadgetId] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [cart, setCart] = useState<{ gadget_id: number; name: string; price: number; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentViewLoading, setRecentViewLoading] = useState(true);

  useEffect(() => {
    fetchBase();
    fetchOrders();
  }, []);

  const fetchBase = async () => {
    try {
      const [cRes, gRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/gadgets")
      ]);
      if (cRes.ok) setCustomers(await cRes.json());
      if (gRes.ok) setGadgets(await gRes.json());
    } catch (e) {
      console.error("Failed to load point-of-sale configuration data:", e);
    }
  };

  const fetchOrders = async () => {
    setRecentViewLoading(true);
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        setRecentOrders(await res.json());
      }
    } catch (e) {
      console.error("Failed to pull billing invoices:", e);
    } finally {
      setRecentViewLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedGadgetId) return;
    const gadget = gadgets.find(g => g.gadget_id === parseInt(selectedGadgetId));
    if (!gadget) return;

    if (gadget.quantity_in_stock <= 0) {
      alert(`Product ${gadget.gadget_name} is currently out of stock.`);
      return;
    }

    const currentInCart = cart.find(item => item.gadget_id === gadget.gadget_id);
    const existingQty = currentInCart ? currentInCart.quantity : 0;
    const requestedQty = selectedQty;

    if (existingQty + requestedQty > gadget.quantity_in_stock) {
      alert(`Cannot add ${requestedQty} units. Only ${gadget.quantity_in_stock - existingQty} remaining in inventory storage.`);
      return;
    }

    if (currentInCart) {
      setCart(cart.map(item => 
        item.gadget_id === gadget.gadget_id 
          ? { ...item, quantity: item.quantity + requestedQty } 
          : item
      ));
    } else {
      setCart([...cart, {
        gadget_id: gadget.gadget_id,
        name: gadget.gadget_name,
        price: gadget.unit_price,
        quantity: requestedQty
      }]);
    }

    setSelectedGadgetId("");
    setSelectedQty(1);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(cart.filter(item => item.gadget_id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckoutSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!selectedCustomerId) {
      alert("Please designate a validated Customer Profile to bind the checkout receipt.");
      return;
    }
    if (cart.length === 0) {
      alert("You cannot settle a checkout session with an empty cart.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: parseInt(selectedCustomerId),
          items: cart.map(i => ({ gadget_id: i.gadget_id, quantity: i.quantity })),
          payment_method: paymentMethod
        })
      });

      if (res.ok) {
        alert("Transaction complete! Stock levels adjusted and customer spent balance logged.");
        setCart([]);
        setSelectedCustomerId("");
        fetchBase(); // Reload gadgets with decremented stocks
        fetchOrders(); // Refresh ledger invoice queue
      } else {
        const err = await res.json();
        alert("Transaction declined: " + err.error);
      }
    } catch (e) {
      console.error("Critical checkout submission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error("Error shifting order status:", e);
    }
  };

  return (
    <div id="migo-sales" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">POS Settle & Sells</h1>
          <p className="text-sm text-slate-500 font-sans">Build customer billing logs, monitor transaction channels, and approve shipping workflows.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Billing builder and cart column (Larger) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShoppingCart size={16} className="text-indigo-600" /> Assemble Billing Cart
            </h3>

            {/* Selector tools */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Customer select */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Validated Customer *</label>
                <select
                  id="checkout-customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer text-slate-700"
                >
                  <option value="">-- Choose Account --</option>
                  {customers.map(c => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} ({c.customer_type === "wholesale" ? "WS" : "Retail"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product select */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Available Gadget / Component</label>
                <select
                  id="checkout-product-select"
                  value={selectedGadgetId}
                  onChange={(e) => setSelectedGadgetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer text-slate-700"
                >
                  <option value="">-- Select Product Stock --</option>
                  {gadgets.map(g => (
                    <option key={g.gadget_id} value={g.gadget_id} disabled={g.quantity_in_stock <= 0}>
                      {g.gadget_name} (${g.unit_price} | {g.quantity_in_stock} left)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Bill Qty</label>
                <input
                  type="number"
                  min="1"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl hover:bg-indigo-700 cursor-pointer transition-colors"
                  title="Add to Invoice Lines"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Current cart items ledger */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Cart Invoice Lines:</span>
              
              {cart.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-xl text-center">
                  <p className="text-xs text-slate-500">Your POS billing assembly is empty. Designate products above to construct receipts.</p>
                </div>
              ) : (
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/80 font-mono text-[9px] uppercase font-bold text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Item details</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans">
                      {cart.map(item => (
                        <tr key={item.gadget_id}>
                          <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-3 px-4 text-right font-mono">${item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 bg-slate-100/50">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">${(item.price * item.quantity).toFixed(2)}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveFromCart(item.gadget_id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment and Settlement Panel */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 text-slate-100 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <h3 className="font-mono font-bold text-xs tracking-wider uppercase text-indigo-400 flex items-center gap-1.5 pb-3 border-b border-slate-800">
              <Calculator size={14} /> POS Checkout Ledger
            </h3>

            {/* Calculations summaries */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal amount:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Local Sales VAT (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="h-px bg-slate-800 my-4"></div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-200 font-sans font-semibold text-sm">TOTAL SETTLEMENT:</span>
                <span className="text-xl font-bold text-indigo-400">${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Payment selections */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Payment channel</span>
              <div className="grid grid-cols-3 gap-2">
                {(["cash", "card", "transfer"] as PaymentMethod[]).map(method => {
                  const isSelected = paymentMethod === method;
                  return (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-3 px-2 rounded-xl border text-[10px] font-mono font-extrabold uppercase tracking-widest flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600 font-bold" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <CreditCard size={14} />
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckoutSubmit}
            disabled={isSubmitting || cart.length === 0}
            className={`w-full py-4 rounded-xl font-mono font-extrabold uppercase text-xs tracking-widest mt-6 flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all ${
              cart.length === 0 
                ? "bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <CheckCircle size={15} />
            {isSubmitting ? "SQUARING LEDGER..." : "SETTLE TRANSACTION"}
          </button>
        </div>
      </div>

      {/* Invoice records ledger list below */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-sm">Recent Ledger Invoices Issued</h3>
            <p className="text-xs text-slate-500 font-sans">Active point-of-sale audits, shipment dispatch codes, and collection trackers.</p>
          </div>
          <button
            onClick={fetchOrders}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-mono"
          >
            <RefreshCw size={12} className={recentViewLoading ? "animate-spin" : ""} />
            Sync Ledger
          </button>
        </div>

        {recentViewLoading ? (
          <div className="text-center py-6 text-xs text-slate-400">Aligning transactional stream...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No transaction records found on active ledger.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[9px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="py-2 px-4">Invoice Num</th>
                  <th className="py-2 px-4">Client Name</th>
                  <th className="py-2 px-4">Receipt Date</th>
                  <th className="py-2 px-4">Stock Ledger Line Details</th>
                  <th className="py-2 px-4 text-right">Sum Invoice</th>
                  <th className="py-2 px-4 text-center">Settlement</th>
                  <th className="py-2 px-4 text-center">Delivery status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {recentOrders.map(order => (
                  <tr key={order.sales_order_id} className="hover:bg-slate-50/20 font-sans">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">#MIGO-{order.sales_order_id.toString().slice(-4)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{order.customer_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{order.order_date.split("T")[0]} {order.order_date.split("T")[1]?.slice(0, 5)}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <span key={idx} className="inline-block bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded mr-1">
                            {it.gadget_name} x{it.quantity_ordered}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-950">${order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      {order.payment ? (
                        <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-100 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase uppercase">
                          PAID [{order.payment.payment_method}]
                        </span>
                      ) : (
                        <span className="inline-block bg-amber-50 text-amber-600 border border-amber-100 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase uppercase">
                          PENDING PAYMENT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center">
                        <select
                          value={order.order_status}
                          onChange={(e) => updateOrderStatus(order.sales_order_id, e.target.value)}
                          className={`font-mono text-[10px] font-bold p-1 rounded-lg focus:outline-none uppercase ${
                            order.order_status === "delivered" 
                              ? "bg-slate-100 text-slate-800 border-slate-200" 
                              : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

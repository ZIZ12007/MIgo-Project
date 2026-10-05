import { GoogleGenAI } from "@google/genai";

// Standard Database Initial Schema matching server.ts
const INITIAL_DATABASE = {
  users: [
    {
      user_id: 1,
      username: "admin",
      first_name: "MIGO",
      last_name: "Admin",
      role: "admin",
      gender: "Male",
      phone_number: "+234 803 123 4567",
      date_registered: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
      user_id: 2,
      username: "sales1",
      first_name: "Chidi",
      last_name: "Okonkwo",
      role: "sales",
      gender: "Male",
      phone_number: "+234 809 987 6543",
      date_registered: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
    {
      user_id: 3,
      username: "tech1",
      first_name: "Bisi",
      last_name: "Adeleke",
      role: "technician",
      gender: "Female",
      phone_number: "+234 815 444 3322",
      date_registered: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    },
    {
      user_id: 4,
      username: "customer1",
      first_name: "Emeka",
      last_name: "Nwachukwu",
      role: "customer",
      gender: "Male",
      phone_number: "+234 703 555 1122",
      date_registered: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    }
  ],
  customers: [
    {
      customer_id: 101,
      customer_name: "Alaba Wholesalers",
      customer_type: "wholesale",
      phone_number: "+234 802 333 4444",
      email: "sales@alabawholesale.com",
      telegram: "@alb_wholesale",
      date_registered: "2026-05-01T10:00:00.000Z",
      total_spent: 4320.00
    },
    {
      customer_id: 102,
      customer_name: "Stella Ndidi",
      customer_type: "retail",
      phone_number: "+234 705 111 2233",
      email: "stella.ndidi@gmail.com",
      telegram: "",
      date_registered: "2026-05-15T14:30:00.000Z",
      total_spent: 850.00
    },
    {
      customer_id: 103,
      customer_name: "Abubakar Garba",
      customer_type: "retail",
      phone_number: "+234 901 888 9900",
      email: "abubakar_tech@yahoo.com",
      telegram: "@abubakar_g",
      date_registered: "2026-06-02T09:15:00.000Z",
      total_spent: 1200.00
    }
  ],
  suppliers: [
    {
      supplier_id: 201,
      supplier_name: "Shenzhen Gadgets Co.",
      contact_number: "+86 755 8888 9999",
      email: "order@shenzhen-gadgets.cn",
      address: "Futian District, Shenzhen, China"
    },
    {
      supplier_id: 202,
      supplier_name: "Lagos Mobile Hub Ltd",
      contact_number: "+234 806 777 8888",
      email: "wholesale@lagosmobilehub.com",
      address: "Computer Village, Ikeja, Lagos"
    }
  ],
  gadgets: [
    {
      gadget_id: 301,
      gadget_name: "iPhone 15 Pro Max",
      branch: "Ikeja Main",
      model: "256GB Titanium Gray",
      unit_price: 1399.00,
      quantity_in_stock: 14,
      supplier_id: 201
    },
    {
      gadget_id: 302,
      gadget_name: "Samsung Galaxy S24 Ultra",
      branch: "Ikeja Main",
      model: "512GB Titanium Black",
      unit_price: 1299.00,
      quantity_in_stock: 8,
      supplier_id: 201
    },
    {
      gadget_id: 303,
      gadget_name: "Xiaomi 14 Pro",
      branch: "Ikeja Main",
      model: "256GB Emerald Green",
      unit_price: 899.00,
      quantity_in_stock: 3,
      supplier_id: 201
    },
    {
      gadget_id: 304,
      gadget_name: "Infinix Note 40 Pro",
      branch: "Lekki Hub",
      model: "256GB Vintage Green",
      unit_price: 299.00,
      quantity_in_stock: 25,
      supplier_id: 202
    },
    {
      gadget_id: 305,
      gadget_name: "Redmi Note 13",
      branch: "Lekki Hub",
      model: "128GB Midnight Black",
      unit_price: 199.00,
      quantity_in_stock: 0,
      supplier_id: 202
    }
  ],
  technicians: [
    {
      technician_id: 401,
      name: "Bisi Adeleke",
      specialization: "iOS & Motherboard Soldering",
      phone: "+234 815 444 3322",
      status: "active"
    },
    {
      technician_id: 402,
      name: "Daniel Peters",
      specialization: "Android & Display Replacements",
      phone: "+234 905 222 1100",
      status: "active"
    },
    {
      technician_id: 403,
      name: "John Okafor",
      specialization: "Charging Ports & Battery Replacements",
      phone: "+234 803 777 9991",
      status: "inactive"
    }
  ],
  sales_orders: [
    {
      sales_order_id: 501,
      customer_id: 101,
      customer_name: "Alaba Wholesalers",
      order_date: "2026-06-10T11:20:00.000Z",
      order_status: "delivered",
      total_amount: 3897.00,
      items: [
        { gadget_id: 301, gadget_name: "iPhone 15 Pro Max", quantity_ordered: 2, sub_total: 2798.00 },
        { gadget_id: 303, gadget_name: "Xiaomi 14 Pro", quantity_ordered: 1, sub_total: 899.00 }
      ],
      payment: {
        payment_amount: 3897.00,
        payment_date: "2026-06-10T11:25:00.000Z",
        payment_method: "transfer"
      }
    },
    {
      sales_order_id: 502,
      customer_id: 102,
      customer_name: "Stella Ndidi",
      order_date: "2026-06-14T15:45:00.000Z",
      order_status: "shipped",
      total_amount: 598.00,
      items: [
        { gadget_id: 304, gadget_name: "Infinix Note 40 Pro", quantity_ordered: 2, sub_total: 598.00 }
      ],
      payment: {
        payment_amount: 598.00,
        payment_date: "2026-06-14T15:45:00.000Z",
        payment_method: "card"
      }
    },
    {
      sales_order_id: 503,
      customer_id: 103,
      customer_name: "Abubakar Garba",
      order_date: "2026-06-16T12:10:00.000Z",
      order_status: "pending",
      total_amount: 1299.00,
      items: [
        { gadget_id: 302, gadget_name: "Samsung Galaxy S24 Ultra", quantity_ordered: 1, sub_total: 1299.00 }
      ]
    }
  ],
  repair_jobs: [
    {
      repair_job_id: 601,
      customer_id: 102,
      customer_name: "Stella Ndidi",
      device_name: "iPhone 13 Pro",
      device_model: "Model A2638",
      defect_description: "Cracked screen and unresponsive touch",
      status: "delivered",
      cost_estimate: 150.00,
      actual_cost: 150.00,
      assigned_technician_id: 401,
      date_created: "2026-06-05T09:00:00.000Z",
      date_completed: "2026-06-06T14:00:00.000Z",
      notes: "Screen assembly replaced with genuine refurbished display. Tested okay."
    },
    {
      repair_job_id: 602,
      customer_id: 103,
      customer_name: "Abubakar Garba",
      device_name: "Galaxy S22",
      device_model: "SM-S901B",
      defect_description: "Battery draining very quickly, phone gets warm on charging",
      status: "in_progress",
      cost_estimate: 60.00,
      assigned_technician_id: 402,
      date_created: "2026-06-15T11:30:00.000Z",
      notes: "Inspected logic board. No short circuits found. Scheduled battery replacement."
    },
    {
      repair_job_id: 603,
      customer_id: 101,
      customer_name: "Alaba Wholesalers",
      device_name: "iPad Air 4th Gen",
      device_model: "A2316",
      defect_description: "Charging port damaged and loose",
      status: "received",
      cost_estimate: 95.00,
      date_created: "2026-06-17T08:00:00.000Z"
    }
  ]
};

const DB_KEY = "migo_management_system_db";

function getDB(): typeof INITIAL_DATABASE {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATABASE));
    return INITIAL_DATABASE;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_DATABASE;
  }
}

function saveDB(db: any) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Helpers
function safeParseInt(val: any, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? fallback : parsed;
}

function safeParseFloat(val: any, fallback = 0.0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

// Global flag to enable mock mode
let mockModeEnabled = false;

// Auto detect mode
export async function initializeApiRouter() {
  // Check if we are running on a hosting provider without a backend or if server is dead
  if (
    window.location.hostname.includes("netlify") || 
    window.location.hostname.includes("github.io") || 
    window.location.hostname.includes("vercel")
  ) {
    console.log("[MIGO API Mock] Netlify or Static environment detected. Activating Client-Side LocalStorage Engine.");
    mockModeEnabled = true;
    enableInterception();
    return;
  }

  // Try checking the real backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const check = await fetch("/api/users", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!check.ok && check.status !== 401) {
      throw new Error("Server returned non-ok response");
    }
    console.log("[MIGO API Mock] Server is active. Directing requests to backend Express server.");
  } catch (err) {
    console.warn("[MIGO API Mock] Node/Express backend is unreachable. Activating Client-Side LocalStorage Engine fallback.", err);
    mockModeEnabled = true;
    enableInterception();
  }
}

function enableInterception() {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (!mockModeEnabled) {
      return originalFetch(input, init);
    }

    const urlStr = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
    
    // Only intercept /api/ requests
    if (!urlStr.includes("/api/")) {
      return originalFetch(input, init);
    }

    // Parse path and method
    const urlObj = new URL(urlStr, window.location.origin);
    const path = urlObj.pathname;
    const method = (init?.method || "GET").toUpperCase();
    const bodyData = init?.body ? JSON.parse(init.body as string) : null;

    console.log(`[MIGO API Intercept] ${method} ${path}`, bodyData);

    // Mock API Handlers
    try {
      const db = getDB();

      // 1. Auth Login
      if (path === "/api/auth/login" && method === "POST") {
        const { username } = bodyData || {};
        const foundUser = db.users.find(u => u.username === username);
        if (foundUser) {
          return createMockResponse({
            success: true,
            user: foundUser,
            token: "migo-simulated-token-" + foundUser.user_id,
          });
        }
        return createMockResponse({ error: "Invalid username or password" }, 401);
      }

      // 2. Users CRUD
      if (path === "/api/users") {
        if (method === "GET") {
          return createMockResponse(db.users);
        }
        if (method === "POST") {
          const newUser = {
            user_id: Date.now(),
            date_registered: new Date().toISOString(),
            ...bodyData,
          };
          db.users.push(newUser);
          saveDB(db);
          return createMockResponse(newUser, 201);
        }
      }

      // 3. Customers CRUD
      if (path === "/api/customers") {
        if (method === "GET") {
          return createMockResponse(db.customers);
        }
        if (method === "POST") {
          const newCust = {
            customer_id: Date.now(),
            date_registered: new Date().toISOString(),
            total_spent: 0,
            ...bodyData,
          };
          db.customers.push(newCust);
          saveDB(db);
          return createMockResponse(newCust, 201);
        }
      }

      if (path.startsWith("/api/customers/")) {
        const id = safeParseInt(path.split("/").pop());
        if (method === "PUT") {
          const idx = db.customers.findIndex(c => safeParseInt(c.customer_id) === id);
          if (idx !== -1) {
            db.customers[idx] = { ...db.customers[idx], ...bodyData };
            saveDB(db);
            return createMockResponse(db.customers[idx]);
          }
          return createMockResponse({ error: "Customer not found" }, 404);
        }
        if (method === "DELETE") {
          db.customers = db.customers.filter(c => safeParseInt(c.customer_id) !== id);
          saveDB(db);
          return createMockResponse({ success: true });
        }
      }

      // 4. Suppliers CRUD
      if (path === "/api/suppliers") {
        if (method === "GET") {
          return createMockResponse(db.suppliers);
        }
        if (method === "POST") {
          const newSupplier = {
            supplier_id: Date.now(),
            ...bodyData,
          };
          db.suppliers.push(newSupplier);
          saveDB(db);
          return createMockResponse(newSupplier, 201);
        }
      }

      if (path.startsWith("/api/suppliers/")) {
        const id = safeParseInt(path.split("/").pop());
        if (method === "DELETE") {
          db.suppliers = db.suppliers.filter(s => safeParseInt(s.supplier_id) !== id);
          db.gadgets = db.gadgets.map(g => safeParseInt(g.supplier_id) === id ? { ...g, supplier_id: 0 } : g);
          saveDB(db);
          return createMockResponse({ success: true });
        }
      }

      // 5. Gadgets CRUD
      if (path === "/api/gadgets") {
        if (method === "GET") {
          return createMockResponse(db.gadgets);
        }
        if (method === "POST") {
          const newGadget = {
            gadget_id: Date.now(),
            ...bodyData,
            unit_price: safeParseFloat(bodyData.unit_price) || 0,
            quantity_in_stock: safeParseInt(bodyData.quantity_in_stock) || 0,
            supplier_id: safeParseInt(bodyData.supplier_id) || 0,
          };
          db.gadgets.push(newGadget);
          saveDB(db);
          return createMockResponse(newGadget, 201);
        }
      }

      if (path.startsWith("/api/gadgets/")) {
        const id = safeParseInt(path.split("/").pop());
        if (method === "PUT") {
          const idx = db.gadgets.findIndex(g => safeParseInt(g.gadget_id) === id);
          if (idx !== -1) {
            db.gadgets[idx] = {
              ...db.gadgets[idx],
              ...bodyData,
              unit_price: bodyData.unit_price !== undefined ? safeParseFloat(bodyData.unit_price) : db.gadgets[idx].unit_price,
              quantity_in_stock: bodyData.quantity_in_stock !== undefined ? safeParseInt(bodyData.quantity_in_stock) : db.gadgets[idx].quantity_in_stock,
              supplier_id: bodyData.supplier_id !== undefined ? safeParseInt(bodyData.supplier_id) : db.gadgets[idx].supplier_id,
            };
            saveDB(db);
            return createMockResponse(db.gadgets[idx]);
          }
          return createMockResponse({ error: "Gadget not found" }, 404);
        }
        if (method === "DELETE") {
          db.gadgets = db.gadgets.filter(g => safeParseInt(g.gadget_id) !== id);
          saveDB(db);
          return createMockResponse({ success: true });
        }
      }

      // 6. Sales Orders CRUD
      if (path === "/api/sales") {
        if (method === "GET") {
          return createMockResponse(db.sales_orders);
        }
        if (method === "POST") {
          const { customer_id, items, payment_method } = bodyData || {};
          const customer = db.customers.find(c => safeParseInt(c.customer_id) === safeParseInt(customer_id));
          if (!customer) {
            return createMockResponse({ error: "Customer not found" }, 400);
          }

          let totalAmount = 0;
          const processedItems = [];

          for (const item of items) {
            const gadget = db.gadgets.find(g => safeParseInt(g.gadget_id) === safeParseInt(item.gadget_id));
            if (!gadget) {
              return createMockResponse({ error: `Product ID ${item.gadget_id} not found` }, 400);
            }
            const qty = safeParseInt(item.quantity, 1);
            if (gadget.quantity_in_stock < qty) {
              return createMockResponse({ error: `Insufficient stock for ${gadget.gadget_name}. Only ${gadget.quantity_in_stock} remaining.` }, 400);
            }

            gadget.quantity_in_stock -= qty;
            const subTotal = gadget.unit_price * qty;
            totalAmount += subTotal;

            processedItems.push({
              gadget_id: gadget.gadget_id,
              gadget_name: gadget.gadget_name,
              quantity_ordered: qty,
              sub_total: subTotal,
            });
          }

          const orderId = Date.now();
          const newOrder = {
            sales_order_id: orderId,
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            order_date: new Date().toISOString(),
            order_status: "pending",
            total_amount: totalAmount,
            items: processedItems,
            payment: payment_method ? {
              payment_amount: totalAmount,
              payment_date: new Date().toISOString(),
              payment_method: payment_method
            } : undefined
          };

          customer.total_spent += totalAmount;
          db.sales_orders.push(newOrder);
          saveDB(db);
          return createMockResponse(newOrder, 201);
        }
      }

      if (path.startsWith("/api/sales/")) {
        const id = safeParseInt(path.split("/").pop());
        if (method === "PUT") {
          const idx = db.sales_orders.findIndex(o => safeParseInt(o.sales_order_id) === id);
          if (idx !== -1) {
            db.sales_orders[idx] = { ...db.sales_orders[idx], ...bodyData };
            saveDB(db);
            return createMockResponse(db.sales_orders[idx]);
          }
          return createMockResponse({ error: "Order not found" }, 404);
        }
      }

      // 7. Repairs CRUD
      if (path === "/api/repairs") {
        if (method === "GET") {
          return createMockResponse(db.repair_jobs);
        }
        if (method === "POST") {
          const { customer_id, device_name, device_model, defect_description, cost_estimate, assigned_technician_id, notes } = bodyData || {};
          const customer = db.customers.find(c => safeParseInt(c.customer_id) === safeParseInt(customer_id));
          if (!customer) {
            return createMockResponse({ error: "Customer not found" }, 400);
          }

          const newRepair = {
            repair_job_id: Date.now(),
            customer_id: customer.customer_id,
            customer_name: customer.customer_name,
            device_name,
            device_model: device_model || "Not specified",
            defect_description,
            status: "received",
            cost_estimate: safeParseFloat(cost_estimate) || 0,
            assigned_technician_id: assigned_technician_id ? safeParseInt(assigned_technician_id) : undefined,
            date_created: new Date().toISOString(),
            notes: notes || "",
          };

          db.repair_jobs.push(newRepair);
          saveDB(db);
          return createMockResponse(newRepair, 201);
        }
      }

      if (path.startsWith("/api/repairs/")) {
        const id = safeParseInt(path.split("/").pop());
        if (method === "PUT") {
          const idx = db.repair_jobs.findIndex(r => safeParseInt(r.repair_job_id) === id);
          if (idx !== -1) {
            const original = db.repair_jobs[idx];
            const updated = { ...original, ...bodyData };

            if ((updated.status === "ready" || updated.status === "delivered") && !original.date_completed) {
              updated.date_completed = new Date().toISOString();
              updated.actual_cost = updated.actual_cost || updated.cost_estimate;
            }

            if (updated.status === "delivered" && original.status !== "delivered") {
              const customer = db.customers.find(c => safeParseInt(c.customer_id) === safeParseInt(updated.customer_id));
              if (customer) {
                customer.total_spent += safeParseFloat(updated.actual_cost || updated.cost_estimate);
              }
            }

            db.repair_jobs[idx] = updated;
            saveDB(db);
            return createMockResponse(updated);
          }
          return createMockResponse({ error: "Repair job not found" }, 404);
        }
      }

      // 8. Technicians
      if (path === "/api/technicians") {
        if (method === "GET") {
          return createMockResponse(db.technicians);
        }
        if (method === "POST") {
          const newTech = {
            technician_id: Date.now(),
            name: bodyData.name,
            specialization: bodyData.specialization,
            phone: bodyData.phone,
            status: bodyData.status || "active",
          };
          db.technicians.push(newTech);
          saveDB(db);
          return createMockResponse(newTech, 201);
        }
      }

      // 9. Dashboard Stats
      if (path === "/api/dashboard/stats" && method === "GET") {
        const totalSales = db.sales_orders
          .filter(o => o.payment)
          .reduce((acc, o) => acc + (o.payment?.payment_amount || 0), 0);

        const activeRepairs = db.repair_jobs.filter(r => r.status !== "delivered").length;
        const lowStockItems = db.gadgets.filter(g => g.quantity_in_stock <= 3).length;

        const dailySales: { [date: string]: number } = {};
        db.sales_orders.forEach(o => {
          const d = o.order_date.split("T")[0];
          dailySales[d] = (dailySales[d] || 0) + o.total_amount;
        });

        const chartData = Object.keys(dailySales)
          .sort()
          .map(date => ({
            date,
            amount: dailySales[date]
          }))
          .slice(-7);

        return createMockResponse({
          totalSales,
          totalOrders: db.sales_orders.length,
          totalCustomers: db.customers.length,
          lowStockItems,
          activeRepairs,
          chartData
        });
      }

      // 10. AI Diagnose
      if (path === "/api/ai/diagnose" && method === "POST") {
        const { device_name, defect_description } = bodyData || {};
        const fallbackDiagnostics = `### Diagnostic Recommendations for ${device_name}
**Reported Defect:** ${defect_description}

*Note: AI Diagnostic Copilot is running in client-side simulation mode.*

#### Recommended Action Steps
1. **Initial Inspection:** Check the device for general physical impact, micro-cracks near ports, and water contact indicators (LCI).
2. **Standard Diagnostic Protocol:**
   - For power-related issues: Measure current draw across the charging port using a USB power meter. A typical functional device draws at least 1.2A to 2.0A. A static 0.1A current usually points to a main logic board short or PMIC lock.
   - For display-related issues: Isolate screen connection, check backlight fuses under a microscope, or test with a verified working screen module.
3. **Safety Advice:** When working with lithium-ion battery sectors, isolate power connectors immediately before decoupling camera or screen rails to prevent temporary shorts in backlights/touch panels.
4. **Estimated Diagnostic Severity:** Moderate, typical bench repair turnaround time is 45-60 minutes.`;

        return createMockResponse({ diagnosis: fallbackDiagnostics });
      }

      return createMockResponse({ error: "Endpoint mock not implemented" }, 404);

    } catch (error: any) {
      console.error("[MIGO API Intercept Error]", error);
      return createMockResponse({ error: error.message }, 500);
    }
  };
}

// Utility to generate a Response object
function createMockResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

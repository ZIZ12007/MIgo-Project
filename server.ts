import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Middleware
app.use(express.json());

// Ensure Database file is initialized
function ensureDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
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

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Initialise DB
ensureDatabase();

// Safe Parsing Helpers to avoid NaN and type coercion errors
function safeParseInt(val: any, fallback: number = 0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? fallback : parsed;
}

function safeParseFloat(val: any, fallback: number = 0.0): number {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number") return isNaN(val) ? fallback : val;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

// Load / Save Helpers
function readDB() {
  ensureDatabase();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Lazy init Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// ===================================
// API ROUTES
// ===================================

// Login simulated
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const foundUser = db.users.find((u: any) => u.username === username);
  if (foundUser) {
    res.json({
      success: true,
      user: foundUser,
      token: "migo-simulated-token-" + foundUser.user_id,
    });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// Users
app.get("/api/users", (req, res) => {
  res.json(readDB().users);
});

app.post("/api/users", (req, res) => {
  const db = readDB();
  const newUser = {
    user_id: Date.now(),
    date_registered: new Date().toISOString(),
    ...req.body,
  };
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

// Customers
app.get("/api/customers", (req, res) => {
  res.json(readDB().customers);
});

app.post("/api/customers", (req, res) => {
  const db = readDB();
  const newCust = {
    customer_id: Date.now(),
    date_registered: new Date().toISOString(),
    total_spent: 0,
    ...req.body,
  };
  db.customers.push(newCust);
  writeDB(db);
  res.status(201).json(newCust);
});

app.put("/api/customers/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  const idx = db.customers.findIndex((c: any) => safeParseInt(c.customer_id) === id);
  if (idx !== -1) {
    db.customers[idx] = { ...db.customers[idx], ...req.body };
    writeDB(db);
    res.json(db.customers[idx]);
  } else {
    res.status(404).json({ error: "Customer not found" });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  db.customers = db.customers.filter((c: any) => safeParseInt(c.customer_id) !== id);
  writeDB(db);
  res.json({ success: true });
});

// Suppliers
app.get("/api/suppliers", (req, res) => {
  res.json(readDB().suppliers);
});

app.post("/api/suppliers", (req, res) => {
  const db = readDB();
  const newSupplier = {
    supplier_id: Date.now(),
    ...req.body,
  };
  db.suppliers.push(newSupplier);
  writeDB(db);
  res.status(201).json(newSupplier);
});

app.delete("/api/suppliers/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  db.suppliers = db.suppliers.filter((s: any) => safeParseInt(s.supplier_id) !== id);
  db.gadgets = db.gadgets.map((g: any) => safeParseInt(g.supplier_id) === id ? { ...g, supplier_id: 0 } : g);
  writeDB(db);
  res.json({ success: true });
});

// Gadgets CRUD
app.get("/api/gadgets", (req, res) => {
  res.json(readDB().gadgets);
});

app.post("/api/gadgets", (req, res) => {
  const db = readDB();
  const newGadget = {
    gadget_id: Date.now(),
    ...req.body,
    unit_price: safeParseFloat(req.body.unit_price) || 0,
    quantity_in_stock: safeParseInt(req.body.quantity_in_stock) || 0,
    supplier_id: safeParseInt(req.body.supplier_id) || 0,
  };
  db.gadgets.push(newGadget);
  writeDB(db);
  res.status(201).json(newGadget);
});

app.put("/api/gadgets/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  const idx = db.gadgets.findIndex((g: any) => safeParseInt(g.gadget_id) === id);
  if (idx !== -1) {
    db.gadgets[idx] = {
      ...db.gadgets[idx],
      ...req.body,
      unit_price: req.body.unit_price !== undefined ? safeParseFloat(req.body.unit_price) : db.gadgets[idx].unit_price,
      quantity_in_stock: req.body.quantity_in_stock !== undefined ? safeParseInt(req.body.quantity_in_stock) : db.gadgets[idx].quantity_in_stock,
      supplier_id: req.body.supplier_id !== undefined ? safeParseInt(req.body.supplier_id) : db.gadgets[idx].supplier_id,
    };
    writeDB(db);
    res.json(db.gadgets[idx]);
  } else {
    res.status(404).json({ error: "Gadget not found" });
  }
});

app.delete("/api/gadgets/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.gadgets = db.gadgets.filter((g: any) => g.gadget_id !== id);
  writeDB(db);
  res.json({ success: true });
});

// Sales Orders
app.get("/api/sales", (req, res) => {
  res.json(readDB().sales_orders);
});

app.post("/api/sales", (req, res) => {
  const db = readDB();
  const { customer_id, items, payment_method } = req.body;

  // Find customer using safe parse comparison
  const customer = db.customers.find((c: any) => safeParseInt(c.customer_id) === safeParseInt(customer_id));
  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }

  // Verify stock and compute total
  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const gadget = db.gadgets.find((g: any) => safeParseInt(g.gadget_id) === safeParseInt(item.gadget_id));
    if (!gadget) {
      return res.status(400).json({ error: `Product ID ${item.gadget_id} not found` });
    }
    const qty = safeParseInt(item.quantity, 1);
    if (gadget.quantity_in_stock < qty) {
      return res.status(400).json({ error: `Insufficient stock for ${gadget.gadget_name}. Only ${gadget.quantity_in_stock} remaining.` });
    }

    // Deduct stock
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

  // Log customer spent
  customer.total_spent += totalAmount;

  db.sales_orders.push(newOrder);
  writeDB(db);

  res.status(201).json(newOrder);
});

app.put("/api/sales/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  const idx = db.sales_orders.findIndex((o: any) => safeParseInt(o.sales_order_id) === id);
  if (idx !== -1) {
    db.sales_orders[idx] = { ...db.sales_orders[idx], ...req.body };
    writeDB(db);
    res.json(db.sales_orders[idx]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Repairs
app.get("/api/repairs", (req, res) => {
  res.json(readDB().repair_jobs);
});

app.post("/api/repairs", (req, res) => {
  const db = readDB();
  const { customer_id, device_name, device_model, defect_description, cost_estimate, assigned_technician_id, notes } = req.body;

  const customer = db.customers.find((c: any) => safeParseInt(c.customer_id) === safeParseInt(customer_id));
  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
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
  writeDB(db);
  res.status(201).json(newRepair);
});

app.put("/api/repairs/:id", (req, res) => {
  const db = readDB();
  const id = safeParseInt(req.params.id);
  const idx = db.repair_jobs.findIndex((r: any) => safeParseInt(r.repair_job_id) === id);
  if (idx !== -1) {
    const original = db.repair_jobs[idx];
    const updated = { ...original, ...req.body };

    // Set complete date if changing to delivered/ready
    if ((updated.status === "ready" || updated.status === "delivered") && !original.date_completed) {
      updated.date_completed = new Date().toISOString();
      updated.actual_cost = updated.actual_cost || updated.cost_estimate;
    }
    
    // Add amount to customer's total spent if delivered
    if (updated.status === "delivered" && original.status !== "delivered") {
      const customer = db.customers.find((c: any) => safeParseInt(c.customer_id) === safeParseInt(updated.customer_id));
      if (customer) {
        customer.total_spent += safeParseFloat(updated.actual_cost || updated.cost_estimate);
      }
    }

    db.repair_jobs[idx] = updated;
    writeDB(db);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Repair job not found" });
  }
});

// Technicians
app.get("/api/technicians", (req, res) => {
  res.json(readDB().technicians);
});

app.post("/api/technicians", (req, res) => {
  const db = readDB();
  const newTech = {
    technician_id: Date.now(),
    name: req.body.name,
    specialization: req.body.specialization,
    phone: req.body.phone,
    status: req.body.status || "active",
  };
  db.technicians.push(newTech);
  writeDB(db);
  res.status(201).json(newTech);
});

// Stats dashboard
app.get("/api/dashboard/stats", (req, res) => {
  const db = readDB();
  
  const totalSales = db.sales_orders
    .filter((o: any) => o.payment)
    .reduce((acc: number, o: any) => acc + (o.payment.payment_amount || 0), 0);

  const activeRepairs = db.repair_jobs.filter((r: any) => r.status !== "delivered").length;
  const lowStockItems = db.gadgets.filter((g: any) => g.quantity_in_stock <= 3).length;

  // Chart data: sales by day last 7 days
  const dailySales: { [date: string]: number } = {};
  db.sales_orders.forEach((o: any) => {
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

  res.json({
    totalSales,
    totalOrders: db.sales_orders.length,
    totalCustomers: db.customers.length,
    lowStockItems,
    activeRepairs,
    chartData
  });
});

// Gemini Diagnostics Assistant integration
app.post("/api/ai/diagnose", async (req, res) => {
  const { device_name, defect_description } = req.body;

  if (!device_name || !defect_description) {
    return res.status(400).json({ error: "Device name and defect description are required." });
  }

  const ai = getAIClient();

  if (!ai) {
    // Generate helpful fallback detailed response if Gemini key is not set
    const fallbackDiagnostics = `### Diagnostic Recommendations for ${device_name}
**Reported Defect:** ${defect_description}

*Note: AI Diagnostic Copilot is running in fallback mode.*

#### Recommended Action Steps
1. **Initial Inspection:** Check the device for general physical impact, micro-cracks near ports, and water contact indicators (LCI).
2. **Standard Diagnostic Protocol:**
   - For power-related issues: Measure current draw across the charging port using a USB power meter. A typical functional device draws at least 1.2A to 2.0A. A static 0.1A current usually points to a main logic board short or PMIC lock.
   - For display-related issues: Isolate screen connection, check backlight fuses under a microscope, or test with a verified working screen module.
3. **Safety Advice:** When working with lithium-ion battery sectors, isolate power connectors immediately before decoupling camera or screen rails to prevent temporary shorts in backlights/touch panels.
4. **Estimated Diagnostic Severity:** Moderate, typical bench repair turnaround time is 45-60 minutes.`;

    return res.json({ diagnosis: fallbackDiagnostics });
  }

  try {
    const prompt = `You are the chief hardware engineer at MIGO Mobile Tech. Provide high-quality, practical step-by-step bench diagnostics and step-by-step repair instruction advice for our specialized technicians.
Device: ${device_name}
Defect description: ${defect_description}

Deliver the response using high quality, concise MD markdown formatting. Include:
1. BENCH ANALYSIS (Briefly state typical root causes, multimeter tests or power-meter readings to check).
2. STEP-BY-STEP WORKFLOW (To identify/resolve the issue safely).
3. ESTIMATED DIFFICULT RATING (Easy, Medium, Hard).
Keep the guidance highly practical, hardware-engineering focused, and tailored to cell phone bench repair technicians (e.g. mention shield removal, hot air station temperature constraints, battery safety, test points where applicable).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ diagnosis: response.text });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({ error: "Generative diagnostic assistance failed: " + error.message });
  }
});


// ===================================
// VITE OR STATIC MIDDLEWARE
// ===================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MIGO Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

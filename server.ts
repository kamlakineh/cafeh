import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import postgres from "postgres";
import { UTApi } from "uploadthing/server";
import { PRODUCTS, BLOG_POSTS, TEAM_MEMBERS, FAQS } from "./src/data";
import { Product, Order, OrderItem, BlogPost, Employee, InventoryItem, Review, TeamMember, FAQItem } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Enable larger payloads for base64 uploads

// --- DATABASE AND CLOUD STORAGE SERVICES ---

let sqlClient: any = null;

function getDb() {
  if (!sqlClient) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn("⚠️ DATABASE_URL is not defined in environment variables. Falling back to in-memory store.");
      return null;
    }
    try {
      sqlClient = postgres(dbUrl, { ssl: "require", max_prepared: 0 } as any);
    } catch (err) {
      console.error("⚠️ Failed to initialize postgres client:", err);
      sqlClient = null;
    }
  }
  return sqlClient;
}

// In-Memory Backups (Fallback if DB is not defined or down)
let menuProducts: Product[] = [...PRODUCTS];
let menuBlogs: BlogPost[] = [...BLOG_POSTS];
let localTeamMembers: TeamMember[] = [...TEAM_MEMBERS];
let localFaqs: FAQItem[] = [...FAQS];
let orders: Order[] = [
  {
    id: "ORD-101",
    table: "Table 4",
    customerName: "Sarah J.",
    type: "Dine-in",
    status: "Cooking",
    items: [
      { id: "b1", name: "Truffle Wagyu Burger", quantity: 1, customizations: ["Medium Rare", "Extra Truffle Aioli"], price: 24.99 },
      { id: "s1", name: "Truffle Fries", quantity: 1, customizations: ["Large"], price: 6.99 }
    ],
    total: 31.98,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    chef: "Chef Marcus",
    priority: true,
    timeRemaining: 240
  },
  {
    id: "ORD-102",
    table: "Delivery",
    customerName: "David Miller",
    type: "Delivery",
    status: "Preparing",
    items: [
      { id: "b2", name: "Double Cheese Golden Burger", quantity: 2, customizations: ["No Onion", "Extra Cheddar"], price: 18.99 },
      { id: "d1", name: "Craft Cola", quantity: 2, customizations: ["Ice-cold"], price: 3.50 }
    ],
    total: 44.98,
    paymentStatus: "Paid",
    paymentMethod: "Wallet",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    chef: "Grill Station #1",
    priority: false
  },
  {
    id: "ORD-103",
    table: "Pickup #12",
    customerName: "Emma Watson",
    type: "Pickup",
    status: "Pending",
    items: [
      { id: "b3", name: "Avocado Plant-Based Burger", quantity: 1, customizations: ["Gluten-Free Bun"], price: 16.99 },
      { id: "d2", name: "Champagne Infused Fizz", quantity: 1, customizations: [], price: 12.00 }
    ],
    total: 28.99,
    paymentStatus: "Pending",
    paymentMethod: "",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    priority: false
  }
];

let reviews: Review[] = [
  { id: 1, name: "Sarah Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", rating: 5, text: "The Truffle Wagyu is the best burger I've ever had. Absolute culinary perfection!", date: "March 15, 2026" },
  { id: 2, name: "Liam Carter", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", rating: 5, text: "Unbelievable dark aesthetic and premium presentation. Truly a luxury dining experience.", date: "April 2, 2026" },
  { id: 3, name: "Michael Vance", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", rating: 4, text: "Fries are crispy, burger is juicy, and the Golden Feast is worth every dollar.", date: "June 24, 2026" }
];

let inventory: InventoryItem[] = [
  { item: "Aged Wagyu Patties", current: 84, min: 30, status: "OK" },
  { item: "Gold Foil Leaves (24k)", current: 12, min: 10, status: "Low" },
  { item: "Truffle Aioli Sauce", current: 5, min: 20, status: "Critical" },
  { item: "Brioche Buns", current: 110, min: 40, status: "OK" },
  { item: "Avocado Patties", current: 15, min: 15, status: "Low" }
];

let employees: Employee[] = [
  {
    id: "EMP-099",
    name: "Aura Owner",
    role: "Owner",
    status: "On duty",
    performance: 100,
    shiftTime: "Flexible Hours",
    pin: "9999",
    password: "ownerpassword",
    isAccessEnabled: true,
    attendanceLogs: []
  },
  { 
    id: "EMP-100", 
    name: "David Miller", 
    role: "General Manager", 
    status: "On duty", 
    performance: 96, 
    shiftTime: "08:00 AM - 05:00 PM",
    pin: "5555", 
    password: "managerpassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "07:55 AM", type: "Auto", onTime: true },
      { date: "2026-07-14", timeIn: "07:50 AM", type: "Auto", onTime: true }
    ] 
  },
  { 
    id: "EMP-101", 
    name: "Chef Marcus", 
    role: "Executive Chef", 
    status: "On duty", 
    performance: 94, 
    shiftTime: "08:00 AM - 04:00 PM",
    pin: "1111", 
    password: "chefpassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "07:45 AM", type: "Auto", onTime: true },
      { date: "2026-07-14", timeIn: "07:48 AM", type: "Auto", onTime: true }
    ] 
  },
  { 
    id: "EMP-102", 
    name: "Chef Elena", 
    role: "Grill Specialist", 
    status: "On duty", 
    performance: 88, 
    shiftTime: "08:00 AM - 04:00 PM",
    pin: "2222", 
    password: "elenapassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "08:15 AM", type: "Auto", onTime: false },
      { date: "2026-07-14", timeIn: "07:59 AM", type: "Auto", onTime: true }
    ] 
  },
  { 
    id: "EMP-103", 
    name: "Chef Carlos", 
    role: "Fry Specialist", 
    status: "Break", 
    performance: 85, 
    shiftTime: "12:00 PM - 08:00 PM",
    pin: "3333", 
    password: "carlospassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "11:58 AM", type: "Auto", onTime: true },
      { date: "2026-07-14", timeIn: "12:05 PM", type: "Auto", onTime: false }
    ] 
  },
  { 
    id: "EMP-104", 
    name: "John Cashier", 
    role: "Receptionist", 
    status: "On duty", 
    performance: 91, 
    shiftTime: "08:00 AM - 04:00 PM",
    pin: "4444", 
    password: "johnpassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "07:50 AM", type: "Auto", onTime: true },
      { date: "2026-07-14", timeIn: "07:55 AM", type: "Auto", onTime: true }
    ] 
  },
  { 
    id: "EMP-105", 
    name: "Emily Waiter", 
    role: "Senior Waiter", 
    status: "On duty", 
    performance: 95, 
    shiftTime: "08:00 AM - 04:00 PM",
    pin: "1234", 
    password: "emilypassword", 
    isAccessEnabled: true, 
    attendanceLogs: [
      { date: "2026-07-15", timeIn: "07:58 AM", type: "Auto", onTime: true },
      { date: "2026-07-14", timeIn: "07:52 AM", type: "Auto", onTime: true }
    ] 
  }
];

// --- MAP SQL ROWS TO TYPES ---

function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    category: row.category,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    rating: parseFloat(row.rating),
    reviewsCount: parseInt(row.reviews_count),
    prepTime: row.prep_time || "",
    calories: row.calories || "",
    image: row.image || "",
    badge: row.badge || undefined,
    ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
    allergens: row.allergens ? JSON.parse(row.allergens) : [],
    spiceLevel: row.spice_level !== null && row.spice_level !== undefined ? parseInt(row.spice_level) : undefined,
    isAvailable: row.is_available,
    addOns: row.add_ons ? JSON.parse(row.add_ons) : undefined,
  };
}

function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    table: row.table_num || "Dine-In",
    customerName: row.customer_name || "Guest",
    type: row.type,
    status: row.status,
    items: row.items ? JSON.parse(row.items) : [],
    total: parseFloat(row.total),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method || "",
    createdAt: row.created_at,
    chef: row.chef || undefined,
    notes: row.notes || undefined,
    waiter: row.waiter || undefined,
    priority: row.priority,
    delayReason: row.delay_reason || undefined,
    timeRemaining: row.time_remaining !== null && row.time_remaining !== undefined ? parseInt(row.time_remaining) : undefined,
  };
}

function mapRowToReview(row: any): Review {
  return {
    id: parseInt(row.id),
    name: row.name,
    avatar: row.avatar || "",
    rating: parseInt(row.rating),
    text: row.text || "",
    date: row.date || "",
  };
}

function mapRowToBlog(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    excerpt: row.excerpt || "",
    content: row.content || "",
    image: row.image || "",
    authorName: row.author_name || "",
    authorAvatar: row.author_avatar || "",
    date: row.date || "",
    readTime: row.read_time || "",
    tags: row.tags ? JSON.parse(row.tags) : [],
  };
}

function mapRowToInventory(row: any): InventoryItem {
  return {
    item: row.item,
    current: parseInt(row.current),
    min: parseInt(row.min),
    status: row.status,
  };
}

function mapRowToEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    status: row.status,
    performance: parseInt(row.performance),
    shiftTime: row.shift_time || undefined,
    pin: row.pin || undefined,
    password: row.password || undefined,
    isAccessEnabled: row.is_access_enabled,
    attendanceLogs: row.attendance_logs ? JSON.parse(row.attendance_logs) : [],
  };
}

function mapRowToTeamMember(row: any): TeamMember {
  return {
    name: row.name,
    role: row.role,
    photo: row.photo || "",
    bio: row.bio || "",
  };
}

function mapRowToFAQ(row: any): FAQItem {
  return {
    question: row.question,
    answer: row.answer,
  };
}

// --- DATABASE DML FUNCTIONS ---

async function dbInsertProduct(prod: Product) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO products (id, name, description, category, price, original_price, rating, reviews_count, prep_time, calories, image, badge, ingredients, allergens, spice_level, is_available, add_ons)
    VALUES (
      ${prod.id}, 
      ${prod.name}, 
      ${prod.description}, 
      ${prod.category}, 
      ${prod.price}, 
      ${prod.originalPrice ?? null}, 
      ${prod.rating}, 
      ${prod.reviewsCount}, 
      ${prod.prepTime}, 
      ${prod.calories}, 
      ${prod.image}, 
      ${prod.badge ?? null}, 
      ${JSON.stringify(prod.ingredients)}, 
      ${JSON.stringify(prod.allergens)}, 
      ${prod.spiceLevel ?? null}, 
      ${prod.isAvailable ?? true}, 
      ${JSON.stringify(prod.addOns ?? [])}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      rating = EXCLUDED.rating,
      reviews_count = EXCLUDED.reviews_count,
      prep_time = EXCLUDED.prep_time,
      calories = EXCLUDED.calories,
      image = EXCLUDED.image,
      badge = EXCLUDED.badge,
      ingredients = EXCLUDED.ingredients,
      allergens = EXCLUDED.allergens,
      spice_level = EXCLUDED.spice_level,
      is_available = EXCLUDED.is_available,
      add_ons = EXCLUDED.add_ons
  `;
}

async function dbSaveOrder(ord: Order) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO orders (id, table_num, customer_name, type, status, items, total, payment_status, payment_method, created_at, chef, notes, priority, delay_reason, time_remaining, waiter)
    VALUES (
      ${ord.id},
      ${ord.table},
      ${ord.customerName},
      ${ord.type},
      ${ord.status},
      ${JSON.stringify(ord.items)},
      ${ord.total},
      ${ord.paymentStatus},
      ${ord.paymentMethod},
      ${ord.createdAt},
      ${ord.chef ?? null},
      ${ord.notes ?? null},
      ${ord.priority},
      ${ord.delayReason ?? null},
      ${ord.timeRemaining ?? null},
      ${ord.waiter ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      table_num = EXCLUDED.table_num,
      customer_name = EXCLUDED.customer_name,
      type = EXCLUDED.type,
      status = EXCLUDED.status,
      items = EXCLUDED.items,
      total = EXCLUDED.total,
      payment_status = EXCLUDED.payment_status,
      payment_method = EXCLUDED.payment_method,
      created_at = EXCLUDED.created_at,
      chef = EXCLUDED.chef,
      notes = EXCLUDED.notes,
      priority = EXCLUDED.priority,
      delay_reason = EXCLUDED.delay_reason,
      time_remaining = EXCLUDED.time_remaining,
      waiter = EXCLUDED.waiter
  `;
}

async function dbSaveBlog(b: BlogPost) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO blogs (id, title, category, excerpt, content, image, author_name, author_avatar, date, read_time, tags)
    VALUES (
      ${b.id},
      ${b.title},
      ${b.category},
      ${b.excerpt},
      ${b.content},
      ${b.image},
      ${b.authorName},
      ${b.authorAvatar},
      ${b.date},
      ${b.readTime},
      ${JSON.stringify(b.tags)}
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      category = EXCLUDED.category,
      excerpt = EXCLUDED.excerpt,
      content = EXCLUDED.content,
      image = EXCLUDED.image,
      author_name = EXCLUDED.author_name,
      author_avatar = EXCLUDED.author_avatar,
      date = EXCLUDED.date,
      read_time = EXCLUDED.read_time,
      tags = EXCLUDED.tags
  `;
}

async function dbSaveEmployee(emp: Employee) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO employees (id, name, role, status, performance, shift_time, pin, password, is_access_enabled, attendance_logs)
    VALUES (
      ${emp.id},
      ${emp.name},
      ${emp.role},
      ${emp.status},
      ${emp.performance},
      ${emp.shiftTime ?? null},
      ${emp.pin ?? null},
      ${emp.password ?? null},
      ${emp.isAccessEnabled ?? true},
      ${JSON.stringify(emp.attendanceLogs ?? [])}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      performance = EXCLUDED.performance,
      shift_time = EXCLUDED.shift_time,
      pin = EXCLUDED.pin,
      password = EXCLUDED.password,
      is_access_enabled = EXCLUDED.is_access_enabled,
      attendance_logs = EXCLUDED.attendance_logs
  `;
}

async function dbSaveTeamMember(m: TeamMember) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO team_members (name, role, photo, bio)
    VALUES (${m.name}, ${m.role}, ${m.photo}, ${m.bio})
    ON CONFLICT (name) DO UPDATE SET
      role = EXCLUDED.role,
      photo = EXCLUDED.photo,
      bio = EXCLUDED.bio
  `;
}

async function dbSaveFAQ(faq: FAQItem) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO faqs (question, answer)
    VALUES (${faq.question}, ${faq.answer})
  `;
}

// --- DATABASE ACCESS HELPERS ---

async function dbSelectOrders(): Promise<Order[]> {
  const db = getDb();
  if (!db) return orders;
  try {
    const rows = await db`SELECT * FROM orders ORDER BY created_at DESC`;
    return rows.map(mapRowToOrder);
  } catch (error) {
    console.error("Failed to select orders:", error);
    return orders;
  }
}

async function dbSelectProducts(): Promise<Product[]> {
  const db = getDb();
  if (!db) return menuProducts;
  try {
    const rows = await db`SELECT * FROM products ORDER BY category ASC, id ASC`;
    return rows.map(mapRowToProduct);
  } catch (error) {
    console.error("Failed to select products:", error);
    return menuProducts;
  }
}

async function dbSelectInventory(): Promise<InventoryItem[]> {
  const db = getDb();
  if (!db) return inventory;
  try {
    const rows = await db`SELECT * FROM inventory ORDER BY item ASC`;
    return rows.map(mapRowToInventory);
  } catch (error) {
    console.error("Failed to select inventory:", error);
    return inventory;
  }
}

async function dbSelectReviews(): Promise<Review[]> {
  const db = getDb();
  if (!db) return reviews;
  try {
    const rows = await db`SELECT * FROM reviews ORDER BY id DESC`;
    return rows.map(mapRowToReview);
  } catch (error) {
    console.error("Failed to select reviews:", error);
    return reviews;
  }
}

async function dbSelectBlogs(): Promise<BlogPost[]> {
  const db = getDb();
  if (!db) return menuBlogs;
  try {
    const rows = await db`SELECT * FROM blogs ORDER BY date DESC, id DESC`;
    return rows.map(mapRowToBlog);
  } catch (error) {
    console.error("Failed to select blogs:", error);
    return menuBlogs;
  }
}

async function dbSelectEmployees(): Promise<Employee[]> {
  const db = getDb();
  if (!db) return employees;
  try {
    const rows = await db`SELECT * FROM employees ORDER BY id ASC`;
    return rows.map(mapRowToEmployee);
  } catch (error) {
    console.error("Failed to select employees:", error);
    return employees;
  }
}

async function dbSelectTeamMembers(): Promise<TeamMember[]> {
  const db = getDb();
  if (!db) return localTeamMembers;
  try {
    const rows = await db`SELECT * FROM team_members ORDER BY name ASC`;
    return rows.map(mapRowToTeamMember);
  } catch (error) {
    console.error("Failed to select team members:", error);
    return localTeamMembers;
  }
}

async function dbSelectFAQs(): Promise<FAQItem[]> {
  const db = getDb();
  if (!db) return localFaqs;
  try {
    const rows = await db`SELECT * FROM faqs ORDER BY id ASC`;
    return rows.map(mapRowToFAQ);
  } catch (error) {
    console.error("Failed to select faqs:", error);
    return localFaqs;
  }
}

// --- UPLOADTHING CORE INTEGRATION ---

async function uploadBase64ToUploadthing(base64DataUrl: string): Promise<string> {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) {
    console.warn("⚠️ UPLOADTHING_TOKEN is not defined in environment variables. Storing image as-is (base64).");
    return base64DataUrl;
  }

  try {
    const match = base64DataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      return base64DataUrl;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");
    
    const ext = mimeType.split("/")[1] || "png";
    const filename = `aura-upload-${Date.now()}.${ext}`;

    const blob = new Blob([buffer], { type: mimeType });
    const file = typeof File !== "undefined"
      ? new File([blob], filename, { type: mimeType })
      : Object.assign(blob, { name: filename });

    console.log(`📡 Uploading image to Uploadthing (${buffer.length} bytes)...`);
    const utapi = new UTApi({ token });
    const response = await utapi.uploadFiles(file);

    if (response && response.data && response.data.url) {
      console.log(`✅ Uploadthing upload successful! CDN URL: ${response.data.url}`);
      return response.data.url;
    } else {
      console.warn("⚠️ Uploadthing response did not contain data.url:", response);
    }
  } catch (error) {
    console.error("❌ Error uploading base64 to Uploadthing:", error);
  }

  return base64DataUrl;
}

// --- GEMINI AI SERVICES ---

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Please add it via AI Studio Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --- EXPRESS SERVER ENDPOINTS (CRUD OPERATIONS) ---

// Get Orders
app.get("/api/orders", async (req, res) => {
  try {
    const data = await dbSelectOrders();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order
app.post("/api/orders", async (req, res) => {
  try {
    const newOrder: Order = {
      id: `ORD-${Math.floor(100 + Math.random() * 900)}`,
      table: req.body.table || "Dine-In",
      customerName: req.body.customerName || "Guest",
      type: req.body.type || "Dine-in",
      status: req.body.status || "Pending",
      items: req.body.items || [],
      total: req.body.total || 0,
      paymentStatus: req.body.paymentStatus || "Pending",
      paymentMethod: req.body.paymentMethod || "",
      createdAt: new Date().toISOString(),
      chef: req.body.chef,
      notes: req.body.notes,
      priority: req.body.priority || false,
      timeRemaining: req.body.timeRemaining
    };

    const db = getDb();
    if (db) {
      await dbSaveOrder(newOrder);
    } else {
      orders.unshift(newOrder);
    }
    res.status(201).json(newOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order
app.patch("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM orders WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      const existing = mapRowToOrder(rows[0]);
      const updated = { ...existing, ...req.body };
      await dbSaveOrder(updated);
      res.json(updated);
    } else {
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...req.body };
        res.json(orders[index]);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Menu Products
app.get("/api/products", async (req, res) => {
  try {
    const data = await dbSelectProducts();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Menu Product
app.post("/api/products", async (req, res) => {
  try {
    let imageUrl = req.body.image || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600";
    if (imageUrl && imageUrl.startsWith("data:")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl);
    }

    const newProd: Product = {
      ...req.body,
      id: req.body.id || `b_${Date.now()}`,
      rating: req.body.rating || 5.0,
      reviewsCount: req.body.reviewsCount || 0,
      ingredients: req.body.ingredients || [],
      allergens: req.body.allergens || [],
      image: imageUrl
    };

    const db = getDb();
    if (db) {
      await dbInsertProduct(newProd);
    } else {
      menuProducts.push(newProd);
    }
    res.status(201).json(newProd);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Menu Product
app.patch("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let imageUrl = req.body.image;
    if (imageUrl && imageUrl.startsWith("data:")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl);
    }

    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM products WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      const existing = mapRowToProduct(rows[0]);
      const updated = { ...existing, ...req.body };
      if (imageUrl) {
        updated.image = imageUrl;
      }
      await dbInsertProduct(updated);
      res.json(updated);
    } else {
      const idx = menuProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        menuProducts[idx] = { ...menuProducts[idx], ...req.body };
        if (imageUrl) {
          menuProducts[idx].image = imageUrl;
        }
        res.json(menuProducts[idx]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Menu Product
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM products WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      await db`DELETE FROM products WHERE id = ${id}`;
      res.json(mapRowToProduct(rows[0]));
    } else {
      const idx = menuProducts.findIndex(p => p.id === id);
      if (idx !== -1) {
        const deleted = menuProducts.splice(idx, 1);
        res.json(deleted[0]);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Inventory
app.get("/api/inventory", async (req, res) => {
  try {
    const data = await dbSelectInventory();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Inventory Item
app.post("/api/inventory/update", async (req, res) => {
  const { item, current } = req.body;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM inventory WHERE item = ${item}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      const existing = mapRowToInventory(rows[0]);
      existing.current = current;
      if (current <= 5) existing.status = "Critical";
      else if (current <= existing.min) existing.status = "Low";
      else existing.status = "OK";

      await dbSaveInventory(existing);
      res.json(existing);
    } else {
      const idx = inventory.findIndex(inv => inv.item === item);
      if (idx !== -1) {
        inventory[idx].current = current;
        if (current <= 5) inventory[idx].status = "Critical";
        else if (current <= inventory[idx].min) inventory[idx].status = "Low";
        else inventory[idx].status = "OK";
        res.json(inventory[idx]);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Inventory Item
app.post("/api/inventory", async (req, res) => {
  const { item, current, min } = req.body;
  if (!item) {
    return res.status(400).json({ error: "Item name is required" });
  }
  try {
    let status: "OK" | "Low" | "Critical" = "OK";
    const currVal = current !== undefined ? parseInt(current) : 0;
    const minVal = min !== undefined ? parseInt(min) : 10;
    if (currVal <= 5) status = "Critical";
    else if (currVal <= minVal) status = "Low";

    const newItem: InventoryItem = {
      item,
      current: currVal,
      min: minVal,
      status
    };

    const db = getDb();
    if (db) {
      await dbSaveInventory(newItem);
    } else {
      const idx = inventory.findIndex(inv => inv.item === item);
      if (idx !== -1) {
        inventory[idx] = newItem;
      } else {
        inventory.push(newItem);
      }
    }
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update (Edit) Inventory Item details
app.patch("/api/inventory/:oldItemName", async (req, res) => {
  const { oldItemName } = req.params;
  const { item, current, min } = req.body;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM inventory WHERE item = ${oldItemName}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      const existing = mapRowToInventory(rows[0]);
      const currVal = current !== undefined ? parseInt(current) : existing.current;
      const minVal = min !== undefined ? parseInt(min) : existing.min;
      const newItemName = item || existing.item;
      
      let status: "OK" | "Low" | "Critical" = "OK";
      if (currVal <= 5) status = "Critical";
      else if (currVal <= minVal) status = "Low";

      if (newItemName !== oldItemName) {
        await db`DELETE FROM inventory WHERE item = ${oldItemName}`;
      }

      const updated: InventoryItem = {
        item: newItemName,
        current: currVal,
        min: minVal,
        status
      };
      await dbSaveInventory(updated);
      res.json(updated);
    } else {
      const idx = inventory.findIndex(inv => inv.item === oldItemName);
      if (idx === -1) {
        return res.status(404).json({ error: "Item not found" });
      }
      const currVal = current !== undefined ? parseInt(current) : inventory[idx].current;
      const minVal = min !== undefined ? parseInt(min) : inventory[idx].min;
      const newItemName = item || inventory[idx].item;
      
      let status: "OK" | "Low" | "Critical" = "OK";
      if (currVal <= 5) status = "Critical";
      else if (currVal <= minVal) status = "Low";

      const updated: InventoryItem = {
        item: newItemName,
        current: currVal,
        min: minVal,
        status
      };

      if (newItemName !== oldItemName) {
        inventory.splice(idx, 1);
        inventory.push(updated);
      } else {
        inventory[idx] = updated;
      }
      res.json(updated);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Inventory Item
app.delete("/api/inventory/:itemName", async (req, res) => {
  const { itemName } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM inventory WHERE item = ${itemName}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }
      await db`DELETE FROM inventory WHERE item = ${itemName}`;
      res.json({ success: true, item: itemName });
    } else {
      const idx = inventory.findIndex(inv => inv.item === itemName);
      if (idx === -1) {
        return res.status(404).json({ error: "Item not found" });
      }
      inventory.splice(idx, 1);
      res.json({ success: true, item: itemName });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function dbSaveInventory(inv: InventoryItem) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO inventory (item, current, min, status)
    VALUES (${inv.item}, ${inv.current}, ${inv.min}, ${inv.status})
    ON CONFLICT (item) DO UPDATE SET
      current = EXCLUDED.current,
      min = EXCLUDED.min,
      status = EXCLUDED.status
  `;
}

// Get Reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const data = await dbSelectReviews();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Review
app.post("/api/reviews", async (req, res) => {
  try {
    const db = getDb();
    let idValue = reviews.length + 1;
    if (db) {
      const countRow = await db`SELECT COUNT(*) FROM reviews`;
      idValue = parseInt(countRow[0].count) + 1;
    }

    const newReview: Review = {
      id: idValue,
      name: req.body.name || "Anonymous",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rating: req.body.rating || 5,
      text: req.body.text || "",
      date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
    };

    if (db) {
      await db`
        INSERT INTO reviews (name, avatar, rating, text, date)
        VALUES (${newReview.name}, ${newReview.avatar}, ${newReview.rating}, ${newReview.text}, ${newReview.date})
      `;
    } else {
      reviews.unshift(newReview);
    }
    res.status(201).json(newReview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Blog Posts
app.get("/api/blogs", async (req, res) => {
  try {
    const data = await dbSelectBlogs();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Blog Post
app.post("/api/blogs", async (req, res) => {
  try {
    let imageUrl = req.body.image || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800";
    if (imageUrl && imageUrl.startsWith("data:")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl);
    }

    const newBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      title: req.body.title || "Untitled Article",
      category: req.body.category || "General",
      excerpt: req.body.excerpt || "",
      content: req.body.content || "",
      image: imageUrl,
      authorName: req.body.authorName || "David Miller",
      authorAvatar: req.body.authorAvatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: req.body.readTime || "3 min read",
      tags: req.body.tags || []
    };

    const db = getDb();
    if (db) {
      await dbSaveBlog(newBlog);
    } else {
      menuBlogs.unshift(newBlog);
    }
    res.status(201).json(newBlog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Blog Post
app.patch("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let imageUrl = req.body.image;
    if (imageUrl && imageUrl.startsWith("data:")) {
      imageUrl = await uploadBase64ToUploadthing(imageUrl);
    }

    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM blogs WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Blog not found" });
      }
      const existing = mapRowToBlog(rows[0]);
      const updated = { ...existing, ...req.body };
      if (imageUrl) {
        updated.image = imageUrl;
      }
      await dbSaveBlog(updated);
      res.json(updated);
    } else {
      const idx = menuBlogs.findIndex(b => b.id === id);
      if (idx !== -1) {
        menuBlogs[idx] = { ...menuBlogs[idx], ...req.body };
        if (imageUrl) {
          menuBlogs[idx].image = imageUrl;
        }
        res.json(menuBlogs[idx]);
      } else {
        res.status(404).json({ error: "Blog not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Blog Post
app.delete("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM blogs WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Blog not found" });
      }
      await db`DELETE FROM blogs WHERE id = ${id}`;
      res.json(mapRowToBlog(rows[0]));
    } else {
      const idx = menuBlogs.findIndex(b => b.id === id);
      if (idx !== -1) {
        const deleted = menuBlogs.splice(idx, 1);
        res.json(deleted[0]);
      } else {
        res.status(404).json({ error: "Blog not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Team Members
app.get("/api/team", async (req, res) => {
  try {
    const data = await dbSelectTeamMembers();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get FAQs
app.get("/api/faqs", async (req, res) => {
  try {
    const data = await dbSelectFAQs();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Employees
app.get("/api/employees", async (req, res) => {
  try {
    const data = await dbSelectEmployees();
    // Sanitize pins and passwords so they aren't exposed to the client browser
    const sanitized = data.map(({ pin, password, ...rest }) => rest);
    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Employee PIN (Secure Database check)
app.post("/api/employees/verify", async (req, res) => {
  const { id, pin } = req.body;
  if (!id || !pin) {
    return res.status(400).json({ error: "id and pin are required" });
  }

  try {
    const db = getDb();
    let emp: Employee | undefined;
    if (db) {
      const rows = await db`SELECT * FROM employees WHERE id = ${id}`;
      if (rows.length > 0) {
        emp = mapRowToEmployee(rows[0]);
      }
    } else {
      emp = employees.find(e => e.id === id);
    }

    if (!emp) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (!emp.isAccessEnabled) {
      return res.status(403).json({ error: "Access Denied: Your employee credential has been deactivated by Management." });
    }

    if (emp.pin === pin) {
      const { pin: p, password: pass, ...sanitized } = emp;
      return res.json({ success: true, employee: sanitized });
    } else {
      return res.status(401).json({ success: false, error: "Invalid security PIN." });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Employee
app.post("/api/employees", async (req, res) => {
  const { name, role, pin, password, shiftTime } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Name and role are required" });
  }

  try {
    const newEmp: Employee = {
      id: `EMP-${Math.floor(106 + Math.random() * 900)}`,
      name,
      role,
      status: "Off",
      performance: 100,
      shiftTime: shiftTime || "08:00 AM - 04:00 PM",
      pin: pin || "1234",
      password: password || "password123",
      isAccessEnabled: true,
      attendanceLogs: []
    };

    const db = getDb();
    if (db) {
      await dbSaveEmployee(newEmp);
    } else {
      employees.push(newEmp);
    }
    res.status(201).json(newEmp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Employee
app.patch("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM employees WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      const existing = mapRowToEmployee(rows[0]);
      const updated = { ...existing, ...req.body };
      await dbSaveEmployee(updated);
      res.json(updated);
    } else {
      const idx = employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        employees[idx] = { ...employees[idx], ...req.body };
        res.json(employees[idx]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Employee
app.delete("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    if (db) {
      const rows = await db`SELECT * FROM employees WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: "Employee not found" });
      }
      await db`DELETE FROM employees WHERE id = ${id}`;
      res.json(mapRowToEmployee(rows[0]));
    } else {
      const idx = employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        const deleted = employees.splice(idx, 1);
        res.json(deleted[0]);
      } else {
        res.status(404).json({ error: "Employee not found" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-track Attendance and update employee shift state
app.post("/api/employees/attendance/auto", async (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ error: "Employee ID is required" });
  }

  try {
    const db = getDb();
    let currentEmployees = employees;
    if (db) {
      currentEmployees = await dbSelectEmployees();
    }

    const idx = currentEmployees.findIndex(
      e => e.id.toLowerCase() === employeeId.toLowerCase() || e.name.toLowerCase().includes(employeeId.toLowerCase())
    );

    if (idx === -1) {
      return res.status(404).json({ error: "Employee not found for auto attendance tracking" });
    }

    const emp = currentEmployees[idx];

    // Only register auto attendance if their access is enabled
    if (emp.isAccessEnabled === false) {
      return res.status(403).json({ error: "Access is disabled for this employee. Contact manager/owner." });
    }

    const todayStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
    
    if (!emp.attendanceLogs) {
      emp.attendanceLogs = [];
    }
    const alreadyLogged = emp.attendanceLogs.some(log => log.date === todayStr);
    
    if (!alreadyLogged) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      let shiftStartHour = 8;
      let shiftStartMinute = 0;
      if (emp.shiftTime) {
        const match = emp.shiftTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && h < 12) h += 12;
          if (ampm === "AM" && h === 12) h = 0;
          shiftStartHour = h;
          shiftStartMinute = m;
        }
      }
      
      const isLate = (currentHours > shiftStartHour) || (currentHours === shiftStartHour && currentMinutes > shiftStartMinute + 15);
      const onTime = !isLate;
      const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      
      emp.attendanceLogs.unshift({
        date: todayStr,
        timeIn: timeStr,
        type: "Auto",
        onTime: onTime
      });
      
      emp.status = isLate ? "Late" : "On duty";
      
      const lateCount = emp.attendanceLogs.filter(log => !log.onTime).length;
      const totalLogs = emp.attendanceLogs.length;
      const onTimeRate = totalLogs > 0 ? (totalLogs - lateCount) / totalLogs : 1;
      
      emp.performance = Math.round(75 + (25 * onTimeRate));
      if (emp.performance > 100) emp.performance = 100;
      if (emp.performance < 50) emp.performance = 50;
    } else {
      if (emp.status === "Off") {
        emp.status = "On duty";
      }
    }

    if (db) {
      await dbSaveEmployee(emp);
    } else {
      employees[idx] = emp;
    }
    
    res.json({ success: true, employee: emp });
  } catch (error: any) {
    console.error("Auto attendance error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- AI COMPLIANT ENDPOINTS ---

app.post("/api/gemini/chat", async (req, res) => {
  const { message } = req.body;
  try {
    const chat = getGenAI().chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are the AI Restaurant concierge of "Aura Gourmet" - a premium luxury burger restaurant. 
        We specialize in luxury burger experiences such as our "Truffle Wagyu Burger" ($24.99) and "The Golden Feast Burger" ($49.99) covered in 24kt gold leaf, caviar, and champagne sauce.
        You are sophisticated, elegant, welcoming, and precise.
        Help the user find the perfect burger, suggest additions, or answer general questions about our gourmet journal, about story, or locations. Keep responses concise and polished.`
      }
    });

    const response = await chat.sendMessage({ message: message || "Hello" });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini AI." });
  }
});

app.post("/api/gemini/insights", async (req, res) => {
  const { question } = req.body;
  try {
    const currentOrders = await dbSelectOrders();
    const currentInventory = await dbSelectInventory();
    const currentEmployees = await dbSelectEmployees();

    const totalRev = currentOrders.reduce((acc, curr) => acc + (curr.status === 'Completed' || curr.paymentStatus === 'Paid' ? curr.total : 0), 0) + 12450.50;
    const avgOrder = totalRev / (currentOrders.length + 420);
    const lowStock = currentInventory.filter(i => i.status !== "OK").map(i => `${i.item} (Only ${i.current} left)`).join(", ");
    
    const context = `
      You are the AI Business Intelligence Analyst for Aura Gourmet restaurant.
      Here is the real-time operational data:
      - Total Revenue Today: $${totalRev.toFixed(2)}
      - Total Orders Processed: ${currentOrders.length + 420} (including historical)
      - Average Order Value: $${avgOrder.toFixed(2)}
      - Kitchen Efficiency: 87% (on-time rate)
      - Low Stock Items Alert: ${lowStock || "None"}
      - Staff on duty: ${currentEmployees.filter(e => e.status === "On duty").length} out of ${currentEmployees.length}
      - Chef performance average: 90%
    `;

    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Context: ${context}\n\nQuestion/Instruction: ${question || "Analyze today's business performance and give 3 actionable business insights."}`,
      config: {
        systemInstruction: "You are an elite, sharp Power BI-style Business Analyst. Speak clearly with financial metrics, numbers, and deep tactical business suggestions. Keep recommendations direct, brief, and bulleted."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini AI." });
  }
});

app.post("/api/gemini/kitchen", async (req, res) => {
  try {
    const currentOrders = await dbSelectOrders();
    const currentEmployees = await dbSelectEmployees();

    const context = `
      Current active orders in kitchen: ${currentOrders.filter(o => o.status !== 'Completed').length}
      Active chefs: ${currentEmployees.filter(e => e.role.toLowerCase().includes("chef") && e.status === "On duty").map(e => e.name).join(", ") || "Marcus, Elena"} (on duty).
      Grill status: busy preparing Truffle Wagyu patty.
    `;
    const response = await getGenAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Active orders: ${context}. Suggest optimal chef assignments, equipment optimization, and predicted delay updates.`,
      config: {
        systemInstruction: "You are the AI Kitchen Coordinator. Provide lightning-fast, high-efficiency task suggestions for a hot, fast-paced kitchen. Format output as 3 brief, actionable bullets."
      }
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Kitchen Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini AI." });
  }
});

// --- DATABASE DDL & SEED STARTUP ---

async function initDb() {
  const db = getDb();
  if (!db) return;

  try {
    console.log("🚀 Initializing Neon PostgreSQL Database Tables...");

    await db`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        rating DECIMAL(3,2) DEFAULT 5.0,
        reviews_count INT DEFAULT 0,
        prep_time VARCHAR(50),
        calories VARCHAR(50),
        image TEXT,
        badge VARCHAR(100),
        ingredients TEXT,
        allergens TEXT,
        spice_level INT,
        is_available BOOLEAN DEFAULT TRUE,
        add_ons TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        table_num VARCHAR(100),
        customer_name VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        items TEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50),
        created_at VARCHAR(100),
        chef VARCHAR(100),
        notes TEXT,
        priority BOOLEAN DEFAULT FALSE,
        delay_reason VARCHAR(255),
        time_remaining INT
      )
    `;

    // Ensure waiter column exists in orders table
    await db`ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter VARCHAR(100)`;

    await db`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar TEXT,
        rating INT NOT NULL,
        text TEXT,
        date VARCHAR(50)
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        excerpt TEXT,
        content TEXT,
        image TEXT,
        author_name VARCHAR(100),
        author_avatar TEXT,
        date VARCHAR(50),
        read_time VARCHAR(50),
        tags TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS inventory (
        item VARCHAR(255) PRIMARY KEY,
        current INT NOT NULL,
        min INT NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        performance INT DEFAULT 100,
        shift_time VARCHAR(100),
        pin VARCHAR(50),
        password VARCHAR(255),
        is_access_enabled BOOLEAN DEFAULT TRUE,
        attendance_logs TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS team_members (
        name VARCHAR(255) PRIMARY KEY,
        role VARCHAR(255) NOT NULL,
        photo TEXT,
        bio TEXT
      )
    `;

    await db`
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      )
    `;

    console.log("✨ Tables verified/created successfully.");

    // Seeding products
    const existingProducts = await db`SELECT id FROM products LIMIT 1`;
    if (existingProducts.length === 0) {
      console.log("🌱 Seeding products table...");
      for (const prod of PRODUCTS) {
        await dbInsertProduct(prod);
      }
    }

    // Seeding blogs
    const existingBlogs = await db`SELECT id FROM blogs LIMIT 1`;
    if (existingBlogs.length === 0) {
      console.log("🌱 Seeding blogs table...");
      for (const b of BLOG_POSTS) {
        await dbSaveBlog(b);
      }
    }

    // Seeding orders
    const existingOrders = await db`SELECT id FROM orders LIMIT 1`;
    if (existingOrders.length === 0) {
      console.log("🌱 Seeding orders table...");
      for (const ord of orders) {
        await dbSaveOrder(ord);
      }
    }

    // Seeding reviews
    const existingReviews = await db`SELECT id FROM reviews LIMIT 1`;
    if (existingReviews.length === 0) {
      console.log("🌱 Seeding reviews table...");
      for (const rev of reviews) {
        await db`
          INSERT INTO reviews (name, avatar, rating, text, date)
          VALUES (${rev.name}, ${rev.avatar}, ${rev.rating}, ${rev.text}, ${rev.date})
        `;
      }
    }

    // Seeding inventory
    const existingInventory = await db`SELECT item FROM inventory LIMIT 1`;
    if (existingInventory.length === 0) {
      console.log("🌱 Seeding inventory table...");
      for (const inv of inventory) {
        await dbSaveInventory(inv);
      }
    }

    // Seeding employees
    const existingEmployees = await db`SELECT id FROM employees LIMIT 1`;
    if (existingEmployees.length === 0) {
      console.log("🌱 Seeding employees table...");
      for (const emp of employees) {
        await dbSaveEmployee(emp);
      }
    } else {
      // Ensure the Owner exists specifically
      const ownerExists = await db`SELECT id FROM employees WHERE LOWER(role) = 'owner' LIMIT 1`;
      if (ownerExists.length === 0) {
        console.log("🌱 Seeding default Owner profile in existing database...");
        await dbSaveEmployee({
          id: "EMP-099",
          name: "Aura Owner",
          role: "Owner",
          status: "On duty",
          performance: 100,
          shiftTime: "Flexible Hours",
          pin: "9999",
          password: "ownerpassword",
          isAccessEnabled: true,
          attendanceLogs: []
        });
      }
    }

    // Seeding team members
    const existingTeam = await db`SELECT name FROM team_members LIMIT 1`;
    if (existingTeam.length === 0) {
      console.log("🌱 Seeding team_members table...");
      for (const m of TEAM_MEMBERS) {
        await dbSaveTeamMember(m);
      }
    }

    // Seeding faqs
    const existingFaqs = await db`SELECT id FROM faqs LIMIT 1`;
    if (existingFaqs.length === 0) {
      console.log("🌱 Seeding faqs table...");
      for (const f of FAQS) {
        await dbSaveFAQ(f);
      }
    }

    console.log("✅ Neon PostgreSQL seeding/init complete.");
  } catch (error) {
    console.error("❌ Error initializing/seeding database:", error);
  }
}

// Start server and mount Vite
async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

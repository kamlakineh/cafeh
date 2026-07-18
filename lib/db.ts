import postgres from "postgres";
import { PRODUCTS, BLOG_POSTS, TEAM_MEMBERS, FAQS } from "../src/data";
import type {
  Product,
  Order,
  BlogPost,
  Employee,
  InventoryItem,
  Review,
  TeamMember,
  FAQItem,
} from "../src/types";

// --- DATABASE CONNECTION ---

let sqlClient: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sqlClient) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn(
        "⚠️ DATABASE_URL is not defined in environment variables. Falling back to in-memory store.",
      );
      return null;
    }
    try {
      sqlClient = postgres(dbUrl, {
        ssl: "require",
        max_prepared: 0,
      } as any);
    } catch (err) {
      console.error("⚠️ Failed to initialize postgres client:", err);
      sqlClient = null;
    }
  }
  return sqlClient;
}

// --- IN-MEMORY FALLBACK STATE ---

export let menuProducts: Product[] = [...PRODUCTS];
export let menuBlogs: BlogPost[] = [...BLOG_POSTS];
export let localTeamMembers: TeamMember[] = [...TEAM_MEMBERS];
export let localFaqs: FAQItem[] = [...FAQS];

export let orders: Order[] = [
  {
    id: "ORD-101",
    table: "Table 4",
    customerName: "Sarah J.",
    type: "Dine-in",
    status: "Cooking",
    items: [
      {
        id: "b1",
        name: "Truffle Wagyu Burger",
        quantity: 1,
        customizations: ["Medium Rare", "Extra Truffle Aioli"],
        price: 24.99,
      },
      {
        id: "s1",
        name: "Truffle Fries",
        quantity: 1,
        customizations: ["Large"],
        price: 6.99,
      },
    ],
    total: 31.98,
    paymentStatus: "Paid",
    paymentMethod: "Card",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    chef: "Chef Marcus",
    priority: true,
    timeRemaining: 240,
  },
  {
    id: "ORD-102",
    table: "Delivery",
    customerName: "David Miller",
    type: "Delivery",
    status: "Preparing",
    items: [
      {
        id: "b2",
        name: "Double Cheese Golden Burger",
        quantity: 2,
        customizations: ["No Onion", "Extra Cheddar"],
        price: 18.99,
      },
      {
        id: "d1",
        name: "Craft Cola",
        quantity: 2,
        customizations: ["Ice-cold"],
        price: 3.5,
      },
    ],
    total: 44.98,
    paymentStatus: "Paid",
    paymentMethod: "Wallet",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    chef: "Grill Station #1",
    priority: false,
  },
  {
    id: "ORD-103",
    table: "Pickup #12",
    customerName: "Emma Watson",
    type: "Pickup",
    status: "Pending",
    items: [
      {
        id: "b3",
        name: "Avocado Plant-Based Burger",
        quantity: 1,
        customizations: ["Gluten-Free Bun"],
        price: 16.99,
      },
      {
        id: "d2",
        name: "Champagne Infused Fizz",
        quantity: 1,
        customizations: [],
        price: 12.0,
      },
    ],
    total: 28.99,
    paymentStatus: "Pending",
    paymentMethod: "",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    priority: false,
  },
];

export let reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    text: "The Truffle Wagyu is the best burger I've ever had. Absolute culinary perfection!",
    date: "March 15, 2026",
  },
  {
    id: 2,
    name: "Liam Carter",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
    text: "Unbelievable dark aesthetic and premium presentation. Truly a luxury dining experience.",
    date: "April 2, 2026",
  },
  {
    id: 3,
    name: "Michael Vance",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    rating: 4,
    text: "Fries are crispy, burger is juicy, and the Golden Feast is worth every dollar.",
    date: "June 24, 2026",
  },
];

export let inventory: InventoryItem[] = [
  { item: "Aged Wagyu Patties", current: 84, min: 30, status: "OK" },
  { item: "Gold Foil Leaves (24k)", current: 12, min: 10, status: "Low" },
  { item: "Truffle Aioli Sauce", current: 5, min: 20, status: "Critical" },
  { item: "Brioche Buns", current: 110, min: 40, status: "OK" },
  { item: "Avocado Patties", current: 15, min: 15, status: "Low" },
];

export let employees: Employee[] = [
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
    attendanceLogs: [],
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
      { date: "2026-07-14", timeIn: "07:50 AM", type: "Auto", onTime: true },
    ],
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
      { date: "2026-07-14", timeIn: "07:48 AM", type: "Auto", onTime: true },
    ],
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
      { date: "2026-07-14", timeIn: "07:59 AM", type: "Auto", onTime: true },
    ],
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
      { date: "2026-07-14", timeIn: "12:05 PM", type: "Auto", onTime: false },
    ],
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
      { date: "2026-07-14", timeIn: "07:55 AM", type: "Auto", onTime: true },
    ],
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
      { date: "2026-07-14", timeIn: "07:52 AM", type: "Auto", onTime: true },
    ],
  },
];

// --- ROW MAPPERS ---

export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    category: row.category,
    price: parseFloat(row.price),
    originalPrice: row.original_price
      ? parseFloat(row.original_price)
      : undefined,
    rating: parseFloat(row.rating),
    reviewsCount: parseInt(row.reviews_count),
    prepTime: row.prep_time || "",
    calories: row.calories || "",
    image: row.image || "",
    badge: row.badge || undefined,
    ingredients: row.ingredients ? JSON.parse(row.ingredients) : [],
    allergens: row.allergens ? JSON.parse(row.allergens) : [],
    spiceLevel:
      row.spice_level !== null && row.spice_level !== undefined
        ? parseInt(row.spice_level)
        : undefined,
    isAvailable: row.is_available,
    addOns: row.add_ons ? JSON.parse(row.add_ons) : undefined,
  };
}

export function mapRowToOrder(row: any): Order {
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
    timeRemaining:
      row.time_remaining !== null && row.time_remaining !== undefined
        ? parseInt(row.time_remaining)
        : undefined,
  };
}

export function mapRowToReview(row: any): Review {
  return {
    id: parseInt(row.id),
    name: row.name,
    avatar: row.avatar || "",
    rating: parseInt(row.rating),
    text: row.text || "",
    date: row.date || "",
  };
}

export function mapRowToBlog(row: any): BlogPost {
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

export function mapRowToInventory(row: any): InventoryItem {
  return {
    item: row.item,
    current: parseInt(row.current),
    min: parseInt(row.min),
    status: row.status,
  };
}

export function mapRowToEmployee(row: any): Employee {
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

export function mapRowToTeamMember(row: any): TeamMember {
  return {
    name: row.name,
    role: row.role,
    photo: row.photo || "",
    bio: row.bio || "",
  };
}

export function mapRowToFAQ(row: any): FAQItem {
  return {
    question: row.question,
    answer: row.answer,
  };
}

// --- DATABASE DML FUNCTIONS ---

export async function dbInsertProduct(prod: Product) {
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

export async function dbSaveOrder(ord: Order) {
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

export async function dbSaveBlog(b: BlogPost) {
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

export async function dbSaveEmployee(emp: Employee) {
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

export async function dbSaveTeamMember(m: TeamMember) {
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

export async function dbSaveFAQ(faq: FAQItem) {
  const db = getDb();
  if (!db) return;
  await db`
    INSERT INTO faqs (question, answer)
    VALUES (${faq.question}, ${faq.answer})
  `;
}

export async function dbSaveInventory(inv: InventoryItem) {
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

// --- DATABASE SELECT HELPERS ---

export async function dbSelectOrders(): Promise<Order[]> {
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

export async function dbSelectProducts(): Promise<Product[]> {
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

export async function dbSelectInventory(): Promise<InventoryItem[]> {
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

export async function dbSelectReviews(): Promise<Review[]> {
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

export async function dbSelectBlogs(): Promise<BlogPost[]> {
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

export async function dbSelectEmployees(): Promise<Employee[]> {
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

export async function dbSelectTeamMembers(): Promise<TeamMember[]> {
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

export async function dbSelectFAQs(): Promise<FAQItem[]> {
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

// --- DATABASE DDL & SEED ---

export async function initDb() {
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

    const existingProducts = await db`SELECT id FROM products LIMIT 1`;
    if (existingProducts.length === 0) {
      console.log("🌱 Seeding products table...");
      for (const prod of PRODUCTS) {
        await dbInsertProduct(prod);
      }
    }

    const existingBlogs = await db`SELECT id FROM blogs LIMIT 1`;
    if (existingBlogs.length === 0) {
      console.log("🌱 Seeding blogs table...");
      for (const b of BLOG_POSTS) {
        await dbSaveBlog(b);
      }
    }

    const existingOrders = await db`SELECT id FROM orders LIMIT 1`;
    if (existingOrders.length === 0) {
      console.log("🌱 Seeding orders table...");
      for (const ord of orders) {
        await dbSaveOrder(ord);
      }
    }

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

    const existingInventory = await db`SELECT item FROM inventory LIMIT 1`;
    if (existingInventory.length === 0) {
      console.log("🌱 Seeding inventory table...");
      for (const inv of inventory) {
        await dbSaveInventory(inv);
      }
    }

    const existingEmployees = await db`SELECT id FROM employees LIMIT 1`;
    if (existingEmployees.length === 0) {
      console.log("🌱 Seeding employees table...");
      for (const emp of employees) {
        await dbSaveEmployee(emp);
      }
    } else {
      const ownerExists =
        await db`SELECT id FROM employees WHERE LOWER(role) = 'owner' LIMIT 1`;
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
          attendanceLogs: [],
        });
      }
    }

    const existingTeam = await db`SELECT name FROM team_members LIMIT 1`;
    if (existingTeam.length === 0) {
      console.log("🌱 Seeding team_members table...");
      for (const m of TEAM_MEMBERS) {
        await dbSaveTeamMember(m);
      }
    }

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

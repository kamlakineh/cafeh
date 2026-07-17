import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PublicPages from "./components/PublicPages";
import CashierDashboard from "./components/CashierDashboard";
import WaiterDashboard from "./components/WaiterDashboard";
import KitchenDashboard from "./components/KitchenDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import OwnerDashboard from "./components/OwnerDashboard";
import StaffPinGate from "./components/StaffPinGate";
import { Order, InventoryItem, Employee, OrderItem, Product, BlogPost, TeamMember, FAQItem } from "./types";

export default function App() {
  // Navigation & Role states
  const [userRole, setUserRole] = React.useState<string>("customer");
  const [currentTab, setCurrentTab] = React.useState<string>("Home");
  const [authenticatedStaff, setAuthenticatedStaff] = React.useState<Employee | null>(null);

  const handleLogout = React.useCallback(() => {
    setAuthenticatedStaff(null);
    setUserRole("waiter");
    setCurrentTab("Dashboard");
  }, []);

  // Clear auth session whenever they change userRole to enforce fresh PIN auth (unless it matches their mapped role)
  React.useEffect(() => {
    if (authenticatedStaff) {
      const r = authenticatedStaff.role.toLowerCase();
      let expectedRole = "waiter";
      if (r.includes("owner")) expectedRole = "owner";
      else if (r.includes("manager")) expectedRole = "manager";
      else if (r.includes("cashier") || r.includes("reception")) expectedRole = "cashier";
      else if (r.includes("chef") || r.includes("specialist") || r.includes("cook") || r.includes("kitchen")) expectedRole = "kitchen";
      else if (r.includes("waiter") || r.includes("server") || r.includes("host")) expectedRole = "waiter";

      if (userRole !== expectedRole) {
        setAuthenticatedStaff(null);
      }
    }
  }, [userRole, authenticatedStaff]);

  // Core synchronized databases
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [faqs, setFaqs] = React.useState<FAQItem[]>([]);

  // Client shopping cart states
  const [cart, setCart] = React.useState<OrderItem[]>([]);
  const [cartOpen, setCartOpen] = React.useState(false);

  // Synchronize state from the backend securely with error boundaries
  const fetchState = React.useCallback(async () => {
    try {
      const [ordersRes, invRes, empRes, prodRes, blogRes, teamRes, faqsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/inventory"),
        fetch("/api/employees"),
        fetch("/api/products"),
        fetch("/api/blogs").catch(() => null),
        fetch("/api/team").catch(() => null),
        fetch("/api/faqs").catch(() => null)
      ]);

      if (!ordersRes.ok || !invRes.ok || !empRes.ok || !prodRes.ok) {
        throw new Error(`Server responded with non-200 status`);
      }

      const ctOrders = ordersRes.headers.get("content-type") || "";
      const ctInv = invRes.headers.get("content-type") || "";
      const ctEmp = empRes.headers.get("content-type") || "";
      const ctProd = prodRes.headers.get("content-type") || "";

      if (!ctOrders.includes("application/json") || !ctInv.includes("application/json") || !ctEmp.includes("application/json") || !ctProd.includes("application/json")) {
        throw new Error("Invalid response content-type (expected application/json)");
      }

      const [ordersData, invData, empData, prodData] = await Promise.all([
        ordersRes.json(),
        invRes.json(),
        empRes.json(),
        prodRes.json()
      ]);
      setOrders(ordersData);
      setInventory(invData);
      setEmployees(empData);
      setProducts(prodData);

      if (blogRes && blogRes.ok) {
        const ctBlog = blogRes.headers.get("content-type") || "";
        if (ctBlog.includes("application/json")) {
          const blogData = await blogRes.json();
          setBlogPosts(blogData);
        }
      }

      if (teamRes && teamRes.ok) {
        const ctTeam = teamRes.headers.get("content-type") || "";
        if (ctTeam.includes("application/json")) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData);
        }
      }

      if (faqsRes && faqsRes.ok) {
        const ctFaqs = faqsRes.headers.get("content-type") || "";
        if (ctFaqs.includes("application/json")) {
          const faqsData = await faqsRes.json();
          setFaqs(faqsData);
        }
      }
    } catch (err) {
      console.warn("Could not synchronize live state (backend might be restarting or loading):", err);
    }
  }, []);

  // Poll state every 4 seconds to sync Waiter, KDS, Cashier, and Owner dashboards
  React.useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Add Item to Customer Cart
  const handleAddToCart = (item: OrderItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(i => i.name === item.name);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prevCart, item];
    });
    setCartOpen(true);
  };

  // Place Order on server
  const handlePlaceOrder = async (orderPayload: Partial<Order>) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error creating order:", err);
    }
  };

  // Update order status on server (Accept, preparing, cooking, ready, complete, delayed)
  const handleUpdateOrderStatus = async (id: string, status: Order['status'], extra: Partial<Order> = {}) => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra })
      });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error patching order status:", err);
    }
  };

  // Publish blog post to the server
  const handlePublishBlogPost = async (blogPayload: Partial<BlogPost>) => {
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogPayload)
      });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error creating blog post:", err);
    }
  };

  const handleUpdateBlogPost = async (id: string, blogPayload: Partial<BlogPost>) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogPayload)
      });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error updating blog post:", err);
    }
  };

  const handleDeleteBlogPost = async (id: string) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error("Error deleting blog post:", err);
    }
  };

  // Customer Checkout
  const handleCustomerCheckout = () => {
    if (cart.length === 0) return;
    const sub = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const tax = sub * 0.08;
    const total = sub + tax;

    handlePlaceOrder({
      table: "Online Pickup",
      customerName: "Aura Guest",
      type: "Pickup",
      status: "Pending",
      items: cart,
      total: total,
      paymentStatus: "Paid",
      paymentMethod: "Wallet",
      priority: false
    });

    setCart([]);
    setCartOpen(false);
    alert("Checkout Authorized! Your Pickup order has been transmitted to our kitchen display. Please visit the restaurant to pick up when ready!");
  };

  return (
    <div 
      id={userRole === "customer" ? "customer-view" : undefined}
      className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans"
    >
      {/* Dynamic Header */}
      {userRole !== "waiter" && (
        <Header 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
          onOpenCart={() => setCartOpen(true)}
          userRole={userRole}
          setUserRole={setUserRole}
          onOpenChat={() => {}}
          authenticatedStaff={authenticatedStaff}
          onLogout={() => {
            setAuthenticatedStaff(null);
            setUserRole("waiter");
          }}
        />
      )}

      {/* Main Container */}
      <main className="flex-grow">
        {userRole === "customer" && (
          <PublicPages 
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onAddToCart={handleAddToCart}
            cart={cart}
            setCart={setCart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
            onCheckout={handleCustomerCheckout}
            products={products}
            blogPosts={blogPosts}
            teamMembers={teamMembers}
            faqs={faqs}
          />
        )}

        {userRole !== "customer" && !authenticatedStaff ? (
          <StaffPinGate
            userRole={userRole}
            employees={employees}
            onAuthSuccess={(emp) => {
              const r = emp.role.toLowerCase();
              let targetRole = "waiter";
              let targetTab = "Tables";
              
              if (r.includes("owner")) {
                targetRole = "owner";
                targetTab = "Executive Dashboard";
              } else if (r.includes("manager")) {
                targetRole = "manager";
                targetTab = "Dashboard";
              } else if (r.includes("cashier") || r.includes("reception")) {
                targetRole = "cashier";
                targetTab = "Dashboard";
              } else if (r.includes("chef") || r.includes("specialist") || r.includes("cook") || r.includes("kitchen")) {
                targetRole = "kitchen";
                targetTab = "Dashboard";
              } else if (r.includes("waiter") || r.includes("server") || r.includes("host")) {
                targetRole = "waiter";
                targetTab = "Tables";
              }

              setUserRole(targetRole);
              setCurrentTab(targetTab);
              setAuthenticatedStaff(emp);
            }}
            onCancel={() => {
              setUserRole("customer");
              setCurrentTab("Home");
            }}
          />
        ) : (
          <>
            {userRole === "cashier" && (
              <CashierDashboard 
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onPlaceOrder={handlePlaceOrder}
                authenticatedStaff={authenticatedStaff}
                onLogout={handleLogout}
              />
            )}

            {userRole === "waiter" && (
              <WaiterDashboard 
                orders={orders}
                onPlaceOrder={handlePlaceOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                setUserRole={setUserRole}
                products={products}
                authenticatedStaff={authenticatedStaff}
                onLogout={handleLogout}
              />
            )}

            {userRole === "kitchen" && (
              <KitchenDashboard 
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                inventory={inventory}
                setUserRole={setUserRole}
                authenticatedStaff={authenticatedStaff}
                onLogout={handleLogout}
              />
            )}

            {userRole === "manager" && (
              <ManagerDashboard 
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                inventory={inventory}
                employees={employees}
                products={products}
                onFetchProducts={fetchState}
                blogPosts={blogPosts}
                onPublishBlogPost={handlePublishBlogPost}
                onUpdateBlogPost={handleUpdateBlogPost}
                onDeleteBlogPost={handleDeleteBlogPost}
                authenticatedStaff={authenticatedStaff}
                onLogout={handleLogout}
              />
            )}

            {userRole === "owner" && (
              <OwnerDashboard 
                orders={orders}
                inventory={inventory}
                authenticatedStaff={authenticatedStaff}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Footer for Public view only */}
      {userRole === "customer" && (
        <Footer 
          setCurrentTab={setCurrentTab}
          setUserRole={setUserRole}
        />
      )}
    </div>
  );
}

import React from "react";
import { 
  LayoutDashboard, ClipboardList, Users, Clock, Calendar, 
  Package, AlertTriangle, TrendingUp, BarChart3, Percent, 
  Grid, Truck, Volume2, CheckSquare, Settings, Menu, X, 
  Bell, ChevronRight, User, ShieldAlert, CheckCircle2, Sliders, Info,
  Edit, Trash2
} from "lucide-react";
import { Order, Employee, CustomerIssue, InventoryItem } from "../types";

// Import modular subcomponent tabs
import DashboardTab from "./manager/DashboardTab";
import EmployeesTab from "./manager/EmployeesTab";
import AttendanceTab from "./manager/AttendanceTab";
import ShiftScheduleTab from "./manager/ShiftScheduleTab";
import InventoryTab from "./manager/InventoryTab";
import CustomerIssuesTab from "./manager/CustomerIssuesTab";
import SalesTab from "./manager/SalesTab";
import ReportsTab from "./manager/ReportsTab";
import PromotionsTab from "./manager/PromotionsTab";
import TableManagementTab from "./manager/TableManagementTab";
import ApprovalsTab from "./manager/ApprovalsTab";
import MenuControlTab from "./manager/MenuControlTab";
import { Product, BlogPost } from "../types";

interface ManagerDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status'], extra?: Partial<Order>) => void;
  inventory: InventoryItem[];
  employees: Employee[];
  products?: Product[];
  onFetchProducts?: () => void;
  blogPosts?: BlogPost[];
  onPublishBlogPost?: (payload: Partial<BlogPost>) => Promise<void>;
  onUpdateBlogPost?: (id: string, payload: Partial<BlogPost>) => Promise<void>;
  onDeleteBlogPost?: (id: string) => Promise<void>;
  authenticatedStaff?: Employee | null;
  onLogout?: () => void;
}

export default function ManagerDashboard({
  orders,
  onUpdateOrderStatus,
  inventory,
  employees,
  products,
  onFetchProducts,
  blogPosts = [],
  onPublishBlogPost,
  onUpdateBlogPost,
  onDeleteBlogPost,
  authenticatedStaff,
  onLogout
}: ManagerDashboardProps) {
  
  // Current active navigation page tab
  const [activeTab, setActiveTab] = React.useState<string>("Dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = React.useState(6);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Shared Tickets Data fallback state
  const [customerIssuesList, setCustomerIssuesList] = React.useState<CustomerIssue[]>([
    { id: "TKT-301", customerName: "Sarah J.", type: "Late Delivery", time: "10 mins ago", status: "Pending", priority: 4, message: "Driver John reported traffic near Central Park. Customer is waiting.", assignedTo: "John Cashier" },
    { id: "TKT-302", customerName: "Liam Carter", type: "Food Quality", time: "1 hr ago", status: "Resolved", priority: 3, message: "Wagyu burger was well-done instead of Medium-Rare. Re-delivered.", assignedTo: "Chef Marcus" },
    { id: "TKT-303", customerName: "Evelyn Monroe", type: "Wrong Order", time: "5 mins ago", status: "Pending", priority: 5, message: "Received dynamic vegan patties instead of double bacon. Extremely upset.", assignedTo: "Lucia Santos" }
  ]);

  const handleUpdateIssueStatus = (id: string, status: CustomerIssue["status"], extra?: Partial<CustomerIssue>) => {
    setCustomerIssuesList(prev => prev.map(issue => issue.id === id ? { ...issue, status, ...extra } : issue));
  };

  // Blog & Announcements form states
  const [newAnnounceTitle, setNewAnnounceTitle] = React.useState("");
  const [newAnnounceContent, setNewAnnounceContent] = React.useState("");
  const [blogCategory, setBlogCategory] = React.useState("News");
  const [blogExcerpt, setBlogExcerpt] = React.useState("");
  const [blogImage, setBlogImage] = React.useState("");
  const [blogTags, setBlogTags] = React.useState("Gourmet, Aura");
  const [editingBlogId, setEditingBlogId] = React.useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImage(reader.result as string);
        showToast("Image loaded from your local device successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceTitle || !newAnnounceContent || !blogExcerpt) {
      showToast("Please fill out subject title, excerpt summary, and article body!");
      return;
    }

    const payload = {
      title: newAnnounceTitle,
      category: blogCategory,
      excerpt: blogExcerpt,
      content: newAnnounceContent,
      image: blogImage || "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
      tags: blogTags.split(",").map(t => t.trim()).filter(Boolean),
      authorName: managerName,
      authorAvatar: managerAvatar
    };

    if (editingBlogId) {
      if (onUpdateBlogPost) {
        await onUpdateBlogPost(editingBlogId, payload);
        showToast("Article updated successfully!");
        setEditingBlogId(null);
      } else {
        showToast("Edit endpoint not fully ready.");
      }
    } else {
      if (onPublishBlogPost) {
        await onPublishBlogPost(payload);
        showToast("Article published to Gourmet Journal!");
      } else {
        showToast("Publish endpoint not fully ready.");
      }
    }

    setNewAnnounceTitle("");
    setNewAnnounceContent("");
    setBlogExcerpt("");
    setBlogImage("");
    setBlogTags("Gourmet, Aura");
  };

  // Inline Settings form states
  const [wifiCode, setWifiCode] = React.useState("GourmetBiteVIP");
  const [alertThreshold, setAlertThreshold] = React.useState("4");
  const [slaTime, setSlaTime] = React.useState("12");

  // Manager Personal Information States
  const [managerName, setManagerName] = React.useState(authenticatedStaff?.name || "David Miller");
  const [managerEmail, setManagerEmail] = React.useState(authenticatedStaff ? `${authenticatedStaff.name.toLowerCase().replace(/\s+/g, ".")}@auragourmet.com` : "david.miller@gourmetbite.com");
  const [managerPhone, setManagerPhone] = React.useState("(555) 101-9021");
  const [managerAvatar, setManagerAvatar] = React.useState("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150");

  React.useEffect(() => {
    if (authenticatedStaff) {
      setManagerName(authenticatedStaff.name);
      setManagerEmail(`${authenticatedStaff.name.toLowerCase().replace(/\s+/g, ".")}@auragourmet.com`);
    }
  }, [authenticatedStaff]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Operational parameters updated in branch config!");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Personal profile information updated successfully!");
  };

  // Define Sidebar Navigation items (Live Orders and Delivery Monitoring removed, Menu Control added)
  const sidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Menu Control", icon: Sliders },
    { label: "Employees", icon: Users },
    { label: "Attendance", icon: Clock },
    { label: "Shift Schedule", icon: Calendar },
    { label: "Inventory Overview", icon: Package },
    { label: "Customer Issues", icon: AlertTriangle, badge: customerIssuesList.filter(i => i.status === "Pending").length },
    { label: "Sales", icon: TrendingUp },
    { label: "Reports", icon: BarChart3 },
    { label: "Announcements", icon: Volume2 },
    { label: "Approval Center", icon: CheckSquare, badge: pendingApprovalsCount },
    { label: "Settings", icon: Settings }
  ];

  const startEditBlog = (post: BlogPost) => {
    setEditingBlogId(post.id);
    setNewAnnounceTitle(post.title);
    setBlogCategory(post.category);
    setBlogExcerpt(post.excerpt);
    setNewAnnounceContent(post.content);
    setBlogImage(post.image);
    setBlogTags(post.tags.join(", "));
    showToast(`Editing: "${post.title}"`);
  };

  const cancelEditBlog = () => {
    setEditingBlogId(null);
    setNewAnnounceTitle("");
    setBlogExcerpt("");
    setNewAnnounceContent("");
    setBlogImage("");
    setBlogTags("Gourmet, Aura");
  };

  const handleDeleteBlog = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      if (onDeleteBlogPost) {
        await onDeleteBlogPost(id);
        showToast("Article deleted successfully!");
        if (editingBlogId === id) {
          cancelEditBlog();
        }
      } else {
        showToast("Delete endpoint not ready.");
      }
    }
  };

  // Map state active tab string to components
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <DashboardTab 
            orders={orders} 
            inventory={inventory} 
            employees={employees} 
            pendingApprovalsCount={pendingApprovalsCount}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case "Menu Control":
        return (
          <MenuControlTab 
            products={products || []} 
            onFetchProducts={onFetchProducts} 
            onTriggerToast={showToast} 
          />
        );
      case "Employees":
        return <EmployeesTab employees={employees} />;
      case "Attendance":
        return <AttendanceTab employees={employees} onRefresh={onFetchProducts} />;
      case "Shift Schedule":
        return <ShiftScheduleTab employees={employees} />;
      case "Inventory Overview":
        return <InventoryTab inventory={inventory} onRefresh={onFetchProducts} />;
      case "Customer Issues":
        return (
          <CustomerIssuesTab 
            issues={customerIssuesList} 
            employees={employees} 
            onUpdateIssueStatus={handleUpdateIssueStatus} 
          />
        );
      case "Sales":
        return <SalesTab orders={orders} />;
      case "Reports":
        return <ReportsTab />;

      case "Announcements": {
        const activeBlogsFeed = blogPosts || [];
        return (
          <div className="space-y-6 animate-fadeIn" id="manager-announcements">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Creator (5 Cols) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-black text-sm text-slate-800">
                      {editingBlogId ? "Edit Announcement" : "Publish Blog & Announcement"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {editingBlogId ? "Modifying existing publication" : "Publish to customer Gourmet Journal and staff terminals"}
                    </p>
                  </div>
                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={cancelEditBlog}
                      className="text-[9px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-mono font-bold uppercase transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Article Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Sourcing Organic Heirloom Tomatoes"
                      value={newAnnounceTitle}
                      onChange={(e) => setNewAnnounceTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-medium">Category</label>
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="News">News</option>
                        <option value="Recipes">Recipes</option>
                        <option value="Behind the Scenes">Behind the Scenes</option>
                        <option value="Operations">Operations</option>
                        <option value="Sustainability">Sustainability</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 font-medium">Tags (comma-separated)</label>
                      <input 
                        type="text"
                        placeholder="e.g. Sourcing, Local"
                        value={blogTags}
                        onChange={(e) => setBlogTags(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-slate-500 font-medium font-bold">Banner Image Selection</label>
                    
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">Import Image from Local Device:</span>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[10px] text-slate-400 uppercase font-mono">Or paste direct image URL:</span>
                      <input 
                        type="text"
                        placeholder="Paste url (or leave empty for default)"
                        value={blogImage}
                        onChange={(e) => setBlogImage(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    {blogImage && (
                      <div className="relative rounded-xl overflow-hidden h-28 border border-slate-200 bg-slate-100">
                        <img src={blogImage} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setBlogImage("")}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Brief Excerpt (1-2 sentences)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g. Meet the farmers behind our farm-to-table heirloom supply chain..."
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Full Article Body Content</label>
                    <textarea 
                      rows={5}
                      placeholder="Type the full blog post text here..."
                      value={newAnnounceContent}
                      onChange={(e) => setNewAnnounceContent(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full p-3 bg-[#2563EB] text-white font-mono font-bold rounded-xl hover:bg-blue-700 transition-colors uppercase tracking-wider text-[10px]"
                  >
                    {editingBlogId ? "💾 Save Changes & Update" : "📢 Publish Blog & Announcement"}
                  </button>
                </form>
              </div>

              {/* Feed (7 Cols) */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-serif font-black text-sm text-slate-800 border-b border-slate-50 pb-3">Gourmet Journal & Announcements Feed</h3>
                
                <div className="space-y-4 text-xs overflow-y-auto max-h-[75vh] pr-1">
                  {activeBlogsFeed.map((post) => (
                    <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 relative group">
                      
                      {/* Edit / Delete overlay control buttons */}
                      <div className="absolute top-3 right-3 flex items-center space-x-2">
                        <button
                          onClick={() => startEditBlog(post)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-[#2563EB] shadow-sm transition"
                          title="Edit Publication"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(post.id)}
                          className="p-1.5 rounded-lg bg-white border border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 shadow-sm transition"
                          title="Delete Publication"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-start pr-16">
                        <div>
                          <span className="px-2 py-0.5 bg-blue-100 text-[#2563EB] text-[8px] rounded font-mono uppercase font-black mr-2">
                            {post.category}
                          </span>
                          <h4 className="font-serif font-black text-slate-800 text-sm mt-1">
                            {post.title}
                          </h4>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">{post.date}</span>
                      </div>
                      
                      {post.image && (
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                          <img src={post.image} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <p className="text-slate-500 italic leading-relaxed font-sans text-[11px]">{post.excerpt}</p>
                      
                      <p className="text-slate-600 leading-relaxed font-sans line-clamp-3">{post.content}</p>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
                        <span>By {post.authorName}</span>
                        <div className="flex space-x-1">
                          {post.tags?.map((t: string) => (
                            <span key={t} className="bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      }

      case "Approval Center":
        return <ApprovalsTab onUpdatePendingCount={setPendingApprovalsCount} />;

      case "Settings":
        return (
          <div className="space-y-6 animate-fadeIn" id="manager-settings">
            {/* Operational Parameters */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
              
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-serif font-black text-slate-800 text-base">Managerial Operational Parameters</h3>
                <p className="text-xs text-slate-400 font-mono uppercase mt-0.5">Define SLA buffers and point-of-sale Wi-Fi overrides</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-sans">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Branch Guest Wi-Fi SSID Password</label>
                    <input 
                      type="text"
                      value={wifiCode}
                      onChange={(e) => setWifiCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Kitchen SLA Target (Minutes)</label>
                    <input 
                      type="number"
                      value={slaTime}
                      onChange={(e) => setSlaTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-medium">Critical Stock Alert Level (Units threshold)</label>
                  <input 
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5 text-slate-500">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Changing operational parameters updates terminal thresholds across our corporate LAN server dynamically. Please notify staff before updating high-volume SLAs.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-mono font-bold rounded-xl shadow-sm uppercase text-[10px]"
                  >
                    Save Configuration
                  </button>
                </div>

              </form>

            </div>

            {/* Personal Profile Settings Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center space-x-3">
                <img src={managerAvatar} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-sm" />
                <div>
                  <h3 className="font-serif font-black text-slate-800 text-base">Personal Profile Customization</h3>
                  <p className="text-xs text-slate-400 font-mono uppercase mt-0.5">Customize your displayed personal identification credentials</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Display Name</label>
                    <input 
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Avatar Photo URL</label>
                    <input 
                      type="text"
                      value={managerAvatar}
                      onChange={(e) => setManagerAvatar(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Email Address</label>
                    <input 
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-500 font-medium">Phone Number</label>
                    <input 
                      type="text"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-mono font-bold rounded-xl shadow-sm uppercase text-[10px]"
                  >
                    Save Profile Info
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return <div className="p-8 text-center text-slate-400 font-mono">Tab component under development.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row relative" id="manager-system-dashboard">
      
      {/* Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white text-xs font-mono py-3 px-5 rounded-xl shadow-2xl z-50 animate-fadeIn flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#1F2937] text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
          <span className="font-serif font-black text-sm tracking-wider uppercase">MANAGER PLATFORM</span>
        </div>
        
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 bg-[#374151] rounded-xl text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Layout */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1F2937] text-white border-r border-[#374151] p-5 flex flex-col justify-between transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:h-auto lg:min-h-screen
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Core items list */}
        <div className="space-y-6">
          {/* Brand header */}
          <div className="hidden lg:flex items-center space-x-2.5 pb-4 border-b border-[#374151]">
            <div className="p-1.5 bg-[#2563EB]/20 border border-[#2563EB]/40 rounded-xl text-[#2563EB]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-sm tracking-widest text-slate-100">MANAGER HUB</h2>
              <span className="text-[8px] font-mono text-slate-400 block tracking-widest uppercase">OPERATIONS CONTROL</span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isSelected = activeTab === item.label;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.label);
                    setMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-serif transition-all text-left group
                    ${isSelected 
                      ? "bg-[#2563EB] text-white font-black shadow-md" 
                      : "text-slate-300 hover:bg-[#374151] hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center space-x-2.5">
                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isSelected ? "text-white" : "text-[#2563EB]"
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                      isSelected ? "bg-white text-[#2563EB]" : "bg-red-600 text-white animate-pulse"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info tag */}
        <div className="pt-4 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 space-y-1.5">
          <div className="flex items-center space-x-2">
            <img src={managerAvatar} className="w-5 h-5 rounded-full object-cover border border-slate-700" />
            <span className="block text-slate-300 font-medium">{managerName}</span>
          </div>
          <span className="block text-[8px] text-slate-500">ID: #704 • ROLE: MANAGER</span>
          <span className="block text-[8px] text-slate-600">SLA METRIC SYNC: 100% OK</span>
        </div>

      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[80vh]">
        {renderActiveTabContent()}
      </main>

    </div>
  );
}

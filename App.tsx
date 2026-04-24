import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { User } from "./types";
import { Coffee, Settings, FileText, LogOut, Clock, Receipt as ReceiptIcon } from "lucide-react";
import { cn } from "./lib/utils";

// Components
import Login from "./components/Login";
import OrderSystem from "./components/OrderSystem";
import AdminPanel from "./components/AdminPanel";
import Report from "./components/Report";
import OrderHistory from "./components/OrderHistory";

function MainLayout({ children, user, setUser }: { children: React.ReactNode, user: User, setUser: (u: User | null) => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const navItems = [
    { name: "Order POS", path: "/orders", icon: Coffee },
    { name: "Order History", path: "/history", icon: Clock },
    { name: "Admin Panel", path: "/admin", icon: Settings, adminOnly: true },
    { name: "Sales Report", path: "/report", icon: FileText, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FF6321] rounded-xl flex items-center justify-center shadow-inner">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900">THE CAFE HEAVEN</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.filter(i => !i.adminOnly || user.role === 'admin').map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-[#FF6321]/10 text-[#FF6321]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm text-gray-600">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold">{user.username}</span>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#F4F4F5] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("cafe_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem("cafe_user", JSON.stringify(u));
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/orders" /> : <Login onLogin={handleLogin} />} />
        
        <Route path="/" element={user ? <MainLayout user={user} setUser={setUser}><Navigate to="/orders" replace /></MainLayout> : <Navigate to="/login" />} />
        
        <Route path="/orders" element={user ? <MainLayout user={user} setUser={setUser}><OrderSystem /></MainLayout> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <MainLayout user={user} setUser={setUser}><OrderHistory /></MainLayout> : <Navigate to="/login" />} />
        
        <Route path="/admin" element={user?.role === 'admin' ? <MainLayout user={user} setUser={setUser}><AdminPanel /></MainLayout> : <Navigate to="/orders" />} />
        <Route path="/report" element={user?.role === 'admin' ? <MainLayout user={user} setUser={setUser}><Report /></MainLayout> : <Navigate to="/orders" />} />
        
        <Route path="*" element={<Navigate to="/orders" />} />
      </Routes>
    </Router>
  );
}


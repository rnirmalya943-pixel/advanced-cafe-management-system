import React, { useState } from "react";
import { User } from "../types";
import { Coffee, Lock, User as UserIcon, Shield, Users } from "lucide-react";

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [loginType, setLoginType] = useState<"staff" | "admin">("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [staffName, setStaffName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (loginType === "admin") {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.success && data.user && data.user.role === "admin") {
          onLogin(data.user);
        } else if (data.success && data.user) {
          setError("This account is not an admin account.");
        } else {
          setError(data.message || "Invalid credentials");
        }
      } else {
        const res = await fetch("/api/staff-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: staffName }),
        });
        const data = await res.json();

        if (data.success && data.user) {
          onLogin(data.user);
        } else {
          setError(data.message || "Failed to log in as staff");
        }
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F4F5] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative z-10 border border-gray-100 flex flex-col">
        <div className="p-8 pb-6 text-center bg-[#FF6321] text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm mb-4 ring-8 ring-white/10">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">THE CAFE HEAVEN</h1>
          <p className="text-white/80 font-medium tracking-wide">POS System</p>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => { setLoginType("staff"); setError(""); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              loginType === "staff" ? "bg-white text-[#FF6321] border-b-2 border-[#FF6321]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Login</span>
          </button>
          <button
            type="button"
            onClick={() => { setLoginType("admin"); setError(""); }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center space-x-2 transition-colors ${
              loginType === "admin" ? "bg-white text-[#FF6321] border-b-2 border-[#FF6321]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Login</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>{error}</span>
            </div>
          )}

          {loginType === "staff" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cashier Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#FF6321] focus:bg-white focus:ring-4 focus:ring-[#FF6321]/10 rounded-xl outline-none transition-all font-medium text-gray-900"
                    placeholder="Enter your name to start"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#FF6321] focus:bg-white focus:ring-4 focus:ring-[#FF6321]/10 rounded-xl outline-none transition-all font-medium text-gray-900"
                    placeholder="Enter admin username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:border-[#FF6321] focus:bg-white focus:ring-4 focus:ring-[#FF6321]/10 rounded-xl outline-none transition-all font-medium text-gray-900"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6321] hover:bg-[#e5581e] disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF6321]/30 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{loginType === "staff" ? "Start Session" : "Secure Login"}</span>
            )}
          </button>

          {loginType === "admin" && (
            <p className="text-center text-xs text-gray-400 font-medium">
              Demo admin credentials: <span className="font-mono bg-gray-100 text-gray-600 px-1 py-0.5 rounded">admin</span> / <span className="font-mono bg-gray-100 text-gray-600 px-1 py-0.5 rounded">admin123</span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { Settings, Plus, Trash2 } from "lucide-react";

export default function AdminPanel() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("TEA & COFFEE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const CATEGORIES = ["TEA & COFFEE", "BEVERAGE", "SALAD", "SANDWICH & BURGER", "SOUP", "PASTA", "Uncategorized"];

  const fetchMenu = () => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isNaN(parseFloat(price))) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price), category }),
      });
      const data = await res.json();
      
      if (data.success) {
        setName("");
        setPrice("");
        setCategory("TEA & COFFEE");
        fetchMenu();
      } else {
        setError(data.message || "Failed to add item");
      }
    } catch(err) {
      setError("Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      fetchMenu();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Admin Panel</h2>
          <p className="text-gray-500 mt-1">Manage menu items and prices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Add Menu Item</h3>
          
          <form onSubmit={handleAddItem} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition-all font-medium"
                placeholder="e.g. Latte"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition-all font-medium font-mono"
                placeholder="e.g. 4.50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition-all font-medium font-mono"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 mt-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add to Menu</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">Current Menu</h3>
          
          {menuItems.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Menu is currently empty.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {menuItems.map(item => (
                <li key={item.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                       <span>{item.name}</span>
                       {item.category && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.category}</span>}
                    </div>
                    <div className="text-gray-500 text-sm">₹{item.price.toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

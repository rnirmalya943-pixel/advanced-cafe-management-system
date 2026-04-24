import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { Coffee, Printer, Plus, Minus, Send, QrCode, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Receipt from "./Receipt";

interface CartItem {
  menuItem: MenuItem;
  qty: number;
}

export default function OrderSystem() {
  const [customer, setCustomer] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Receipt & Payment State
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // Default UPI ID for demo
  const UPI_ID = "merchant@upi"; 
  
  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(data => {
        setMenuItems(data);
      })
      .catch(err => console.error(err));
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.menuItem.price * item.qty), 0);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=The+Cafe+Heaven&am=${total.toFixed(2)}&cu=INR`;

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { menuItem: item, qty: 1 }];
    });
  };

  const updateCartQty = (id: number, delta: number) => {
    setCartItems(prev => prev.map(c => {
      if (c.menuItem.id === id) {
        return { ...c, qty: Math.max(1, c.qty + delta) };
      }
      return c;
    }));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(c => c.menuItem.id !== id));
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || !customer) return;

    setLoading(true);
    setError("");

    const date = new Date().toISOString().split('T')[0];

    const orderData = {
      customer,
      items: cartItems.map(c => ({
        name: c.menuItem.name,
        price: c.menuItem.price,
        qty: c.qty
      })),
      total,
      date
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data.success) {
        setLastOrder({ ...orderData, orderId: data.orderId });
        setShowPayment(false);
        setShowReceipt(true);
        setCustomer("");
        setCartItems([]);
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const initPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !customer) return;
    setShowPayment(true);
  };

  const printReceipt = () => {
    const printContent = document.getElementById("receipt-printarea");
    const windowPrint = window.open('', '', 'width=400,height=600');
    if (windowPrint && printContent) {
      windowPrint.document.write('<html><head><title>Print Receipt</title>');
      windowPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      windowPrint.document.write('</head><body class="p-4">');
      windowPrint.document.write(printContent.outerHTML);
      windowPrint.document.write('</body></html>');
      windowPrint.document.close();
      windowPrint.focus();
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 500);
    }
  };

  if (showReceipt && lastOrder) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Order Placed Successfully</h2>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <Receipt {...lastOrder} />
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={printReceipt}
            className="flex-1 bg-gray-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print Receipt</span>
          </button>
          <button 
            onClick={() => setShowReceipt(false)}
            className="flex-1 bg-[#FF6321] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#e5581e] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Order</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">New Order</h2>
        <p className="text-gray-500 mt-1">Select items and process customer orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-[#FF6321]" />
              <span>Menu Items</span>
            </h3>
            
            <div className="space-y-8">
              {Object.entries(
                menuItems.reduce((acc, item) => {
                  const cat = item.category || 'Uncategorized';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(item);
                  return acc;
                }, {} as Record<string, MenuItem[]>)
              ).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="p-4 rounded-2xl border-2 text-left transition-all duration-200 border-gray-100 bg-white hover:border-[#FF6321] active:scale-95"
                      >
                        <div className="font-bold text-gray-900 truncate">{item.name}</div>
                        <div className="text-gray-500 text-sm mt-1">₹{item.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {menuItems.length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No items in menu. Add some from Admin Panel.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h3 className="text-lg font-bold mb-4">Cart Details</h3>
            
            <form onSubmit={initPayment} className="space-y-5">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition-all font-medium"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-4 border-2 border-dashed border-gray-100 rounded-xl">Cart is empty</div>
                ) : (
                  cartItems.map((cartItem) => (
                    <div key={cartItem.menuItem.id} className="flex flex-col bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <div className="flex justify-between items-start mb-2">
                         <div className="font-bold text-sm text-gray-900">{cartItem.menuItem.name}</div>
                         <div className="font-medium text-sm">₹{(cartItem.menuItem.price * cartItem.qty).toFixed(2)}</div>
                       </div>
                       <div className="flex justify-between items-center">
                         <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200">
                           <button type="button" onClick={() => updateCartQty(cartItem.menuItem.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg hover:text-black">
                             <Minus className="w-3 h-3" />
                           </button>
                           <span className="w-4 text-center font-bold text-sm">{cartItem.qty}</span>
                           <button type="button" onClick={() => updateCartQty(cartItem.menuItem.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg hover:text-black">
                             <Plus className="w-3 h-3" />
                           </button>
                         </div>
                         <button type="button" onClick={() => removeFromCart(cartItem.menuItem.id)} className="text-red-400 hover:text-red-600 p-1">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mt-2">
                  <span className="text-gray-900 font-bold">Total</span>
                  <span className="text-3xl font-light text-[#FF6321]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={cartItems.length === 0 || !customer || loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Cash</span>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={cartItems.length === 0 || !customer || loading}
                  className="w-full bg-[#FF6321] hover:bg-[#e5581e] disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF6321]/30 flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full relative border border-gray-100">
            <button 
              onClick={() => setShowPayment(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
            >
              ×
            </button>
            <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Scan to Pay</h3>
            <p className="text-gray-500 mb-6 font-medium">Amount: <span className="text-[#FF6321] font-bold text-xl">₹{total.toFixed(2)}</span></p>
            
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block shadow-sm mb-8">
              <QRCodeSVG value={upiLink} size={220} level="H" />
            </div>

            <p className="text-xs text-gray-400 mb-6 px-4">
              Ensure customer has completed the payment successfully before confirming the order.
            </p>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="block w-full bg-[#10B981] text-white font-bold py-4 px-4 rounded-xl hover:bg-[#059669] transition-all active:scale-95 shadow-lg shadow-[#10B981]/30 flex justify-center items-center h-14"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-lg">Payment Received</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

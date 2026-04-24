import { useState, useEffect } from "react";
import { Order } from "../types";
import { Clock, Printer } from "lucide-react";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const printOrderReceipt = (order: Order) => {
    const windowPrint = window.open('', '', 'width=400,height=600');
    if (windowPrint) {
      windowPrint.document.write('<html><head><title>Print Receipt</title>');
      windowPrint.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      windowPrint.document.write('</head><body class="p-8 font-sans">');
      
      const content = `
        <div class="max-w-sm mx-auto bg-white p-6 rounded-xl border border-dashed border-gray-300">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold">THE CAFE HEAVEN</h2>
            <p class="text-sm text-gray-500">Order Receipt</p>
          </div>
          <div class="mb-4 text-sm border-b border-dashed border-gray-200 pb-4">
            <p><strong>Order #:</strong> ${order.id.toString().padStart(4, '0')}</p>
            <p><strong>Date:</strong> ${order.date}</p>
            <p><strong>Customer:</strong> ${order.customer || 'Guest'}</p>
          </div>
          <div class="mb-4 pb-4 border-b border-dashed border-gray-200 text-sm">
             ${order.items && order.items.length > 0 ? 
               order.items.map(i => `<div class="flex justify-between mb-2"><span>${i.name} x${i.qty}</span><span>₹${(i.price * i.qty).toFixed(2)}</span></div>`).join('')
               : `<div class="flex justify-between mb-2"><span>${order.item} x${order.qty}</span><span>₹${order.total.toFixed(2)}</span></div>`
             }
          </div>
          <div class="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>₹${order.total.toFixed(2)}</span>
          </div>
          <div class="text-center mt-8 text-xs text-gray-500">
            <p>Thank you for visiting!<br/>Duplicate Bill</p>
          </div>
        </div>
      `;

      windowPrint.document.write(content);
      windowPrint.document.write('</body></html>');
      windowPrint.document.close();
      windowPrint.focus();
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 500);
    }
  };

  return (
    <div className="max-w-4xl max-w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Order History</h2>
        <p className="text-gray-500 mt-1">Real-time view of recent store orders.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="text-gray-500 mt-1">Orders will appear here once placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-3xl">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 rounded-tr-3xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">#{order.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4">{order.item}</td>
                    <td className="px-6 py-4 text-gray-500">{order.qty}</td>
                    <td className="px-6 py-4 font-medium text-[#FF6321]">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.date} 
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => printOrderReceipt(order)}
                        className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


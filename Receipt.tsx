interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptProps {
  customer: string;
  item?: string;
  qty?: number;
  total: number;
  date: string;
  orderId?: number;
  items?: ReceiptItem[];
}

export default function Receipt({ customer, item, qty, total, date, orderId, items }: ReceiptProps) {
  return (
    <div id="receipt-printarea" className="bg-white p-6 w-80 shadow-md font-mono text-sm border-t-4 border-[#FF6321] mx-auto text-center" style={{ color: '#000' }}>
      <h2 className="text-xl font-bold mb-1">THE CAFE HEAVEN</h2>
      <p className="text-xs text-gray-500 mb-4">Receipt #{orderId || 'PENDING'}</p>
      
      <div className="border-t border-dashed border-gray-400 py-3 mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-gray-500">Date:</span>
          <span>{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Customer:</span>
          <span className="font-semibold">{customer}</span>
        </div>
      </div>
      
      <div className="border-t border-dashed border-gray-400 py-3 mb-3 text-left">
        <div className="flex justify-between font-bold mb-2">
          <span>Item</span>
          <span>Qty x Price</span>
        </div>
        {items && items.length > 0 ? (
          items.map((i, idx) => (
            <div key={idx} className="flex justify-between mb-1">
              <span className="truncate max-w-[140px]">{i.name}</span>
              <span>{i.qty} x ₹{i.price.toFixed(2)}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span className="truncate w-1/2">{item}</span>
            <span>{qty} x ₹{(total / (qty || 1)).toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="border-t border-dashed border-gray-400 py-3 mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500">Thank you for your visit!</p>
      <p className="text-[10px] mt-1 text-gray-400">Printed: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

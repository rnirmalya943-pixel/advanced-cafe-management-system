import { useState, useEffect } from "react";
import { ReportData } from "../types";
import { FileText, TrendingUp, Calendar, IndianRupee, ShoppingBag, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ['#FF6321', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function Report() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [date]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/report?date=${date}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = report?.totalSales || 0;
  const totalOrders = report?.totalOrders || 0;
  const peakHours = report?.peakHours || [];
  const topItems = report?.topItems || [];

  return (
    <div className="max-w-6xl w-full">
      <div className="mb-8 flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sales Dashboard</h2>
          <p className="text-gray-500 mt-1">Analytics and daily performance metrics.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 inline-block">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-50 border-none rounded-lg px-3 py-2 font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center relative z-10">
            <IndianRupee className="w-8 h-8 text-green-500" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="text-4xl font-black tracking-tight text-gray-900">₹{totalSales.toFixed(2)}</div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <IndianRupee className="w-48 h-48" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center space-x-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center relative z-10">
            <ShoppingBag className="w-8 h-8 text-purple-500" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</div>
            <div className="text-4xl font-black tracking-tight text-gray-900">{totalOrders}</div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <ShoppingBag className="w-48 h-48" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Hours Bar Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span>Peak Hours Overview</span>
            </h3>
            {peakHours.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip 
                       cursor={{ fill: '#F3F4F6' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center text-gray-400 text-sm">
                No orders data found for this date.
              </div>
            )}
          </div>

          {/* Top Selling Items Pie Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-[#FF6321]" />
              <span>Top Selling Items</span>
            </h3>
            {topItems.length > 0 ? (
              <div className="h-72 w-full flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topItems}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value, name) => [`${value} sold`, name]}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center text-gray-400 text-sm">
                No items sold on this date.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

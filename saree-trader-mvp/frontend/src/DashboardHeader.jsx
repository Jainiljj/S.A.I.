import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function DashboardHeader({ refreshTrigger }) {
  const [stats, setStats] = useState({ totalOutstanding: 0, lowStockCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`);
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const sendReminders = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/telegram/remind`);
      alert(`Success: ${res.data.message}`);
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Failed to send reminders.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex gap-6">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Total Outstanding</p>
          <p className="text-3xl font-bold text-rose-600">
            ₹{stats.totalOutstanding ? stats.totalOutstanding.toLocaleString('en-IN') : 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Low Stock Items</p>
          <p className="text-3xl font-bold text-amber-600">
            {stats.lowStockCount || 0}
          </p>
        </div>
      </div>
      <div>
        <button 
          onClick={sendReminders} 
          disabled={loading}
          className="btn-primary flex items-center gap-2 text-lg shadow-lg"
        >
          <Bell size={24} />
          {loading ? 'Sending...' : 'Send 60-day reminders now'}
        </button>
      </div>
    </div>
  );
}

// src/pages/admin/DashboardOverview.jsx
import { useState, useEffect } from 'react';
import StatCard from './StatCard';
import QuickAction from './QuickAction';
import ActivityItem from './ActivityItem';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback mock data
      setStats({
        totalUsers: 1248,
        totalProducts: 36,
        totalOrders: 289,
        totalRevenue: 12540
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="users"
          color="blue"
        />
        
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="products"
          color="green"
        />
        
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="orders"
          color="purple"
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="revenue"
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction
              title="Add New Product"
              description="Create a new herbal honey product"
              icon="➕"
              section="products"
            />
            
            <QuickAction
              title="Manage Slides"
              description="Update homepage slider content"
              icon="🎠"
              section="slides"
            />
            
            <QuickAction
              title="View Orders"
              description="Process customer orders"
              icon="📦"
              section="orders"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-5 flow-root">
            <ul className="-mb-8">
              <ActivityItem
                action="created"
                target="new product"
                person="Sarah Johnson"
                date="2h ago"
                icon="🆕"
              />
              
              <ActivityItem
                action="updated"
                target="homepage slide"
                person="Mike Chen"
                date="4h ago"
                icon="🔄"
              />
              
              <ActivityItem
                action="processed"
                target="order #1234"
                person="Emma Wilson"
                date="1d ago"
                icon="✅"
              />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
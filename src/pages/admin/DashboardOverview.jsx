// src/pages/admin/DashboardOverview.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';
import QuickAction from './QuickAction';
import ActivityItem from './ActivityItem';
import ConnectionTroubleshooter from '../../utils/ConnectionTroubleshooter';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          errorMessage = 'Authentication failed. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = 'Access denied. Insufficient permissions.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Error: ${status}`;
      }
    } else if (error.request) {
      errorMessage = 'Cannot connect to server. Please check your connection and ensure the backend is running.';
    }
    
    error.message = errorMessage;
    return Promise.reject(error);
  }
);

const DashboardOverview = ({ onQuickAction }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    orderStatus: {},
    topProducts: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [activityError, setActivityError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    checkConnectionAndFetchData();
  }, []);

  const checkConnectionAndFetchData = async () => {
    setIsLoading(true);
    setConnectionError(false);
    setStatsError(null);
    setActivityError(null);

    try {
      // Test connection first
      await axiosInstance.get('/api/test-connection', { timeout: 5000 });
      
      // Fetch data in parallel
      await Promise.all([fetchStats(), fetchRecentActivity()]);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionError(true);
      setStatsError({ 
        message: error.message,
        details: error.response?.data?.error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/stats');
      
      if (response.data.success) {
        setStats({
          totalUsers: response.data.data.totalUsers || 0,
          totalProducts: response.data.data.totalProducts || 0,
          totalOrders: response.data.data.totalOrders || 0,
          totalRevenue: response.data.data.totalRevenue || 0,
          orderStatus: response.data.data.orderStatus || {},
          topProducts: response.data.data.topProducts || []
        });
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError({
        message: error.message,
        details: error.response?.data?.error,
        status: error.response?.status
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/activity');
      
      if (response.data.success) {
        setRecentActivity(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch recent activity');
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
      setActivityError({
        message: error.message,
        details: error.response?.data?.error
      });
    }
  };

  const handleRetry = () => {
    checkConnectionAndFetchData();
  };

  const renderError = (error, title, onRetry) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">{title}</h4>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
          {error.details && (
            <p className="text-red-600 text-xs mt-1">Details: {error.details}</p>
          )}
          {error.status && (
            <p className="text-red-600 text-xs mt-1">Status: {error.status}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (connectionError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Connection issues detected
          </div>
        </div>
        <ConnectionTroubleshooter onRetry={handleRetry} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="text-sm text-gray-500">
            Loading...
          </div>
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Error Display */}
      {statsError && renderError(statsError, 'Failed to Load Statistics', handleRetry)}
      {activityError && renderError(activityError, 'Failed to Load Recent Activity')}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="users"
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="products"
          color="green"
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="orders"
          color="purple"
          trend={{ value: 23, isPositive: true }}
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="revenue"
          color="amber"
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <QuickAction
                  title="Add New Product"
                  description="Create a new herbal honey product"
                  icon="➕"
                  section="products"
                  onClick={onQuickAction}
                />
                
                <QuickAction
                  title="Manage Slides"
                  description="Update homepage slider content"
                  icon="🎠"
                  section="slides"
                  onClick={onQuickAction}
                />
                
                <QuickAction
                  title="View Orders"
                  description="Process customer orders"
                  icon="📦"
                  section="orders"
                  onClick={onQuickAction}
                />

                <QuickAction
                  title="Analytics"
                  description="View sales and traffic reports"
                  icon="📊"
                  section="analytics"
                  onClick={onQuickAction}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                <button 
                  onClick={() => onQuickAction('orders')}
                  className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="flow-root">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No recent activity found</p>
                  </div>
                ) : (
                  <ul className="-mb-8">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem
                        key={activity.id || index}
                        action={activity.action}
                        target={activity.target}
                        person={activity.person}
                        date={activity.date}
                        icon={activity.icon}
                        isLast={index === recentActivity.length - 1}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Order Status and Top Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Orders Status</h4>
              <div className="space-y-3">
                {Object.entries(stats.orderStatus).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No orders data available</p>
                  </div>
                ) : (
                  Object.entries(stats.orderStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{status}</span>
                      <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                        {count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Top Products</h4>
              <div className="space-y-3">
                {stats.topProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No products data available</p>
                  </div>
                ) : (
                  stats.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate max-w-[120px]">
                        {product.product_name}
                      </span>
                      <span className="text-sm font-medium bg-amber-100 px-2 py-1 rounded">
                        {product.total_sold} sold
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleRetry}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;
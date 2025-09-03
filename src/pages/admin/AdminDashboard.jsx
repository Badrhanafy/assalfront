// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardOverview from './DashboardOverview';
import SlidesManager from './SlidesManager';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import AnalyticsDashboard from './AnalyticsDashboard';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [authorized, setAuthorized] = useState(null); // null = كنشيك مازال
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true }); // redirection مباشرة
    } else {
      setAuthorized(true); // يقدر يشوف الصفحة
    }
  }, [navigate]);

  if (authorized === null) {
    return null; // حتى يتشيك، ما نعرضو والو
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'slides':
        return <SlidesManager />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex pt-16">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:ml-0">
            {renderContent()}
          </div>
        </main>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2">
          {['dashboard', 'products', 'orders', 'analytics'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`flex flex-col items-center px-3 py-2 text-xs ${
                activeSection === item
                  ? 'text-amber-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="mb-1">
                {item === 'dashboard' && '📊'}
                {item === 'products' && '🍕'}
                {item === 'orders' && '📦'}
                {item === 'analytics' && '📈'}
              </span>
              <span className="capitalize">{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiPieChart, FiTrendingUp, FiDollarSign, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Components
import Dashboard from './components/Dashboard';
import BalanceSheet from './components/BalanceSheet';
import CashFlow from './components/CashFlow';
import Settings from './components/Settings';

// Services
import { getDashboard } from './services/financeService';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Balance Sheet', href: '/balance-sheet', icon: FiPieChart },
    { name: 'Cash Flow', href: '/cash-flow', icon: FiTrendingUp },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Personal Finance Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-lg"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
      >
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <FiDollarSign className="text-white text-2xl mr-2" />
          <h1 className="text-white text-xl font-bold">Finance Tracker</h1>
        </div>
        
        <nav className="mt-8 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 text-lg" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        {dashboardData && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData.netWorth?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Routes>
                <Route 
                  path="/" 
                  element={<Dashboard data={dashboardData} onDataUpdate={loadDashboardData} />} 
                />
                <Route 
                  path="/balance-sheet" 
                  element={<BalanceSheet data={dashboardData} onDataUpdate={loadDashboardData} />} 
                />
                <Route 
                  path="/cash-flow" 
                  element={<CashFlow data={dashboardData} onDataUpdate={loadDashboardData} />} 
                />
                <Route 
                  path="/settings" 
                  element={<Settings onDataUpdate={loadDashboardData} />} 
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiCreditCard, FiDownload, FiUpload } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import toast from 'react-hot-toast';

// Components
import AddBankModal from './modals/AddBankModal';
import AddInvestmentModal from './modals/AddInvestmentModal';
import AddDebtModal from './modals/AddDebtModal';
import AddExpenseModal from './modals/AddExpenseModal';

// Services
import { formatGBP, exportExcel, importExcel, updateInvestmentPrices } from '../services/localStorageService';

const Dashboard = ({ data, onDataUpdate }) => {
  const [showBankModal, setShowBankModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Prepare chart data
  const assetChartData = [
    { name: 'Bank Accounts', value: data?.banks?.reduce((sum, bank) => sum + bank.balance, 0) || 0 },
    { name: 'Investments', value: data?.investments?.reduce((sum, inv) => sum + inv.currentValue, 0) || 0 },
  ];

  const expenseChartData = data?.expenses?.map(expense => ({
    name: expense.category,
    value: expense.amount
  })) || [];

  const handleExport = async () => {
    try {
      await exportExcel();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImporting(true);
      await importExcel(file);
      toast.success('Data imported successfully!');
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleUpdatePrices = async () => {
    try {
      setUpdatingPrices(true);
      await updateInvestmentPrices();
      toast.success('Investment prices updated successfully!');
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to update investment prices');
    } finally {
      setUpdatingPrices(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      className="card"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${change >= 0 ? 'text-success' : 'text-danger'}`}>
              {change >= 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
              <span className="ml-1 text-sm">
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-600 text-xl`} />
        </div>
      </div>
    </motion.div>
  );

  const QuickActionButton = ({ title, icon: Icon, onClick, color = 'blue' }) => (
    <motion.button
      className={`flex flex-col items-center p-4 rounded-lg bg-${color}-50 hover:bg-${color}-100 transition-colors`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className={`text-${color}-600 text-2xl mb-2`} />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your financial health</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label htmlFor="import-file" className="btn btn-secondary cursor-pointer">
            {importing ? <div className="spinner" /> : <FiUpload className="mr-2" />}
            Import Excel
          </label>
          <button onClick={handleExport} className="btn btn-primary">
            <FiDownload className="mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assets"
          value={formatGBP(data?.totalAssets || 0)}
          icon={FiDollarSign}
          color="blue"
        />
        <StatCard
          title="Net Worth"
          value={formatGBP(data?.netWorth || 0)}
          icon={FiTrendingUp}
          color="success"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatGBP(data?.monthlyExpenses || 0)}
          icon={FiCreditCard}
          color="warning"
        />
        <StatCard
          title="Total Liabilities"
          value={formatGBP(data?.totalLiabilities || 0)}
          icon={FiPieChart}
          color="danger"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Assets Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatGBP(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Expenses Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatGBP(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            title="Add Bank Account"
            icon={FiDollarSign}
            onClick={() => setShowBankModal(true)}
            color="blue"
          />
          <QuickActionButton
            title="Add Investment"
            icon={FiTrendingUp}
            onClick={() => setShowInvestmentModal(true)}
            color="success"
          />
          <QuickActionButton
            title="Add Debt"
            icon={FiCreditCard}
            onClick={() => setShowDebtModal(true)}
            color="warning"
          />
          <QuickActionButton
            title="Add Expense"
            icon={FiPieChart}
            onClick={() => setShowExpenseModal(true)}
            color="danger"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={handleUpdatePrices}
            className="btn btn-secondary"
            disabled={updatingPrices}
          >
            {updatingPrices ? 'Updating...' : 'Update Investment Prices'}
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data?.banks?.slice(0, 3).map((bank) => (
            <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FiDollarSign className="text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">{bank.name}</p>
                  <p className="text-sm text-gray-600">{bank.bankName}</p>
                </div>
              </div>
              <span className="font-semibold">{formatGBP(bank.balance)}</span>
            </div>
          ))}
          {data?.investments?.slice(0, 3).map((investment) => (
            <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FiTrendingUp className="text-success mr-3" />
                <div>
                  <p className="font-medium">{investment.symbol}</p>
                  <p className="text-sm text-gray-600">{investment.shares} shares</p>
                </div>
              </div>
              <span className="font-semibold">{formatGBP(investment.currentValue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddBankModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={() => {
          setShowBankModal(false);
          onDataUpdate();
        }}
      />
      <AddInvestmentModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        onSuccess={() => {
          setShowInvestmentModal(false);
          onDataUpdate();
        }}
      />
      <AddDebtModal
        isOpen={showDebtModal}
        onClose={() => setShowDebtModal(false)}
        onSuccess={() => {
          setShowDebtModal(false);
          onDataUpdate();
        }}
      />
      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSuccess={() => {
          setShowExpenseModal(false);
          onDataUpdate();
        }}
      />
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import moment from 'moment';

// Services
import { getCashFlow, addExpense, updateExpense, deleteExpense, formatGBP } from '../services/localStorageService';

// Modals
import AddExpenseModal from './modals/AddExpenseModal';

const CashFlow = ({ onDataUpdate }) => {
  const [cashFlowData, setCashFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalStates, setModalStates] = useState({
    expense: false
  });
  const [editData, setEditData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // 'current', 'projected'

  useEffect(() => {
    loadCashFlow();
  }, []);

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      const data = await getCashFlow();
      setCashFlowData(data);
    } catch (error) {
      toast.error('Failed to fetch cash flow data');
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (type, data = null) => {
    setEditData(data);
    setModalStates(prev => ({ ...prev, [type]: true }));
  };

  const handleModalClose = (type) => {
    setModalStates(prev => ({ ...prev, [type]: false }));
    setEditData(null);
  };

  const handleSuccess = () => {
    loadCashFlow();
    onDataUpdate();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await deleteExpense(id);
      toast.success('Transaction deleted successfully');
      handleSuccess();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const calculateProjections = () => {
    if (!cashFlowData) return null;

    const { currentMonth, monthlyExpenses } = cashFlowData;
    const avgMonthlyExpense = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(monthlyExpenses.length, 1);
    const avgMonthlyIncome = currentMonth.income;
    
    const projections = [];
    let projectedBalance = currentMonth.endingBalance;
    
    for (let i = 1; i <= 12; i++) {
      const month = moment().add(i, 'months');
      projectedBalance += (avgMonthlyIncome - avgMonthlyExpense);
      
      projections.push({
        month: month.format('MMM YYYY'),
        projectedBalance: Math.round(projectedBalance * 100) / 100,
        income: avgMonthlyIncome,
        expenses: avgMonthlyExpense
      });
    }
    
    return projections;
  };

  const prepareChartData = () => {
    if (!cashFlowData) return [];

    const { monthlyExpenses } = cashFlowData;
    const categoryTotals = {};
    
    monthlyExpenses.forEach(expense => {
      if (expense.type === 'expense') {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      }
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!cashFlowData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cash flow data available</p>
      </div>
    );
  }

  const { currentMonth, monthlyExpenses } = cashFlowData;
  const projections = calculateProjections();
  const chartData = prepareChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow</h1>
          <p className="text-gray-600">Track your income, expenses, and projections</p>
        </div>
        <button
          onClick={() => handleModalOpen('expense')}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="card bg-gradient-to-r from-green-500 to-green-600 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Monthly Income</p>
              <p className="text-2xl font-bold">{formatGBP(currentMonth.income)}</p>
            </div>
            <FiTrendingUp className="text-2xl" />
          </div>
        </motion.div>

        <motion.div
          className="card bg-gradient-to-r from-red-500 to-red-600 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Monthly Expenses</p>
              <p className="text-2xl font-bold">{formatGBP(currentMonth.expenses)}</p>
            </div>
            <FiTrendingDown className="text-2xl" />
          </div>
        </motion.div>

        <motion.div
          className={`card ${
            currentMonth.netCashFlow >= 0 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          } text-white`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Net Cash Flow</p>
              <p className="text-2xl font-bold">{formatGBP(currentMonth.netCashFlow)}</p>
            </div>
            {currentMonth.netCashFlow >= 0 ? (
              <FiTrendingUp className="text-2xl" />
            ) : (
              <FiTrendingDown className="text-2xl" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPeriod('current')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === 'current'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Current Month
        </button>
        <button
          onClick={() => setSelectedPeriod('projected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedPeriod === 'projected'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Projections
        </button>
      </div>

      {/* Current Month Details */}
      {selectedPeriod === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses Breakdown Chart */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses Breakdown</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatGBP(value)} />
                  <Bar dataKey="amount" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No expense data available
              </div>
            )}
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {monthlyExpenses.slice(0, 10).map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                    <p className="text-xs text-gray-500">{moment(expense.date).format('MMM DD, YYYY')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {expense.type === 'income' ? '+' : '-'}{formatGBP(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleModalOpen('expense', expense)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {monthlyExpenses.length === 0 && (
                <p className="text-gray-500 text-center py-4">No transactions recorded</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Projections */}
      {selectedPeriod === 'projected' && projections && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">12-Month Projections</h3>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatGBP(value)} />
                <Line 
                  type="monotone" 
                  dataKey="projectedBalance" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Projected Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Projection Assumptions</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Average Monthly Income: {formatGBP(currentMonth.income)}</p>
                <p>• Average Monthly Expenses: {formatGBP(monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) / Math.max(monthlyExpenses.length, 1))}</p>
                <p>• Starting Balance: {formatGBP(currentMonth.endingBalance)}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• {projections[projections.length - 1]?.projectedBalance >= 0 ? 'Positive' : 'Negative'} trend projected</p>
                <p>• Year-end balance: {formatGBP(projections[projections.length - 1]?.projectedBalance)}</p>
                <p>• Monthly change: {formatGBP(projections[0]?.projectedBalance - currentMonth.endingBalance)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={modalStates.expense}
        onClose={() => handleModalClose('expense')}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </div>
  );
};

export default CashFlow;
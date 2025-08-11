import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { getBalanceSheet, deleteBank, deleteInvestment, deleteDebt } from '../services/financeService';

// Modals
import AddBankModal from './modals/AddBankModal';
import AddInvestmentModal from './modals/AddInvestmentModal';
import AddDebtModal from './modals/AddDebtModal';

const BalanceSheet = ({ onDataUpdate }) => {
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalStates, setModalStates] = useState({
    bank: false,
    investment: false,
    debt: false
  });
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    loadBalanceSheet();
  }, []);

  const loadBalanceSheet = async () => {
    try {
      setLoading(true);
      const data = await getBalanceSheet();
      setBalanceSheetData(data);
    } catch (error) {
      toast.error('Failed to fetch balance sheet data');
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
    loadBalanceSheet();
    onDataUpdate();
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'bank':
          await deleteBank(id);
          break;
        case 'investment':
          await deleteInvestment(id);
          break;
        case 'debt':
          await deleteDebt(id);
          break;
        default:
          throw new Error('Invalid type');
      }
      
      toast.success('Item deleted successfully');
      handleSuccess();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  if (!balanceSheetData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No balance sheet data available</p>
      </div>
    );
  }

  const { assets, liabilities, netWorth } = balanceSheetData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600">Overview of your financial position</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModalOpen('bank')}
            className="btn btn-primary"
          >
            <FiPlus className="mr-2" />
            Add Bank
          </button>
          <button
            onClick={() => handleModalOpen('investment')}
            className="btn btn-primary"
          >
            <FiPlus className="mr-2" />
            Add Investment
          </button>
          <button
            onClick={() => handleModalOpen('debt')}
            className="btn btn-primary"
          >
            <FiPlus className="mr-2" />
            Add Debt
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="card bg-gradient-to-r from-green-500 to-green-600 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Assets</p>
              <p className="text-2xl font-bold">${assets.total.toLocaleString()}</p>
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
              <p className="text-red-100">Total Liabilities</p>
              <p className="text-2xl font-bold">${liabilities.total.toLocaleString()}</p>
            </div>
            <FiTrendingDown className="text-2xl" />
          </div>
        </motion.div>

        <motion.div
          className={`card ${
            netWorth >= 0 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          } text-white`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Net Worth</p>
              <p className="text-2xl font-bold">${netWorth.toLocaleString()}</p>
            </div>
            {netWorth >= 0 ? (
              <FiTrendingUp className="text-2xl" />
            ) : (
              <FiTrendingDown className="text-2xl" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Assets Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assets</h2>
          <span className="text-2xl font-bold text-green-600">
            ${assets.total.toLocaleString()}
          </span>
        </div>

        {/* Bank Accounts */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Bank Accounts</h3>
          <div className="space-y-3">
            {assets.banks.map(bank => (
              <div key={bank.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{bank.name}</p>
                  <p className="text-sm text-gray-600">{bank.bankName} • {bank.accountNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-green-600">
                    ${bank.balance.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleModalOpen('bank', bank)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete('bank', bank.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {assets.banks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No bank accounts added yet</p>
            )}
          </div>
        </div>

        {/* Investments */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Investments</h3>
          <div className="space-y-3">
            {assets.investments.map(investment => (
              <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{investment.symbol}</p>
                  <p className="text-sm text-gray-600">
                    {investment.shares} shares @ ${investment.purchasePrice}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-green-600">
                    ${investment.currentValue.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleModalOpen('investment', investment)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete('investment', investment.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {assets.investments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No investments added yet</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Liabilities Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Liabilities</h2>
          <span className="text-2xl font-bold text-red-600">
            ${liabilities.total.toLocaleString()}
          </span>
        </div>

        <div className="space-y-3">
          {liabilities.debts.map(debt => (
            <div key={debt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{debt.person}</p>
                <p className="text-sm text-gray-600">
                  {debt.description} {debt.dueDate && `• Due: ${debt.dueDate}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-red-600">
                  ${debt.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => handleModalOpen('debt', debt)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete('debt', debt.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {liabilities.debts.length === 0 && (
            <p className="text-gray-500 text-center py-4">No debts recorded</p>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AddBankModal
        isOpen={modalStates.bank}
        onClose={() => handleModalClose('bank')}
        onSuccess={handleSuccess}
        editData={editData}
      />

      <AddInvestmentModal
        isOpen={modalStates.investment}
        onClose={() => handleModalClose('investment')}
        onSuccess={handleSuccess}
        editData={editData}
      />

      <AddDebtModal
        isOpen={modalStates.debt}
        onClose={() => handleModalClose('debt')}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </div>
  );
};

export default BalanceSheet;
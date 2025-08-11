import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { addExpense, updateExpense } from '../../services/localStorageService';

const AddExpenseModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [formData, setFormData] = useState({
    category: editData?.category || '',
    amount: editData?.amount || '',
    description: editData?.description || '',
    date: editData?.date || new Date().toISOString().split('T')[0],
    type: editData?.type || 'expense' // 'expense' or 'income'
  });
  const [loading, setLoading] = useState(false);

  const expenseCategories = [
    'Salary',
    'Rent',
    'Utilities',
    'Groceries',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Insurance',
    'Gym',
    'Phone',
    'TV/Internet',
    'Shopping',
    'Dining',
    'Travel',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        ...(editData && { id: editData.id })
      };

      if (editData) {
        await updateExpense(expenseData);
        toast.success('Expense updated successfully!');
      } else {
        await addExpense(expenseData);
        toast.success('Expense added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  formData.type === 'income' ? 'bg-success' : 'bg-danger'
                }`}>
                  <FiDollarSign className={`${
                    formData.type === 'income' ? 'text-success' : 'text-danger'
                  }`} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editData ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="flex gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={loading}
                    />
                    Expense
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={loading}
                    />
                    Income
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Monthly rent payment"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date" className="form-label">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn flex-1 ${
                    formData.type === 'income' ? 'btn-success' : 'btn-primary'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    editData ? 'Update Transaction' : 'Add Transaction'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;
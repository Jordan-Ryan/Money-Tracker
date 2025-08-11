import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { addDebt, updateDebt } from '../../services/localStorageService';

const AddDebtModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [formData, setFormData] = useState({
    person: editData?.person || '',
    amount: editData?.amount || '',
    description: editData?.description || '',
    dueDate: editData?.dueDate || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.person || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const debtData = {
        ...formData,
        amount: parseFloat(formData.amount),
        ...(editData && { id: editData.id })
      };

      if (editData) {
        await updateDebt(debtData);
        toast.success('Debt updated successfully!');
      } else {
        await addDebt(debtData);
        toast.success('Debt added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save debt');
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
        person: '',
        amount: '',
        description: '',
        dueDate: ''
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
                <div className="p-2 bg-warning rounded-lg mr-3">
                  <FiCreditCard className="text-warning" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editData ? 'Edit Debt' : 'Add Debt'}
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
                <label htmlFor="person" className="form-label">
                  Person/Entity *
                </label>
                <input
                  type="text"
                  id="person"
                  name="person"
                  value={formData.person}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Amount Owed *
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
                  placeholder="e.g., Loan for car purchase"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate" className="form-label">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="form-input"
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
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner" />
                  ) : (
                    editData ? 'Update Debt' : 'Add Debt'
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

export default AddDebtModal;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { addBankAccount, updateBankAccount } from '../../services/financeService';

const AddBankModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    balance: editData?.balance || '',
    accountNumber: editData?.accountNumber || '',
    bankName: editData?.bankName || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.balance || !formData.bankName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const bankData = {
        ...formData,
        balance: parseFloat(formData.balance),
        ...(editData && { id: editData.id })
      };

      if (editData) {
        await updateBankAccount(bankData);
        toast.success('Bank account updated successfully!');
      } else {
        await addBankAccount(bankData);
        toast.success('Bank account added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save bank account');
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
        name: '',
        balance: '',
        accountNumber: '',
        bankName: ''
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
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FiDollarSign className="text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editData ? 'Edit Bank Account' : 'Add Bank Account'}
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
                <label htmlFor="name" className="form-label">
                  Account Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Main Checking Account"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="balance" className="form-label">
                  Current Balance *
                </label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={formData.balance}
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
                <label htmlFor="bankName" className="form-label">
                  Bank Name *
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Chase Bank"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="accountNumber" className="form-label">
                  Account Number
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., ****1234"
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
                    editData ? 'Update Account' : 'Add Account'
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

export default AddBankModal;
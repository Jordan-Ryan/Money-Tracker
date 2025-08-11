import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { addInvestment, updateInvestment } from '../../services/financeService';

const AddInvestmentModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [formData, setFormData] = useState({
    symbol: editData?.symbol || '',
    shares: editData?.shares || '',
    purchasePrice: editData?.purchasePrice || '',
    currentPrice: editData?.currentPrice || '',
    currentValue: editData?.currentValue || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.shares || !formData.purchasePrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const investmentData = {
        ...formData,
        shares: parseFloat(formData.shares),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice),
        currentValue: parseFloat(formData.currentValue) || (parseFloat(formData.shares) * parseFloat(formData.currentPrice || formData.purchasePrice)),
        ...(editData && { id: editData.id })
      };

      if (editData) {
        await updateInvestment(investmentData);
        toast.success('Investment updated successfully!');
      } else {
        await addInvestment(investmentData);
        toast.success('Investment added successfully!');
      }
      
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save investment');
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
        symbol: '',
        shares: '',
        purchasePrice: '',
        currentPrice: '',
        currentValue: ''
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
                <div className="p-2 bg-success rounded-lg mr-3">
                  <FiTrendingUp className="text-success" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editData ? 'Edit Investment' : 'Add Investment'}
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
                <label htmlFor="symbol" className="form-label">
                  Stock Symbol *
                </label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., AAPL"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="shares" className="form-label">
                  Number of Shares *
                </label>
                <input
                  type="number"
                  id="shares"
                  name="shares"
                  value={formData.shares}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchasePrice" className="form-label">
                  Purchase Price per Share *
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice}
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
                <label htmlFor="currentPrice" className="form-label">
                  Current Price per Share
                </label>
                <input
                  type="number"
                  id="currentPrice"
                  name="currentPrice"
                  value={formData.currentPrice}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentValue" className="form-label">
                  Current Total Value
                </label>
                <input
                  type="number"
                  id="currentValue"
                  name="currentValue"
                  value={formData.currentValue}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
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
                    editData ? 'Update Investment' : 'Add Investment'
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

export default AddInvestmentModal;
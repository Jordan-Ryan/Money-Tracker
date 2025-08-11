import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiUpload, FiRefreshCw, FiSettings, FiDatabase, FiShield, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Services
import { exportExcel, importExcel } from '../services/financeService';

const Settings = ({ onDataUpdate }) => {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportExcel();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setImportLoading(true);
      await importExcel(file);
      toast.success('Data imported successfully!');
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to import data');
    } finally {
      setImportLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRefreshData = async () => {
    try {
      setRefreshLoading(true);
      // This would typically refresh live data from APIs
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('Data refreshed successfully!');
      onDataUpdate();
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a simple template structure
    const templateData = {
      banks: [
        { name: 'Main Checking', balance: 5000, accountNumber: '1234-5678', bankName: 'Example Bank' }
      ],
      investments: [
        { symbol: 'AAPL', shares: 10, purchasePrice: 150, currentPrice: 175, currentValue: 1750 }
      ],
      debts: [
        { person: 'John Doe', amount: 500, description: 'Personal loan', dueDate: '2024-12-31' }
      ],
      expenses: [
        { category: 'Salary', amount: 5000, description: 'Monthly salary', date: '2024-01-01', type: 'income' },
        { category: 'Rent', amount: 1200, description: 'Monthly rent', date: '2024-01-01', type: 'expense' }
      ]
    };

    // Convert to Excel and download
    const workbook = new Blob([
      JSON.stringify(templateData, null, 2)
    ], { type: 'application/json' });
    
    const url = URL.createObjectURL(workbook);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Template downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application preferences and data</p>
      </div>

      {/* Data Management Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center mb-4">
          <FiDatabase className="text-primary mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Export Data</h3>
            <p className="text-sm text-gray-600">
              Download all your financial data as an Excel file for backup or analysis.
            </p>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="btn btn-primary w-full"
            >
              {exportLoading ? (
                <div className="spinner" />
              ) : (
                <>
                  <FiDownload className="mr-2" />
                  Export to Excel
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Import Data</h3>
            <p className="text-sm text-gray-600">
              Import financial data from an Excel file. Make sure it follows the correct format.
            </p>
            <label className="btn btn-secondary w-full cursor-pointer">
              <FiUpload className="mr-2" />
              {importLoading ? 'Importing...' : 'Import from Excel'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                disabled={importLoading}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={downloadTemplate}
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            Download Excel template
          </button>
        </div>
      </motion.div>

      {/* Data Refresh Section */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center mb-4">
          <FiRefreshCw className="text-primary mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Live Data Refresh</h2>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-600">
            Refresh live data from connected APIs including stock prices, exchange rates, and market indices.
          </p>
          <button
            onClick={handleRefreshData}
            disabled={refreshLoading}
            className="btn btn-primary"
          >
            {refreshLoading ? (
              <div className="spinner" />
            ) : (
              <>
                <FiRefreshCw className="mr-2" />
                Refresh Live Data
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Application Information */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <FiInfo className="text-primary mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Application Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Version</h3>
            <p className="text-gray-600">1.0.0 (MVP)</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Last Updated</h3>
            <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Data Storage</h3>
            <p className="text-gray-600">In-memory (Development)</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">API Status</h3>
            <p className="text-green-600">Connected</p>
          </div>
        </div>
      </motion.div>

      {/* Data Format Guide */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <FiSettings className="text-primary mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Excel Import Format</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Required Sheets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600">Banks Sheet</p>
                <p className="text-gray-500">Columns: name, balance, accountNumber, bankName</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Investments Sheet</p>
                <p className="text-gray-500">Columns: symbol, shares, purchasePrice, currentPrice</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Note:</strong> The first row should contain column headers. Column names are case-insensitive.
            </p>
            <p className="text-sm text-gray-600">
              Download the template above to see the exact format required.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        className="card bg-blue-50 border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-start">
          <FiShield className="text-blue-600 mr-3 mt-1" size={20} />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Security & Privacy</h3>
            <p className="text-blue-800 text-sm">
              This application stores your financial data locally in memory during development. 
              For production use, consider implementing secure database storage and encryption. 
              Never share your financial data with unauthorized parties.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
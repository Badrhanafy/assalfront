// src/utils/ConnectionTroubleshooter.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTroubleshooter = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [diagnostics, setDiagnostics] = useState([]);
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_BACKEND_ENDPOINT || 'http://localhost:8000');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const checks = [];
    
    try {
      // Check 1: Basic connectivity
      checks.push({ step: 'Checking backend URL', status: 'testing' });
      setDiagnostics([...checks]);
      
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      // Check 2: Test basic HTTP connection
      checks.push({ step: 'Testing connection to backend', status: 'testing' });
      setDiagnostics([...checks]);
      
      const testResponse = await axios.get(`${backendUrl}/api/test-connection`, {
        timeout: 5000,
      }).catch(error => {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Cannot connect to backend at ${backendUrl}. Make sure your Laravel server is running.`);
        }
        throw error;
      });

      checks[checks.length - 1].status = 'success';
      setDiagnostics([...checks]);

      // Check 3: Test API endpoint
      checks.push({ step: 'Testing API endpoint', status: 'testing' });
      setDiagnostics([...checks]);

      const apiResponse = await axios.get(`${backendUrl}/api/admin/stats`, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      checks[checks.length - 1].status = 'success';
      setConnectionStatus('connected');

    } catch (error) {
      const lastCheck = checks[checks.length - 1];
      if (lastCheck) {
        lastCheck.status = 'error';
        lastCheck.error = error.message;
      }
      setConnectionStatus('error');
    } finally {
      setDiagnostics([...checks]);
    }
  };

  const retryConnection = () => {
    setConnectionStatus('checking');
    setDiagnostics([]);
    checkConnection();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Connection Diagnostics</h2>
      
      {connectionStatus === 'checking' && (
        <div className="flex items-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mr-3"></div>
          <span>Checking connection to backend...</span>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {diagnostics.map((check, index) => (
          <div key={index} className="flex items-center">
            {check.status === 'testing' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-3"></div>
            )}
            {check.status === 'success' && (
              <svg className="w-4 h-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {check.status === 'error' && (
              <svg className="w-4 h-4 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm">{check.step}</span>
            {check.error && (
              <span className="text-sm text-red-600 ml-2">- {check.error}</span>
            )}
          </div>
        ))}
      </div>

      {connectionStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Connection Failed</h3>
          <p className="text-red-700 text-sm mb-4">
            Unable to connect to the backend server. This could be due to:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside space-y-1 mb-4">
            <li>Laravel backend server is not running</li>
            <li>Incorrect backend URL configuration</li>
            <li>Network connectivity issues</li>
            <li>CORS configuration problems</li>
          </ul>
          
          <div className="bg-gray-100 p-3 rounded mb-4">
            <p className="text-sm font-mono text-gray-700">
              Backend URL: {backendUrl || 'Not configured'}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={retryConnection}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Successfully connected to backend!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTroubleshooter;
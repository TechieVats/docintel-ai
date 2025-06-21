import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DocumentUpload from './components/DocumentUpload';
import AnalysisResults from './components/AnalysisResults';
import Dashboard from './components/Dashboard';

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadToastId, setUploadToastId] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'dashboard', 'history'

  const handleUploadComplete = (results, toastId) => {
    console.log('Analysis results:', results);
    setAnalysisResults(results);
    setUploadToastId(toastId);
  };

  const handleError = (error) => {
    console.error('Error:', error);
    setAnalysisResults(null);
  };

  useEffect(() => {
    if (analysisResults && uploadToastId) {
      toast.dismiss(uploadToastId);
      setUploadToastId(null);
    }
  }, [analysisResults, uploadToastId]);

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-200 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DocIntel AI
        </h1>
        <p className="text-xs text-gray-500">Document Intelligence Platform</p>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setCurrentView('upload')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'upload'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📄 Upload
      </button>
      <button
        onClick={() => setCurrentView('dashboard')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'dashboard'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📊 Dashboard
      </button>
      <button
        onClick={() => setCurrentView('history')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          currentView === 'history'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        📋 History
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Logo />
            <Navigation />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Document Intelligence Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your documents to get instant compliance analysis, risk assessment, and intelligent insights powered by AI.
              </p>
            </div>
            
            <DocumentUpload
              onUploadComplete={handleUploadComplete}
              onError={handleError}
              setLoading={setLoading}
            />

            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Processing document with AI...</p>
                </div>
              </div>
            )}

            {analysisResults && !loading && (
              <AnalysisResults results={analysisResults} />
            )}
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard />
        )}

        {currentView === 'history' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Document History</h3>
            <p className="text-gray-600">Coming soon! View your previously analyzed documents.</p>
          </div>
        )}
      </main>

      <ToastContainer 
        position="bottom-right"
        toastClassName="bg-white border border-gray-200 shadow-lg rounded-lg"
        progressClassName="bg-gradient-to-r from-blue-500 to-purple-500"
      />
    </div>
  );
}

export default App; 
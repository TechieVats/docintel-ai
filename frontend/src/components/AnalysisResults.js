import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const StatCard = ({ title, value, color, tooltip, icon: Icon, trend }) => {
  // Debug logging
  console.log(`StatCard "${title}" value:`, value, 'type:', typeof value);
  
  // Ensure value is converted to string
  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value || '0');
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <InformationCircleIcon className="h-5 w-5 text-gray-400" title={tooltip} />
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="flex items-baseline space-x-2">
        <p className={`text-3xl font-bold ${color.replace('bg-', 'text-')}`}>{displayValue}</p>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

const AnalysisResults = ({ results }) => {
  // Comprehensive debugging
  console.log('=== AnalysisResults Debug ===');
  console.log('Full results object:', results);
  console.log('Results type:', typeof results);
  console.log('Results keys:', results ? Object.keys(results) : 'No results');
  
  if (results) {
    console.log('compliance_report:', results.compliance_report);
    console.log('entities:', results.entities);
    console.log('summary:', results.summary);
    console.log('clause_traceability:', results.clause_traceability);
    
    // Check if any of these are objects that might be rendered directly
    if (results.compliance_report) {
      console.log('compliance_report type:', typeof results.compliance_report);
      console.log('compliance_report keys:', Object.keys(results.compliance_report));
    }
    if (results.entities) {
      console.log('entities type:', typeof results.entities);
      console.log('entities length:', results.entities.length);
      console.log('First entity:', results.entities[0]);
    }
    if (results.clause_traceability) {
      console.log('clause_traceability type:', typeof results.clause_traceability);
      console.log('clause_traceability keys:', Object.keys(results.clause_traceability));
    }
  }
  console.log('=== End Debug ===');

  const [activeTab, setActiveTab] = useState(0);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AnalysisResults mounted with results:', results);
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [results]);

  if (!results) {
    console.log('No results available');
    return (
      <div className="mt-8 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No analysis results available. Please upload a document to begin.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  const { compliance_report, entities, summary, clause_traceability } = results;

  // Debug logs
  console.log('Compliance Report:', compliance_report);
  console.log('Entities:', entities);
  console.log('Summary:', summary);
  console.log('Clause Traceability:', clause_traceability);
  console.log('Clause Traceability type:', typeof clause_traceability);
  console.log('Clause Traceability is array:', Array.isArray(clause_traceability));
  console.log('Clause Traceability keys:', clause_traceability ? Object.keys(clause_traceability) : 'null');

  // Test render to see if the issue is with the data structure
  if (clause_traceability) {
    console.log('Testing clause_traceability structure:');
    Object.entries(clause_traceability).forEach(([key, value], index) => {
      console.log(`Clause ${index} key:`, key);
      console.log(`Clause ${index} value:`, value);
      console.log(`Clause ${index} value type:`, typeof value);
      if (typeof value === 'object' && value !== null) {
        console.log(`Clause ${index} value keys:`, Object.keys(value));
        Object.entries(value).forEach(([propKey, propValue]) => {
          console.log(`  ${propKey}:`, propValue, 'type:', typeof propValue);
        });
      }
    });
  }

  // Simple test render to see the raw data
  const testRender = clause_traceability ? (
    <div className="mt-4 p-4 bg-gray-100 rounded">
      <h4 className="font-bold mb-2">Debug: Raw clause_traceability data</h4>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(clause_traceability, null, 2)}
      </pre>
    </div>
  ) : null;

  // Prepare data for charts
  const entityTypeData = {
    labels: [...new Set(entities?.map(e => typeof e?.label === 'string' ? e.label : String(e?.label || 'Unknown')) || [])],
    datasets: [{
      label: 'Entity Count',
      data: [...new Set(entities?.map(e => typeof e?.label === 'string' ? e.label : String(e?.label || 'Unknown')) || [])].map(label => 
        entities?.filter(e => (typeof e?.label === 'string' ? e.label : String(e?.label || 'Unknown')) === label).length || 0
      ),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const complianceData = {
    labels: ['Compliant', 'Non-Compliant', 'Pending Review'],
    datasets: [{
      data: [
        compliance_report?.compliant_requirements?.length || 0,
        compliance_report?.missing_requirements?.length || 0,
        compliance_report?.pending_requirements?.length || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
      ],
      borderWidth: 2,
    }]
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-green-600 bg-green-100'
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
  };

  const filterBySeverity = (items) => {
    if (severityFilter === 'All') return items;
    return items?.filter(item => {
      // Safely convert severity to string for comparison
      const itemSeverity = typeof item?.severity === 'string' ? item.severity : String(item?.severity || 'low');
      return itemSeverity === severityFilter.toLowerCase();
    }) || [];
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Document Analysis Report', 20, 20);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 40);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(summary || 'No summary available', 170);
    doc.text(summaryLines, 20, 50);
    
    // Compliance Report
    doc.setFontSize(14);
    doc.text('Compliance Report', 20, 80);
    doc.setFontSize(10);
    
    const compliantData = compliance_report?.compliant_requirements?.map(req => {
      const title = typeof req === 'object' && req.title ? String(req.title) : String(req || 'Unknown');
      return [title, 'Compliant'];
    }) || [];
    const missingData = compliance_report?.missing_requirements?.map(req => {
      const title = typeof req === 'object' && req.title ? String(req.title) : String(req || 'Unknown');
      return [title, 'Missing'];
    }) || [];
    
    autoTable(doc, {
      head: [['Requirement', 'Status']],
      body: [...compliantData, ...missingData],
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save('document-analysis-report.pdf');
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">Comprehensive document analysis and compliance assessment</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export PDF
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requirements"
          value={compliance_report?.total_clauses || 0}
          color="text-blue-600"
          tooltip="Total number of compliance requirements checked"
          icon={DocumentTextIcon}
        />
        <StatCard
          title="Compliant"
          value={compliance_report?.compliant_requirements?.length || 0}
          color="text-green-600"
          tooltip="Requirements that meet compliance standards"
          icon={CheckCircleIcon}
        />
        <StatCard
          title="Missing"
          value={compliance_report?.missing_requirements?.length || 0}
          color="text-red-600"
          tooltip="Requirements that need attention"
          icon={XCircleIcon}
        />
        <StatCard
          title="Risk Level"
          value={compliance_report?.risk_level || 'Unknown'}
          color="text-yellow-600"
          tooltip="Overall risk assessment of the document"
          icon={ExclamationTriangleIcon}
        />
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
            Executive Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Debug: Raw data test */}
      {testRender}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 p-4 border-b border-gray-200">
            <Tab
              className={({ selected }) =>
                classNames(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  selected
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <ChartBarIcon className="h-4 w-4" />
              Compliance Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  selected
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <UserGroupIcon className="h-4 w-4" />
              Entities
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  selected
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <DocumentMagnifyingGlassIcon className="h-4 w-4" />
              Clause Traceability
            </Tab>
          </Tab.List>
          <Tab.Panels className="p-6">
            <Tab.Panel>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Distribution</h4>
                    <div className="h-64">
                      <Doughnut 
                        data={complianceData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Compliance Details</h4>
                    <div className="space-y-3">
                      {compliance_report?.compliant_requirements?.map((req, idx) => {
                        const title = typeof req === 'object' && req.title ? String(req.title) : String(req || 'Unknown');
                        return (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-800">{title}</span>
                          </div>
                        );
                      })}
                      {compliance_report?.missing_requirements?.map((req, idx) => {
                        const title = typeof req === 'object' && req.title ? String(req.title) : String(req || 'Unknown');
                        return (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <span className="text-sm text-red-800">{title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Entity Analysis</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Filter by severity:</label>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1"
                    >
                      <option value="All">All</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                
                {entities && entities.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-md font-medium text-gray-900 mb-4">Entity Distribution</h5>
                      <div className="h-64">
                        <Bar 
                          data={entityTypeData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-md font-medium text-gray-900">Detected Entities</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filterBySeverity(entities).map((entity, idx) => {
                          // Debug logging for entities
                          console.log(`Entity ${idx}:`, entity);
                          console.log(`Entity text:`, entity?.text, 'type:', typeof entity?.text);
                          console.log(`Entity label:`, entity?.label, 'type:', typeof entity?.label);
                          console.log(`Entity severity:`, entity?.severity, 'type:', typeof entity?.severity);
                          
                          // Safely convert entity properties to strings
                          const safeText = typeof entity?.text === 'string' ? entity.text : String(entity?.text || 'Unknown');
                          const safeLabel = typeof entity?.label === 'string' ? entity.label : String(entity?.label || 'Unknown');
                          const safeSeverity = typeof entity?.severity === 'string' ? entity.severity : String(entity?.severity || 'low');
                          
                          return (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{safeText}</span>
                                <span className="text-xs text-gray-500 ml-2">({safeLabel})</span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(safeSeverity)}`}>
                                {safeSeverity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No entities detected in this document.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>
            
            <Tab.Panel>
              {/* Temporary test to isolate the issue */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Clause Traceability Test</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-bold mb-2">Raw Data:</h4>
                  <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
                    {JSON.stringify(clause_traceability, null, 2)}
                  </pre>
                  
                  <h4 className="font-bold mb-2 mt-4">Processed Data:</h4>
                  {clause_traceability && Object.entries(clause_traceability).map(([key, value], index) => {
                    try {
                      // Debug logging
                      console.log(`Processing clause ${index}:`, key, value);
                      console.log(`Value type:`, typeof value);
                      console.log(`Value keys:`, value && typeof value === 'object' ? Object.keys(value) : 'Not an object');
                      
                      // Ensure value is an object
                      if (!value || typeof value !== 'object') {
                        console.warn(`Value for key ${key} is not an object:`, value);
                        return (
                          <div key={key} className="mb-4 p-4 border border-red-200 rounded bg-red-50">
                            <h5 className="font-semibold text-red-800">Clause {index + 1}: {String(key)}</h5>
                            <p className="text-sm text-red-600">Invalid data: {String(value)}</p>
                          </div>
                        );
                      }
                      
                      // Check if any property is an object that might be rendered directly
                      Object.entries(value).forEach(([propKey, propValue]) => {
                        if (typeof propValue === 'object' && propValue !== null) {
                          console.warn(`WARNING: Property ${propKey} is an object:`, propValue);
                          console.warn(`This might be causing the rendering error!`);
                        }
                      });
                      
                      // Safely convert all values to strings - NEVER render objects directly
                      const safeId = typeof value.id === 'string' ? value.id : String(value.id || 'N/A');
                      const safeTitle = typeof value.title === 'string' ? value.title : String(value.title || 'N/A');
                      const safeStatus = typeof value.status === 'string' ? value.status : String(value.status || 'N/A');
                      const safeSeverity = typeof value.severity === 'string' ? value.severity : String(value.severity || 'N/A');
                      const safeRecommendation = typeof value.recommendation === 'string' ? value.recommendation : String(value.recommendation || 'N/A');
                      const safeRequired = typeof value.required === 'boolean' ? String(value.required) : String(value.required || 'false');
                      
                      // Handle matched_paragraphs safely
                      let matchedParagraphsText = '0';
                      if (value.matched_paragraphs) {
                        if (Array.isArray(value.matched_paragraphs)) {
                          matchedParagraphsText = String(value.matched_paragraphs.length);
                        } else {
                          matchedParagraphsText = 'Not an array';
                        }
                      }
                      
                      return (
                        <div key={key} className="mb-4 p-4 border border-gray-200 rounded">
                          <h5 className="font-semibold">Clause {index + 1}: {String(key)}</h5>
                          <div className="text-sm">
                            <p><strong>ID:</strong> {safeId}</p>
                            <p><strong>Title:</strong> {safeTitle}</p>
                            <p><strong>Status:</strong> {safeStatus}</p>
                            <p><strong>Severity:</strong> {safeSeverity}</p>
                            <p><strong>Recommendation:</strong> {safeRecommendation}</p>
                            <p><strong>Required:</strong> {safeRequired}</p>
                            <p><strong>Matched Paragraphs:</strong> {matchedParagraphsText}</p>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error(`Error processing clause ${index}:`, error);
                      return (
                        <div key={key} className="mb-4 p-4 border border-red-200 rounded bg-red-50">
                          <h5 className="font-semibold text-red-800">Error processing clause {index + 1}</h5>
                          <p className="text-sm text-red-600">Error: {error.message}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AnalysisResults; 
import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    compliantDocuments: 0,
    highRiskDocuments: 0,
    pendingReviews: 0,
    averageComplianceScore: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Simulate loading dashboard data
    const mockStats = {
      totalDocuments: 24,
      compliantDocuments: 18,
      highRiskDocuments: 3,
      pendingReviews: 3,
      averageComplianceScore: 85,
      recentActivity: [
        { id: 1, document: 'Safety Protocol v2.1.pdf', status: 'compliant', date: '2024-06-21', score: 92 },
        { id: 2, document: 'Emergency Procedures.docx', status: 'high-risk', date: '2024-06-20', score: 45 },
        { id: 3, document: 'Training Manual.pdf', status: 'pending', date: '2024-06-19', score: 78 },
        { id: 4, document: 'Compliance Report Q2.pdf', status: 'compliant', date: '2024-06-18', score: 88 }
      ]
    };
    setStats(mockStats);
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ComplianceChart = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Compliance Overview</h3>
        <ChartBarIcon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Compliant</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(stats.compliantDocuments / stats.totalDocuments) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.compliantDocuments}/{stats.totalDocuments}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">High Risk</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(stats.highRiskDocuments / stats.totalDocuments) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.highRiskDocuments}/{stats.totalDocuments}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pending Review</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(stats.pendingReviews / stats.totalDocuments) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.pendingReviews}/{stats.totalDocuments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentActivity = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {stats.recentActivity.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'compliant' ? 'bg-green-500' :
                activity.status === 'high-risk' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.document}</p>
                <p className="text-xs text-gray-500">{activity.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${
                activity.score >= 80 ? 'text-green-600' :
                activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {activity.score}%
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                activity.status === 'compliant' ? 'bg-green-100 text-green-800' :
                activity.status === 'high-risk' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {activity.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-lg text-gray-600">Monitor your document compliance and risk assessment overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={DocumentTextIcon}
          color="bg-blue-500"
          subtitle="Analyzed documents"
        />
        <StatCard
          title="Compliant"
          value={stats.compliantDocuments}
          icon={CheckCircleIcon}
          color="bg-green-500"
          subtitle="Meeting standards"
        />
        <StatCard
          title="High Risk"
          value={stats.highRiskDocuments}
          icon={ExclamationTriangleIcon}
          color="bg-red-500"
          subtitle="Requires attention"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReviews}
          icon={ClockIcon}
          color="bg-yellow-500"
          subtitle="Under analysis"
        />
      </div>

      {/* Compliance Score */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Average Compliance Score</h3>
            <p className="text-3xl font-bold">{stats.averageComplianceScore}%</p>
            <p className="text-blue-100 text-sm mt-1">Based on all analyzed documents</p>
          </div>
          <ShieldCheckIcon className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplianceChart />
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Upload New Document</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Generate Report</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Compliance Check</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
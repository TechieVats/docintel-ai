import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import apiService from '../services/api';

const DocumentUpload = ({ onUploadComplete, onError, setLoading }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        
        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid file (PDF, DOC, DOCX, or TXT)');
            return;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        setLoading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const result = await apiService.uploadDocument(file);
            clearInterval(progressInterval);
            setUploadProgress(100);
            
            console.log('Upload result:', result);
            
            if (result && result.results) {
                const toastId = toast.success('Document uploaded and analyzed successfully!', { autoClose: false });
                onUploadComplete(result.results, toastId);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload document. Please try again.');
            onError(error);
        } finally {
            setTimeout(() => {
                setUploading(false);
                setLoading(false);
                setUploadProgress(0);
            }, 1000);
        }
    };

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        multiple: false,
        disabled: uploading
    });

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-105
                            ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50 shadow-lg' : 
                              isDragReject ? 'border-red-500 bg-red-50' :
                              'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input {...getInputProps()} />
                        
                        {uploading ? (
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                    {uploadProgress > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-900">Processing document...</p>
                                    <p className="text-sm text-gray-600 mt-1">AI is analyzing your document</p>
                                </div>
                                {uploadProgress > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-6xl mb-4 transform hover:scale-110 transition-transform duration-200">
                                    {isDragActive ? '📤' : '📄'}
                                </div>
                                <div>
                                    <p className="text-xl font-semibold text-gray-900 mb-2">
                                        {isDragActive
                                            ? isDragReject ? "Invalid file type" : "Drop your document here"
                                            : "Upload your document"}
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        {isDragActive
                                            ? isDragReject ? "Please select a valid file type" : "Release to upload"
                                            : "Drag and drop a document here, or click to browse"}
                                    </p>
                                </div>
                                
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Supported formats:</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border">PDF</span>
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border">DOC</span>
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border">DOCX</span>
                                        <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border">TXT</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Upload Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Ensure documents are clear and readable</li>
                            <li>• Maximum file size: 10MB</li>
                            <li>• Supported languages: English</li>
                            <li>• Processing time: 30-60 seconds</li>
                        </ul>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get:</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Compliance Analysis</h4>
                                    <p className="text-xs text-gray-600">Automated checking against industry standards</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Risk Assessment</h4>
                                    <p className="text-xs text-gray-600">Identify potential compliance gaps and risks</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Smart Summaries</h4>
                                    <p className="text-xs text-gray-600">AI-generated insights and recommendations</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <DocumentArrowUpIcon className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Export Reports</h4>
                                    <p className="text-xs text-gray-600">Download detailed analysis reports</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">🔒 Security & Privacy</h4>
                        <p className="text-xs text-gray-600">
                            Your documents are processed securely using enterprise-grade encryption. 
                            Files are automatically deleted after analysis for your privacy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload; 
import { getApiUrl } from '../config/api';

class ApiService {
  async uploadDocument(file) {
    try {
      console.log('Starting document upload...');
      console.log('File:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      const url = getApiUrl('/documents/upload');
      console.log('Upload URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // Return the data in the expected format
      return {
        results: {
          summary: data.summary,
          entities: data.entities,
          compliance_report: data.compliance_report,
          clause_traceability: data.clause_traceability
        }
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getCompanyConfig() {
    try {
      const response = await fetch(getApiUrl('/config/company'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Company Config:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching company config:', error);
      throw error;
    }
  }

  async getComplianceRules() {
    try {
      const response = await fetch(getApiUrl('/config/rules'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Compliance Rules:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching compliance rules:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService; 
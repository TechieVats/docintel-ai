const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  ENDPOINTS: {
    DOCUMENTS: {
      UPLOAD: '/documents/upload',
    },
    CONFIG: {
      COMPANY: '/config/company',
      COMPLIANCE_RULES: '/config/rules',
    },
  },
};

export const API_BASE_URL = API_CONFIG.BASE_URL;

export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG; 
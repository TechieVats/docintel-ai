from pydantic_settings import BaseSettings
from typing import Dict, List, Optional
from functools import lru_cache
import os
from pathlib import Path
import json

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Document Intelligence"
    
    # File Upload Settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "doc", "docx", "txt"]
    
    # Compliance Rules Settings
    COMPLIANCE_RULES_FILE: str = "app/config/compliance_rules.json"
    COMPANY_CONFIG_FILE: str = "app/config/company_config.json"
    
    # Analysis Settings
    RISK_THRESHOLDS: Dict[str, int] = {
        "high": 10,
        "medium": 5,
        "low": 0
    }
    
    # Date Settings
    DRILL_COMPLIANCE_DAYS: int = 180  # 6 months
    
    # Azure Cognitive Services
    AZURE_VISION_KEY: Optional[str] = None
    AZURE_VISION_ENDPOINT: Optional[str] = None
    AZURE_FORM_RECOGNIZER_KEY: Optional[str] = None
    AZURE_FORM_RECOGNIZER_ENDPOINT: Optional[str] = None
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # Database
    DATABASE_URL: str = "sqlite:///./docintel.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Create upload directory if it doesn't exist
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Create a settings instance
settings = get_settings()

def load_compliance_rules() -> Dict:
    """Load compliance rules from configuration file"""
    try:
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'compliance_rules.json')
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading compliance rules: {e}")
        return {}

def load_company_config() -> Dict:
    """Load company-specific configuration"""
    try:
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'company_config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                return json.load(f)
        # Return default config if file doesn't exist
        return {
            "company_name": "Default Company",
            "compliance_rules": {
                "ppe_requirements": ["hard hat", "safety boots", "gloves"],
                "emergency_procedures": ["evacuation", "first aid", "fire safety"],
                "training_requirements": ["safety training", "certification"]
            }
        }
    except Exception as e:
        print(f"Error loading company config: {e}")
        # Return default config on error
        return {
            "company_name": "Default Company",
            "compliance_rules": {
                "ppe_requirements": ["hard hat", "safety boots", "gloves"],
                "emergency_procedures": ["evacuation", "first aid", "fire safety"],
                "training_requirements": ["safety training", "certification"]
            }
        } 
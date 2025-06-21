from fastapi import APIRouter, HTTPException
from app.core.config import load_company_config, load_compliance_rules
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/company")
async def get_company_config():
    """Get company-specific configuration"""
    try:
        config = load_company_config()
        return config
    except Exception as e:
        logger.error(f"Error loading company config: {str(e)}")
        # Return default config on error
        return {
            "company_name": "Default Company",
            "compliance_rules": {
                "ppe_requirements": ["hard hat", "safety boots", "gloves"],
                "emergency_procedures": ["evacuation", "first aid", "fire safety"],
                "training_requirements": ["safety training", "certification"]
            }
        }

@router.get("/compliance-rules")
async def get_compliance_rules():
    """Get compliance rules configuration"""
    try:
        rules = load_compliance_rules()
        return rules
    except Exception as e:
        logger.error(f"Error loading compliance rules: {str(e)}")
        # Return default rules on error
        return {
            "general": [
                {
                    "id": "safety_training",
                    "text": "Safety training requirements",
                    "severity": "high",
                    "recommendation": "Ensure all employees complete mandatory safety training"
                }
            ],
            "ppe": [
                {
                    "id": "ppe_requirements",
                    "text": "Personal protective equipment requirements",
                    "severity": "high",
                    "recommendation": "Provide and maintain appropriate PPE for all workers"
                }
            ]
        } 
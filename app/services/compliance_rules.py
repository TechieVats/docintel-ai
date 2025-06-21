from typing import Dict, List, Any
import json
import os
from pathlib import Path

class ComplianceRules:
    def __init__(self):
        self.rules = self._load_rules()
        self.company_config = self._load_company_config()

    def _load_rules(self) -> Dict:
        """Load compliance rules from configuration"""
        try:
            config_path = Path(__file__).parent.parent.parent / 'config' / 'compliance_rules.json'
            with open(config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading compliance rules: {str(e)}")
            return {}

    def _load_company_config(self) -> Dict:
        """Load company configuration"""
        try:
            config_path = Path(__file__).parent.parent.parent / 'config' / 'company_config.json'
            with open(config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading company config: {str(e)}")
            return {}

    def analyze_document(self, text: str) -> Dict[str, Any]:
        """Analyze document for compliance"""
        try:
            # Initialize results
            results = {
                "compliance_report": {
                    "risk_level": "Low",
                    "missing_clauses_count": 0,
                    "ppe_update_status": "Up to date",
                    "emergency_drill_status": "Compliant",
                    "missing_clauses": []
                }
            }

            # Check for required clauses
            missing_clauses = []
            for clause in self.rules.get("required_clauses", []):
                if clause["text"].lower() not in text.lower():
                    missing_clauses.append({
                        "id": clause["id"],
                        "text": clause["text"],
                        "status": "Missing"
                    })

            # Update results
            results["compliance_report"]["missing_clauses"] = missing_clauses
            results["compliance_report"]["missing_clauses_count"] = len(missing_clauses)

            # Determine risk level based on missing clauses
            if len(missing_clauses) > 5:
                results["compliance_report"]["risk_level"] = "High"
            elif len(missing_clauses) > 2:
                results["compliance_report"]["risk_level"] = "Medium"

            # Check PPE update status
            ppe_keywords = self.rules.get("ppe_keywords", [])
            ppe_found = any(keyword.lower() in text.lower() for keyword in ppe_keywords)
            results["compliance_report"]["ppe_update_status"] = "Up to date" if ppe_found else "Needs update"

            # Check emergency drill status
            drill_keywords = self.rules.get("drill_keywords", [])
            drill_found = any(keyword.lower() in text.lower() for keyword in drill_keywords)
            results["compliance_report"]["emergency_drill_status"] = "Compliant" if drill_found else "Non-compliant"

            return results

        except Exception as e:
            print(f"Error analyzing document: {str(e)}")
            return {
                "compliance_report": {
                    "error": str(e),
                    "risk_level": "Unknown",
                    "missing_clauses_count": 0,
                    "ppe_update_status": "Unknown",
                    "emergency_drill_status": "Unknown",
                    "missing_clauses": []
                }
            } 
from typing import Dict, List, Union, Optional, Any
import docx
from docx.document import Document
from docx.text.paragraph import Paragraph
import re
from rapidfuzz import fuzz
import logging
import json
import os

logger = logging.getLogger(__name__)

class ClauseTracer:
    def __init__(self):
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'compliance_rules.json')
        self.clauses = {}
        self.config_loaded = False
        try:
            with open(config_path, 'r') as f:
                rules = json.load(f)
                for section in ["general", "ppe", "emergency", "training", "incident"]:
                    for clause in rules.get(section, []):
                        name = clause.get("clause") or clause.get("text") or clause.get("id")
                        self.clauses[name] = {
                            "keywords": [clause.get("pattern") or clause.get("text") or name],
                            "severity": clause.get("severity", "medium"),
                            "required": True,
                            "recommendation": clause.get("recommendation", "")
                        }
            self.config_loaded = True
        except FileNotFoundError:
            logger.error(f"Clause config file not found at {config_path}. Using hardcoded defaults. Please add config/compliance_rules.json for full functionality.")
            self.clauses = {
                "Emergency Drill": {
                    "keywords": ["emergency drill", "evacuation drill", "safety drill", "emergency response"],
                    "severity": "high",
                    "required": True
                },
                "PPE Requirements": {
                    "keywords": ["ppe", "personal protective equipment", "safety gear", "protective gear"],
                    "severity": "high",
                    "required": True
                },
                "Safety Training": {
                    "keywords": ["safety training", "safety course", "training program", "safety certification"],
                    "severity": "medium",
                    "required": True
                },
                "Incident Reporting": {
                    "keywords": ["incident report", "accident report", "safety incident", "near miss"],
                    "severity": "medium",
                    "required": True
                }
            }
        except json.JSONDecodeError:
            logger.error(f"Clause config file at {config_path} is not valid JSON. Using hardcoded defaults. Please fix the file format.")
            self.clauses = {
                "Emergency Drill": {
                    "keywords": ["emergency drill", "evacuation drill", "safety drill", "emergency response"],
                    "severity": "high",
                    "required": True
                },
                "PPE Requirements": {
                    "keywords": ["ppe", "personal protective equipment", "safety gear", "protective gear"],
                    "severity": "high",
                    "required": True
                },
                "Safety Training": {
                    "keywords": ["safety training", "safety course", "training program", "safety certification"],
                    "severity": "medium",
                    "required": True
                },
                "Incident Reporting": {
                    "keywords": ["incident report", "accident report", "safety incident", "near miss"],
                    "severity": "medium",
                    "required": True
                }
            }
        except Exception as e:
            logger.error(f"Unexpected error loading clause config: {str(e)}. Using hardcoded defaults.")
            self.clauses = {
                "Emergency Drill": {
                    "keywords": ["emergency drill", "evacuation drill", "safety drill", "emergency response"],
                    "severity": "high",
                    "required": True
                },
                "PPE Requirements": {
                    "keywords": ["ppe", "personal protective equipment", "safety gear", "protective gear"],
                    "severity": "high",
                    "required": True
                },
                "Safety Training": {
                    "keywords": ["safety training", "safety course", "training program", "safety certification"],
                    "severity": "medium",
                    "required": True
                },
                "Incident Reporting": {
                    "keywords": ["incident report", "accident report", "safety incident", "near miss"],
                    "severity": "medium",
                    "required": True
                }
            }

    def find_matches(self, text: str, keywords: List[str], threshold: int = 80) -> List[Dict[str, Any]]:
        """Find matches for keywords in text using fuzzy matching"""
        try:
            matches = []
            # Split text into paragraphs
            paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
            
            for keyword in keywords:
                for i, paragraph in enumerate(paragraphs):
                    if fuzz.partial_ratio(keyword.lower(), paragraph.lower()) >= threshold:
                        matches.append({
                            "keyword": keyword,
                            "match": paragraph,
                            "location": f"Paragraph {i+1}"
                        })
            return matches
        except Exception as e:
            logger.error(f"Error finding matches: {str(e)}")
            return []

    def trace_clauses(self, text: str) -> Dict[str, Any]:
        """Trace compliance clauses in the document and return detailed match info"""
        try:
            results = {}
            # Split text into paragraphs for matching
            paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
            for clause_name, clause_info in self.clauses.items():
                # Attempt to extract id, title, severity, recommendation from clause_info
                clause_id = clause_info.get("id") or clause_name
                title = clause_name
                severity = clause_info.get("severity", "medium")
                recommendation = clause_info.get("recommendation", "")
                keywords = clause_info.get("keywords", [])
                matched_paragraphs = []
                for keyword in keywords:
                    for i, paragraph in enumerate(paragraphs):
                        if fuzz.partial_ratio(keyword.lower(), paragraph.lower()) >= 80:
                            matched_paragraphs.append({
                                "paragraph_number": i + 1,
                                "snippet": paragraph,
                                "keyword": keyword
                            })
                status = "Found" if matched_paragraphs else "Missing"
                results[clause_id] = {
                    "id": clause_id,
                    "title": title,
                    "severity": severity,
                    "recommendation": recommendation,
                    "status": status,
                    "matched_paragraphs": matched_paragraphs,
                    "required": clause_info.get("required", True)
                }
            return results
        except Exception as e:
            logger.error(f"Error tracing clauses: {str(e)}")
            return {}

    def get_compliance_summary(self, trace_results: Dict) -> Dict:
        """
        Generate a compliance summary from trace results.
        
        Args:
            trace_results (Dict): Results from trace_clauses
            
        Returns:
            Dict: Compliance summary
        """
        summary = {
            "total_clauses": len(trace_results),
            "missing_clauses": 0,
            "high_risk_missing": 0,
            "medium_risk_missing": 0,
            "low_risk_missing": 0,
            "missing_clauses_list": []
        }
        
        for clause_name, result in trace_results.items():
            if result["status"] == "Missing":
                summary["missing_clauses"] += 1
                summary["missing_clauses_list"].append({
                    "name": clause_name,
                    "severity": result["severity"],
                    "required": result["required"]
                })
                
                if result["severity"] == "high":
                    summary["high_risk_missing"] += 1
                elif result["severity"] == "medium":
                    summary["medium_risk_missing"] += 1
                else:
                    summary["low_risk_missing"] += 1
        
        # Calculate risk level
        if summary["high_risk_missing"] > 0:
            summary["risk_level"] = "High"
        elif summary["medium_risk_missing"] > 0:
            summary["risk_level"] = "Medium"
        else:
            summary["risk_level"] = "Low"
            
        return summary 
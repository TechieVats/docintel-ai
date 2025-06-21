from typing import Dict, List, Optional
import spacy
from transformers import pipeline
from ..core.config import get_settings

settings = get_settings()

class NLPProcessor:
    def __init__(self):
        # Load spaCy model
        self.nlp = spacy.load("en_core_web_lg")
        
        # Initialize transformers pipeline for text classification
        self.classifier = pipeline(
            "text-classification",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        
        # Define compliance categories
        self.compliance_categories = {
            "hse": ["safety", "health", "environment", "hazard", "risk"],
            "quality": ["quality", "standard", "compliance", "certification"],
            "operations": ["procedure", "operation", "maintenance", "inspection"],
            "legal": ["contract", "agreement", "liability", "warranty"]
        }

    async def analyze_compliance(self, text: str) -> Dict:
        """
        Analyze text for compliance-related information.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dict containing compliance analysis results
        """
        try:
            # Process text with spaCy
            doc = self.nlp(text)
            
            # Extract entities
            entities = self._extract_entities(doc)
            
            # Categorize content
            categories = self._categorize_content(text)
            
            # Identify compliance gaps
            gaps = self._identify_compliance_gaps(doc)
            
            return {
                "entities": entities,
                "categories": categories,
                "compliance_gaps": gaps,
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    def _extract_entities(self, doc) -> List[Dict]:
        """Extract relevant entities from the text"""
        entities = []
        for ent in doc.ents:
            if ent.label_ in ["DATE", "ORG", "PERSON", "LAW", "PERCENT"]:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                })
        return entities

    def _categorize_content(self, text: str) -> Dict[str, float]:
        """Categorize content into compliance categories"""
        categories = {}
        for category, keywords in self.compliance_categories.items():
            score = sum(1 for keyword in keywords if keyword.lower() in text.lower())
            categories[category] = score / len(keywords)
        return categories

    def _identify_compliance_gaps(self, doc) -> List[Dict]:
        """Identify potential compliance gaps in the text"""
        gaps = []
        
        # Check for missing critical terms
        critical_terms = {
            "safety": ["emergency", "evacuation", "first aid"],
            "quality": ["inspection", "verification", "testing"],
            "operations": ["procedure", "protocol", "guideline"],
            "legal": ["compliance", "regulation", "standard"]
        }
        
        for category, terms in critical_terms.items():
            missing_terms = [term for term in terms if term.lower() not in doc.text.lower()]
            if missing_terms:
                gaps.append({
                    "category": category,
                    "missing_terms": missing_terms,
                    "severity": "high" if len(missing_terms) > 1 else "medium"
                })
        
        return gaps

    async def generate_summary(self, text: str) -> str:
        """Generate a concise summary of the document"""
        try:
            # Use spaCy for basic summarization
            doc = self.nlp(text)
            
            # Extract key sentences (simple approach)
            sentences = [sent.text for sent in doc.sents]
            key_sentences = []
            
            for sent in sentences:
                # Score sentence based on presence of important terms
                score = sum(1 for term in ["must", "shall", "required", "compliance", "safety"]
                          if term.lower() in sent.lower())
                if score > 0:
                    key_sentences.append(sent)
            
            # Return top 3 sentences or fewer if less available
            return " ".join(key_sentences[:3])
        except Exception as e:
            return f"Error generating summary: {str(e)}" 
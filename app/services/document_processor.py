from typing import Dict, List, Any, Optional
import os
import PyPDF2
import docx
import spacy
from datetime import datetime
from .compliance_rules import ComplianceRules
from app.core.config import settings
import logging
from docx import Document
from rapidfuzz import fuzz
from .clause_traceability import ClauseTracer
import fitz  # PyMuPDF
import torch
from transformers import pipeline
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        # Load spaCy model for entity recognition
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # If model is not downloaded, download it
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        self.compliance_rules = ComplianceRules()
        self.upload_dir = "uploads"
        os.makedirs(self.upload_dir, exist_ok=True)
        self.clause_tracer = ClauseTracer()
        # Initialize summarizer
        self._summarizer = None

    def process_document(self, file) -> Dict:
        """
        Process a document and extract information
        """
        try:
            # Save the file
            file_path = self.save_file(file)
            
            # Extract text
            text = self.extract_text(file_path)
            if not text:
                raise ValueError("No text could be extracted from the document")
            logger.info(f"Extracted text length: {len(text)} characters")
            
            # Process text in parallel
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
                # Submit tasks
                entities_future = executor.submit(self.extract_entities, text)
                summary_future = executor.submit(self.generate_summary, text)
                compliance_future = executor.submit(self.analyze_compliance, text)
                clause_traceability_future = executor.submit(self.clause_tracer.trace_clauses, text)
                
                # Get results with timeouts
                try:
                    entities = entities_future.result(timeout=30)
                    summary = summary_future.result(timeout=30)
                    compliance_report = compliance_future.result(timeout=30)
                    clause_traceability = clause_traceability_future.result(timeout=30)
                except concurrent.futures.TimeoutError:
                    logger.error("Processing timed out")
                    raise HTTPException(status_code=504, detail="Processing timed out")
            
            logger.info(f"Found {len(entities)} entities")
            logger.info(f"Generated summary length: {len(summary)} characters")
            logger.info("Compliance analysis completed")
            logger.info(f"Clause traceability completed with {len(clause_traceability)} clauses")
            
            # Clean up
            try:
                os.remove(file_path)
                logger.info("Temporary file removed")
            except Exception as e:
                logger.warning(f"Error removing temporary file: {str(e)}")
            
            return {
                "summary": summary,
                "entities": entities,
                "compliance_report": compliance_report,
                "clause_traceability": clause_traceability
            }
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            # Clean up file if it exists
            try:
                if 'file_path' in locals():
                    os.remove(file_path)
            except:
                pass
            raise

    def save_file(self, file) -> str:
        """Save uploaded file to disk and return the file path"""
        try:
            file_path = os.path.join(self.upload_dir, file.filename)
            with open(file_path, "wb") as buffer:
                content = file.file.read()
                buffer.write(content)
            logger.info(f"File saved successfully to {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving file: {str(e)}")
            raise

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from a document.
        Supports PDF (via PyMuPDF) and DOCX (via python-docx).
        """
        try:
            if file_path.lower().endswith('.pdf'):
                try:
                    doc = fitz.open(file_path)
                    text = "\n".join(page.get_text() for page in doc)
                    return text
                except Exception as e:
                    logger.error(f"Error extracting text from PDF: {str(e)}")
                    raise
            else:
                doc = Document(file_path)
                return "\n".join([paragraph.text for paragraph in doc.paragraphs])
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            raise

    def extract_entities(self, text: str) -> List[Dict]:
        """
        Extract named entities from text.
        
        Args:
            text (str): Text to process
            
        Returns:
            List[Dict]: List of entities with their types
        """
        try:
            doc = self.nlp(text)
            entities = []
            for ent in doc.ents:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                })
            return entities
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            raise

    def generate_summary(self, text: str) -> str:
        """
        Generate a high-level summary of the text using Hugging Face transformers (BART).
        If the text is too long, chunk and summarize in batches, then combine.
        Returns a 5-7 sentence summary.
        """
        try:
            # Initialize summarizer if not already done
            if self._summarizer is None:
                self._summarizer = pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn",
                    tokenizer="facebook/bart-large-cnn",
                    device=0 if torch.cuda.is_available() else -1
                )
            
            # For very short texts, return first few sentences
            if len(text.split()) < 100:
                sentences = text.split('.')
                return '. '.join(sentences[:3]) + '.'
            
            # For medium texts, use simple extractive summarization
            if len(text.split()) < 1000:
                doc = self.nlp(text)
                sentences = [sent.text for sent in doc.sents]
                # Take first 3-5 sentences that are not too short
                summary_sentences = []
                for sent in sentences:
                    if len(sent.split()) > 5:  # Only include sentences with more than 5 words
                        summary_sentences.append(sent)
                    if len(summary_sentences) >= 5:
                        break
                return ' '.join(summary_sentences)
            
            # For long texts, use BART
            max_input = 1024
            paragraphs = [p for p in text.split('\n') if p.strip()]
            chunks = []
            current_chunk = ""
            
            for para in paragraphs:
                if len((current_chunk + para).split()) > max_input:
                    chunks.append(current_chunk)
                    current_chunk = para
                else:
                    current_chunk += " " + para
            if current_chunk:
                chunks.append(current_chunk)
            
            # Summarize each chunk
            summaries = []
            for chunk in chunks:
                if len(chunk.split()) > 50:  # Only summarize chunks with sufficient content
                    summary = self._summarizer(chunk, max_length=130, min_length=40, do_sample=False)[0]['summary_text']
                    summaries.append(summary)
                else:
                    summaries.append(chunk)
            
            # Combine summaries and ensure it's not too long
            final_summary = " ".join(summaries)
            if len(final_summary.split()) > 200:
                # If still too long, summarize again
                final_summary = self._summarizer(final_summary, max_length=200, min_length=100, do_sample=False)[0]['summary_text']
            
            return final_summary
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            # Fallback to simple extractive summarization
            try:
                doc = self.nlp(text)
                sentences = [sent.text for sent in doc.sents]
                return ' '.join(sentences[:5])
            except:
                return text[:500] + "..."

    def analyze_compliance(self, text: str) -> Dict:
        """Analyze document for compliance using clause traceability"""
        try:
            # Basic compliance rules to check
            compliance_rules = {
                "safety_training": {
                    "id": "safety_training",
                    "title": "Safety Training Requirements",
                    "severity": "high",
                    "keywords": ["safety training", "training program", "safety certification", "training records"],
                    "recommendation": "Ensure all employees complete mandatory safety training"
                },
                "ppe_requirements": {
                    "id": "ppe_requirements",
                    "title": "Personal Protective Equipment",
                    "severity": "high",
                    "keywords": ["PPE", "personal protective equipment", "safety gear", "protective clothing"],
                    "recommendation": "Provide and maintain appropriate PPE for all workers"
                },
                "emergency_procedures": {
                    "id": "emergency_procedures",
                    "title": "Emergency Response Procedures",
                    "severity": "high",
                    "keywords": ["emergency response", "evacuation plan", "emergency procedures", "first aid"],
                    "recommendation": "Maintain up-to-date emergency response procedures"
                },
                "incident_reporting": {
                    "id": "incident_reporting",
                    "title": "Incident Reporting",
                    "severity": "medium",
                    "keywords": ["incident report", "accident report", "near miss", "incident investigation"],
                    "recommendation": "Implement comprehensive incident reporting system"
                },
                "risk_assessment": {
                    "id": "risk_assessment",
                    "title": "Risk Assessment",
                    "severity": "medium",
                    "keywords": ["risk assessment", "hazard identification", "risk analysis", "risk management"],
                    "recommendation": "Conduct regular risk assessments"
                }
            }

            # Analyze text against compliance rules
            missing_requirements = []
            compliant_requirements = []
            matched_paragraphs = []

            # Split text into paragraphs
            paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
            
            for rule_id, rule in compliance_rules.items():
                found = False
                rule_matches = []
                
                for i, para in enumerate(paragraphs):
                    # Check for keyword matches
                    for keyword in rule["keywords"]:
                        if keyword.lower() in para.lower():
                            found = True
                            rule_matches.append({
                                "paragraph_number": i + 1,
                                "keyword": keyword,
                                "snippet": para[:200] + "..." if len(para) > 200 else para
                            })
                            break
                
                requirement = {
                    "id": rule["id"],
                    "title": rule["title"],
                    "severity": rule["severity"],
                    "status": "Found" if found else "Missing",
                    "recommendation": rule["recommendation"],
                    "matched_paragraphs": rule_matches
                }
                
                if found:
                    compliant_requirements.append(requirement)
                else:
                    missing_requirements.append(requirement)

            # Calculate risk level based on missing requirements
            high_risk_missing = len([r for r in missing_requirements if r["severity"] == "high"])
            medium_risk_missing = len([r for r in missing_requirements if r["severity"] == "medium"])
            
            if high_risk_missing > 0:
                risk_level = "High"
            elif medium_risk_missing > 0:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            return {
                "risk_level": risk_level,
                "missing_requirements": missing_requirements,
                "compliant_requirements": compliant_requirements,
                "total_clauses": len(compliance_rules),
                "missing_clauses": len(missing_requirements),
                "high_risk_missing": high_risk_missing,
                "medium_risk_missing": medium_risk_missing,
                "low_risk_missing": len([r for r in missing_requirements if r["severity"] == "low"])
            }
        except Exception as e:
            logger.error(f"Error analyzing compliance: {str(e)}")
            return {
                "risk_level": "Unknown",
                "missing_requirements": [],
                "compliant_requirements": [],
                "total_clauses": 0,
                "missing_clauses": 0,
                "high_risk_missing": 0,
                "medium_risk_missing": 0,
                "low_risk_missing": 0
            } 
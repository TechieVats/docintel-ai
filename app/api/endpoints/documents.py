import os
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import tempfile
from app.services.document_processor import DocumentProcessor
from app.services.clause_traceability import ClauseTracer
from app.config.settings import UPLOAD_DIR
import asyncio

router = APIRouter()
logger = logging.getLogger(__name__)

# Track ongoing uploads to prevent duplicates
ongoing_uploads = set()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload and process a document
    """
    try:
        # Check if file is already being processed
        if file.filename in ongoing_uploads:
            raise HTTPException(status_code=400, detail="File is already being processed")
        
        # Add to ongoing uploads
        ongoing_uploads.add(file.filename)
        
        logger.info(f"Saving file to uploads/{file.filename}")
        
        # Initialize processors
        doc_processor = DocumentProcessor()
        
        # Process the document
        result = doc_processor.process_document(file)
        
        logger.info("Response prepared successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error handling file upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Remove from ongoing uploads
        ongoing_uploads.discard(file.filename)

@router.get("/health")
async def health_check() -> Dict:
    """Check the health of document processing services"""
    return {
        "status": "healthy",
        "ongoing_uploads": len(ongoing_uploads)
    } 
import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Upload directory for documents
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}

# Maximum file size (in bytes) - 10MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# API settings
API_PREFIX = "/api/v1" 
# DocIntel AI

An AI-powered document intelligence and compliance analysis tool for the oil & gas industry.

## Overview

DocIntel AI is designed to automate the analysis of technical documents in the oil & gas sector, including:
- Health, Safety & Environment (HSE) guidelines
- Compliance reports
- Vendor contracts
- SOPs
- Risk assessments
- Inspection logs

## Features

- 🔍 Document Ingestion: Support for scanned and digital documents
- 📄 OCR & Text Extraction: Powered by Azure Cognitive Services
- 🧠 NLP Engine: Entity extraction and document understanding
- ⚖️ Compliance Rules Engine: Pre-loaded rules from ADNOC HSE, ISO 45001, ISO 14001
- ⚠️ Risk/Gap Detection: Automated compliance checking
- 🧾 Summarization: Quick compliance summaries
- 📊 Dashboard: Web interface for document management and risk visualization

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

```
docintel-ai/
├── app/
│   ├── api/            # API endpoints
│   ├── core/           # Core functionality
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── tests/              # Test files
├── .env.example        # Example environment variables
├── requirements.txt    # Project dependencies
└── README.md          # This file
```

## License

MIT License 
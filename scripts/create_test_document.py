import markdown
import pdfkit
import os

def create_pdf_from_markdown():
    # Create output directory if it doesn't exist
    os.makedirs('test_documents', exist_ok=True)
    
    # Read the markdown file
    with open('sample_documents/safety_policy_2023.md', 'r') as f:
        md_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown.markdown(md_content)
    
    # Add some basic styling
    styled_html = f"""
    <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #2c3e50; }}
                h2 {{ color: #34495e; margin-top: 30px; }}
                h3 {{ color: #7f8c8d; }}
                ul, ol {{ margin-left: 20px; }}
                li {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            {html_content}
        </body>
    </html>
    """
    
    # Convert HTML to PDF
    pdf_path = 'test_documents/safety_policy_2023.pdf'
    pdfkit.from_string(styled_html, pdf_path)
    
    print(f"PDF created successfully at: {pdf_path}")

if __name__ == "__main__":
    create_pdf_from_markdown() 
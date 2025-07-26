import asyncio
import tempfile
import os
try:
    from pyppeteer import launch
except ImportError:
    print("pyppeteer not installed, PDF generation will be disabled")
    launch = None

def save_newsletter_pdf(html_content: str, output_path: str) -> bool:
    """
    Generate a PDF from HTML content using pyppeteer and save it to the local server.
    Returns True if PDF generation succeeded, False otherwise.
    """
    print(f"Generating PDF at: {output_path}")
    
    if launch is None:
        print("pyppeteer not available, skipping PDF generation")
        return False
    
    try:
        # Use asyncio to run the async PDF generation
        return asyncio.run(_generate_pdf_async(html_content, output_path))
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return False

async def _generate_pdf_async(html_content: str, output_path: str) -> bool:
    """Async function to generate PDF using pyppeteer"""
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Create a temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_html:
            temp_html.write(html_content)
            temp_html_path = temp_html.name
        
        try:
            # Launch headless browser
            browser = await launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
            page = await browser.newPage()
            
            # Load the HTML file
            await page.goto(f'file://{temp_html_path.replace(os.sep, "/")}', {'waitUntil': 'networkidle0'})
            
            # Generate PDF with options
            await page.pdf({
                'path': output_path,
                'format': 'A4',
                'printBackground': True,
                'margin': {
                    'top': '1cm',
                    'right': '1cm',
                    'bottom': '1cm',
                    'left': '1cm'
                }
            })
            
            # Close browser
            await browser.close()
            
            print(f"PDF generated successfully at {output_path}")
            return True
            
        finally:
            # Clean up temporary HTML file
            try:
                os.unlink(temp_html_path)
            except:
                pass

    except Exception as e:
        print(f"Error in async PDF generation: {str(e)}")
        return False
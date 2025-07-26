#!/usr/bin/env python3
"""
Test script to verify newsletter PDF generation works with pyppeteer
"""
import asyncio
import sys
import os
from datetime import datetime

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    from pyppeteer import launch
    print("✅ pyppeteer import successful")
except ImportError as e:
    print(f"❌ pyppeteer import failed: {e}")
    sys.exit(1)

async def test_pdf_generation():
    """Test basic PDF generation capability"""
    print("🧪 Testing PDF generation...")
    
    try:
        # Simple HTML content for testing
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Newsletter</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; }
                .content { margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Test Newsletter</h1>
                <p>PDF Generation Test - {}</p>
            </div>
            <div class="content">
                <h2>✅ pyppeteer is working!</h2>
                <p>This PDF was generated successfully using pyppeteer.</p>
                <ul>
                    <li>No wkhtmltopdf dependency</li>
                    <li>Uses headless Chrome</li>
                    <li>Better CSS support</li>
                    <li>Modern PDF generation</li>
                </ul>
            </div>
        </body>
        </html>
        """.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        
        # Create output directory
        output_dir = "./output"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"test_newsletter_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        
        # Launch browser and generate PDF
        print("🚀 Launching headless browser...")
        browser = await launch(headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        page = await browser.newPage()
        
        print("📝 Setting HTML content...")
        await page.setContent(html_content, {'waitUntil': 'networkidle0'})
        
        print("📄 Generating PDF...")
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
        
        await browser.close()
        
        # Check if PDF was created
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ PDF generated successfully!")
            print(f"📁 Location: {output_path}")
            print(f"📊 Size: {file_size} bytes")
            return True
        else:
            print("❌ PDF file was not created")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed: {str(e)}")
        return False

async def main():
    """Main test function"""
    print("🔍 Testing Newsletter PDF Generation")
    print("=" * 50)
    
    # Test pyppeteer import
    try:
        from pyppeteer import launch
        print("✅ pyppeteer imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import pyppeteer: {e}")
        print("💡 Run: pip install pyppeteer")
        return
    
    # Test PDF generation
    success = await test_pdf_generation()
    
    print("=" * 50)
    if success:
        print("🎉 All tests passed! Newsletter PDF generation is working.")
        print("💡 The newsletter service should now work without wkhtmltopdf errors.")
    else:
        print("⚠️  PDF generation test failed. Check the error messages above.")

if __name__ == "__main__":
    asyncio.run(main())

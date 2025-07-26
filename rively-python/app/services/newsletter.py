import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.schemas.newsletter import NewsletterResponse
from app.config import settings
from app.repository.email_recipients import EmailRecipientRepository
from app.repository.tracked_companies import TrackedCompanyRepository
from app.repository.tracked_company_updates import TrackedCompanyUpdateRepository
from app.repository.customers import CustomerRepository
from databases import Database
from uuid import UUID
import logging

# >>> PDF UTILS IMPORT <<<
from app.utils.pdf_utils import save_newsletter_pdf

logger = logging.getLogger(__name__)

class NewsletterService:
    def __init__(self, db: Database):
        print("Initializing NewsletterService")
        self.smtp_host = settings.EMAIL_HOST
        self.smtp_port = settings.EMAIL_PORT
        self.email_address = settings.EMAIL_ADDRESS
        self.email_password = settings.EMAIL_PASSWORD
        self.brandfetch_client_id = getattr(settings, 'BRANDFETCH_CLIENT_ID', 'your-client-id-here')
        print(f"SMTP settings - Host: {self.smtp_host}, Port: {self.smtp_port}, Email: {self.email_address}")
        
        self.email_recipient_repo = EmailRecipientRepository(db)
        self.company_repo = TrackedCompanyRepository(db)
        self.update_repo = TrackedCompanyUpdateRepository(db)
        self.customer_repo = CustomerRepository(db)
        print("Repositories initialized")

    def get_company_logo_url(self, domain: str) -> str:
        print(f"Generating company logo URL for domain: {domain}")
        return f"https://cdn.brandfetch.io/{domain}?c={self.brandfetch_client_id}"

    def get_customer_logo_url(self, customer_domain: str) -> str:
        print(f"Generating customer logo URL for domain: {customer_domain}")
        return f"https://cdn.brandfetch.io/{customer_domain}?c={self.brandfetch_client_id}"

    async def test_smtp_connection(self) -> bool:
        print("Testing SMTP connection...")
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                print(f"Connected to SMTP server at {self.smtp_host}:{self.smtp_port}")
                server.starttls()
                print("TLS started")
                server.login(self.email_address, self.email_password)
                print("Login successful")
                logger.info("SMTP connection test successful")
                return True
        except Exception as e:
            print(f"SMTP connection failed: {str(e)}")
            logger.error(f"SMTP connection failed: {str(e)}")
            return False

    async def send_newsletter(self, customer_uid: str) -> NewsletterResponse:
        print(f"Starting newsletter send for customer: {customer_uid}")
        try:
            # Convert string to UUID
            try:
                customer_uuid = UUID(customer_uid)
                print(f"Converted customer_uid to UUID: {customer_uuid}")
            except ValueError as e:
                print(f"Invalid customer_uid format: {customer_uid}, error: {str(e)}")
                return NewsletterResponse(success=False)

            # 1. Fetch all email recipients
            print("Fetching email recipients...")
            email_recipients = await self.email_recipient_repo.get_all_email_recipients(customer_uid=customer_uid)
            print(f"Found {len(email_recipients)} email recipients")
            if not email_recipients:
                print("No email recipients found for this customer")
                return NewsletterResponse(success=False)

            # 2. Fetch tracked companies
            print("Fetching tracked companies...")
            companies = await self.company_repo.get_all_tracked_companies(customer_uuid)
            print(f"Found {len(companies)} tracked companies")
            if not companies:
                print("No tracked companies found for this customer")
                return NewsletterResponse(success=False)

            # 3. Fetch recent updates
            one_week_ago = datetime.now() - timedelta(days=7)
            print(f"Fetching updates since {one_week_ago}...")
            updates = await self.update_repo.get_updates_for_companies(
                [c.tracked_company_uid for c in companies],
                since_date=one_week_ago,
                limit=10
            )
            print(f"Found {len(updates)} recent updates")
            if not updates:
                print("No recent updates found")
                return NewsletterResponse(success=False)

            # 4. Fetch customer details
            print("Fetching customer details...")
            customer_details = await self.customer_repo.get_customer_details(customer_uid)
            print(f"Customer details: {customer_details}")

            # >>> PDF GENERATION <<<
            # Generate PDF once per newsletter send
            html_content_for_pdf = self._prepare_email_content(email_recipients[0], updates, companies, customer_details)
            pdf_path = f"./output/newsletter_{customer_uid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            save_newsletter_pdf(html_content_for_pdf, pdf_path)

            # 5. Send emails
            email_count = 0
            print(f"Preparing to send emails to {len(email_recipients)} email recipients")
            for recipient in email_recipients:
                try:
                    print(f"Preparing email for recipient: {recipient.email}")
                    message = MIMEMultipart("alternative")
                    message["Subject"] = f"{recipient.name}, your competitor insights are here!"
                    message["From"] = self.email_address
                    message["To"] = recipient.email

                    print("Generating email content...")
                    html_content = self._prepare_email_content(recipient, updates, companies, customer_details)
                    html_part = MIMEText(html_content, "html")
                    message.attach(html_part)

                    print("Connecting to SMTP server...")
                    with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                        print("Starting TLS...")
                        server.starttls()
                        print("Logging in...")
                        server.login(self.email_address, self.email_password)
                        print("Sending email...")
                        server.sendmail(
                            self.email_address,
                            recipient.email,
                            message.as_string()
                        )
                    print(f"Email sent successfully to {recipient.email}")
                    email_count += 1
                except Exception as e:
                    print(f"Failed to send email to {recipient.email}: {str(e)}")
                    continue  # Skip failed emails but try others

            print(f"Successfully sent {email_count} emails out of {len(email_recipients)}")
            return NewsletterResponse(success=email_count > 0)
        except Exception as e:
            print(f"Error in send_newsletter: {str(e)}")
            return NewsletterResponse(success=False)

    def _prepare_email_content(self, recipient, updates, companies, customer_details) -> str:
        """Generate HTML content for the newsletter using simplified template with logos"""
        print("Preparing email content...")
        
        # Determine customer company name and domain from customer details
        customer_company_name = customer_details['name'] if customer_details and 'name' in customer_details else "Your Company"
        customer_domain = customer_details['domain'] if customer_details and 'domain' in customer_details else 'rively.com'
        
        # Calculate date range for the week
        today = datetime.now()
        one_week_ago = today - timedelta(days=7)
        date_range = f"{one_week_ago.strftime('%B %d')} - {today.strftime('%B %d, %Y')}"
        
        # Create company domain mapping
        company_domains = {}
        for company in companies:
            # Extract domain from company name or use a default mapping
            company_name = getattr(company, 'name', '').lower().replace(' ', '')
            domain = f"{company_name}.com"  # Simple domain generation
            company_domains[company.tracked_company_uid] = domain
        
        # Categorize updates into insights, risks, and opportunities
        insights = []
        risks = []
        opportunities = []
        
        for i, update in enumerate(updates):
            # Simple distribution based on update_type or index
            update_type = getattr(update, 'update_type', '').lower()
            if 'risk' in update_type or 'threat' in update_type:
                risks.append(update)
            elif 'opportunity' in update_type or 'market' in update_type:
                opportunities.append(update)
            else:
                insights.append(update)
        
        # If categories are empty, distribute evenly
        if not risks and not opportunities:
            for i, update in enumerate(updates):
                if i % 3 == 0:
                    insights.append(update)
                elif i % 3 == 1:
                    risks.append(update)
                else:
                    opportunities.append(update)
        
        # Generate HTML for each section
        def generate_update_cards(updates_list, section_title):
            if not updates_list:
                return f'<div class="empty-section"><p>No {section_title.lower()} available this week.</p></div>'
            
            updates_html = f'<div class="section-header">{section_title}</div>'
            for update in updates_list:
                # Get company domain for logo
                company_domain = company_domains.get(update.tracked_company_uid, 'example.com')
                company_logo_url = self.get_company_logo_url(company_domain)
                
                # Get company name from the tracked companies
                company_name = "Unknown Company"
                for company in companies:
                    if company.tracked_company_uid == update.tracked_company_uid:
                        company_name = getattr(company, 'name', 'Unknown Company')
                        break
                
                action_point_html = ""
                if hasattr(update, 'action_point') and update.action_point:
                    action_point_html = f"""
                        <div class="action-point">
                            <div class="action-label">Action Point</div>
                            <div class="action-text">{update.action_point}</div>
                        </div>
                    """
                
                updates_html += f"""
                    <div class="update-card">
                        <div class="update-header">
                            <img src="{company_logo_url}" alt="{company_name} Logo" class="competitor-logo">
                            <div class="update-title-section">
                                <div class="company-name">{company_name}</div>
                                <h3 class="update-title">{update.title}</h3>
                            </div>
                        </div>
                        <div class="update-description">{getattr(update, 'description', 'No description available.')}</div>
                        <div class="update-meta">
                            <span class="category-tag">{getattr(update, 'update_category', 'General')}</span>
                            <a href="{getattr(update, 'source_url', '#')}" class="read-more-link">Read more →</a>
                        </div>
                        {action_point_html}
                    </div>
                """
            return updates_html
        
        insights_html = generate_update_cards(insights, "🎯 Key Insights")
        risks_html = generate_update_cards(risks, "⚠️ Risks & Threats")
        opportunities_html = generate_update_cards(opportunities, "🚀 Opportunities")
        
        # Get recipient name and department info
        recipient_name = getattr(recipient, 'name', 'Valued Customer')
        department_info = f"from your department" if hasattr(recipient, 'department_uid') and recipient.department_uid else ""
        
        # Get customer logo URLs using customer domain from database
        customer_logo_url = self.get_customer_logo_url(customer_domain)
        footer_logo_url = self.get_customer_logo_url(customer_domain)
        
        # Generate full HTML content with improved styling
        email_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Competitor Insights</title>
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #1f2937;
                    background-color: #f8fafc;
                    padding: 20px 10px;
                }}
                
                .container {{
                    max-width: 680px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }}
                
                .header {{
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                    position: relative;
                }}
                
                .header::before {{
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                    opacity: 0.3;
                }}
                
                .header > * {{
                    position: relative;
                    z-index: 1;
                }}
                
                .company-logo {{
                    max-height: 45px;
                    max-width: 180px;
                    height: auto;
                    width: auto;
                    filter: brightness(0) invert(1);
                    margin-bottom: 20px;
                    border-radius: 6px;
                }}
                
                .header h1 {{
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    letter-spacing: -0.5px;
                }}
                
                .date-badge {{
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                
                .content {{
                    padding: 40px 30px;
                }}
                
                .greeting {{
                    font-size: 18px;
                    margin-bottom: 24px;
                    color: #374151;
                }}
                
                .summary {{
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 40px;
                    border-left: 4px solid #3b82f6;
                }}
                
                .summary p {{
                    font-size: 16px;
                    color: #4b5563;
                    margin: 0;
                }}
                
                .section-header {{
                    font-size: 22px;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 40px 0 24px 0;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }}
                
                .update-card {{
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 20px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                }}
                
                .update-card:hover {{
                    border-color: #d1d5db;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }}
                
                .update-header {{
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }}
                
                .competitor-logo {{
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    margin-right: 16px;
                    flex-shrink: 0;
                    object-fit: contain;
                    background: #f9fafb;
                    padding: 6px;
                    border: 1px solid #e5e7eb;
                }}
                
                .update-title-section {{
                    flex-grow: 1;
                    min-width: 0;
                }}
                
                .company-name {{
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 600;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                
                .update-title {{
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                    line-height: 1.4;
                }}
                
                .update-description {{
                    color: #4b5563;
                    font-size: 15px;
                    line-height: 1.6;
                    margin-bottom: 16px;
                }}
                
                .update-meta {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }}
                
                .category-tag {{
                    background: #f3f4f6;
                    color: #374151;
                    padding: 6px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                
                .read-more-link {{
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 14px;
                    transition: color 0.2s ease;
                }}
                
                .read-more-link:hover {{
                    color: #1d4ed8;
                }}
                
                .action-point {{
                    margin-top: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-radius: 8px;
                    border-left: 4px solid #f59e0b;
                }}
                
                .action-label {{
                    font-size: 12px;
                    font-weight: 700;
                    color: #92400e;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }}
                
                .action-text {{
                    color: #78350f;
                    font-size: 14px;
                    font-weight: 500;
                }}
                
                .empty-section {{
                    text-align: center;
                    padding: 40px 20px;
                    color: #6b7280;
                    font-style: italic;
                }}
                
                .cta-section {{
                    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                    margin: 40px -30px 0 -30px;
                }}
                
                .cta-section h2 {{
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }}
                
                .cta-section p {{
                    font-size: 16px;
                    color: #d1d5db;
                    margin-bottom: 24px;
                }}
                
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }}
                
                .cta-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
                }}
                
                .footer {{
                    background: #f9fafb;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                    margin: 0 -30px -40px -30px;
                }}
                
                .footer-logo {{
                    max-height: 28px;
                    margin-bottom: 16px;
                    opacity: 0.6;
                }}
                
                .footer p {{
                    color: #6b7280;
                    font-size: 14px;
                    margin-bottom: 8px;
                }}
                
                .footer a {{
                    color: #3b82f6;
                    text-decoration: none;
                    font-weight: 500;
                }}
                
                .footer a:hover {{
                    text-decoration: underline;
                }}
                
                @media (max-width: 600px) {{
                    body {{
                        padding: 10px 5px;
                    }}
                    
                    .container {{
                        border-radius: 12px;
                    }}
                    
                    .header {{
                        padding: 30px 20px;
                    }}
                    
                    .header h1 {{
                        font-size: 24px;
                    }}
                    
                    .content {{
                        padding: 30px 20px;
                    }}
                    
                    .update-card {{
                        padding: 20px;
                    }}
                    
                    .update-header {{
                        flex-direction: column;
                        align-items: flex-start;
                    }}
                    
                    .competitor-logo {{
                        margin-bottom: 12px;
                        margin-right: 0;
                    }}
                    
                    .update-meta {{
                        flex-direction: column;
                        align-items: flex-start;
                    }}
                    
                    .cta-section {{
                        padding: 30px 20px;
                        margin: 30px -20px 0 -20px;
                    }}
                    
                    .footer {{
                        padding: 25px 20px;
                        margin: 0 -20px -30px -20px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="{customer_logo_url}" alt="{customer_company_name} Logo" class="company-logo">
                    <h1>Weekly Competitor Insights</h1>
                    <div class="date-badge">Week of {date_range}</div>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Hi <strong>{recipient_name}</strong> {department_info},
                    </div>
                    
                    <div class="summary">
                        <p>Here are your <strong>{len(updates)} competitor insights</strong> from the past week. We've organized them into key insights, risks, and opportunities to help you stay ahead of the competition.</p>
                    </div>
                    
                    {insights_html}
                    {risks_html}
                    {opportunities_html}
                </div>
                
                <div class="cta-section">
                    <h2>Want more insights?</h2>
                    <p>Get real-time alerts and deeper competitive analysis to stay ahead.</p>
                    <a href="https://yourdomain.com/subscribe" class="cta-button">Explore Premium</a>
                </div>
                
                <div class="footer">
                    <img src="{footer_logo_url}" alt="{customer_company_name} Logo" class="footer-logo">
                    <p>© {datetime.now().year} {customer_company_name}. All rights reserved.</p>
                    <p>
                        <a href="https://yourdomain.com/unsubscribe">Unsubscribe</a> |
                        <a href="https://yourdomain.com/privacy">Privacy Policy</a> |
                        <a href="https://yourdomain.com/contact">Contact</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        print("Email content prepared successfully")
        return email_content

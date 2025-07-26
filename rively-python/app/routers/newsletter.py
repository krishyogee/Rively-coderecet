from fastapi import APIRouter, Depends
from app.schemas.newsletter import NewsletterRequest, NewsletterResponse
from app.services.newsletter import NewsletterService
from app.dependency import get_newsletter_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/send-newsletter/", response_model=NewsletterResponse)
async def send_newsletter(
    newsletter: NewsletterRequest,
    newsletter_service: NewsletterService = Depends(get_newsletter_service),
):
    try:
        logger.info(f"Attempting to send newsletter for customer: {newsletter.customer_uid}")
        "about to enter the service"
        result = await newsletter_service.send_newsletter(newsletter.customer_uid)
        "after the service"
        logger.info(f"Newsletter send {'succeeded' if result.success else 'failed'}")
        return result
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return NewsletterResponse(success=False)
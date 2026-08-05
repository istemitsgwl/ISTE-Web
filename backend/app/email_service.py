import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from app.config import settings

logger = logging.getLogger("uvicorn")

def send_contact_notification_email(
    name: str,
    email: str,
    subject: str,
    message: str,
    submitted_at: str,
    ip_address: str,
    user_agent: str
) -> bool:
    """
    Sends an immediate email notification for a new contact form submission to shivampatidar780@gmail.com.
    Tries Resend API first, then fallback to SMTP/Gmail. Returns True if sent, False if delivery failed.
    """
    recipient = settings.NOTIFICATION_EMAIL or "shivampatidar780@gmail.com"
    email_subject = f"New Contact Form Submission: {subject}"

    body_text = f"""New Contact Form Submission

Name: {name}
Email: {email}
Subject: {subject}
Message:
{message}

Submitted At: {submitted_at}
IP Address: {ip_address}
Browser: {user_agent}
"""

    body_html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; rounded: 12px;">
      <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 8px;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
      <p><strong>Subject:</strong> {subject}</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #7C3AED; margin: 15px 0;">
        <p style="margin: 0; white-space: pre-wrap;"><strong>Message:</strong><br/>{message}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;"><strong>Submitted At:</strong> {submitted_at}</p>
      <p style="font-size: 12px; color: #777;"><strong>IP Address:</strong> {ip_address}</p>
      <p style="font-size: 12px; color: #777;"><strong>User Agent:</strong> {user_agent}</p>
    </div>
    """

    # 1. Try Resend API if API Key is set
    if settings.RESEND_API_KEY:
        try:
            res = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "ISTE MITS <onboarding@resend.dev>",
                    "to": [recipient],
                    "subject": email_subject,
                    "text": body_text,
                    "html": body_html
                },
                timeout=8
            )
            if res.status_code in [200, 201, 202]:
                logger.info(f"✅ [EMAIL SENT - RESEND] Notification sent to {recipient}")
                return True
            else:
                logger.warning(f"⚠️ [RESEND WARNING] Resend HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"❌ [RESEND ERROR] Failed to send via Resend API: {e}")

    # 2. Try SMTP if configured
    if settings.SMTP_SERVER and settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = email_subject
            msg["From"] = settings.SMTP_USERNAME
            msg["To"] = recipient

            msg.attach(MIMEText(body_text, "plain"))
            msg.attach(MIMEText(body_html, "html"))

            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=8) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_USERNAME, recipient, msg.as_string())
            logger.info(f"✅ [EMAIL SENT - SMTP] Notification sent to {recipient}")
            return True
        except Exception as e:
            logger.error(f"❌ [SMTP ERROR] Failed to send via SMTP: {e}")

    logger.info(f"ℹ️ [EMAIL NOTICE] No active email API keys configured. Message saved safely in MongoDB.")
    return False

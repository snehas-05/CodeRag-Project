import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

logger = logging.getLogger("coderag.email")

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.SMTP_FROM,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_otp_email(email: str, otp: str):
    """Send an OTP email to the user for password reset."""
    message = MessageSchema(
        subject="CodeRAG Password Reset OTP",
        recipients=[email],
        body=f"""
        <html>
            <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #00d4ff;">CodeRAG password reset</h2>
                    <p>You requested a password reset. Use the following code to verify your identity:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; color: #0f172a; margin: 20px 0;">
                        {otp}
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="font-size: 0.8em; color: #64748b;">If you did not request this, you can safely ignore this email.</p>
                </div>
            </body>
        </html>
        """,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    
    # In development or if SMTP not configured, just log it
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(f"SMTP not configured. OTP for {email} is: {otp}")
        print(f"\n[EMAIL MOCK] To: {email} | OTP: {otp}\n")
        return True

    try:
        await fm.send_message(message)
        logger.info(f"OTP email sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {e}")
        return False

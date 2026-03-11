import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from loguru import logger


class MailSender:
    def __init__(self, server, port, address, password):
        self.server = server
        self.port = port
        self.address = address
        self.password = password
        logger.debug(
            "MailSender initialized for {address} on {server}:{port}",
            address=address,
            server=server,
            port=port,
        )

    def send_email(self, recipient, subject, body):
        logger.info("Sending email to {recipient} with subject: {subject}", recipient=recipient, subject=subject)
        message = MIMEMultipart()
        message["From"] = self.address
        message["To"] = recipient
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        try:
            with smtplib.SMTP(self.server, self.port) as server:
                server.starttls()
                server.login(self.address, self.password)
                server.sendmail(self.address, recipient, message.as_string())
            logger.info("Email successfully sent to {recipient}", recipient=recipient)
        except smtplib.SMTPException as e:
            logger.error("Failed to send email to {recipient}: {error}", recipient=recipient, error=e)
            raise

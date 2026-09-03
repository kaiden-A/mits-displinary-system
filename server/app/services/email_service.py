import httpx

from ..config import settings

EMAIL_ENDPOINT = "/api/v1/emails/send-html"
DEFAULT_FROM = "spsm@mits.edu.my"
PARENT_PLACEHOLDER_EMAIL = "ibu-bapa-placeholder@mits.edu.my"


def send_html(to_email: str, subject: str, html_content: str, from_email: str = DEFAULT_FROM) -> bool:
    """Send an HTML email through the configured EMAIL_API."""
    if not settings.email_api or not settings.api_key:
        return False
    try:
        res = httpx.post(
            f"{settings.email_api}{EMAIL_ENDPOINT}",
            headers={"X-API-Key": settings.api_key},
            json={
                "toEmail": to_email,
                "subject": subject,
                "fromEmail": from_email,
                "htmlContent": html_content,
            },
            timeout=15,
        )
        return res.status_code < 300
    except httpx.HTTPError:
        return False


def notify_case_created(case, origin: str) -> None:
    """Send emails for newly created cases. origin: 'COMPLAINT' | 'PREFECT_WARNING' | 'SPOT_CHECK'."""
    subject = f"SPSM: Kes baharu {case['id']}"
    if origin == "COMPLAINT":
        subject = f"SPSM: Aduan B01 baharu {case['id']}"
    elif origin == "PREFECT_WARNING":
        subject = f"SPSM: Kad Peringatan B03 menunggu semakan {case['id']}"
    send_html(
        "guru-disiplin@mits.edu.my",
        subject,
        f"<p>Kes <b>{case['id']}</b> ({case['status']}) bagi {case['student_name']} "
        f"({case['points']} mata) telah diwujudkan.</p>",
    )


def notify_b03_review(case, pengawas_email: str, approved: bool) -> None:
    send_html(
        pengawas_email,
        f"SPSM: Kad Peringatan {case['id']} {'disahkan' if approved else 'ditolak'}",
        f"<p>Kad Peringatan <b>{case['id']}</b> telah {'disahkan dan direkod dalam B04' if approved else 'ditolak'}.</p>",
    )


def notify_parent_letter(case, level: str) -> None:
    send_html(
        PARENT_PLACEHOLDER_EMAIL,
        f"SPSM: Surat Pemberitahuan / Amaran {level} - {case['id']}",
        f"<p>Surat Pemberitahuan / Amaran {level} bagi kes {case['id']} telah dikeluarkan.</p>",
    )
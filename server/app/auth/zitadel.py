import jwt

from ..config import settings
from ..schemas import Principal

ROLES_CLAIMS = [
    f"urn:zitadel:iam:org:project:{settings.zitadel_audience}:roles",
    "urn:zitadel:iam:org:project:roles",
]


def _extract_roles(claims: dict) -> list[str]:
    roles: list[str] = []
    for key in ROLES_CLAIMS:
        value = claims.get(key)
        if isinstance(value, dict):
            roles.extend(str(k) for k in value.keys())
        elif isinstance(value, list):
            roles.extend(str(v) for v in value)
    return roles


def validate_staff_token(token: str) -> Principal:
    """Validate a Zitadel access token (signature via JWKS, issuer, audience).

    Raises jwt.PyJWTError on invalid tokens.
    """
    jwk_client = jwt.PyJWKClient(settings.zitadel_jwks_uri)
    signing_key = jwk_client.get_signing_key_from_jwt(token)

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"],
        issuer=settings.zitadel_issuer or None,
        audience=settings.zitadel_audience or None,
        options={"verify_aud": bool(settings.zitadel_audience)},
    )

    roles = _extract_roles(claims)
    if settings.zitadel_required_role and settings.zitadel_required_role not in roles:
        raise jwt.PyJWTError("missing required role")

    return Principal(
        auth_type="staff",
        sub=str(claims.get("sub") or ""),
        name=str(claims.get("name") or claims.get("preferred_username") or ""),
        email=str(claims.get("email") or ""),
        roles=roles,
    )
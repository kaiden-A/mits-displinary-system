import jwt

from ..config import settings
from ..schemas import Principal

ROLES_CLAIMS = [
    "urn:zitadel:iam:org:project:roles",
    "urn:zitadel:iam:org:roles",
]

_jwks_client = jwt.PyJWKClient(settings.zitadel_jwks_uri) if settings.zitadel_jwks_uri else None


def _extract_roles(claims: dict) -> list[str]:
    """Read Zitadel roles from token claims.

    Zitadel maps each granted role to the org ids/domains it applies in;
    roles with empty mappings are not granted in the current context.
    """
    roles: set[str] = set()
    for key, value in claims.items():
        is_role_claim = key in ROLES_CLAIMS or (
            isinstance(key, str)
            and key.startswith("urn:zitadel:iam:org:project:")
            and key.endswith(":roles")
        )
        if is_role_claim and isinstance(value, dict):
            for role, mapping in value.items():
                if mapping and isinstance(mapping, (dict, list, str)):
                    roles.add(str(role))
    groups = claims.get("groups")
    if isinstance(groups, list):
        roles.update(str(group) for group in groups)
    return sorted(roles)


def validate_staff_token(token: str) -> Principal:
    """Validate a Zitadel access token (signature via JWKS, issuer, audience,
    optional org membership and SPSM role).

    Raises jwt.PyJWTError on invalid tokens.
    """
    jwk_client = _jwks_client
    signing_key = jwk_client.get_signing_key_from_jwt(token)

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "EdDSA"],
        issuer=settings.zitadel_issuer or None,
        audience=settings.zitadel_audience or None,
        options={"verify_aud": bool(settings.zitadel_audience)},
    )

    if settings.zitadel_allowed_org_id:
        org_id = str(claims.get("urn:zitadel:iam:user:resourceowner:id") or "")
        if not org_id or org_id != settings.zitadel_allowed_org_id:
            raise jwt.PyJWTError("user is not a member of the allowed organization")

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
from fastapi import APIRouter, Depends

from ..dependencies import get_current_principal
from ..schemas import LadderTierOut, OffenceOut, Principal
from ..seed import CATEGORIES, LADDER, OFFENCES, prefect_allowed, required_forms, tier_for

router = APIRouter(tags=["catalogue"])


@router.get("/offences", response_model=list[OffenceOut])
def list_offences(_: Principal = Depends(get_current_principal)):
    return [
        OffenceOut(code=r[0], name=r[2], min_points=r[3], max_points=r[4], action=r[5])
        for r in OFFENCES
    ]


@router.get("/offences/prefect-allowed", response_model=list[OffenceOut])
def prefect_offences(_: Principal = Depends(get_current_principal)):
    return [
        OffenceOut(code=r[0], name=r[2], min_points=r[3], max_points=r[4], action=r[5])
        for r in prefect_allowed()
    ]


@router.get("/spsm/ladder", response_model=list[LadderTierOut])
def ladder(_: Principal = Depends(get_current_principal)):
    return [LadderTierOut(**tier) for tier in LADDER]


@router.get("/spsm/tier/{points}")
def tier(points: int, _: Principal = Depends(get_current_principal)):
    return tier_for(points)


@router.get("/spsm/forms/{points}")
def forms(points: int, _: Principal = Depends(get_current_principal)):
    return required_forms(points)


@router.get("/offences/categories")
def categories(_: Principal = Depends(get_current_principal)):
    return CATEGORIES
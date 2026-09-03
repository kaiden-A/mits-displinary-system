from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import accounts, auth, cases, notifications, offences, students

app = FastAPI(title="MITS SPSM API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(students.router)
app.include_router(offences.router)
app.include_router(cases.router)
app.include_router(notifications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
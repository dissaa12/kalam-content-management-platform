from pydantic import BaseModel
from datetime import datetime


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    database_status: str
    timestamp: str

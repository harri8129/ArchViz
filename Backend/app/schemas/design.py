from pydantic import BaseModel

class DesignRequest(BaseModel):
    system_name: str

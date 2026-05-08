from pydantic import BaseModel

class CheckinRequestDTO(BaseModel):
    checkin_code: str

class ManualCheckinRequestDTO(BaseModel):
    user_id: str
    reservation_id: str
    trip_id: str
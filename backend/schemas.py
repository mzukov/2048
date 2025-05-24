from pydantic import BaseModel

class ScoreBase(BaseModel):
    name: str
    score: int

class ScoreCreate(ScoreBase):
    pass

class Score(ScoreBase):
    id: int

    class Config:
        orm_mode = True
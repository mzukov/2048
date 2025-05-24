from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

import models, schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене обязательно замените на конкретные origins!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scores/", response_model=List[schemas.Score], summary="Получить все счета")
def get_all_scores(db: Session = Depends(get_db)):
    scores = db.query(models.Score).all()
    return scores

@app.post("/scores/", response_model=schemas.Score, status_code=status.HTTP_201_CREATED, summary="Добавить новый счет")
def create_score(score: schemas.ScoreCreate, db: Session = Depends(get_db)):
    db_score = models.Score(name=score.name, score=score.score)
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score
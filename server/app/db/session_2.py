# from sqlalchemy import create_engine 
# from sqlalchemy.orm import Session, sessionmaker

# from app.core.config import settings
# from app.db.base import Base

# connect_args = {"check_same_thread" : False} if settings.fake_database_url.startswith("sqlite") else {}


# engine = create_engine(settings.fake_database_url, connect_args=connect_args)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# def init_db() -> None:
#         """
#         Create tables that don't exist yet. Call once at startup.

#         This is intentionally not a migration tool -- for a learning project,
#         create_all is enough. If you add real users and need to evolve the
#         schema safely later, that's the point to bring in Alembic.
#         """

#         from app.models.podcast import Podcast

#         Base.metadata.create_all(bind=engine)

# def get_db() -> Session:
#         db = SessionLocal()

#         try:
#                 yield db 

#         finally:
#                 db.close()

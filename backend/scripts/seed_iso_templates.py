"""CLI: seed global ISO checklist templates."""

from app.db.session import SessionLocal
from app.modules.audit_templates.seeder import seed_system_templates


def main() -> None:
    session = SessionLocal()
    try:
        created = seed_system_templates(session)
        session.commit()
        print(f"Seed complete. New templates created: {created}")
    finally:
        session.close()


if __name__ == "__main__":
    main()

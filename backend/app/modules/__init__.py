"""
Feature modules (bounded contexts).

Each module should follow Clean Architecture internally:

    modules/<name>/
        domain/          # entities, interfaces
        application/     # use cases
        infrastructure/  # ORM, repo impl
        api/             # route registration

Register module routers in app.api.v1.router.
"""

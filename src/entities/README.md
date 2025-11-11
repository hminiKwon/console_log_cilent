# Entities Layer

Encapsulates reusable domain models (User, Project, etc.). Keep UI-free business logic here.
- `model/`: types, adapters, state helpers
- `api/`: entity-specific fetchers or server actions
- `ui/`: small view helpers bound to the entity only
- `index.ts`: public entry point with carefully curated exports

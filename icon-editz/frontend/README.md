# Frontend migration boundary

The active Vite frontend remains at the repository root during the compatibility phase. This directory reserves the target `frontend/` boundary requested for the final monorepo layout. Move a feature here only after its API contract has FastAPI parity and deployment routing has been changed; do not duplicate or fork the live UI.

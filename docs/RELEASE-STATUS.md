# CampusConnect MVP — release status

## Included
- Existing React/Vite frontend and Express/Mongoose backend from the supplied project.
- Post feed, post publishing, authentication, Likes, and Comments integration.
- Original UI snapshot in `docs/ui-original/` for reference. Git branch history should remain the primary way to compare designs.
- Like-state identity check aligned with the backend authentication contract: verified JWT `payload.sub`.
- Like fetch failures no longer silently display a misleading zero count; previously loaded state is retained and marked as an error internally.

## Verification status
- Source package created from the supplied archive.
- A frontend production build was **not verified** in this environment because frontend dependencies are not installed (`vite: not found`).
- Database-backed behavior, browser interaction, CORS, duplicate legacy Like rows, and account-specific Like persistence still require testing against the user's configured MongoDB/API.

## Before presenting as a completed release
1. Install dependencies in `frontend/` and `backend/`.
2. Run the frontend production build and backend checks.
3. Sign in with two test accounts. Like a post, refresh/reopen, confirm filled state and count; unlike, refresh again.
4. Confirm there is at most one Like record per user/post. If old duplicate rows exist, deduplicate them before relying on the unique compound index.
5. Open comments for two different posts, publish a comment, refresh, and confirm each discussion remains associated with its own post.
6. Verify unauthorized comment creation/edit/delete is rejected and a user cannot edit/delete another user's comment.

-- Mengukir Senja — Phase 2 placeholder cover art.
--
-- The seed rows ship without photography. `cover_image_url` is plain text and
-- may hold either a repo-relative path (as below) or an absolute Supabase
-- Storage URL once real photos are uploaded from the admin panel in Phase 3.
-- These are generated duotone placeholders in the brand palette, not photos of
-- real work, and should be replaced before launch.

update public.catalog_items set cover_image_url = '/images/placeholders/' || slug || '.png' where is_active;

update public.portfolio_items set cover_image_url = '/images/placeholders/' || slug || '.png' where is_active;

-- Minimal demo data. Cover images are intentionally NULL: real images are
-- uploaded to the `catalog` / `portfolio` storage buckets from the admin panel.

insert into public.services (name, slug, type, description, sort_order) values
  ('Decoration', 'decoration', 'core', 'Dekorasi personal untuk acara pernikahan dan acara Hoseok.', 10),
  ('Soundsystem', 'soundsystem', 'partner', 'Sistem suara untuk acara, dikerjakan bersama partner.', 20),
  ('Tenda', 'tenda', 'partner', 'Paket tenda dan pelengkap acara.', 30),
  ('Fotografer', 'fotografer', 'partner', 'Dokumentasi acara oleh partner kami.', 40),
  ('Layur', 'layur', 'partner', 'Perlengkapan dekorasi tambahan untuk acara.', 50);

insert into public.partners (name, service_id, notes)
select 'Basssound', s.id, 'Partner utama untuk layanan soundsystem.'
from public.services s where s.slug = 'soundsystem';

insert into public.catalog_items (service_id, name, slug, description, price, price_label, is_featured, sort_order)
select s.id, v.name, v.slug, v.description, v.price, v.price_label, v.is_featured, v.sort_order
from (values
  ('decoration', 'Paket Rustic Garden', 'paket-rustic-garden',
   'Dekorasi taman dengan sentuhan rustic: wood sign, greenery, dan pencahayaan hangat.', 18000000, 'Mulai dari Rp18.000.000', true, 10),
  ('decoration', 'Paket Elegant', 'paket-elegant',
   'Dekorasi seremonial dengan dominasi bunga segar, linen, dan detail emas.', 32000000, 'Mulai dari Rp32.000.000', true, 20),
  ('decoration', 'Paket Minimalist', 'paket-minimalist',
   'Komposisi bersih dengan bentuk geometris dan palet monokrom.', 12000000, 'Mulai dari Rp12.000.000', false, 30),
  ('soundsystem', 'Wedding Sound Basic', 'wedding-sound-basic',
   'Dua line array, dua wireless microphone, dan mixer digital.', 6000000, 'Mulai dari Rp6.000.000', false, 10),
  ('soundsystem', 'Wedding Sound Pro', 'wedding-sound-pro',
   'Line array penuh, lighting, dan operator responsif.', 14000000, 'Mulai dari Rp14.000.000', false, 20),
  ('tenda', 'Tenda Wedding Basic', 'tenda-wedding-basic',
   'Tenda 6x8 meter dengan dinding samping dan dek.', 4500000, 'Mulai dari Rp4.500.000', false, 10),
  ('tenda', 'Tenda Wedding Premium', 'tenda-wedding-premium',
   'Tenda 8x12 meter dengan plank flooring, lighting, dan AC portable.', 9000000, 'Mulai dari Rp9.000.000', false, 20),
  ('fotografer', 'Photography Package A', 'photography-package-a',
   'Dokumentasi acara hingga 6 jam dengan 300 foto teredit.', 7500000, 'Mulai dari Rp7.500.000', false, 10),
  ('layur', 'Layur Package A', 'layur-package-a',
   'Dekorasi tambahan untuk pelaminan dan meja tamu.', 2500000, 'Mulai dari Rp2.500.000', false, 10)
) as v(service_slug, name, slug, description, price, price_label, is_featured, sort_order)
join public.services s on s.slug = v.service_slug;

-- Soundsystem catalog items are supplied by the Basssound partner.
update public.catalog_items ci
set partner_id = p.id
from public.partners p, public.services s
where p.service_id = s.id
  and s.slug = 'soundsystem'
  and p.name = 'Basssound'
  and ci.service_id = s.id
  and ci.partner_id is null;

insert into public.portfolio_items (service_id, title, slug, description, event_date, is_featured, sort_order)
select s.id, v.title, v.slug, v.description, v.event_date, v.is_featured, v.sort_order
from (values
  ('decoration', 'Rustic Garden Wedding', 'rustic-garden-wedding',
   'Dekorasi taman hari terbuka dengan pencahayaan senja.', '2026-03-14'::date, true, 10),
  ('decoration', 'Elegant Indoor Ceremony', 'elegant-indoor-ceremony',
   'Ceremony di dalam gedung dengan instalasi bunga segar.', '2026-01-25'::date, true, 20),
  ('decoration', 'Minimalist Garden Party', 'minimalist-garden-party',
   'Komposisi geometris untuk acara di luar ruangan.', '2025-11-08'::date, false, 30),
  ('soundsystem', 'Festival Sound by Basssound', 'festival-sound-by-basssound',
   'Sistem suara untuk acara outdoor berskala besar.', '2025-09-20'::date, false, 10),
  ('tenda', 'Tenda Wedding Expo', 'tenda-wedding-expo',
   'Instalasi tenda untuk area expo dengan pembatas dinding penuh.', '2025-07-12'::date, false, 10)
) as v(service_slug, title, slug, description, event_date, is_featured, sort_order)
join public.services s on s.slug = v.service_slug;

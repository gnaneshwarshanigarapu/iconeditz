-- Migration 015: Add missing performance indexes safely
-- Do not drop any tables, recreate tables, or modify existing data.

CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_gallery_product_idx ON public.product_gallery(product_id);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_customer_idx ON public.orders(user_email);
CREATE INDEX IF NOT EXISTS page_content_page_order_idx ON public.page_content(page, sort_order);
CREATE INDEX IF NOT EXISTS website_sections_page_order_idx ON public.website_sections(page, sort_order);
CREATE INDEX IF NOT EXISTS r2_objects_bucket_key_idx ON public.r2_objects(bucket_id, object_key);

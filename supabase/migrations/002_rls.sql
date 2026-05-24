-- ============================================================
-- 002_rls.sql — Villa Paradise Tahiti
-- Row Level Security : toutes les tables
-- ============================================================

-- ============================================================
-- Fonction helper is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
      AND role IN ('owner','assistant','developer')
  );
$$;

-- ============================================================
-- RLS sur toutes les tables
-- ============================================================

-- settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read"  ON settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write"  ON settings FOR ALL    USING (is_admin());

-- villa
ALTER TABLE villa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "villa_public_read"     ON villa FOR SELECT USING (true);
CREATE POLICY "villa_admin_write"     ON villa FOR ALL    USING (is_admin());

-- gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read"   ON gallery_items FOR SELECT USING (active = true);
CREATE POLICY "gallery_admin_write"   ON gallery_items FOR ALL    USING (is_admin());

-- excursion_providers (privé)
ALTER TABLE excursion_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_admin_only"  ON excursion_providers FOR ALL USING (is_admin());

-- experiences
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exp_public_read"       ON experiences FOR SELECT USING (active = true);
CREATE POLICY "exp_admin_write"       ON experiences FOR ALL    USING (is_admin());

-- experience_gallery
ALTER TABLE experience_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exp_gallery_public"    ON experience_gallery FOR SELECT USING (true);
CREATE POLICY "exp_gallery_admin"     ON experience_gallery FOR ALL    USING (is_admin());

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read"   ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_admin_write"   ON reviews FOR ALL    USING (is_admin());

-- posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read"     ON posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "posts_admin_write"     ON posts FOR ALL USING (is_admin());

-- faqs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read"      ON faqs FOR SELECT USING (active = true);
CREATE POLICY "faqs_admin_write"      ON faqs FOR ALL    USING (is_admin());

-- admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_users_self"      ON admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_users_owner"     ON admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner')
);

-- customers (jamais publique)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_admin"       ON customers FOR ALL USING (is_admin());

-- reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations_admin"    ON reservations FOR ALL USING (is_admin());

-- payment_events
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_events_admin"  ON payment_events FOR ALL USING (is_admin());

-- blocked_dates (lecture publique pour le calendrier)
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_dates_public"  ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "blocked_dates_admin"   ON blocked_dates FOR ALL    USING (is_admin());

-- email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_logs_admin"      ON email_logs FOR ALL USING (is_admin());

-- contact_inquiries
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries_admin"       ON contact_inquiries FOR ALL USING (is_admin());

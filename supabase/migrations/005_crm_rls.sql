-- ============================================================
-- 005_crm_rls.sql — Villa Paradise Tahiti
-- Row Level Security pour les nouvelles tables CRM
-- ============================================================

-- customer_tags
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_tags_admin" ON customer_tags FOR ALL USING (is_admin());

-- customer_tag_assignments
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_tag_assignments_admin" ON customer_tag_assignments FOR ALL USING (is_admin());

-- customer_notes
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_notes_admin" ON customer_notes FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────────────────────
-- Note sur customer_summary (VIEW)
-- ─────────────────────────────────────────────────────────────
-- Les vues n'ont pas leur propre RLS en PostgreSQL : elles héritent des
-- policies des tables sous-jacentes (customers, reservations, customer_tags,
-- customer_tag_assignments), toutes déjà protégées par is_admin().
-- → Aucun policy à créer ici, la vue est implicitement admin-only.

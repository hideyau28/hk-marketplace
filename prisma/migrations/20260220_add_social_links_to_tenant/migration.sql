-- AddSocialLinks: add socialLinks JSON column to Tenant
-- Format: [{"platform":"instagram","url":"https://..."},{"platform":"whatsapp","url":"852XXXXXXXX"}]
-- Max 4 entries, enforced at application level

ALTER TABLE "Tenant" ADD COLUMN "socialLinks" JSONB;

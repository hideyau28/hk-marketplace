// Shared shell for all Wowlix transactional emails.
// Email CSS is fragile across clients (Gmail strips classes, Outlook ignores
// many things) — we inline all styles + fall back to system font stack.

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const COLORS = {
  paper: "#FBFAF7", // cream
  cream: "#F8F6F2",
  ink: "#1A1A1A",
  stone: "#6F6A63",
  mist: "#E8E5DE",
};

// System font stack — no web fonts in email (most clients strip them).
const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const styles = {
  body: {
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    fontFamily: FONT_SANS,
    margin: 0,
    padding: 0,
    WebkitFontSmoothing: "antialiased" as const,
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "48px 32px",
  },
  brand: {
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: COLORS.ink,
    margin: 0,
  },
  brandLine: {
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: COLORS.stone,
    margin: "4px 0 0",
  },
  hr: {
    borderTop: `1px solid ${COLORS.mist}`,
    borderBottom: 0,
    borderLeft: 0,
    borderRight: 0,
    margin: "40px 0",
  },
  footer: {
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: COLORS.stone,
    margin: "8px 0",
  },
  footerLine: {
    fontSize: "12px",
    color: COLORS.stone,
    margin: "8px 0",
    lineHeight: 1.6,
  },
};

type Props = {
  preview: string;
  children: ReactNode;
  /** Optional per-tenant branding override; falls back to platform default. */
  brand?: { name?: string; tagline?: string };
};

export default function EmailShell({ preview, children, brand }: Props) {
  const brandName = brand?.name || "WoWlix";
  const brandTagline = brand?.tagline || "Storefronts for tasteful IG shops";

  return (
    <Html lang="zh-HK">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header — restrained word-mark, no logo image (avoids broken-image
              boxes in clients that block remote content by default). */}
          <Section>
            <Text style={styles.brand}>{brandName}</Text>
            <Text style={styles.brandLine}>{brandTagline}</Text>
          </Section>

          <Hr style={styles.hr} />

          {/* Body content */}
          <Section>{children}</Section>

          <Hr style={styles.hr} />

          {/* Footer */}
          <Section>
            <Text style={styles.footer}>WoWlix · Hong Kong</Text>
            <Text style={styles.footerLine}>
              You&apos;re receiving this because of recent activity on your
              WoWlix account. If this wasn&apos;t you, ignore the email — no
              action is needed.
            </Text>
            <Text style={styles.footerLine}>
              © {new Date().getFullYear()} WoWlix. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

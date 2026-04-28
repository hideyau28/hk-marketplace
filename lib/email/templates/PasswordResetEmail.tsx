import { Button, Heading, Section, Text } from "@react-email/components";
import EmailShell from "./EmailShell";

const styles = {
  heading: {
    fontSize: "28px",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    color: "#1A1A1A",
    margin: "0 0 12px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#6F6A63",
    margin: "0 0 8px",
  },
  body: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#1A1A1A",
    margin: "20px 0",
  },
  fineText: {
    fontSize: "13px",
    color: "#6F6A63",
    lineHeight: 1.6,
    margin: "16px 0 0",
  },
  cta: {
    display: "inline-block",
    backgroundColor: "#1A1A1A",
    color: "#FBFAF7",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    fontWeight: 500,
    padding: "16px 32px",
    textDecoration: "none",
    margin: "28px 0",
  },
  fallbackLink: {
    fontSize: "13px",
    color: "#6F6A63",
    wordBreak: "break-all" as const,
    margin: "8px 0 0",
  },
};

type Props = {
  resetUrl: string;
  /** How long the link is valid. Used in the body copy. */
  expiresInMinutes?: number;
  brand?: { name?: string; tagline?: string };
};

export default function PasswordResetEmail({
  resetUrl,
  expiresInMinutes = 60,
  brand,
}: Props) {
  return (
    <EmailShell
      preview="Reset your WoWlix admin password — link expires soon"
      brand={brand}
    >
      <Text style={styles.eyebrow}>Reset password</Text>
      <Heading style={styles.heading}>Set a new password</Heading>
      <Text style={styles.body}>
        We received a request to reset the password for your WoWlix admin
        account. Use the button below to choose a new one.
      </Text>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={resetUrl} style={styles.cta}>
          Reset password
        </Button>
      </Section>

      <Text style={styles.fineText}>
        This link expires in {expiresInMinutes} minutes. If you didn&apos;t
        request a reset, ignore this email — your password will stay the same.
      </Text>

      <Text style={styles.fineText}>
        Trouble with the button? Copy this link into your browser:
      </Text>
      <Text style={styles.fallbackLink}>{resetUrl}</Text>
    </EmailShell>
  );
}

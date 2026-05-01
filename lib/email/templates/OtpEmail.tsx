import { Heading, Section, Text } from "@react-email/components";
import EmailShell from "./EmailShell";

const styles = {
  eyebrow: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: "#6F6A63",
    margin: "0 0 8px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    color: "#1A1A1A",
    margin: "0 0 12px",
  },
  body: {
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#1A1A1A",
    margin: "20px 0 8px",
  },
  // The code itself — large, monospaced, generously spaced.
  // Centered in its own panel so it stands out at a glance.
  codePanel: {
    backgroundColor: "#F8F6F2",
    border: "1px solid #E8E5DE",
    padding: "28px 24px",
    margin: "24px 0 8px",
    textAlign: "center" as const,
  },
  code: {
    fontSize: "36px",
    fontWeight: 700,
    letterSpacing: "0.4em",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
    color: "#1A1A1A",
    margin: 0,
    // Trailing letter-spacing pushes the visual center off — pad-left compensates.
    paddingLeft: "0.4em",
  },
  fineText: {
    fontSize: "13px",
    color: "#6F6A63",
    lineHeight: 1.6,
    margin: "16px 0 0",
  },
};

type Props = {
  code: string;
  expiresInMinutes?: number;
  brand?: { name?: string; tagline?: string };
};

export default function OtpEmail({
  code,
  expiresInMinutes = 5,
  brand,
}: Props) {
  return (
    <EmailShell
      preview={`Your WoWlix verification code is ${code}`}
      brand={brand}
    >
      <Text style={styles.eyebrow}>Verification code</Text>
      <Heading style={styles.heading}>Sign in to WoWlix</Heading>
      <Text style={styles.body}>
        Enter the code below to finish signing in. It expires in{" "}
        {expiresInMinutes} minutes.
      </Text>

      <Section style={styles.codePanel}>
        <Text style={styles.code}>{code}</Text>
      </Section>

      <Text style={styles.fineText}>
        If you didn&apos;t request this code, ignore this email — no action is
        needed and no one can sign in without it.
      </Text>
    </EmailShell>
  );
}

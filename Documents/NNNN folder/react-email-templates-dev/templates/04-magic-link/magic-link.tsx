import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from "@react-email/components";
import * as React from "react";

interface MagicLinkProps {
  email?: string;
  magicUrl?: string;
  expiresInMinutes?: number;
}

export default function MagicLink({ email = "user@example.com", magicUrl = "https://example.com/auth/magic", expiresInMinutes = 15 }: MagicLinkProps) {
  return (
    <Html>
      <Head />
      <Preview>Your magic link — sign in instantly</Preview>
      <Body style={{ backgroundColor: "#0f172a", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#f8fafc", fontSize: "26px", fontWeight: "bold" }}>✨ Your magic link</Heading>
          <Text style={{ color: "#cbd5e1", fontSize: "16px", lineHeight: "1.6" }}>
            Click below to sign in as <strong style={{ color: "#fff" }}>{email}</strong>. No password needed.
          </Text>
          <Button href={magicUrl} style={{ backgroundColor: "#6366f1", color: "#fff", padding: "14px 28px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", display: "inline-block", margin: "20px 0", fontSize: "16px" }}>
            Sign In Now
          </Button>
          <Text style={{ color: "#64748b", fontSize: "13px" }}>
            This link expires in {expiresInMinutes} minutes and can only be used once.
          </Text>
          <Text style={{ color: "#475569", fontSize: "12px", marginTop: "24px" }}>
            If you didn't request this, ignore this email — your account is safe.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

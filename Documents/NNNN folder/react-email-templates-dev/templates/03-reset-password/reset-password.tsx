import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordProps {
  name?: string;
  resetUrl?: string;
  expiresInHours?: number;
}

export default function ResetPassword({ name = "User", resetUrl = "https://example.com/reset", expiresInHours = 1 }: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "24px" }}>Reset your password</Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Hi {name}, we received a request to reset your password. Click the button below to create a new one.
          </Text>
          <Button href={resetUrl} style={{ backgroundColor: "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none", display: "inline-block", margin: "16px 0" }}>
            Reset Password
          </Button>
          <Text style={{ color: "#666", fontSize: "14px" }}>
            This link expires in {expiresInHours} hour{expiresInHours !== 1 ? "s" : ""}.
          </Text>
          <Text style={{ color: "#888", fontSize: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            If you didn't request a password reset, you can safely ignore this email. Your password won't change.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

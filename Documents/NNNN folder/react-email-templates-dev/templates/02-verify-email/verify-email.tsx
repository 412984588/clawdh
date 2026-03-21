import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface VerifyEmailProps {
  name?: string;
  verifyUrl?: string;
  otp?: string;
}

export default function VerifyEmail({ name = "User", verifyUrl = "https://example.com/verify", otp = "123456" }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "24px" }}>Confirm your email</Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px" }}>
            Hi {name}, please verify your email address to continue.
          </Text>
          <Section style={{ background: "#f0f4ff", borderRadius: "8px", padding: "24px", textAlign: "center", margin: "24px 0" }}>
            <Text style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "8px", color: "#0070f3", margin: 0 }}>
              {otp}
            </Text>
            <Text style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>
              This code expires in 10 minutes
            </Text>
          </Section>
          <Text style={{ color: "#4a4a4a", fontSize: "14px" }}>
            Or click the button below:
          </Text>
          <Button href={verifyUrl} style={{ backgroundColor: "#0070f3", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none" }}>
            Verify Email
          </Button>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            If you didn't request this, ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

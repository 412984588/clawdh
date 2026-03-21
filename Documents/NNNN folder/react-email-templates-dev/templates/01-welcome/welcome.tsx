import {
  Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export default function WelcomeEmail({ name = "there", loginUrl = "https://example.com/login" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the platform — you're all set!</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "28px", fontWeight: "bold" }}>
            Welcome, {name}!
          </Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Your account is ready. Start exploring everything we have to offer.
          </Text>
          <Section style={{ textAlign: "center", margin: "32px 0" }}>
            <Button href={loginUrl} style={{ backgroundColor: "#0070f3", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none" }}>
              Get Started
            </Button>
          </Section>
          <Text style={{ color: "#888", fontSize: "14px" }}>
            If you did not sign up, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

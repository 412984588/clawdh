import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionCancelledProps {
  name?: string;
  planName?: string;
  accessUntil?: string;
  reactivateUrl?: string;
}

export default function SubscriptionCancelled({
  name = "User",
  planName = "Pro",
  accessUntil = "2024-02-01",
  reactivateUrl = "https://example.com/reactivate",
}: SubscriptionCancelledProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {planName} subscription has been cancelled</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "24px" }}>Subscription cancelled</Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Hi {name}, we've cancelled your {planName} subscription as requested.
          </Text>
          <Section style={{ background: "#fef3c7", borderRadius: "8px", padding: "16px 20px", border: "1px solid #fde68a", margin: "20px 0" }}>
            <Text style={{ color: "#92400e", margin: 0 }}>
              You still have access to all {planName} features until <strong>{accessUntil}</strong>.
            </Text>
          </Section>
          <Text style={{ color: "#4a4a4a", fontSize: "16px" }}>
            Changed your mind? You can reactivate anytime.
          </Text>
          <Button href={reactivateUrl} style={{ backgroundColor: "#0070f3", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none", display: "inline-block", margin: "8px 0" }}>
            Reactivate Subscription
          </Button>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            If you have questions, reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface SubscriptionStartedProps {
  name?: string;
  planName?: string;
  amount?: number;
  currency?: string;
  nextBillingDate?: string;
  dashboardUrl?: string;
}

export default function SubscriptionStarted({
  name = "User",
  planName = "Pro",
  amount = 49,
  currency = "USD",
  nextBillingDate = "2024-02-01",
  dashboardUrl = "https://example.com/dashboard",
}: SubscriptionStartedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {planName} subscription is now active</Preview>
      <Body style={{ backgroundColor: "#f0fdf4", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Text style={{ fontSize: "40px", textAlign: "center", margin: "0 0 8px" }}>🎉</Text>
          <Heading style={{ color: "#15803d", fontSize: "24px", textAlign: "center" }}>
            You're subscribed to {planName}!
          </Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Hi {name}, welcome to the {planName} plan. Your subscription is now active.
          </Text>
          <Section style={{ background: "#fff", borderRadius: "8px", padding: "20px", border: "1px solid #bbf7d0", margin: "20px 0" }}>
            <Text style={{ margin: "4px 0", color: "#333" }}><strong>Plan:</strong> {planName}</Text>
            <Text style={{ margin: "4px 0", color: "#333" }}><strong>Amount:</strong> ${amount} {currency}/month</Text>
            <Text style={{ margin: "4px 0", color: "#333" }}><strong>Next billing:</strong> {nextBillingDate}</Text>
          </Section>
          <Button href={dashboardUrl} style={{ backgroundColor: "#16a34a", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none", display: "inline-block" }}>
            Go to Dashboard
          </Button>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            You can cancel anytime from your account settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

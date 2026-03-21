import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface PaymentFailedProps {
  name?: string;
  amount?: number;
  currency?: string;
  planName?: string;
  retryDate?: string;
  updatePaymentUrl?: string;
}

export default function PaymentFailed({
  name = "User",
  amount = 49,
  currency = "USD",
  planName = "Pro",
  retryDate = "2024-01-08",
  updatePaymentUrl = "https://example.com/billing",
}: PaymentFailedProps) {
  return (
    <Html>
      <Head />
      <Preview>Action required: payment failed for your {planName} subscription</Preview>
      <Body style={{ backgroundColor: "#fff5f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Section style={{ background: "#fee2e2", borderRadius: "8px", padding: "16px 20px", border: "1px solid #fca5a5", marginBottom: "24px" }}>
            <Text style={{ color: "#991b1b", fontWeight: "bold", margin: 0, fontSize: "16px" }}>
              ⚠️ Payment failed
            </Text>
          </Section>
          <Heading style={{ color: "#1a1a1a", fontSize: "22px" }}>We couldn't process your payment</Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Hi {name}, we were unable to charge ${amount} {currency} for your {planName} subscription.
          </Text>
          <Text style={{ color: "#4a4a4a", fontSize: "16px" }}>
            We'll retry on <strong>{retryDate}</strong>. Please update your payment method to avoid interruption.
          </Text>
          <Button href={updatePaymentUrl} style={{ backgroundColor: "#dc2626", color: "#fff", padding: "12px 24px", borderRadius: "6px", fontWeight: "bold", textDecoration: "none", display: "inline-block", margin: "16px 0" }}>
            Update Payment Method
          </Button>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            If you have questions about your payment, reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

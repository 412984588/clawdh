import {
  Body, Button, Container, Head, Heading, Html, Preview, Row, Column, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface OnboardingStep {
  number: number;
  title: string;
  description: string;
}

interface OnboardingEmailProps {
  name?: string;
  appName?: string;
  steps?: OnboardingStep[];
  getStartedUrl?: string;
}

const defaultSteps: OnboardingStep[] = [
  { number: 1, title: "Complete your profile", description: "Add your name, photo, and preferences." },
  { number: 2, title: "Connect your tools", description: "Integrate the services you use daily." },
  { number: 3, title: "Invite your team", description: "Collaborate better by bringing your team in." },
];

export default function OnboardingEmail({
  name = "User",
  appName = "AppName",
  steps = defaultSteps,
  getStartedUrl = "https://example.com/dashboard",
}: OnboardingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Get the most out of {appName} — 3 steps to get started</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "26px" }}>
            Hi {name}, let's get you set up 🚀
          </Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            Here are {steps.length} quick steps to get the most out of {appName}:
          </Text>
          {steps.map((step) => (
            <Section key={step.number} style={{ background: "#fff", borderRadius: "8px", padding: "16px 20px", border: "1px solid #e5e7eb", margin: "12px 0" }}>
              <Row>
                <Column style={{ width: "40px" }}>
                  <Text style={{ background: "#0070f3", color: "#fff", width: "28px", height: "28px", borderRadius: "50%", textAlign: "center", lineHeight: "28px", fontWeight: "bold", margin: 0 }}>
                    {step.number}
                  </Text>
                </Column>
                <Column>
                  <Text style={{ fontWeight: "bold", color: "#1a1a1a", margin: "0 0 4px" }}>{step.title}</Text>
                  <Text style={{ color: "#666", fontSize: "14px", margin: 0 }}>{step.description}</Text>
                </Column>
              </Row>
            </Section>
          ))}
          <Section style={{ textAlign: "center", marginTop: "28px" }}>
            <Button href={getStartedUrl} style={{ backgroundColor: "#0070f3", color: "#fff", padding: "14px 28px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "16px" }}>
              Let's Go!
            </Button>
          </Section>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            Questions? Reply to this email anytime.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

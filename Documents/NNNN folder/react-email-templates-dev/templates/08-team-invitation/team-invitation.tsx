import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface TeamInvitationProps {
  inviterName?: string;
  teamName?: string;
  inviteUrl?: string;
  role?: string;
  expiresInDays?: number;
}

export default function TeamInvitation({
  inviterName = "Alex",
  teamName = "Acme Team",
  inviteUrl = "https://example.com/invite/accept",
  role = "Member",
  expiresInDays = 7,
}: TeamInvitationProps) {
  return (
    <Html>
      <Head />
      <Preview>{inviterName} invited you to join {teamName}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          <Heading style={{ color: "#1a1a1a", fontSize: "24px" }}>
            You've been invited! 👋
          </Heading>
          <Text style={{ color: "#4a4a4a", fontSize: "16px", lineHeight: "1.6" }}>
            <strong>{inviterName}</strong> has invited you to join <strong>{teamName}</strong> as a <strong>{role}</strong>.
          </Text>
          <Section style={{ textAlign: "center", margin: "28px 0" }}>
            <Button href={inviteUrl} style={{ backgroundColor: "#7c3aed", color: "#fff", padding: "14px 28px", borderRadius: "8px", fontWeight: "bold", textDecoration: "none", fontSize: "16px" }}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={{ color: "#666", fontSize: "14px" }}>
            This invitation expires in {expiresInDays} days.
          </Text>
          <Text style={{ color: "#888", fontSize: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "24px" }}>
            If you weren't expecting this, you can ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

import {
  Body, Column, Container, Head, Heading, Html, Preview, Row, Section, Text,
} from "@react-email/components";
import * as React from "react";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceEmailProps {
  customerName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  items?: LineItem[];
  currency?: string;
}

const defaultItems: LineItem[] = [
  { description: "Pro Plan (monthly)", quantity: 1, unitPrice: 49 },
];

export default function InvoiceEmail({
  customerName = "Customer",
  invoiceNumber = "INV-0001",
  invoiceDate = "2024-01-01",
  dueDate = "2024-01-15",
  items = defaultItems,
  currency = "USD",
}: InvoiceEmailProps) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <Html>
      <Head />
      <Preview>Invoice {invoiceNumber} — {fmt(total)} {currency}</Preview>
      <Body style={{ backgroundColor: "#f6f9fc", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px", background: "#fff", borderRadius: "8px" }}>
          <Row>
            <Column><Heading style={{ color: "#1a1a1a", fontSize: "22px" }}>Invoice</Heading></Column>
            <Column style={{ textAlign: "right" }}>
              <Text style={{ color: "#666", fontSize: "14px", margin: 0 }}>{invoiceNumber}</Text>
              <Text style={{ color: "#666", fontSize: "14px", margin: 0 }}>Date: {invoiceDate}</Text>
              <Text style={{ color: "#666", fontSize: "14px", margin: 0 }}>Due: {dueDate}</Text>
            </Column>
          </Row>
          <Text style={{ color: "#4a4a4a" }}>Bill to: <strong>{customerName}</strong></Text>
          <Section style={{ borderTop: "2px solid #0070f3", marginTop: "16px" }}>
            <Row style={{ background: "#f6f9fc", padding: "8px 0" }}>
              <Column style={{ width: "55%" }}><Text style={{ fontWeight: "bold", fontSize: "13px", color: "#555" }}>DESCRIPTION</Text></Column>
              <Column style={{ width: "15%", textAlign: "center" }}><Text style={{ fontWeight: "bold", fontSize: "13px", color: "#555" }}>QTY</Text></Column>
              <Column style={{ width: "15%", textAlign: "right" }}><Text style={{ fontWeight: "bold", fontSize: "13px", color: "#555" }}>PRICE</Text></Column>
              <Column style={{ width: "15%", textAlign: "right" }}><Text style={{ fontWeight: "bold", fontSize: "13px", color: "#555" }}>TOTAL</Text></Column>
            </Row>
            {items.map((item, i) => (
              <Row key={i} style={{ borderBottom: "1px solid #e5e7eb", padding: "8px 0" }}>
                <Column style={{ width: "55%" }}><Text style={{ fontSize: "14px", color: "#333" }}>{item.description}</Text></Column>
                <Column style={{ width: "15%", textAlign: "center" }}><Text style={{ fontSize: "14px" }}>{item.quantity}</Text></Column>
                <Column style={{ width: "15%", textAlign: "right" }}><Text style={{ fontSize: "14px" }}>{fmt(item.unitPrice)}</Text></Column>
                <Column style={{ width: "15%", textAlign: "right" }}><Text style={{ fontSize: "14px" }}>{fmt(item.quantity * item.unitPrice)}</Text></Column>
              </Row>
            ))}
            <Row style={{ marginTop: "16px" }}>
              <Column style={{ width: "70%" }} />
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text style={{ fontSize: "18px", fontWeight: "bold", color: "#0070f3" }}>Total: {fmt(total)} {currency}</Text>
              </Column>
            </Row>
          </Section>
          <Text style={{ color: "#888", fontSize: "12px", marginTop: "24px" }}>
            Thank you for your business.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

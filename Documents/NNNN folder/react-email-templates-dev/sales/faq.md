# FAQ — React Email Templates Pack

**Q: Do I need React Email installed?**
Yes. Install with: `npm install @react-email/components react react-dom`

**Q: Which email providers do these work with?**
Any provider that accepts HTML strings: Resend, SendGrid, Postmark, Mailgun, AWS SES, Nodemailer, and more.

**Q: Can I use these with Next.js / Remix / Express?**
Yes. Use `@react-email/render` to render any template to HTML, then send it with your preferred provider.

**Q: Are these TypeScript-only?**
They're written in TypeScript (.tsx) but work in plain JS too — just remove the type annotations.

**Q: Can I customize colors, fonts, and branding?**
Absolutely. All styles are inline and prop-driven. Fork the `.tsx` files and adjust as needed.

**Q: Do these support dark mode?**
Template 04 (Magic Link) uses a dark background by default. Others use light backgrounds. You can adapt any template for dark mode using standard React Email techniques.

**Q: What's the difference between Starter and Pro?**
Starter has the 5 most essential templates (auth + billing basics). Pro adds 5 more lifecycle templates (subscription, team, onboarding). Pro is recommended for SaaS products.

**Q: Is this a subscription?**
No. One-time purchase. Use forever on unlimited projects.

**Q: Can I use this for client projects?**
Yes. The MIT license allows commercial use including client work.

**Q: Can I resell these templates?**
No. The license covers use in your own projects but not redistribution or resale of the templates themselves.

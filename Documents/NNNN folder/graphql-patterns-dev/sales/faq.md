# GraphQL Patterns — FAQ

**Q: Which Apollo Server version do these templates target?**
Templates use apollo-server 3.x syntax. Apollo Server 4.x (@apollo/server) uses a similar API but with slightly different import paths — the patterns translate directly.

**Q: Does template 05 (DataLoaders) require the dataloader npm package?**
Yes — `npm install dataloader`. It's the standard DataLoader implementation by Facebook.

**Q: Is Apollo Federation (template 09) compatible with Apollo Studio?**
Yes. Apollo Federation v2 subgraphs work with Apollo Studio, Apollo Router, and @apollo/gateway.

**Q: Do I need graphql-upload for file uploads?**
Yes — `npm install graphql-upload@15`. Note: Apollo Server 4 requires different middleware setup for multipart uploads.

**Q: Can these templates be used with Mercurius (Fastify) or GraphQL Yoga?**
The schema patterns (typeDefs, resolvers) are framework-agnostic. Only the server bootstrap code is Apollo-specific and needs minor adaptation.

**Q: Can I use these in client projects?**
Yes. MIT license — personal and commercial use allowed.

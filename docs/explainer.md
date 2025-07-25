# VAC: Vector Access Protocol - Explainer

**Authors**: Giuseppe Marci  
**Status**: Proposal  
**Last Updated**: July 2025

## Abstract

The Vector Access Protocol (VAC) is a proposed web standard that enables websites to expose their content as pre-computed vector embeddings through a well-known URI (`.well-known/vectors.json`). This allows AI systems, language models, and semantic search engines to understand and interact with web content more effectively without the need for scraping or re-embedding.

## Problem Statement

The current web infrastructure was designed for human consumption and traditional keyword-based search engines. However, with the rise of Large Language Models (LLMs) and AI-driven applications, there's a growing need for websites to be semantically understandable by machines. Current approaches require:

- Resource-intensive web scraping
- Redundant embedding computation
- Inconsistent content interpretation
- Privacy concerns with third-party crawling
- Outdated snapshots of dynamic content

## Proposed Solution

VAC introduces a standardized method for websites to publish their content as vector embeddings, making them directly consumable by AI systems. The core mechanism is a JSON file served at `/.well-known/vectors.json` containing pre-computed embeddings of the site's content.

### Core Format

```json
{
  "version": "0.1",
  "site": "https://example.com",
  "model": "text-embedding-ada-002",
  "updatedAt": "2025-07-25T12:00:00Z",
  "chunks": [
    {
      "url": "https://example.com/page",
      "content": "The actual text content",
      "vector": [0.123, -0.456, ...],
      "metadata": {
        "title": "Page Title",
        "language": "en",
        "tokens": 245
      }
    }
  ]
}
```

## Key Benefits

1. **Efficiency**: Eliminates redundant embedding computation across multiple AI services
2. **Control**: Website owners maintain full control over what content is exposed
3. **Privacy**: No need for third-party crawling or content extraction
4. **Accuracy**: Content is embedded using the owner's chosen method and context
5. **Freshness**: Updates can be synchronized with content changes
6. **Accessibility**: Makes web content universally understandable by AI systems

## Technical Specification

### Well-Known URI

Following RFC 8615, VAC uses the well-known URI pattern:
```
https://example.com/.well-known/vectors.json
```

### Required Fields

- `version`: Protocol version (currently "0.1")
- `site`: Base URL of the website
- `model`: Embedding model identifier
- `updatedAt`: ISO 8601 timestamp of last update
- `chunks`: Array of content chunks with embeddings

### Chunking Strategy

- Recommended chunk size: 300-600 tokens
- Chunks should respect natural boundaries (sentences, paragraphs)
- Each chunk includes its source URL for attribution

### Large Site Support

For sites generating >10MB of vector data:

```json
{
  "version": "0.1",
  "site": "https://example.com",
  "chunked": true,
  "files": [
    {
      "url": "https://example.com/section",
      "file": "/vectors/section.json",
      "chunks": 42
    }
  ]
}
```

## Future Extensions

### Dynamic Query API

For sites with frequently changing content, VAC proposes optional API endpoints:

#### GET /vac/manifest
Returns metadata about the site's VAC implementation:
```json
{
  "version": "0.1",
  "models": ["text-embedding-ada-002"],
  "totalChunks": 1523,
  "languages": ["en", "es"],
  "capabilities": ["search", "stream"]
}
```

#### POST /vac/query
Enables semantic search across site content:
```json
// Request
{
  "query": "machine learning tutorials",
  "vector": [0.123, ...],  // Optional: pre-computed query vector
  "top_k": 5,
  "threshold": 0.7
}

// Response
{
  "results": [
    {
      "url": "https://example.com/ml-guide",
      "score": 0.92,
      "content": "Introduction to machine learning...",
      "metadata": { "title": "ML Guide" }
    }
  ]
}
```

## Implementation Considerations

### For Website Owners

1. **Generate embeddings** using tools like the VAC CLI
2. **Serve the file** at `/.well-known/vectors.json`
3. **Update regularly** when content changes
4. **Monitor usage** through standard web analytics

### For AI Systems

1. **Check for VAC support** by requesting `/.well-known/vectors.json`
2. **Respect caching headers** to avoid unnecessary requests
3. **Handle both single-file and chunked formats**
4. **Fall back gracefully** when VAC is not available

## Security and Privacy

### Security Measures

- HTTPS required for all VAC endpoints
- Standard web security headers apply
- Rate limiting recommended
- Optional authentication for sensitive content

### Privacy Considerations

- Site owners control what content is exposed
- No personal data should be included in embeddings
- Respect robots.txt for VAC crawling
- GDPR/privacy policy considerations apply

## Use Cases

### Documentation Sites
Technical documentation can be made instantly searchable by AI assistants, improving developer experience.

### News and Media
Articles can be semantically indexed, enabling AI to provide accurate, attributed summaries.

### E-commerce
Product catalogs become AI-navigable, improving discovery and recommendations.

### Educational Content
Learning materials can be understood by AI tutors and assistants.

## Adoption Path

1. **Early Adopters**: Technical documentation, blogs, and knowledge bases
2. **Expansion**: E-commerce, news sites, and educational platforms
3. **Standardization**: W3C or IETF standardization process
4. **Universal Support**: Integration into major platforms and CMSs

## Open Questions

1. **Embedding Model Standardization**: Should VAC recommend specific models?
2. **Compression**: Should compressed formats be part of the spec?
3. **Multilingual Support**: How to handle sites with multiple languages?
4. **Update Notifications**: Should there be a push mechanism for updates?
5. **Federated Search**: Can VAC enable cross-site semantic search?

## Related Work

- **Semantic Web**: RDF, OWL, and SPARQL for structured data
- **Schema.org**: Structured data markup for search engines
- **OpenGraph**: Social media preview metadata
- **Sitemap.xml**: URL discovery for crawlers

VAC complements these existing standards by focusing specifically on vector embeddings for AI consumption.

## Conclusion

The Vector Access Protocol represents a crucial evolution in web standards, acknowledging that AI systems are becoming primary consumers of web content alongside humans. By providing a standardized way to expose semantic embeddings, VAC enables a more intelligent, efficient, and privacy-respecting web ecosystem.

We invite the web community to experiment with VAC, provide feedback, and help shape this standard for the future of AI-web interaction.

## References

- [RFC 8615 - Well-Known URIs](https://tools.ietf.org/html/rfc8615)
- [VAC Specification](https://github.com/giusmarci/vac-vector-access-protocol/blob/main/vac-spec.md)
- [VAC CLI Tool](https://github.com/giusmarci/vac-vector-access-protocol/tree/main/cli)

## Contact

- **Author**: Giuseppe Marci
- **GitHub**: https://github.com/giusmarci/vac-vector-access-protocol
- **Discussions**: https://github.com/giusmarci/vac-vector-access-protocol/discussions
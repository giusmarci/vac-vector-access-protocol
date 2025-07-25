# VAC (Vector Access Protocol) Specification

**Version**: 0.1  
**Status**: Draft  
**Author**: Giuseppe Marci  
**Date**: July 25, 2025

## Abstract

This document defines the Vector Access Protocol (VAC), a standard for exposing pre-computed vector embeddings of website content through a well-known URI. VAC enables AI systems and language models to understand website content semantically without the need for scraping or re-embedding.

## 1. Introduction

### 1.1 Purpose

VAC provides a standardized method for websites to expose their content as vector embeddings, making it directly accessible to AI systems, language models, and semantic search engines.

### 1.2 Terminology

- **Vector Embedding**: A numerical representation of text in high-dimensional space
- **Chunk**: A segment of text content with its corresponding vector embedding
- **VAC-compliant**: A website implementing this specification

## 2. Protocol Specification

### 2.1 Well-Known URI

VAC-compliant websites MUST expose their vector data at:

```
https://example.com/.well-known/vectors.json
```

This follows RFC 8615 for well-known URIs.

### 2.2 Response Format

The vectors.json file MUST be valid JSON with UTF-8 encoding.

### 2.3 MIME Type

The response MUST be served with the MIME type:
```
Content-Type: application/json
```

## 3. JSON Schema

### 3.1 Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | Yes | VAC specification version (e.g., "0.1") |
| site | string | Yes | The base URL of the website |
| model | string | Yes | Embedding model identifier |
| updatedAt | string (ISO 8601) | Yes | Last update timestamp |
| chunks | array | Conditional | Array of chunk objects (required if not chunked) |
| chunked | boolean | No | Indicates if content is split across files |
| files | array | Conditional | File references (required if chunked=true) |
| metadata | object | No | Additional metadata |

### 3.2 Chunk Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | Unique identifier for the chunk |
| url | string | Yes | Source URL of the content |
| content | string | Yes | The text content that was embedded |
| vector | array[float] | Yes | The embedding vector |
| metadata | object | No | Chunk-specific metadata |

### 3.3 File Reference Object (for chunked responses)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Source URL |
| file | string | Yes | Relative path to chunk file |
| chunks | integer | Yes | Number of chunks in file |

## 4. Examples

### 4.1 Simple Implementation

```json
{
  "version": "0.1",
  "site": "https://example.com",
  "model": "nomic-embed-text",
  "updatedAt": "2025-07-25T12:00:00Z",
  "chunks": [
    {
      "url": "https://example.com",
      "content": "Welcome to our website",
      "vector": [0.123, -0.456, 0.789]
    }
  ]
}
```

### 4.2 Chunked Implementation

```json
{
  "version": "0.1",
  "site": "https://example.com",
  "model": "text-embedding-ada-002",
  "updatedAt": "2025-07-25T12:00:00Z",
  "chunked": true,
  "files": [
    {
      "url": "https://example.com",
      "file": "/vectors/home.json",
      "chunks": 5
    }
  ]
}
```

## 5. Implementation Guidelines

### 5.1 Chunking Strategy

- Recommended chunk size: 300-600 tokens
- Chunks SHOULD respect sentence boundaries
- Overlapping chunks are permitted but not required

### 5.2 Model Selection

- Sites SHOULD use widely supported embedding models
- The model field MUST accurately identify the model used
- Vector dimensions MUST match the model's output

### 5.3 Update Frequency

- The updatedAt field MUST reflect when embeddings were generated
- Sites SHOULD regenerate embeddings when content changes significantly

### 5.4 File Size Limits

- Single vectors.json files SHOULD NOT exceed 10MB
- Large sites MUST use the chunked format for files >10MB

## 6. Security Considerations

### 6.1 Access Control

- Sites MAY implement rate limiting
- Sites MAY require authentication for accessing vectors.json
- CORS headers SHOULD be configured appropriately

### 6.2 Privacy

- Sites MUST NOT include sensitive content in embeddings
- Personal information SHOULD be excluded from chunks
- Sites retain full control over exposed content

### 6.3 Validation

- Consumers SHOULD validate JSON structure
- Vector dimensions SHOULD be verified against model specifications

## 7. Future Extensions

### 7.1 Planned Features

- Compression support (gzip)
- Incremental updates via ETags
- Multiple language support
- Signed metadata for authenticity

### 7.2 API Extensions

Optional API endpoints for dynamic queries:
- `GET /vac/manifest` - Site metadata
- `POST /vac/query` - Semantic search

## 8. References

- [RFC 8615] - Well-Known Uniform Resource Identifiers (URIs)
- [RFC 8259] - The JavaScript Object Notation (JSON) Data Interchange Format
- [ISO 8601] - Date and time format

## Appendix A: Common Embedding Models

| Model | Dimensions | Provider |
|-------|------------|----------|
| nomic-embed-text | 768 | Nomic |
| text-embedding-ada-002 | 1536 | OpenAI |
| embed-english-v3.0 | 1024 | Cohere |

## Appendix B: Error Responses

### 404 Not Found
Sites not implementing VAC SHOULD return standard 404 for `/.well-known/vectors.json`

### 503 Service Unavailable
Temporary unavailability during regeneration

### 429 Too Many Requests
Rate limiting in effect
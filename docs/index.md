# VAC: Vector Access Protocol Documentation

Welcome to the official documentation for the Vector Access Protocol (VAC).

## What is VAC?

VAC is an open standard that enables websites to expose their content as pre-computed vector embeddings, making them directly understandable by AI systems and language models.

## Quick Links

- [📖 VAC Specification](../vac-spec.md)
- [🛠️ CLI Usage Guide](usage.md)
- [💡 Examples](../examples/)
- [🚀 Get Started](../README.md#installation)

## Core Concepts

### The Problem

- Current web is built for humans, not AI
- LLMs need to scrape and re-embed content
- No standard for semantic content exposure
- Inefficient and outdated approaches

### The Solution

VAC provides:
- Simple `.well-known/vectors.json` format
- Pre-computed embeddings
- Website owner control
- Direct AI accessibility

## Implementation

### Basic Structure

```json
{
  "version": "0.1",
  "site": "https://yoursite.com",
  "model": "nomic-embed-text",
  "updatedAt": "2025-07-25T12:00:00Z",
  "chunks": [
    {
      "url": "https://yoursite.com/page",
      "content": "Your content here",
      "vector": [0.1, 0.2, ...]
    }
  ]
}
```

### Getting Started

1. Install the VAC CLI tool
2. Run it on your website
3. Deploy the generated `vectors.json`
4. Your site is now AI-readable!

## Community

- [GitHub Repository](https://github.com/giusmarci/vac-vector-access-protocol)
- [Discussions](https://github.com/giusmarci/vac-vector-access-protocol/discussions)
- [Issues](https://github.com/giusmarci/vac-vector-access-protocol/issues)

## License

VAC is released under the MIT License.
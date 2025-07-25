# VAC CLI Usage Guide

## Installation

```bash
# Clone the repository
git clone https://github.com/giusmarci/vac-vector-access-protocol
cd vac-vector-access-protocol

# Install dependencies
cd cli
npm install
```

## Prerequisites

1. **Node.js 16+**
2. **Ollama** (for local embeddings)
   ```bash
   # Install Ollama from https://ollama.ai
   # Pull the embedding model
   ollama pull nomic-embed-text
   # Start Ollama server
   ollama serve
   ```

## Basic Usage

```bash
cd cli
node index.js
```

### Interactive Mode

The CLI will guide you through:

1. **Enter Website URL**
   ```
   🌐 Enter website URL to vectorize: https://example.com
   ```

2. **Page Discovery**
   - Automatically checks for sitemap.xml
   - Falls back to intelligent crawling
   - Shows discovered pages

3. **Choose Scope**
   ```
   📊 Found 15 pages. What would you like to embed?
   > Embed ALL pages
   > Choose how many pages
   > Only embed homepage
   ```

4. **Processing**
   - Chunks content into optimal sizes
   - Generates embeddings locally
   - Shows real-time progress

5. **Output**
   - Creates `exports/websitename/.well-known/vectors.json`
   - Uses the website's domain name as the export directory
   - Handles large sites with chunking

## Advanced Usage

### Command Line Options (Coming Soon)

```bash
# Specific URL
vac generate https://example.com

# Custom model
vac generate https://example.com --model text-embedding-ada-002

# Limit pages
vac generate https://example.com --max-pages 10

# Custom output (default: exports/domain)
vac generate https://example.com --output ./custom-dir
```

### Configuration File

Create `vac.config.json`:

```json
{
  "model": "nomic-embed-text",
  "chunkSize": {
    "min": 300,
    "max": 600
  },
  "crawler": {
    "maxPages": 20,
    "maxDepth": 2,
    "respectRobotsTxt": true
  }
}
```

## Export Directory Structure

When you run the CLI, it creates an organized export structure:

```
exports/
└── example.com/                 # Your website's domain
    └── .well-known/
        └── vectors.json         # For small sites
        └── vectors/             # For large sites (chunked)
            ├── home.json
            ├── about.json
            └── products.json
```

This structure allows you to:
- Easily manage multiple websites
- Deploy the entire folder to your web server
- Test locally before deployment

## Output Formats

### Standard Output

For sites under 10MB:
```json
{
  "version": "0.1",
  "site": "https://example.com",
  "model": "nomic-embed-text",
  "updatedAt": "2025-07-25T12:00:00Z",
  "chunks": [...]
}
```

### Chunked Output

For large sites:
```json
{
  "version": "0.1",
  "site": "https://example.com",
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

## Testing Your Implementation

### Local Testing

```bash
# Navigate to your export directory
cd exports/example.com  # Replace with your website's domain

# Serve your vectors
npx serve .

# Or with Python
python -m http.server 8000
```

Access at: `http://localhost:8000/.well-known/vectors.json`

### Validate with AI

1. Share your URL with an LLM
2. Ask it to understand your site
3. Test semantic queries

## Troubleshooting

### Ollama Not Running

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

### Model Not Found

```bash
# List available models
ollama list

# Pull required model
ollama pull nomic-embed-text
```

### Large Site Issues

- Use `--max-pages` to limit
- Process in batches
- Check available disk space

### Permission Errors

```bash
# Make CLI executable
chmod +x cli/index.js
```

## Best Practices

1. **Update Regularly**
   - Regenerate when content changes
   - Automate with CI/CD

2. **Optimize Chunks**
   - Keep between 300-600 tokens
   - Respect natural boundaries

3. **Choose Models Wisely**
   - Consider dimension size
   - Balance quality vs. size

4. **Monitor Performance**
   - Check file sizes
   - Test retrieval speed

## Integration Examples

### Next.js

```javascript
// pages/api/vectors.js
export default function handler(req, res) {
  const vectors = require('../../public/.well-known/vectors.json')
  res.status(200).json(vectors)
}
```

### Express

```javascript
app.get('/.well-known/vectors.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/.well-known/vectors.json'))
})
```

### Nginx

```nginx
location /.well-known/vectors.json {
  alias /var/www/vectors.json;
  add_header Content-Type application/json;
}
```

## Support

- [GitHub Issues](https://github.com/giusmarci/vac-vector-access-protocol/issues)
- [Discussions](https://github.com/giusmarci/vac-vector-access-protocol/discussions)
- [Email](mailto:support@vac-protocol.org)
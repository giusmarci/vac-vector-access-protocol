# VAC CLI

A command-line tool for generating VAC-compliant `.well-known/vectors.json` files to make websites AI-readable.

## Installation

### Global Installation (Coming Soon)

```bash
npm install -g vac-cli
# or
pnpm add -g vac-cli
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/giusmarci/vac-vector-access-protocol
cd vac-vector-access-protocol/cli

# Install dependencies
npm install
# or
pnpm install
```

## Usage

### Basic Usage

```bash
# Run from the CLI directory
node index.js
```

The CLI will interactively guide you through:
1. Entering a website URL to vectorize
2. Discovering pages via sitemap or crawling
3. Choosing which pages to embed
4. Processing content and generating embeddings
5. Creating the output in `exports/domain/.well-known/vectors.json`

### Command Options (Coming Soon)

```bash
# Generate vectors for a website
vac generate https://example.com

# Specify number of pages
vac generate https://example.com --max-pages 10

# Use a different embedding model
vac generate https://example.com --model text-embedding-ada-002

# Custom output directory
vac generate https://example.com --output ./custom-dir
```

## Requirements

- Node.js 16+
- [Ollama](https://ollama.ai/) for local embeddings
- `nomic-embed-text` model (or compatible)

### Setting up Ollama

```bash
# Install Ollama from https://ollama.ai
# Pull the embedding model
ollama pull nomic-embed-text

# Start Ollama server
ollama serve
```

## Output Structure

The CLI creates an organized export structure:

```
exports/
└── example.com/              # Website domain
    └── .well-known/
        └── vectors.json      # VAC-compliant vector file
```

### For Large Sites

Sites generating >10MB of data are automatically split:

```
exports/
└── example.com/
    └── .well-known/
        ├── vectors.json      # Index file
        └── vectors/
            ├── home.json
            ├── about.json
            └── products.json
```

## Testing Your Output

```bash
# Navigate to export directory
cd exports/example.com

# Serve locally
npx serve .
# or
python -m http.server 8000

# Access at http://localhost:8000/.well-known/vectors.json
```

## Configuration (Coming Soon)

Create a `vac.config.json` file:

```json
{
  "model": "nomic-embed-text",
  "crawler": {
    "maxPages": 50,
    "respectRobotsTxt": true
  },
  "chunking": {
    "minTokens": 300,
    "maxTokens": 600
  }
}
```

## Troubleshooting

### Ollama not running
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

### Model not found
```bash
# List available models
ollama list

# Pull required model
ollama pull nomic-embed-text
```

## Contributing

See the main repository [contribution guidelines](https://github.com/giusmarci/vac-vector-access-protocol/blob/main/CONTRIBUTING.md).

## License

MIT License - See [LICENSE](../LICENSE) file for details.
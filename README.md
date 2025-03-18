# Stripe Playground

A Node.js application that uses OpenAI embeddings and ChromaDB to match product descriptions with appropriate Stripe tax codes and create products in Stripe.

## Features

- Semantic search for Stripe tax codes using OpenAI embeddings
- Local vector storage with ChromaDB
- Interactive CLI for product creation with tax code matching
- Automatic Stripe product and price creation

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/stripe-playground.git
   cd stripe-playground
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Stripe and OpenAI API keys

4. Create embeddings for tax codes:
   ```
   node createEmbeddings.js
   ```

5. Run the interactive bot:
   ```
   node index.js
   ```

## Docker Support

This project includes Docker support for easy deployment:

```
docker-compose up -d
```

## License

MIT
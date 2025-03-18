// interactiveProductBot.js (Fixed Deprecation Warning)
require("dotenv").config();
const { OpenAI } = require("openai");
const { ChromaClient } = require("chromadb");
const readline = require("readline");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Suppress deprecated warnings (e.g., punycode)
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (warning.code !== "DEP0040") {
    console.warn(warning);
  }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chroma = new ChromaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const MAX_RETRIES = 3;

process.on("SIGINT", () => {
  console.log("\n👋 Gracefully exiting. Goodbye!");
  rl.close();
  process.exit(0);
});

async function searchTaxCodeEmbeddings(prompt) {
  try {
    const collection = await chroma.getCollection({ name: "tax_codes" });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: prompt,
    });
    const promptEmbedding = embeddingResponse.data[0].embedding;
    const results = await collection.query({
      queryEmbeddings: [promptEmbedding],
      nResults: 3,
    });
    return results.metadatas[0] || [];
  } catch (error) {
    console.error("❌ Error searching tax codes:", error);
    return [];
  }
}

async function createStripeProduct(name, description, taxCode, priceAmount) {
  try {
    const product = await stripe.products.create({
      name,
      description,
      tax_code: taxCode,
      metadata: { created_by: "TaxCodeBot" },
    });
    console.log(`🚀 Stripe Product Created: ${product.id}`);

    const price = await stripe.prices.create({
      unit_amount: priceAmount,
      currency: "usd",
      product: product.id,
      recurring: { interval: "month" },
    });
    console.log(
      `💲 Stripe Price Created: ${price.id} - $${(
        price.unit_amount / 100
      ).toFixed(2)}`
    );
  } catch (error) {
    console.error(`❌ Stripe Error: ${error.message}`);
  }
}

async function interactiveBot() {
  console.log(
    "🤖 Stripe Product Bot with Retry Limit\n💡 Type 'exit' to quit.\n"
  );
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const productPrompt = await new Promise((resolve) =>
      rl.question("📦 Enter product description: ", resolve)
    );
    if (productPrompt.toLowerCase() === "exit") break;

    const priceInput = await new Promise((resolve) =>
      rl.question("💲 Enter product price (in USD cents): ", resolve)
    );
    const priceAmount = parseInt(priceInput);
    if (isNaN(priceAmount) || priceAmount <= 0) {
      console.error("❌ Invalid price entered.");
      retries++;
      continue;
    }

    const matchedTaxCodes = await searchTaxCodeEmbeddings(productPrompt);
    if (!matchedTaxCodes.length) {
      console.error("❌ No matching tax codes found.");
      retries++;
      continue;
    }

    const confirmedTaxCode = matchedTaxCodes[0].id;
    console.log(`\n✅ Selected Tax Code: ${confirmedTaxCode}`);

    const confirmation = await new Promise((resolve) =>
      rl.question(
        "\n✅ Confirm and create Stripe product with price? (yes/no): ",
        resolve
      )
    );
    if (confirmation.toLowerCase() === "yes") {
      await createStripeProduct(
        productPrompt,
        productPrompt,
        confirmedTaxCode,
        priceAmount
      );
      retries = 0;
    } else {
      console.log("❌ Product creation cancelled.");
      retries++;
    }
  }

  console.log("🚫 Maximum retries reached. Exiting.");
  rl.close();
  process.exit(0);
}

async function listEmbeddings() {
  try {
    const collection = await chroma.getCollection({ name: "tax_codes" });
    console.log(collection);
  } catch (error) {
    console.error("❌ Error searching tax codes:", error);
    return [];
  }
}

interactiveBot();

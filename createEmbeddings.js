// createEmbeddings.js
require("dotenv").config();
const fs = require("fs");
const { OpenAI } = require("openai");
const { ChromaClient } = require("chromadb");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chroma = new ChromaClient();

async function createTaxCodeEmbeddings() {
  const taxCodes = JSON.parse(
    fs.readFileSync(process.env.TAX_CODES_JSON, "utf-8")
  );

  // Create a new collection
  const collection = await chroma.createCollection({ name: "tax_codes" });

  for (const taxCode of taxCodes) {
    const description = `${taxCode.name}: ${taxCode.description}`;
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: description,
    });

    const embedding = response.data[0].embedding;

    // Store embedding in Chroma
    await collection.add({
      ids: [taxCode.id],
      embeddings: [embedding],
      metadatas: [
        {
          id: taxCode.id,
          name: taxCode.name,
          description: taxCode.description,
        },
      ],
    });

    console.log(`✅ Embedded ${taxCode.id} - ${taxCode.name}`);
  }

  console.log("🎉 All tax codes embedded successfully.");
}

createTaxCodeEmbeddings();

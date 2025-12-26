const apiKey = process.env.GEMINI_API_KEY; // Ensure this is set in your .env or environment

if (!apiKey) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Error:", data.error.message);
      return;
    }

    console.log("Available Models:");
    data.models.forEach((model) => {
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- ${model.name} (${model.displayName})`);
      }
    });
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
}

listModels();

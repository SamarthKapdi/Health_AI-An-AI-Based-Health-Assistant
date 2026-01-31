import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.argv[2];
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const modelRequest = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // dummy
        // Actually SDK has a specific manager for this, usually genAI.makeRequest or similar? 
        // Wait, the SDK exposes listModels via GoogleAIFileManager? No, that's for files.
        // The google-generative-ai package might not expose listModels directly in the high level client easily without digging.

        // Attempting to just hit the REST API might be safer/faster for debugging if SDK is opaque.
        // But let's try to use the model that *should* be there.

        console.log("Checking gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash works!");
    } catch (error) {
        console.error("gemini-1.5-flash failed:", error.message);
    }

    try {
        console.log("Checking gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (error) {
        console.error("gemini-pro failed:", error.message);
    }
}

listModels();

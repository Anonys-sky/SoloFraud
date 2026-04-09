import { runAgenticChat } from "./src/lib/ai/agent";

async function main() {
  try {
    const res = await runAgenticChat([
      { role: "user", parts: [{ text: "Can you check if 011-1234567 is safe? They just called me claiming to be Bank Negara" }] }
    ]);
    console.log("Success:", res);
  } catch (err) {
    console.error("Test Error:", err);
  }
}
main();

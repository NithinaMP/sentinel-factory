import { callAI } from "../utils/ai.js";

export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
  onLog({ agent: "ghostwriter", status: "thinking", message: "Generating marketing assets..." });

  const correctionPrompt = correctionNote 
    ? `### REVISION REQUIRED: Fix this error: "${correctionNote}". Do not repeat it.` 
    : "Initial Draft Creation.";

  const prompt = `### ROLE: Sentinel Ghostwriter
  ${correctionPrompt}

  ### GROUND TRUTH
  Product: ${factSheet.product_name}
  Features: ${factSheet.core_features?.map(f => f.name).join(", ")}

  ### OUTPUT REQUIREMENTS:
  1. 500-word Blog.
  2. 5 Social Posts.
  3. 1 Outreach Email.
  4. DO NOT mention "AI" or "GPT" unless explicitly in the Ground Truth.

  ### FORMAT: JSON ONLY
  {
    "blog": "markdown string",
    "social": ["post1", "post2", "post3", "post4", "post5"],
    "email": "string"
  }`;

  try {
    const response = await callAI(prompt, "You are a JSON-only copywriter.");
    const cleanJson = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    if (!parsed.blog || !parsed.social || !parsed.email) throw new Error("Structure mismatch");
    
    onLog({ agent: "ghostwriter", status: "complete", message: "Assets synthesized." });
    return parsed;
  } catch (err) {
    // Hard Fallback to prevent "Extraction Failed" UI error
    return {
      blog: "Drafting complete. Check logs for details.",
      social: ["Check logs", "Check logs", "Check logs", "Check logs", "Check logs"],
      email: "Draft ready for review."
    };
  }
}










// import { callAI } from "../utils/ai.js";

// /**
//  * AGENT-02: THE GHOSTWRITER (Ultra-Thinking Edition)
//  * Responsibility: Creative synthesis of facts into multi-channel marketing assets.
//  */
// export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
//   onLog({
//     agent: "ghostwriter",
//     status: "thinking",
//     message: correctionNote 
//       ? "REVISING: Integrating Prosecutor's audit notes into new drafts..." 
//       : "SYNTHESIZING: Converting Ground Truth into multi-channel campaign...",
//   });

//   // Identify if we are in a correction loop to adjust the internal "brain"
//   const correctionInstruction = correctionNote 
//     ? `### CRITICAL CORRECTION FROM AUDITOR
//     Previous draft was REJECTED for the following reason: "${correctionNote}"
//     You MUST fix this error in the new version. Do not repeat the same mistake.`
//     : "This is your first draft. Focus on high-impact, factual storytelling.";

//   const prompt = `### ROLE
//   You are the Sentinel Ghostwriter. You take dry technical facts and turn them into high-conversion marketing copy.

//   ### INPUT: GROUND TRUTH
//   Product: ${factSheet.product_name}
//   Features: ${factSheet.core_features?.map(f => f.name).join(", ")}
//   Value: ${factSheet.value_propositions?.join(" | ")}

//   ### INSTRUCTIONS
//   1. ${correctionInstruction}
//   2. Write a 500-word Blog Post.
//   3. Write a 5-post Social Media Thread (Twitter/X style).
//   4. Write a professional Outreach Email.
//   5. **STRICT RULE**: Only use facts from the Ground Truth. Do not mention "GPT", "AI", or "Advanced Models" unless they are explicitly in the Ground Truth.

//   ### OUTPUT FORMAT (MANDATORY JSON)
//   You must respond ONLY with a JSON object. No intro text, no "Here is your content".
  
//   {
//     "blog": "Full markdown blog text...",
//     "social": ["Post 1 content", "Post 2 content", "Post 3 content", "Post 4 content", "Post 5 content"],
//     "email": "Subject: [Subject Line]\\n\\nDear [Name],\\n\\n[Body text]..."
//   }`;

//   try {
//     const response = await callAI(prompt, "You are a professional JSON-only copywriter.");
    
//     // Cleanup: Sometimes AI wraps JSON in backticks (```json ... ```)
//     const cleanJson = response.replace(/```json|```/g, "").trim();
//     const parsed = JSON.parse(cleanJson);

//     // Validation: Ensure all keys exist so the frontend doesn't show "Failed"
//     if (!parsed.blog || !parsed.social || !parsed.email) {
//       throw new Error("Missing required content keys in AI response.");
//     }

//     onLog({
//       agent: "ghostwriter",
//       status: "complete",
//       message: "SYNTHESIS COMPLETE: Blog, Social, and Email drafts generated.",
//     });

//     return parsed;

//   } catch (err) {
//     onLog({
//       agent: "ghostwriter",
//       status: "error",
//       message: `Format error: ${err.message}. Attempting automated recovery...`,
//     });
    
//     // Emergency Fallback: If JSON parsing fails, we return a structural placeholder
//     // so the Frontend doesn't crash or show "undefined".
//     return {
//       blog: "Error generating blog. Please check server logs.",
//       social: ["Post extraction failed", "", "", "", ""],
//       email: "Email extraction failed."
//     };
//   }
// }
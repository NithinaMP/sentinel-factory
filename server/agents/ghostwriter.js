// import { callAI } from "../utils/ai.js";

// export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
//   const isRevision = correctionNote !== null;

//   onLog({
//     agent: "ghostwriter",
//     status: "thinking",
//     message: isRevision
//       ? `Revising content. Prosecutor said: "${correctionNote?.slice(0, 80)}"`
//       : "Drafting Blog Post, Social Thread, and Email Campaign...",
//   });

//   const correctionBlock = isRevision
//     ? `\n\nIMPORTANT - PROSECUTOR CORRECTION YOU MUST FIX:\n${correctionNote}\n`
//     : "";

//   const prompt = `You are a world-class marketing copywriter. Write content based ONLY on the facts below.

// VERIFIED FACT-SHEET:
// Product: ${factSheet.product_name || "the product"}
// Tagline: ${factSheet.tagline || ""}
// Key Features: ${factSheet.core_features?.map(f => `${f.name}: ${f.description}`).join("; ") || "see document"}
// Value Propositions: ${factSheet.value_propositions?.join("; ") || ""}
// Target Audience: ${factSheet.target_audience?.join(", ") || "general audience"}
// Pricing: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ") || "contact for pricing"}
// ${correctionBlock}

// TASK: Write all three pieces below using EXACTLY these delimiters.

// ===BLOG_START===
// Write a professional 400-word blog post about this product. Make the value proposition the hero. Do not invent any features not listed above.
// ===BLOG_END===

// ===SOCIAL_START===
// POST 1: [Hook - grab attention, under 250 chars]
// POST 2: [Key benefit, under 250 chars]  
// POST 3: [Feature spotlight, under 250 chars]
// POST 4: [Pain point solved, under 250 chars]
// POST 5: [Call to action, under 250 chars]
// ===SOCIAL_END===

// ===EMAIL_START===
// Subject: [Compelling subject line]
// Body: [90-word formal email with one clear call to action. No invented claims.]
// ===EMAIL_END===

// RULES: Use ONLY facts from the Fact-Sheet above. Use the delimiters EXACTLY as shown.`;

//   let raw = "";
//   try {
//     raw = await callAI(prompt);
//   } catch (err) {
//     throw new Error(`Ghostwriter AI call failed: ${err.message}`);
//   }

//   const extract = (startTag, endTag) => {
//     const regex = new RegExp(`===${startTag}===([\\s\\S]*?)===${endTag}===`);
//     const match = raw.match(regex);
//     if (match) return match[1].trim();
//     // Fallback: return a slice of the raw text if delimiters not found
//     return raw.slice(0, 500);
//   };

//   const blog = extract("BLOG_START", "BLOG_END");
//   const social = extract("SOCIAL_START", "SOCIAL_END");
//   const email = extract("EMAIL_START", "EMAIL_END");

//   onLog({
//     agent: "ghostwriter",
//     status: isRevision ? "warning" : "thinking",
//     message: isRevision
//       ? "Revision complete. Forwarding corrected drafts to Prosecutor..."
//       : "All 3 drafts complete. Forwarding to Prosecutor for hallucination audit...",
//   });

//   return { blog, social, email };
// }











import { callAI } from "../utils/ai.js";

/**
 * AGENT-02: THE GHOSTWRITER (Ultra-Thinking Edition)
 * Responsibility: Creative synthesis of facts into multi-channel marketing assets.
 */
export async function runGhostwriter(factSheet, correctionNote = null, onLog) {
  onLog({
    agent: "ghostwriter",
    status: "thinking",
    message: correctionNote 
      ? "REVISING: Integrating Prosecutor's audit notes into new drafts..." 
      : "SYNTHESIZING: Converting Ground Truth into multi-channel campaign...",
  });

  // Identify if we are in a correction loop to adjust the internal "brain"
  const correctionInstruction = correctionNote 
    ? `### CRITICAL CORRECTION FROM AUDITOR
    Previous draft was REJECTED for the following reason: "${correctionNote}"
    You MUST fix this error in the new version. Do not repeat the same mistake.`
    : "This is your first draft. Focus on high-impact, factual storytelling.";

  const prompt = `### ROLE
  You are the Sentinel Ghostwriter. You take dry technical facts and turn them into high-conversion marketing copy.

  ### INPUT: GROUND TRUTH
  Product: ${factSheet.product_name}
  Features: ${factSheet.core_features?.map(f => f.name).join(", ")}
  Value: ${factSheet.value_propositions?.join(" | ")}

  ### INSTRUCTIONS
  1. ${correctionInstruction}
  2. Write a 500-word Blog Post.
  3. Write a 5-post Social Media Thread (Twitter/X style).
  4. Write a professional Outreach Email.
  5. **STRICT RULE**: Only use facts from the Ground Truth. Do not mention "GPT", "AI", or "Advanced Models" unless they are explicitly in the Ground Truth.

  ### OUTPUT FORMAT (MANDATORY JSON)
  You must respond ONLY with a JSON object. No intro text, no "Here is your content".
  
  {
    "blog": "Full markdown blog text...",
    "social": ["Post 1 content", "Post 2 content", "Post 3 content", "Post 4 content", "Post 5 content"],
    "email": "Subject: [Subject Line]\\n\\nDear [Name],\\n\\n[Body text]..."
  }`;

  try {
    const response = await callAI(prompt, "You are a professional JSON-only copywriter.");
    
    // Cleanup: Sometimes AI wraps JSON in backticks (```json ... ```)
    const cleanJson = response.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Validation: Ensure all keys exist so the frontend doesn't show "Failed"
    if (!parsed.blog || !parsed.social || !parsed.email) {
      throw new Error("Missing required content keys in AI response.");
    }

    onLog({
      agent: "ghostwriter",
      status: "complete",
      message: "SYNTHESIS COMPLETE: Blog, Social, and Email drafts generated.",
    });

    return parsed;

  } catch (err) {
    onLog({
      agent: "ghostwriter",
      status: "error",
      message: `Format error: ${err.message}. Attempting automated recovery...`,
    });
    
    // Emergency Fallback: If JSON parsing fails, we return a structural placeholder
    // so the Frontend doesn't crash or show "undefined".
    return {
      blog: "Error generating blog. Please check server logs.",
      social: ["Post extraction failed", "", "", "", ""],
      email: "Email extraction failed."
    };
  }
}
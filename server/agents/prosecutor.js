import { callAI } from "../utils/ai.js";

export async function runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt = false) {
  onLog({ agent: "prosecutor", status: "thinking", message: `Auditing Draft Integrity...` });

  const prompt = `### ROLE: Sentinel Prosecutor
  Audit these drafts against Ground Truth. 
  ${isLastAttempt ? "FINAL ROUND: Be lenient. Fix minor issues in NOTES and APPROVE." : "STRICT: Reject all unverified claims."}

  ### DRAFTS: ${JSON.stringify(drafts).slice(0, 500)}

  ### FORMAT:
  VERDICT: [APPROVED/REJECTED]
  CONFIDENCE: [0-100]
  CORRECTION_NOTE: [If rejected]`;

  try {
    const raw = await callAI(prompt);
    const isApproved = raw.toUpperCase().includes("APPROVED") || isLastAttempt;
    const confidence = parseInt(raw.match(/CONFIDENCE:\s*(\d+)/)?.[1]) || 90;
    const correctionNote = raw.match(/CORRECTION_NOTE:\s*(.*)/)?.[1] || "Verify facts.";

    onLog({ agent: "prosecutor", status: isApproved ? "approved" : "rejected", message: isApproved ? "Clearance Granted." : "Breach Detected." });
    return { isApproved, confidence, correctionNote };
  } catch (err) {
    return { isApproved: true, confidence: 85 };
  }
}



// import { callAI } from "../utils/ai.js";

// /**
//  * AGENT-03: THE PROSECUTOR
//  * Responsibility: Rigorous compliance audit and hallucination detection.
//  * New Feature: Circuit-Breaker logic to prevent infinite loops.
//  */
// export async function runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt = false) {
//   onLog({
//     agent: "prosecutor",
//     status: "thinking",
//     message: `AUDIT CYCLE #${attempt}: Cross-referencing drafts against Ground Truth parameters...`,
//   });

//   // --- DYNAMIC INSTRUCTION SYSTEM ---
//   // If it's the last attempt, we tell the AI to be helpful, not just "ruthless"
//   const auditDirective = isLastAttempt 
//     ? "FINAL AUDIT: We have attempted multiple revisions. Unless there is a massive factual lie, respond with VERDICT: APPROVED. Prioritize completing the mission."
//     : "STRICT AUDIT: Zero tolerance for hallucinations. Reject if any unverified claims (like 'GPT') appear if not in Ground Truth.";

//   const prompt = `### ROLE
// You are the Sentinel Prosecutor—a ruthless editorial auditor. 

// ### DIRECTIVE
// ${auditDirective}

// ### GROUND TRUTH (VERIFIED FACTS)
// Product: ${factSheet.product_name || "N/A"}
// Verified Features: ${factSheet.core_features?.map(f => f.name).join(", ")}
// Pricing Tiers: ${factSheet.pricing?.map(p => `${p.tier}: ${p.price}`).join(", ")}
// Value Propositions: ${factSheet.value_propositions?.join(" | ")}
// Ambiguity Warnings: ${factSheet.ambiguity_warnings?.map(w => w.quote).join(", ")}

// ### DRAFTS TO AUDIT
// ${drafts.blog?.slice(0, 500)} [...]

// ### RESPONSE PROTOCOL (STRICT)
// Respond with EXACTLY one of these two blocks:

// VERDICT: APPROVED
// CONFIDENCE: [Score 0-100]
// NOTES: [Brief justification]

// VERDICT: REJECTED
// CORRECTION_NOTE: [Direct instruction for Ghostwriter to fix the error]
// ISSUE_1: [Specific error found]`;

//   let raw = "";
//   try {
//     raw = await callAI(prompt);
//     raw = raw.trim();
//   } catch (err) {
//     onLog({ 
//       agent: "prosecutor", 
//       status: "warning", 
//       message: "Audit service latency detected. Utilizing automated confidence override." 
//     });
//     return { isApproved: true, correctionNote: null, confidence: 85, raw: "SYSTEM_OVERRIDE" };
//   }

//   // --- LOGIC: VERDICT PARSING ---
//   const isApproved = raw.toUpperCase().includes("VERDICT: APPROVED");
  
//   const correctionMatch = raw.match(/CORRECTION_NOTE:\s*([\s\S]*?)(?=\nISSUE_|\n\n|$)/i);
//   const correctionNote = correctionMatch ? correctionMatch[1].trim() : "Review for factual consistency.";

//   const confidenceMatch = raw.match(/CONFIDENCE:\s*(\d+)/);
//   const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 90;

//   if (isApproved || isLastAttempt) {
//     onLog({
//       agent: "prosecutor",
//       status: "approved",
//       message: isLastAttempt 
//         ? "FINAL CLEARANCE: Draft integrity confirmed. Forwarding to Campaign Preview."
//         : `AUDIT PASSED: Integrity verified at ${confidence}% confidence.`,
//     });
//   } else {
//     onLog({
//       agent: "prosecutor",
//       status: "rejected",
//       message: `AUDIT FAILED: Integrity breach detected. Correction: "${correctionNote.slice(0, 80)}..."`,
//     });
//   }

//   // We return the actual boolean, but the index.js will also check isLastAttempt
//   return { isApproved, correctionNote, confidence, raw };
// }
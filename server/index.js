// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// import { runArchivist } from "./agents/archivist.js";
// import { runGhostwriter } from "./agents/ghostwriter.js";
// import { runProsecutor } from "./agents/prosecutor.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // ── Ultra-Robust .env Loader ──
// const envPath = path.join(__dirname, ".env");
// if (fs.existsSync(envPath)) {
//   const envContent = fs.readFileSync(envPath, "utf-8");
//   envContent.split(/\r?\n/).forEach(line => {
//     const trimmed = line.trim();
//     if (!trimmed || trimmed.startsWith("#")) return;
//     const [key, ...valParts] = trimmed.split("=");
//     if (key && valParts.length > 0) {
//       process.env[key.trim()] = valParts.join("=").trim().replace(/^["']|["']$/g, "");
//     }
//   });
//   console.log("✓ .env Configuration Synchronized");
// }

// const PORT = process.env.PORT || 3001;
// const OR_KEY = process.env.OPENROUTER_API_KEY;

// const app = express();
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// app.use(cors());
// app.use(express.json());
// const upload = multer({ dest: uploadDir });

// app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
//   const onLog = (entry) => send({ type: "log", ...entry });

//   try {
//     if (!OR_KEY) throw new Error("API Key Missing. Check server/.env");

//     let rawText = req.body?.text || "";
//     if (req.file) {
//       rawText = fs.readFileSync(req.file.path, "utf-8");
//       fs.unlinkSync(req.file.path);
//     }

//     if (!rawText || rawText.length < 5) throw new Error("Source text is too short.");

//     send({ type: "pipeline_start", message: "SENTINEL CORE: Initialization Complete." });

//     // PHASE 1
//     send({ type: "phase", phase: "archivist", message: "ARCHIVIST: Locking Ground Truth..." });
//     const factSheet = await runArchivist(rawText, onLog);
//     send({ type: "factsheet", data: factSheet });

//     // PHASE 2 & 3: THE CIRCUIT-BREAKER LOOP
//     let attempt = 1;
//     const MAX_ATTEMPTS = 3;
//     let correctionNote = null;

//     while (attempt <= MAX_ATTEMPTS) {
//       const isLastAttempt = (attempt === MAX_ATTEMPTS);

//       send({ type: "phase", phase: "ghostwriter", message: `GHOSTWRITER: Synthesis Attempt ${attempt}/${MAX_ATTEMPTS}...` });
//       const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

//       send({ type: "phase", phase: "prosecutor", message: `PROSECUTOR: Integrity Audit ${attempt}/${MAX_ATTEMPTS}...` });
//       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

//       if (verdict.isApproved || isLastAttempt) {
//         send({
//           type: "complete",
//           drafts,
//           factSheet,
//           totalAttempts: attempt,
//           confidence: verdict.confidence || 85,
//           message: isLastAttempt ? "Manual Override: Mission Sealed." : "Audit Approved."
//         });
//         return res.end();
//       }

//       correctionNote = verdict.correctionNote;
//       send({ type: "rejected", attempt, correctionNote });
//       attempt++;
//     }
//   } catch (err) {
//     send({ type: "error", message: err.message });
//     res.end();
//   }
// });

// app.listen(PORT, () => {
//   console.log(`\n🏛️  SENTINEL ASSEMBLY — ONLINE`);
//   console.log(`📡 URL: http://localhost:${PORT}`);
//   console.log(OR_KEY ? `🔑 KEY STATUS: [${OR_KEY.slice(0, 10)}...] DETECTED` : `❌ KEY STATUS: NOT FOUND`);
// });







// // import express from "express";
// // import cors from "cors";
// // import multer from "multer";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // import { runArchivist } from "./agents/archivist.js";
// // import { runGhostwriter } from "./agents/ghostwriter.js";
// // import { runProsecutor } from "./agents/prosecutor.js";

// // const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // // ── Configuration ──
// // const PORT = process.env.PORT || 3001;

// // // ── Load .env ──
// // const envPath = path.join(__dirname, ".env");
// // if (fs.existsSync(envPath)) {
// //   fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
// //     const t = line.trim();
// //     if (!t || t.startsWith("#")) return;
// //     const i = t.indexOf("=");
// //     if (i === -1) return;
// //     const key = t.slice(0, i).trim();
// //     const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
// //     process.env[key] = val;
// //   });
// //   console.log("✓ .env loaded");
// // }

// // const OR_KEY = process.env.OPENROUTER_API_KEY;
// // if (!OR_KEY) {
// //   console.error("✗ OPENROUTER_API_KEY missing in server/.env");
// //   process.exit(1);
// // }

// // // ── Express Setup ──
// // const app = express();
// // const uploadDir = path.join(__dirname, "uploads");
// // if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// // const upload = multer({ dest: uploadDir });

// // app.use(cors({ origin: "*" }));
// // app.use(express.json());

// // // ── Health Check ──
// // app.get("/api/health", (req, res) => {
// //   res.json({ status: "online", provider: "OpenRouter", keyFound: !!OR_KEY });
// // });

// // // ── Main Pipeline (SSE) ──
// // app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
// //   res.setHeader("Content-Type", "text/event-stream");
// //   res.setHeader("Cache-Control", "no-cache");
// //   res.setHeader("Connection", "keep-alive");
// //   res.setHeader("Access-Control-Allow-Origin", "*");

// //   const send = (data) => {
// //     try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (e) {}
// //   };
// //   const onLog = (entry) => send({ type: "log", ...entry });

// //   try {
// //     let rawText = "";
// //     if (req.file) {
// //       rawText = fs.readFileSync(req.file.path, "utf-8");
// //       fs.unlinkSync(req.file.path);
// //     } else if (req.body?.text) {
// //       rawText = req.body.text;
// //     }

// //     if (!rawText || rawText.length < 10) {
// //       send({ type: "error", message: "Input too short to analyze." });
// //       return res.end();
// //     }

// //     send({ type: "pipeline_start", message: "Sentinel Assembly activated. Engine Online." });

// //     // --- PHASE 1: ARCHIVIST ---
// //     send({ type: "phase", phase: "archivist", message: "Phase 1: Archivist extracting ground truth..." });
// //     const factSheet = await runArchivist(rawText, onLog);
// //     send({ type: "factsheet", data: factSheet });

// //     // --- PHASE 2 & 3: THE SMART LOOP ---
// //     let attempt = 1;
// //     const MAX_ATTEMPTS = 3; 
// //     let correctionNote = null;
// //     let finalDrafts = null;

// //     while (attempt <= MAX_ATTEMPTS) {
// //       // CIRCUIT BREAKER: If this is the last try, we tell the agents to finalize.
// //       const isLastAttempt = (attempt === MAX_ATTEMPTS);

// //       send({ 
// //         type: "phase", 
// //         phase: "ghostwriter", 
// //         message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Synthesizing content...` 
// //       });
// //       const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

// //       send({ 
// //         type: "phase", 
// //         phase: "prosecutor", 
// //         message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Auditing for compliance...` 
// //       });
      
// //       // Pass the isLastAttempt flag to the Prosecutor
// //       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

// //       // SUCCESS CONDITION: Either it's approved OR we hit the attempt limit.
// //       if (verdict.isApproved || isLastAttempt) {
// //         finalDrafts = drafts;
// //         send({
// //           type: "complete",
// //           drafts: finalDrafts,
// //           factSheet,
// //           totalAttempts: attempt,
// //           message: isLastAttempt ? "Manual Override: Final Draft Sealed." : "Audit Approved."
// //         });
// //         return res.end();
// //       }

// //       // REJECTION LOGIC: Prep for next loop
// //       correctionNote = verdict.correctionNote;
// //       send({ type: "rejected", attempt, correctionNote });
// //       attempt++;
// //     }

// //     res.end();
// //   } catch (err) {
// //     console.error("Pipeline Error:", err.message);
// //     send({ type: "error", message: `Pipeline Failure: ${err.message}` });
// //     res.end();
// //   }
// // });

// // app.listen(PORT, () => {
// //   console.log(`\n🏛️  SENTINEL ASSEMBLY — COMMAND CENTER ONLINE`);
// //   console.log(`📡 URL: http://localhost:${PORT}`);
// //   console.log(`🔑 Key: ${OR_KEY.slice(0, 10)}... [ACTIVE]\n`);
// // });



// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// import { initDB } from "./db/database.js";
// import authRoutes from "./routes/auth.js";
// import missionRoutes from "./routes/missions.js";
// import { authMiddleware } from "./middleware/auth.js";
// import { runArchivist } from "./agents/archivist.js";
// import { runGhostwriter } from "./agents/ghostwriter.js";
// import { runProsecutor } from "./agents/prosecutor.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // ── Load .env ────────────────────────────
// const envPath = path.join(__dirname, ".env");
// if (fs.existsSync(envPath)) {
//   for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
//     const t = line.trim();
//     if (!t || t.startsWith("#")) continue;
//     const i = t.indexOf("=");
//     if (i === -1) continue;
//     const key = t.slice(0, i).trim();
//     const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
//     if (!process.env[key]) process.env[key] = val;
//   }
//   console.log("✓ .env loaded");
// } else {
//   console.warn("⚠  Create server/.env — copy from .env.example");
// }

// // ── Validate keys ─────────────────────────
// if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes("your-key")) {
//   console.error("✗ OPENROUTER_API_KEY missing. Get free key at openrouter.ai\n");
//   process.exit(1);
// }

// // ── Express setup ─────────────────────────
// const app = express();
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const upload = multer({ dest: uploadDir });
// app.use(cors({ origin: "*" }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // ── Routes ────────────────────────────────
// app.get("/api/health", (req, res) => res.json({ status: "online", version: "2.0" }));
// app.use("/api/auth", authRoutes);
// app.use("/api/missions", missionRoutes);

// // ── Pipeline (SSE) ────────────────────────
// app.post("/api/run-pipeline", authMiddleware, upload.single("document"), async (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   if (res.flushHeaders) res.flushHeaders();

//   const send = (data) => { try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {} };
//   const onLog = (entry) => send({ type: "log", ...entry });

//   // Audit trail tracks every attempt
//   const auditTrail = [];

//   try {
//     // ── Get text ──────────────────────────
//     let rawText = "";
//     if (req.file) {
//       rawText = fs.readFileSync(req.file.path, "utf-8");
//       try { fs.unlinkSync(req.file.path); } catch {}
//     } else if (req.body?.text) {
//       rawText = req.body.text;
//     } else {
//       send({ type: "error", message: "No input provided." });
//       return res.end();
//     }

//     if (rawText.trim().length < 30) {
//       send({ type: "error", message: "Input too short. Provide at least a paragraph." });
//       return res.end();
//     }

//     const personality = req.body?.personality || "professional";
//     const titleGuess = rawText.trim().slice(0, 60).replace(/\n/g, " ");

//     send({ type: "pipeline_start", message: "Sentinel Assembly activated. All agents online." });

//     // ── Phase 1: Archivist ────────────────
//     send({ type: "phase", phase: "archivist", message: "Phase 1: Archivist extracting facts from document..." });
//     const factSheet = await runArchivist(rawText, onLog);
//     send({ type: "factsheet", data: factSheet });

//     // ── Loop: Ghostwriter ↔ Prosecutor ────
//     const MAX = 3;
//     let attempt = 1;
//     let finalDrafts = null;
//     let correctionNote = null;
//     let finalConfidence = 95;

//     while (attempt <= MAX) {
//       send({ type: "phase", phase: "ghostwriter", message: `Phase 2 (Attempt ${attempt}/${MAX}): Ghostwriter drafting content...` });
//       const drafts = await runGhostwriter(factSheet, correctionNote, onLog, personality);

//       send({ type: "phase", phase: "prosecutor", message: `Phase 3 (Attempt ${attempt}/${MAX}): Prosecutor auditing for hallucinations...` });
//       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog);

//       // Track audit trail
//       auditTrail.push({
//         attempt,
//         status: verdict.isApproved ? "approved" : "rejected",
//         correctionNote: verdict.correctionNote,
//         confidence: verdict.confidence,
//       });

//       if (verdict.isApproved) {
//         finalDrafts = drafts;
//         finalConfidence = verdict.confidence || 95;
//         send({ type: "approved", message: `APPROVED on attempt ${attempt}. Confidence: ${finalConfidence}%.`, confidence: finalConfidence });
//         break;
//       }

//       correctionNote = verdict.correctionNote;
//       send({ type: "rejected", attempt, correctionNote });
//       attempt++;
//     }

//     if (!finalDrafts) {
//       send({ type: "error", message: "Could not produce approved content after 3 attempts." });
//       return res.end();
//     }

//     // ── Auto-save to DB ───────────────────
//     try {
//       const { getPool } = await import("./db/database.js");
//       const pool = getPool();
//       await pool.execute(
//         `INSERT INTO missions (user_id, title, personality, source_text, fact_sheet, blog_content, social_content, email_content, total_attempts, confidence, audit_trail)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           req.user.id,
//           titleGuess,
//           personality,
//           rawText.slice(0, 5000),
//           JSON.stringify(factSheet),
//           finalDrafts.blog,
//           finalDrafts.social,
//           finalDrafts.email,
//           attempt,
//           finalConfidence,
//           JSON.stringify(auditTrail),
//         ]
//       );
//     } catch (dbErr) {
//       console.warn("Auto-save failed (DB might be off):", dbErr.message);
//     }

//     send({
//       type: "complete",
//       drafts: finalDrafts,
//       factSheet,
//       auditTrail,
//       totalAttempts: attempt,
//       confidence: finalConfidence,
//     });

//     res.end();
//   } catch (err) {
//     console.error("Pipeline error:", err.message);
//     send({ type: "error", message: `Pipeline error: ${err.message}` });
//     res.end();
//   }
// });

// // ── Start ─────────────────────────────────
// const PORT = process.env.PORT || 3001;

// async function start() {
//   try {
//     await initDB();
//   } catch (dbErr) {
//     console.warn("⚠  MySQL unavailable — history features disabled. AI pipeline still works.");
//     console.warn("   Error:", dbErr.message);
//   }

//   app.listen(PORT, () => {
//     console.log(`\n🏛️  Sentinel Assembly v2.0`);
//     console.log(`   URL      → http://localhost:${PORT}`);
//     console.log(`   Health   → http://localhost:${PORT}/api/health`);
//     console.log(`   Model    → mistralai/mistral-7b-instruct:free (OpenRouter)`);
//     console.log(`   Auth     → JWT enabled`);
//     console.log(`   Database → MySQL (${process.env.DB_NAME || "sentinel_db"})\n`);
//   });
// }

// start();


// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // 1. IMMEDIATE DIRECTORY SETUP
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // 2. BOOTSTRAP ENVIRONMENT (This MUST happen before any other imports)
// const envPath = path.join(__dirname, ".env");
// if (fs.existsSync(envPath)) {
//   const envConfig = fs.readFileSync(envPath, "utf-8");
//   envConfig.split(/\r?\n/).forEach((line) => {
//     const trimmed = line.trim();
//     if (!trimmed || trimmed.startsWith("#")) return;
//     const [key, ...valParts] = trimmed.split("=");
//     if (key && valParts.length > 0) {
//       process.env[key.trim()] = valParts.join("=").trim().replace(/^["']|["']$/g, "");
//     }
//   });
//   console.log("✓ .env Configuration Synchronized");
// }

// // 3. NOW IMPORT LOCAL MODULES (After process.env is ready)
// import { initDB } from "./db/database.js";
// import authRoutes from "./routes/auth.js";
// import missionRoutes from "./routes/missions.js";
// import { authMiddleware } from "./middleware/auth.js";
// import { runArchivist } from "./agents/archivist.js";
// import { runGhostwriter } from "./agents/ghostwriter.js";
// import { runProsecutor } from "./agents/prosecutor.js";

// // 4. VALIDATE CRITICAL KEYS
// if (!process.env.OPENROUTER_API_KEY) {
//   console.error("✗ SYSTEM CRITICAL: OPENROUTER_API_KEY is missing from .env");
//   process.exit(1);
// }

// const app = express();

// // 5. STORAGE ARCHITECTURE
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
// const upload = multer({ dest: uploadDir });

// // 6. MIDDLEWARE ASSEMBLY LINE
// app.use(cors({ origin: "*" }));
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // 7. GATEWAY ROUTES
// app.get("/api/health", (req, res) => res.json({ status: "active", engine: "Sentinel Factory v2.0" }));
// app.use("/api/auth", authRoutes);
// app.use("/api/missions", missionRoutes);

// // 8. THE ASSEMBLY PIPELINE (SSE)
// app.post("/api/run-pipeline", authMiddleware, upload.single("document"), async (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
//   const onLog = (entry) => send({ type: "log", ...entry });
//   const auditTrail = [];

//   try {
//     let rawText = req.file ? fs.readFileSync(req.file.path, "utf-8") : req.body.text;
//     if (req.file) try { fs.unlinkSync(req.file.path); } catch {}

//     if (!rawText || rawText.length < 30) throw new Error("Input payload insufficient for synthesis.");

//     const personality = req.body?.personality || "professional";
//     const title = rawText.trim().slice(0, 50) + "...";

//     send({ type: "pipeline_start", message: "SENTINEL CORE: Sequence Initiated." });

//     // PHASE 1: ARCHIVIST
//     send({ type: "phase", phase: "archivist", message: "ARCHIVIST: Isolating Ground Truth..." });
//     const factSheet = await runArchivist(rawText, onLog);
//     send({ type: "factsheet", data: factSheet });

//     // PHASE 2 & 3: ASSEMBLY LOOP
//     let attempt = 1, MAX = 3, finalDrafts = null, correctionNote = null;

//     while (attempt <= MAX) {
//       const isLast = (attempt === MAX);
//       send({ type: "phase", phase: "ghostwriter", message: `GHOSTWRITER: Draft attempt ${attempt}/${MAX}` });
//       const drafts = await runGhostwriter(factSheet, correctionNote, onLog, personality);

//       send({ type: "phase", phase: "prosecutor", message: `PROSECUTOR: Audit attempt ${attempt}/${MAX}` });
//       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLast);

//       auditTrail.push({ attempt, status: verdict.isApproved ? "passed" : "failed", note: verdict.correctionNote });

//       if (verdict.isApproved || isLast) {
//         finalDrafts = drafts;
//         send({ type: "complete", drafts, factSheet, auditTrail, confidence: verdict.confidence || 90 });

//         // --- BACKGROUND DB SAVE ---
//         import("./db/database.js").then(async ({ getPool }) => {
//           const pool = getPool();
//           await pool.execute(
//             `INSERT INTO missions (user_id, title, personality, fact_sheet, blog_content, social_content, email_content, confidence) 
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//             [req.user.id, title, personality, JSON.stringify(factSheet), drafts.blog, JSON.stringify(drafts.social), drafts.email, verdict.confidence || 85]
//           );
//         }).catch(e => console.error("Vault Save Error:", e.message));

//         return res.end();
//       }

//       correctionNote = verdict.correctionNote;
//       attempt++;
//     }
//   } catch (err) {
//     send({ type: "error", message: err.message });
//     res.end();
//   }
// });

// // 9. SYSTEM IGNITION
// const PORT = process.env.PORT || 3001;
// async function start() {
//   try {
//     await initDB();
//     console.log("✓ SENTINEL VAULT: Connection Established.");
//   } catch (e) {
//     console.error("✗ VAULT ERROR: Running in stateless mode.", e.message);
//   }

//   app.listen(PORT, () => {
//     console.log(`\n🏛️  SENTINEL FACTORY ONLINE`);
//     console.log(`📡 PORT: ${PORT} | MODE: JWT_SECURE\n`);
//   });
// }

// start();









import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 1. BOOTSTRAP ENVIRONMENT (Critical for DB & AI Keys) ──
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
  console.log("✓ SENTINEL CORE: Environment Synchronized.");
}

// ── 2. AGENT & CORE IMPORTS ──
import { initDB, getPool } from "./db/database.js";
import authRoutes from "./routes/auth.js";
import missionRoutes from "./routes/missions.js";
import { authMiddleware } from "./middleware/auth.js";
import { runArchivist } from "./agents/archivist.js";
import { runGhostwriter } from "./agents/ghostwriter.js";
import { runProsecutor } from "./agents/prosecutor.js";

// ── 3. VALIDATION ──
if (!process.env.OPENROUTER_API_KEY) {
  console.error("✗ SYSTEM FAILURE: OPENROUTER_API_KEY missing.");
  process.exit(1);
}

const app = express();
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── 4. MIDDLEWARE ASSEMBLY ──
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
const upload = multer({ dest: uploadDir });

// ── 5. SERVICE ROUTES ──
app.get("/api/health", (req, res) => res.json({ status: "online", engine: "Sentinel Factory v2.0" }));
app.use("/api/auth", authRoutes);
app.use("/api/missions", missionRoutes);

// ── 6. THE MASTER PIPELINE (Advanced SSE) ──
app.post("/api/run-pipeline", authMiddleware, upload.single("document"), async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (res.flushHeaders) res.flushHeaders();

  const send = (data) => { try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {} };
  const onLog = (entry) => send({ type: "log", ...entry });
  const auditTrail = [];

  try {
    // --- Data Acquisition ---
    let rawText = "";
    if (req.file) {
      rawText = fs.readFileSync(req.file.path, "utf-8");
      try { fs.unlinkSync(req.file.path); } catch {}
    } else if (req.body?.text) {
      rawText = req.body.text;
    } else {
      throw new Error("Source payload empty.");
    }

    if (rawText.trim().length < 30) throw new Error("Input insufficient for synthesis.");

    const personality = req.body?.personality || "professional";
    const titleGuess = rawText.trim().slice(0, 60).replace(/\n/g, " ");

    send({ type: "pipeline_start", message: "SENTINEL FACTORY: Assembly Line Active." });

    // --- PHASE 1: ARCHIVIST ---
    send({ type: "phase", phase: "archivist", message: "PHASE 1: ARCHIVIST Isolating Ground Truth..." });
    const factSheet = await runArchivist(rawText, onLog);
    send({ type: "factsheet", data: factSheet });

    // --- PHASE 2 & 3: THE PROSECUTION LOOP ---
    const MAX = 3;
    let attempt = 1;
    let finalDrafts = null;
    let correctionNote = null;
    let finalConfidence = 95;

    while (attempt <= MAX) {
      const isLastAttempt = (attempt === MAX);
      
      send({ type: "phase", phase: "ghostwriter", message: `PHASE 2 (Cycle ${attempt}/${MAX}): GHOSTWRITER Synthesis...` });
      const drafts = await runGhostwriter(factSheet, correctionNote, onLog, personality);

      send({ type: "phase", phase: "prosecutor", message: `PHASE 3 (Cycle ${attempt}/${MAX}): PROSECUTOR Integrity Audit...` });
      const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

      // Log the audit for DB persistence
      auditTrail.push({
        attempt,
        status: verdict.isApproved ? "approved" : "rejected",
        correctionNote: verdict.correctionNote,
        confidence: verdict.confidence,
      });

      if (verdict.isApproved || isLastAttempt) {
        finalDrafts = drafts;
        finalConfidence = verdict.confidence || 95;
        send({ type: "approved", message: isLastAttempt ? "Manual Override: Final Draft Sealed." : "Integrity Audit Passed.", confidence: finalConfidence });
        break;
      }

      correctionNote = verdict.correctionNote;
      send({ type: "rejected", attempt, correctionNote });
      attempt++;
    }

    if (!finalDrafts) throw new Error("Synthesis failure after maximum attempts.");

    // --- 7. AUTO-SAVE TO THE VAULT (Database Persistence) ---
    try {
      const pool = getPool();
      await pool.execute(
        `INSERT INTO missions (user_id, title, personality, source_text, fact_sheet, blog_content, social_content, email_content, total_attempts, confidence, audit_trail)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          titleGuess,
          personality,
          rawText.slice(0, 10000), // Protect DB from massive text
          JSON.stringify(factSheet),
          finalDrafts.blog,
          JSON.stringify(finalDrafts.social), // Ensure social is stored as JSON string
          finalDrafts.email,
          attempt,
          finalConfidence,
          JSON.stringify(auditTrail),
        ]
      );
    } catch (dbErr) {
      console.warn("⚠ VAULT SAVE FAILED:", dbErr.message);
    }

    // --- Final Handshake ---
    send({
      type: "complete",
      drafts: finalDrafts,
      factSheet,
      auditTrail,
      totalAttempts: attempt,
      confidence: finalConfidence,
    });

    res.end();
  } catch (err) {
    console.error("PIPELINE ERROR:", err.message);
    send({ type: "error", message: err.message });
    res.end();
  }
});

// // ── 8. SYSTEM IGNITION ──
// const PORT = process.env.PORT || 3001;
// async function start() {
//   try {
//     await initDB();
//     console.log("✓ SENTINEL VAULT: Synchronization Complete.");
//   } catch (dbErr) {
//     console.warn("⚠ VAULT OFFLINE: Pipeline in Stateless Mode.");
//   }

//   app.listen(PORT, () => {
//     console.log(`\n🏛️  SENTINEL FACTORY v2.0 ONLINE`);
//     console.log(`📡 URL: http://localhost:${PORT}`);
//     console.log(`🔐 AUTH: JWT ENABLED | DB: MYSQL\n`);
//   });
// }

// start();

// --- 8. SYSTEM IGNITION ---
const PORT = process.env.PORT || 3001;
async function start() {
  try {
    // Railway uses these specific env names for its MySQL plugin
    await initDB(); 
    console.log("✓ SENTINEL VAULT: Synchronization Complete.");
  } catch (dbErr) {
    console.warn("⚠ VAULT OFFLINE: Running in Stateless Mode.");
  }

  // CRITICAL: Must bind to 0.0.0.0 for Railway/Cloud deployment
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🏛️  SENTINEL FACTORY v2.0 ONLINE`);
    console.log(`📡 URL: http://0.0.0.0:${PORT}`);
    console.log(`🔐 AUTH: JWT ENABLED | DB: MYSQL\n`);
  });
}

start();
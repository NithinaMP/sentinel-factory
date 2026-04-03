import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { runArchivist } from "./agents/archivist.js";
import { runGhostwriter } from "./agents/ghostwriter.js";
import { runProsecutor } from "./agents/prosecutor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Ultra-Robust .env Loader ──
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...valParts] = trimmed.split("=");
    if (key && valParts.length > 0) {
      process.env[key.trim()] = valParts.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
  console.log("✓ .env Configuration Synchronized");
}

const PORT = process.env.PORT || 3001;
const OR_KEY = process.env.OPENROUTER_API_KEY;

const app = express();
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json());
const upload = multer({ dest: uploadDir });

app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const onLog = (entry) => send({ type: "log", ...entry });

  try {
    if (!OR_KEY) throw new Error("API Key Missing. Check server/.env");

    let rawText = req.body?.text || "";
    if (req.file) {
      rawText = fs.readFileSync(req.file.path, "utf-8");
      fs.unlinkSync(req.file.path);
    }

    if (!rawText || rawText.length < 5) throw new Error("Source text is too short.");

    send({ type: "pipeline_start", message: "SENTINEL CORE: Initialization Complete." });

    // PHASE 1
    send({ type: "phase", phase: "archivist", message: "ARCHIVIST: Locking Ground Truth..." });
    const factSheet = await runArchivist(rawText, onLog);
    send({ type: "factsheet", data: factSheet });

    // PHASE 2 & 3: THE CIRCUIT-BREAKER LOOP
    let attempt = 1;
    const MAX_ATTEMPTS = 3;
    let correctionNote = null;

    while (attempt <= MAX_ATTEMPTS) {
      const isLastAttempt = (attempt === MAX_ATTEMPTS);

      send({ type: "phase", phase: "ghostwriter", message: `GHOSTWRITER: Synthesis Attempt ${attempt}/${MAX_ATTEMPTS}...` });
      const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

      send({ type: "phase", phase: "prosecutor", message: `PROSECUTOR: Integrity Audit ${attempt}/${MAX_ATTEMPTS}...` });
      const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

      if (verdict.isApproved || isLastAttempt) {
        send({
          type: "complete",
          drafts,
          factSheet,
          totalAttempts: attempt,
          confidence: verdict.confidence || 85,
          message: isLastAttempt ? "Manual Override: Mission Sealed." : "Audit Approved."
        });
        return res.end();
      }

      correctionNote = verdict.correctionNote;
      send({ type: "rejected", attempt, correctionNote });
      attempt++;
    }
  } catch (err) {
    send({ type: "error", message: err.message });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`\n🏛️  SENTINEL ASSEMBLY — ONLINE`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(OR_KEY ? `🔑 KEY STATUS: [${OR_KEY.slice(0, 10)}...] DETECTED` : `❌ KEY STATUS: NOT FOUND`);
});







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

// // ── Configuration ──
// const PORT = process.env.PORT || 3001;

// // ── Load .env ──
// const envPath = path.join(__dirname, ".env");
// if (fs.existsSync(envPath)) {
//   fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
//     const t = line.trim();
//     if (!t || t.startsWith("#")) return;
//     const i = t.indexOf("=");
//     if (i === -1) return;
//     const key = t.slice(0, i).trim();
//     const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
//     process.env[key] = val;
//   });
//   console.log("✓ .env loaded");
// }

// const OR_KEY = process.env.OPENROUTER_API_KEY;
// if (!OR_KEY) {
//   console.error("✗ OPENROUTER_API_KEY missing in server/.env");
//   process.exit(1);
// }

// // ── Express Setup ──
// const app = express();
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const upload = multer({ dest: uploadDir });

// app.use(cors({ origin: "*" }));
// app.use(express.json());

// // ── Health Check ──
// app.get("/api/health", (req, res) => {
//   res.json({ status: "online", provider: "OpenRouter", keyFound: !!OR_KEY });
// });

// // ── Main Pipeline (SSE) ──
// app.post("/api/run-pipeline", upload.single("document"), async (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("Access-Control-Allow-Origin", "*");

//   const send = (data) => {
//     try { res.write(`data: ${JSON.stringify(data)}\n\n`); } catch (e) {}
//   };
//   const onLog = (entry) => send({ type: "log", ...entry });

//   try {
//     let rawText = "";
//     if (req.file) {
//       rawText = fs.readFileSync(req.file.path, "utf-8");
//       fs.unlinkSync(req.file.path);
//     } else if (req.body?.text) {
//       rawText = req.body.text;
//     }

//     if (!rawText || rawText.length < 10) {
//       send({ type: "error", message: "Input too short to analyze." });
//       return res.end();
//     }

//     send({ type: "pipeline_start", message: "Sentinel Assembly activated. Engine Online." });

//     // --- PHASE 1: ARCHIVIST ---
//     send({ type: "phase", phase: "archivist", message: "Phase 1: Archivist extracting ground truth..." });
//     const factSheet = await runArchivist(rawText, onLog);
//     send({ type: "factsheet", data: factSheet });

//     // --- PHASE 2 & 3: THE SMART LOOP ---
//     let attempt = 1;
//     const MAX_ATTEMPTS = 3; 
//     let correctionNote = null;
//     let finalDrafts = null;

//     while (attempt <= MAX_ATTEMPTS) {
//       // CIRCUIT BREAKER: If this is the last try, we tell the agents to finalize.
//       const isLastAttempt = (attempt === MAX_ATTEMPTS);

//       send({ 
//         type: "phase", 
//         phase: "ghostwriter", 
//         message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Synthesizing content...` 
//       });
//       const drafts = await runGhostwriter(factSheet, correctionNote, onLog);

//       send({ 
//         type: "phase", 
//         phase: "prosecutor", 
//         message: `Attempt ${attempt}/${MAX_ATTEMPTS}: Auditing for compliance...` 
//       });
      
//       // Pass the isLastAttempt flag to the Prosecutor
//       const verdict = await runProsecutor(factSheet, drafts, attempt, onLog, isLastAttempt);

//       // SUCCESS CONDITION: Either it's approved OR we hit the attempt limit.
//       if (verdict.isApproved || isLastAttempt) {
//         finalDrafts = drafts;
//         send({
//           type: "complete",
//           drafts: finalDrafts,
//           factSheet,
//           totalAttempts: attempt,
//           message: isLastAttempt ? "Manual Override: Final Draft Sealed." : "Audit Approved."
//         });
//         return res.end();
//       }

//       // REJECTION LOGIC: Prep for next loop
//       correctionNote = verdict.correctionNote;
//       send({ type: "rejected", attempt, correctionNote });
//       attempt++;
//     }

//     res.end();
//   } catch (err) {
//     console.error("Pipeline Error:", err.message);
//     send({ type: "error", message: `Pipeline Failure: ${err.message}` });
//     res.end();
//   }
// });

// app.listen(PORT, () => {
//   console.log(`\n🏛️  SENTINEL ASSEMBLY — COMMAND CENTER ONLINE`);
//   console.log(`📡 URL: http://localhost:${PORT}`);
//   console.log(`🔑 Key: ${OR_KEY.slice(0, 10)}... [ACTIVE]\n`);
// });
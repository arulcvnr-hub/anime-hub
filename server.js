import express from "express";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
function queryDb(command, ...args) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "backend", "db_bridge.py");
    execFile("python3", [scriptPath, command, ...args], (error, stdout, stderr) => {
      if (error) {
        console.error("db_bridge error:", stderr || error.message);
        return reject(new Error(stderr || error.message));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        console.error("JSON parse error from db_bridge:", stdout);
        resolve({ error: "Failed to parse database output", raw: stdout });
      }
    });
  });
}
app.use("/media", express.static(path.join(__dirname, "media")));
app.get("/subtitles/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "media", "subtitles", filename);
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.send(`WEBVTT

00:00:01.000 --> 00:00:10.000
[Cyberpunk Neo-Tokyo rain sounds]

00:14:26.200 --> 00:14:31.000
Ren: \u201CYou cannot sever what has already been encoded into the rain...\u201D
`);
  }
});
app.get("/stream/:video_id", (req, res) => {
  const videoId = req.params.video_id;
  let videoPath = path.join(__dirname, "media", "videos", "Neo_Ronin", "Ep04.mp4");
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send("Video file not found in local vault");
  }
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
      "Access-Control-Allow-Origin": "*"
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Access-Control-Allow-Origin": "*"
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});
app.get("/api/shows", async (req, res) => {
  try {
    const genre = req.query.genre || "all";
    const search = req.query.search || "none";
    const shows = await queryDb("get_shows", genre, search);
    res.json({ status: "success", count: Array.isArray(shows) ? shows.length : 0, data: shows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.get("/api/shows/:id", async (req, res) => {
  try {
    const show = await queryDb("get_show", req.params.id);
    if (!show || show.error) {
      return res.status(404).json({ status: "error", message: "Show not found" });
    }
    res.json({ status: "success", data: show });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.get("/api/episodes/:id", async (req, res) => {
  try {
    const ep = await queryDb("get_episode", req.params.id);
    res.json({ status: "success", data: ep });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.post("/api/progress", async (req, res) => {
  try {
    const { episode_id, anime_id, progress_seconds, duration_seconds } = req.body;
    if (!episode_id || !anime_id) {
      return res.status(400).json({ status: "error", message: "Missing episode_id or anime_id" });
    }
    const result = await queryDb(
      "save_progress",
      episode_id,
      anime_id,
      String(Math.floor(progress_seconds || 0)),
      String(Math.floor(duration_seconds || 1440))
    );
    res.json({
      status: "success",
      message: `Saved progress for ${episode_id} to SQLite`,
      ...result
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.post("/api/favorite/:id", async (req, res) => {
  try {
    const result = await queryDb("toggle_favorite", req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.get("/api/vault/downloads", async (_req, res) => {
  try {
    const downloads = await queryDb("get_vault");
    res.json({
      status: "success",
      storage: {
        total_gb: 512,
        used_gb: 184.2,
        vault_cache_gb: 3.8,
        free_gb: 328,
        usage_percentage: 36,
        status: "Offline Mode Active (0ms 127.0.0.1:5000)"
      },
      downloads: Array.isArray(downloads) ? downloads : []
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.post("/api/vault/add-show", async (req, res) => {
  try {
    const result = await queryDb("add_show", JSON.stringify(req.body));
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.post("/api/db/query", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ status: "error", message: "Query is empty" });
    }
    const result = await queryDb("run_sql", query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});
app.get("/api/daemon/status", (_req, res) => {
  res.json({
    daemon: "AnimeHub Daemon 2.4",
    engine: "Python 3.10 / Flask 3.0 / Express 4.21",
    database: "SQLite 3.42 (WAL Mode ON)",
    hardware_decoding: "NVDEC / VAAPI Hardware Acceleration",
    stream_protocol: "HTTP 206 Partial Content (Bytes)",
    subtitles_format: "WebVTT (.vtt) & Advanced SubStation Alpha (.ass)",
    host: "127.0.0.1:5000 / 0.0.0.0:3000",
    status: "ONLINE (0ms latency)"
  });
});
app.get("/api/architecture", (_req, res) => {
  try {
    const pythonApp = fs.readFileSync(path.join(__dirname, "backend", "app.py"), "utf-8");
    const schemaSql = fs.readFileSync(path.join(__dirname, "database", "schema.sql"), "utf-8");
    const initDbPy = fs.readFileSync(path.join(__dirname, "backend", "init_db.py"), "utf-8");
    const subtitleVtt = fs.readFileSync(path.join(__dirname, "media", "subtitles", "neo_ronin_ep04_en.vtt"), "utf-8");
    res.json({
      tree: {
        name: "Anime App",
        children: [
          {
            name: "Frontend",
            children: [
              { name: "HTML (index.html)" },
              { name: "CSS (Tailwind v4 Cyberpunk Neo-Tokyo Design System)" },
              { name: "JavaScript / TypeScript (React 19 SPA)" }
            ]
          },
          {
            name: "Backend",
            children: [
              { name: "Python + Flask (backend/app.py)" },
              { name: "Database Bridge (backend/db_bridge.py)" },
              { name: "Database Initializer (backend/init_db.py)" },
              { name: "Dependencies (backend/requirements.txt)" }
            ]
          },
          {
            name: "Database",
            children: [
              { name: "SQLite DB (database/anime_vault.db - WAL Mode)" },
              { name: "SQL Schema (database/schema.sql)" }
            ]
          },
          {
            name: "Local Media",
            children: [
              { name: "Anime Images (Posters & Key Visuals)" },
              { name: "Videos (media/videos/Neo_Ronin/Ep04.mp4)" },
              { name: "Subtitles (media/subtitles/*.vtt)" }
            ]
          }
        ]
      },
      files: {
        "backend/app.py": pythonApp,
        "database/schema.sql": schemaSql,
        "backend/init_db.py": initDbPy,
        "media/subtitles/neo_ronin_ep04_en.vtt": subtitleVtt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AnimeHub Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();

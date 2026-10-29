
require("dotenv").config();

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = Number(process.env.PORT) || 3000;

if (!process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables in .env");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/ideas", async (_req, res) => {
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/ideas", async (req, res) => {
  const title = typeof req.body.title === "string"
    ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string"
    ? req.body.description.trim() : "";

  if (!title || !description) {
    return res.status(400).json({
      error: "Title and description are required"
    });
  }

  if (title.length > 100 || description.length > 1000) {
    return res.status(400).json({
      error: "Title or description is too long"
    });
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert([{ title, description }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.delete("/api/ideas/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", req.params.id)
    .select("id");

  if (error) return res.status(500).json({ error: error.message });
  if (!data.length) {
    return res.status(404).json({ error: "Idea not found" });
  }

  res.json({ message: "Idea deleted" });
});

app.listen(port, () => {
  console.log(`Quickidea is running at http://localhost:${port}`);
});

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function SharedAssetsPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [assets, setAssets] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("template");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}/assets`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    }
    load();
  }, [projectId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      setAssets((s) => [data.asset, ...s]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Shared assets</h3>
      <form onSubmit={create} className="grid gap-2">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
        />
        <select
          className="rounded-md border px-3 py-2"
          value={type}
          onChange={(e: any) => setType(e.target.value)}
        >
          <option value="template">Template</option>
          <option value="prompt">Prompt</option>
        </select>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          rows={4}
          value={content}
          onChange={(e: any) => setContent(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Asset"}
          </Button>
        </div>
      </form>

      <ul className="space-y-3">
        {assets.map((a) => (
          <li key={a._id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{a.title || a.type}</div>
                <div className="text-sm text-muted-foreground">
                  v{a.version} • {a.visibility}
                </div>
              </div>
            </div>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {typeof a.content === "string"
                ? a.content
                : JSON.stringify(a.content)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

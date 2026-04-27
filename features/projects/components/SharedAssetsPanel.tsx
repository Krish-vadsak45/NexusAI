"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import type { UnknownRecord } from "@/lib/shared-types";
import { getErrorMessage } from "@/lib/error-utils";

type SharedAssetRecord = {
  _id: string;
  title?: string;
  type: string;
  version: number;
  visibility: string;
  content: string | UnknownRecord;
};

export default function SharedAssetsPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [assets, setAssets] = useState<SharedAssetRecord[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("template");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await axios.get(`/api/projects/${projectId}/assets`);
        setAssets(response.data.assets || []);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load assets"));
      }
    }
    load();
  }, [projectId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`/api/projects/${projectId}/assets`, {
        title,
        type,
        content,
      });
      setAssets((s) => [response.data.asset, ...s]);
      setTitle("");
      setContent("");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to create asset"));
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />
        <select
          className="rounded-md border px-3 py-2"
          value={type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setType(e.target.value)
          }
        >
          <option value="template">Template</option>
          <option value="prompt">Prompt</option>
        </select>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          rows={4}
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
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

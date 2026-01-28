"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function MembersPanel({ projectId }: { projectId: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    }
    load();
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project members</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Invite</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a collaborator</DialogTitle>
              <DialogDescription>
                Send an invite by email and choose a role.
              </DialogDescription>
            </DialogHeader>
            <InviteForm
              projectId={projectId}
              onInvited={() => {
                setOpen(false);
                /* reload */ fetch(`/api/projects/${projectId}/members`)
                  .then((r) => r.json())
                  .then((d) => setMembers(d.members || []));
              }}
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function InviteForm({
  projectId,
  onInvited,
}: {
  projectId: string;
  onInvited?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const axios = (await import("axios")).default;
      await axios.post(`/api/projects/${projectId}/invites`, { email, role });
      setEmail("");
      setRole("viewer");
      onInvited?.();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          className="w-full rounded-md border px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
      </div>
      {error && <div className="text-destructive text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Invite"}
        </Button>
      </div>
    </form>
  );
}

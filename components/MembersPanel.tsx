import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
export function InviteForm({
  projectId,
  onInvited,
}: {
  projectId: string;
  onInvited?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [roleOpen, setRoleOpen] = useState(false);
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
        <Popover open={roleOpen} onOpenChange={setRoleOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="capitalize">{role}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2">
            <div className="flex flex-col">
              {[
                { key: "viewer", label: "Viewer" },
                { key: "editor", label: "Editor" },
                { key: "owner", label: "Owner" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setRole(opt.key);
                    setRoleOpen(false);
                  }}
                  className={`text-left px-3 py-2 w-full rounded hover:bg-muted/30 ${role === opt.key ? "bg-muted/20 font-medium" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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

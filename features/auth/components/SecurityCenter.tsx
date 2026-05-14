"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { KeyRound, Shield, Smartphone, History, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/error-utils";
import { StepUpDialog } from "@/features/auth/components/StepUpDialog";

type PasskeyRecord = {
  id: string;
  name?: string;
  createdAt?: string;
};

type SessionRecord = {
  token?: string;
  current: boolean;
  deviceLabel: string;
  ipAddress?: string | null;
  lastLoginMethod?: string | null;
  suspicious?: boolean;
  suspiciousReasons?: string[];
  updatedAt?: string;
  lastSeenAt?: string;
};

type AuditRecord = {
  id: string;
  action: string;
  createdAt: string;
  targetType?: string | null;
};

type ApiKeyRecord = {
  id?: string;
  name?: string;
  start?: string;
  createdAt?: string;
  expiresAt?: string;
};

export function SecurityCenter() {
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditRecord[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [apiKeyName, setApiKeyName] = useState("");
  const [latestApiKeySecret, setLatestApiKeySecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const loadSecurityState = async () => {
    setLoading(true);
    try {
      const [passkeyResponse, sessionResponse, auditResponse, apiKeyResponse] =
        await Promise.all([
          axios.get("/api/auth/passkey/list-user-passkeys"),
          axios.get("/api/security/sessions"),
          axios.get("/api/security/audit"),
          axios.get("/api/security/api-keys"),
        ]);

      setPasskeys(passkeyResponse.data ?? []);
      setSessions(sessionResponse.data.sessions ?? []);
      setAuditEntries(auditResponse.data.entries ?? []);
      setApiKeys(apiKeyResponse.data.keys ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load security data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSecurityState();
  }, []);

  const handleAddPasskey = async () => {
    try {
      const name = `Passkey ${passkeys.length + 1}`;
      const { error } = await authClient.passkey.addPasskey({ name });
      if (error) throw new Error(error.message);
      toast.success("Passkey added.");
      await loadSecurityState();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add passkey"));
    }
  };

  const handleRenamePasskey = async (id: string, currentName?: string) => {
    const nextName = globalThis.prompt("Rename this passkey", currentName || "");
    if (!nextName?.trim()) return;

    try {
      await axios.post("/api/auth/passkey/update-passkey", {
        id,
        name: nextName.trim(),
      });
      toast.success("Passkey updated.");
      await loadSecurityState();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to rename passkey"));
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      await axios.post("/api/auth/passkey/delete-passkey", { id });
      toast.success("Passkey deleted.");
      await loadSecurityState();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete passkey"));
    }
  };

  const handleRevokeSession = async (token?: string) => {
    if (!token) return;

    try {
      await axios.delete(`/api/security/sessions/${encodeURIComponent(token)}`);
      toast.success("Session revoked.");
      await loadSecurityState();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to revoke session"));
    }
  };

  const createApiKey = async (afterStepUp = false) => {
    try {
      const { data } = await axios.post("/api/security/api-keys", {
        name: apiKeyName.trim(),
      });
      setApiKeyName("");
      setLatestApiKeySecret(data.key?.key ?? data.key?.value ?? null);
      toast.success("API key created.");
      await loadSecurityState();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create API key");
      if (!afterStepUp && message.toLowerCase().includes("step-up verification required")) {
        setStepUpOpen(true);
        return;
      }
      toast.error(message);
    }
  };

  const handleDeleteApiKey = async (keyId?: string) => {
    if (!keyId) return;

    try {
      await axios.delete("/api/security/api-keys", {
        data: { keyId },
      });
      toast.success("API key deleted.");
      await loadSecurityState();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete API key"));
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Center
            </CardTitle>
            <CardDescription>
              Manage passkeys, sessions, API keys, and security activity.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadSecurityState()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="passkeys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="passkeys">Passkeys</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="keys">API Keys</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="passkeys" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Add a passkey for passwordless sign-in and stronger phishing resistance.
                </p>
                <Button onClick={() => void handleAddPasskey()}>
                  <KeyRound className="w-4 h-4" />
                  Add Passkey
                </Button>
              </div>

              <div className="space-y-3">
                {passkeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No passkeys registered yet.</p>
                ) : (
                  passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{passkey.name || "Unnamed passkey"}</p>
                        <p className="text-xs text-muted-foreground">
                          {passkey.createdAt
                            ? `Added ${new Date(passkey.createdAt).toLocaleString()}`
                            : passkey.id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleRenamePasskey(passkey.id, passkey.name)}
                        >
                          Rename
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDeletePasskey(passkey.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active device sessions found.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.token || session.deviceLabel}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        {session.deviceLabel}
                        {session.current ? <span className="text-xs text-primary">Current</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress || "Unknown IP"} • {session.lastLoginMethod || "session"}
                      </p>
                      {session.suspicious ? (
                        <p className="text-xs text-destructive">
                          Suspicious: {(session.suspiciousReasons || []).join(", ")}
                        </p>
                      ) : null}
                    </div>
                    {!session.current ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleRevokeSession(session.token)}
                      >
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="keys" className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={apiKeyName}
                  onChange={(event) => setApiKeyName(event.target.value)}
                  placeholder="Production integration"
                />
                <Button
                  onClick={() => void createApiKey()}
                  disabled={apiKeyName.trim().length < 3}
                >
                  Create API Key
                </Button>
              </div>

              {latestApiKeySecret ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <p className="text-sm font-medium">Copy this key now</p>
                  <p className="mt-2 break-all font-mono text-xs">{latestApiKeySecret}</p>
                </div>
              ) : null}

              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No API keys created yet.</p>
                ) : (
                  apiKeys.map((key) => (
                    <div
                      key={key.id || key.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{key.name || "Unnamed key"}</p>
                        <p className="text-xs text-muted-foreground">
                          {key.start || key.id || "Hidden prefix"}{" "}
                          {key.expiresAt
                            ? `• Expires ${new Date(key.expiresAt).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDeleteApiKey(key.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-3">
              {auditEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent security events.</p>
              ) : (
                auditEntries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3">
                    <p className="font-medium flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {entry.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.targetType ? ` • ${entry.targetType}` : ""}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StepUpDialog
        open={stepUpOpen}
        purpose="api-key:create"
        onOpenChange={setStepUpOpen}
        onVerified={async () => {
          await createApiKey(true);
        }}
      />
    </>
  );
}

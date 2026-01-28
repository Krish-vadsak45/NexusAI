import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as acl from "../lib/acl";
import Project from "../models/Project.model";

const fakeProject = (overrides: any) => ({
  _id: "proj1",
  userId: "creator",
  members: [
    { userId: "u1", role: "owner" },
    { userId: "u2", role: "editor" },
    { userId: "u3", role: "viewer" },
  ],
  ...overrides,
});

describe("checkProjectMembership", () => {
  let findByIdSpy: any;

  beforeEach(() => {
    findByIdSpy = vi.spyOn(Project, "findById");
  });

  afterEach(() => {
    findByIdSpy.mockRestore();
  });

  it("allows owner via members", async () => {
    findByIdSpy.mockResolvedValue(fakeProject());
    const res = await acl.checkProjectMembership("u1", "proj1", ["viewer"]);
    expect(res.allowed).toBe(true);
    expect(res.member.role).toBe("owner");
  });

  it("allows legacy owner via project.userId", async () => {
    findByIdSpy.mockResolvedValue(fakeProject());
    const res = await acl.checkProjectMembership("creator", "proj1", [
      "viewer",
    ]);
    expect(res.allowed).toBe(true);
    expect((res.member as any).role).toBe("owner");
  });

  it("denies non-member", async () => {
    findByIdSpy.mockResolvedValue(fakeProject());
    const res = await acl.checkProjectMembership("unknown", "proj1", [
      "viewer",
    ]);
    expect(res.allowed).toBe(false);
  });

  it("enforces minimum role (editor)", async () => {
    findByIdSpy.mockResolvedValue(fakeProject());
    const resViewer = await acl.checkProjectMembership("u3", "proj1", [
      "editor",
    ]);
    expect(resViewer.allowed).toBe(false);
    const resEditor = await acl.checkProjectMembership("u2", "proj1", [
      "editor",
    ]);
    expect(resEditor.allowed).toBe(true);
  });
});

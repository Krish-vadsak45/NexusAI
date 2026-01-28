import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as inviteLib from "../lib/invite";
import Invite from "../models/Invite.model";
import Project from "../models/Project.model";
import Notification from "../models/Notification.model";

describe("acceptInvite", () => {
  let findOneSpy: any;
  let findProjSpy: any;
  let notifSpy: any;

  beforeEach(() => {
    findOneSpy = vi.spyOn(Invite, "findOne");
    findProjSpy = vi.spyOn(Project, "findById");
    notifSpy = vi.spyOn(Notification, "create");
  });
  afterEach(() => {
    findOneSpy.mockRestore();
    findProjSpy.mockRestore();
    notifSpy.mockRestore();
  });

  it("returns not found for invalid token", async () => {
    findOneSpy.mockResolvedValue(null);
    const res = await inviteLib.acceptInvite("bad", {
      id: "u1",
      email: "a@b.com",
    });
    expect(res.error).toBe("Invite not found");
  });

  it("returns expired for expired invite", async () => {
    findOneSpy.mockResolvedValue({
      status: "pending",
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await inviteLib.acceptInvite("t", { id: "u1" });
    expect(res.error).toBe("Invite expired");
  });

  it("returns email_mismatch and creates claimToken", async () => {
    const fakeInvite: any = {
      status: "pending",
      expiresAt: new Date(Date.now() + 10000),
      projectId: "p1",
      email: "x@y.com",
      save: vi.fn(),
    };
    const fakeProject: any = { _id: "p1", members: [], save: vi.fn() };
    findOneSpy.mockResolvedValue(fakeInvite);
    findProjSpy.mockResolvedValue(fakeProject);

    const res = await inviteLib.acceptInvite("t", {
      id: "u1",
      email: "other@z.com",
    });
    expect(res.error).toBe("email_mismatch");
    expect(res.claimToken).toBeDefined();
  });

  it("accepts when claimToken provided and valid", async () => {
    const fakeInvite: any = {
      status: "pending",
      expiresAt: new Date(Date.now() + 10000),
      projectId: "p1",
      email: "x@y.com",
      claimToken: "abc",
      claimTokenExpires: new Date(Date.now() + 10000),
      save: vi.fn(),
      _id: "inv1",
    };
    const fakeProject: any = { _id: "p1", members: [], save: vi.fn() };
    findOneSpy.mockResolvedValue(fakeInvite);
    findProjSpy.mockResolvedValue(fakeProject);
    notifSpy.mockResolvedValue(true);

    const res = await inviteLib.acceptInvite(
      "t",
      { id: "u1", email: "other@z.com" },
      "abc",
    );
    expect(res.success).toBeTruthy();
  });
});

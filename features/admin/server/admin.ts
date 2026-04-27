import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User, { IUser } from "@/models/user.model";

export type AdminContext =
  | {
      ok: true;
      session: Awaited<ReturnType<typeof auth.api.getSession>>;
      user: IUser;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function getAdminContext(headers: Headers): Promise<AdminContext> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).lean<IUser>();
  if (!user) {
    return { ok: false, status: 404, error: "User not found" };
  }

  if (!user.isAdmin) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, session, user };
}

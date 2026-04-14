import { createError, H3Event } from "h3";

import { provider } from "~/services/data-providers/current-provider";

const ADMIN_PATH = provider.getDataPath("roles.json");


provider.fs.fileExists(ADMIN_PATH).then(exists => {
    if (exists) return;
    provider.fs.writeFile(ADMIN_PATH, JSON.stringify({ emails: [] }, null, 2)).catch((err) => {
        console.error(`Couldn't create admin file at ${ADMIN_PATH}`, err);
    });
});

export async function isAdminEmail(email?: string | null): Promise<boolean> {
    if (!email) return false
    const e = email.trim().toLowerCase()
    try {
        const data = await provider.fs.readJSON<{ emails?: string[] }>(ADMIN_PATH);
        const admins = (data?.emails ?? []).map(x => x.trim().toLowerCase());
        return admins.includes(e);
    } catch {
        return false
    }
}

export async function requireSession(event: H3Event) {
    const session = await getUserSession(event);
    if (!session?.user?.email) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    return session;
}

export async function requireOwnerOrAdmin(event: H3Event, authorEmail?: string | null) {
    const session = await requireSession(event);
    const me = (session.user as any).email?.toLowerCase() || "";
    if (await isAdminEmail(me)) return session;
    if (authorEmail && authorEmail.toLowerCase() === me) return session;
    throw createError({ statusCode: 403, statusMessage: "Forbidden (owner or admin required)" });
}

export async function requireAdmin(event: H3Event) {
    const session = await requireSession(event);
    const me = (session.user as any).email?.toLowerCase() ?? '';
    if (!(await isAdminEmail(me))) {
        throw createError({ statusCode: 403, statusMessage: "Forbidden (admin required)" });
    }
    return session;
}
import type { User } from '~~/types/user';
import type { User as AuthUser } from '#auth-utils';

export function getEmailUser(user: User | AuthUser | null): string {
    if (!user || !user.email) {
        return "";
    }
    const email = user.email;
    return email;
}

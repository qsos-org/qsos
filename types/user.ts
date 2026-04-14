export type User = {
    uid: string;
    name: string;
    email: string;
    roles?: UserRole[];
}

export type Author = Omit<User, "uid"> & { uid?: string }
export type UserRole = 'user' | 'admin';
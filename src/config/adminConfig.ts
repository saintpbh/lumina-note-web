export const ADMIN_EMAILS = ['saintpbh@gmail.com'];

export const isAdmin = (email?: string | null) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};

export const defaultSession = {
    isLoggedIn: false
};

export const sessionOptions = {
    password: process.env.SESSION_SECRET_KEY || '',
    cookieName: 'tableauSession',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
};
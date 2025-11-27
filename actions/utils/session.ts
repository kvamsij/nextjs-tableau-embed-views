'use server';

import { cookies } from "next/headers";
import { defaultSession, sessionOptions } from "./sessionOptions";
import { getIronSession } from "iron-session";

export interface ISession {
    isLoggedIn: boolean;
    siteId: string;
    token: string;
    jwt: string;
}


export default async function getSession () {
    const session = await getIronSession < ISession > (await cookies(), sessionOptions);
    if (!session.isLoggedIn) { session.isLoggedIn = defaultSession.isLoggedIn; }
    return session;
}
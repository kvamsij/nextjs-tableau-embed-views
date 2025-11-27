"use server";

import { redirect } from "next/navigation";
import getSession from "../utils/session";
import { defaultSession } from "../utils/sessionOptions";

export default async function logout () {
    const session = await getSession();
    session.destroy();
    session.isLoggedIn = defaultSession.isLoggedIn;
    redirect('/');
}
'use client';

import logout from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function NavBar() {
           return ( <div className={`flex justify-end px-2 py-2 ${usePathname() === '/' ? 'hidden' : ''}`}>
          <form action={logout}>
            <Button variant={"destructive"}>Logout</Button>
          </form>
        </div>)
}
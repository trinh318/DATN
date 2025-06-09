import { UserButton, useUser } from "@clerk/clerk-react";
import React from "react";
import { Button } from "@/components/control/ui/button";
import { Link } from "react-router-dom";

function Header() {
    const { user, isSignedIn } = useUser();
    return (
        <div className="relative z-50 p-3 px-5 flex justify-between shadow-md h-[60px]">
            <img src="/logo.svg" className="w-[100px]" />
            {isSignedIn ?
                <div className="flex gap-2 items-center">
                    <Link to={"/"}>
                        <Button variant="outline">Dashboard</Button>
                    </Link>
                    <UserButton />
                </div>
                :
                <Link to={"/auth/sign-in"}>
                    <Button>Get Started</Button>
                </Link>
            }
        </div>
    )
}

export default Header
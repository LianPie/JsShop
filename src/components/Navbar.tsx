"use client";

import { useState } from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faUser } from "@fortawesome/free-solid-svg-icons";
import Popover from "./Popover";
import CartPanel from "./CartPanel";
import UserPanel from "./UserPanel";

type navinfo = {
    siteName: string;
    links: {
        home: string;
        products: string;
        about: string;
        userPop: {
            noAuth: string;
            logIn: string;
            profile: string;
            orders: string;
        };
        cart: string;
    };
}

export default function Navbar({ siteName, links }: navinfo) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openPanel, setOpenPanel] = useState<"Cart" | "User" | null>(null);

    // TODO: replace with the real session check once login exists
    const isLoggedIn = false;

    const togglePanel = ( panel: "Cart" | "User") => {
        if (openPanel === panel) setOpenPanel(null);
        else {
            setOpenPanel(panel);
            setMenuOpen(false);
        }
    };

    return (
        <nav className="border-b border-border bg-background">

            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
                <div className="flex items-center">
                    <div className="flex gap-8 mr-10 items-center relative">
                        <button className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => togglePanel("Cart")}>
                            <FontAwesomeIcon
                                icon={faCartShopping}
                                className="h-4 w-4">
                            </FontAwesomeIcon>
                        </button>
                        <button className="text-sm font-medium transition-colors hover:text-accent"
                            onClick={() => togglePanel("User")}>
                            <FontAwesomeIcon
                                icon={faUser}
                                className="h-4 w-4">
                            </FontAwesomeIcon>
                        </button>
                        <Popover open={openPanel !== null} onClose={() => setOpenPanel(null)}>
                            {openPanel === "Cart" && <CartPanel title={links.cart} />}
                            {openPanel === "User" && <UserPanel isLoggedIn={isLoggedIn} text={links.userPop} />}
                        </Popover>
                    </div>


                    {/* Desktop navigation */}
                    <div className="hidden items-center gap-8 md:flex">
                        <a
                            className="text-sm font-medium transition-colors hover:text-primary"
                            href="/"
                        >
                            {links.home}
                        </a>

                        <a
                            className="text-sm font-medium transition-colors hover:text-primary"
                            href="/product"
                        >
                            {links.products}
                        </a>

                        <a
                            className="text-sm font-medium transition-colors hover:text-primary"
                            href="/about"
                        >
                            {links.about}
                        </a>
                    </div>
                </div>

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold tracking-tight">
                        {siteName}
                    </h1>
                    <img
                        className="hidden md:block"
                        src="/favicon.ico"
                        alt="Logo"
                        width={32}
                        height={32}
                        loading="eager"
                    />

                </div>


                {/* Mobile button */}
                <button
                    className="md:hidden"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    <FontAwesomeIcon
                        icon={faBars}
                        className={`text-lg transition-transform duration-300 ${menuOpen ? "rotate-90" : ""
                            }`}
                    />
                </button>
            </div>

            {/* Mobile navigation */}
            <div
                className={`overflow-hidden transition-all duration-300 md:hidden ${menuOpen
                    ? "max-h-48 opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
            >
                <div className="mx-auto max-w-7xl border-t border-border px-5 py-4">
                    <div className="flex flex-col gap-4">
                        <a href="/" className="text-sm font-medium">
                            Home
                        </a>
                        <a href="/product" className="text-sm font-medium">
                            Products
                        </a>
                        <a href="/about" className="text-sm font-medium">
                            About
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
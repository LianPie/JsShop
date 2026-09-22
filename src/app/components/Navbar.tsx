"use client";

import { useState } from "react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { link } from "fs";

type navinfo = {
    siteName: string;
    links: {
        home: string;
        products: string;
        about: string;
    };
}

export default function Navbar({ siteName, links }: navinfo) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="border-b border-border bg-background">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

                {/* Brand */}
                <div className="flex items-center gap-3">
                    <img
                        className="hidden md:block"
                        src="/favicon.ico"
                        alt="Logo"
                        width={32}
                        height={32}
                        loading="eager"
                    />

                    <h1 className="text-lg font-semibold tracking-tight">
                        {siteName}
                    </h1>
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
                        href="#"
                    >
                        {links.about}
                    </a>
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
                        <a href="#" className="text-sm font-medium">
                            About
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
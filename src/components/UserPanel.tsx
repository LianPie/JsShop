type UserPanelInfo = {
    isLoggedIn: boolean;
    text: {
        noAuth: string;
        logIn: string;
        profile: string;
        orders: string;
    };
}

export default function UserPanel({ isLoggedIn, text }: UserPanelInfo) {
    // Not logged in: show the message and a login button
    if (!isLoggedIn) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                    {text.noAuth}
                </p>
                <a
                    href="/login"
                    className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-hover"
                >
                    {text.logIn}
                </a>
            </div>
        );
    }

    // Logged in: show the account links
    return (
        <div className="flex flex-col gap-2">
            <a
                href="/profile"
                className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-accent-soft"
            >
                {text.profile}
            </a>
            <a
                href="/orders"
                className="rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-accent-soft"
            >
                {text.orders}
            </a>
        </div>
    );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPhone, faCalendarDays, faReceipt, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import content from "@/data/site-content.json";
import { getCurrentUser } from "@/lib/session";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = {
    title: `${content.profile.title} | ${content.siteInfo.shopName}`,
};

const dateFormat = new Intl.DateTimeFormat(content.siteInfo.lan, { dateStyle: "long" });

// Read-only overview of the logged-in user's account
export default async function ProfilePage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const profile = await getProfile(user.id);
    // The session pointed at a user that's gone: treat it as logged out
    if (!profile) redirect("/login");

    const details = [
        { icon: faPhone, label: content.profile.phone, value: profile.phoneNumber },
        { icon: faCalendarDays, label: content.profile.memberSince, value: dateFormat.format(profile.dateCreated) },
        { icon: faReceipt, label: content.profile.orders, value: String(profile._count.orders) },
    ];

    return (
        <div className="mt-6 mb-10 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            {/* Header: avatar + name */}
            <div className="flex items-center gap-5 border-b border-border bg-accent-soft px-6 py-8 md:px-8">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface shadow-md">
                    {/* "!" makes the size win over FontAwesome's own height: 1em */}
                    <FontAwesomeIcon icon={faUser} className="h-9! w-9! text-accent" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                        {content.profile.title}
                    </p>
                    <h1 className="truncate text-3xl font-semibold tracking-tight">
                        {profile.userName}
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-8 p-6 md:p-8">
                {/* Account details */}
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {details.map((detail) => (
                        <div key={detail.label} className="rounded-xl border border-border p-4">
                            <dt className="flex items-center gap-2 text-sm text-muted">
                                <FontAwesomeIcon icon={detail.icon} />
                                {detail.label}
                            </dt>
                            <dd className="mt-1 text-lg font-semibold">
                                {detail.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                {/* Saved addresses */}
                <section>
                    <h2 className="text-lg font-semibold">
                        {content.profile.addresses}
                    </h2>

                    {profile.address.length === 0 ? (
                        <p className="mt-3 text-muted">
                            {content.profile.noAddresses}
                        </p>
                    ) : (
                        <ul className="mt-3 flex flex-col gap-3">
                            {profile.address.map((address) => (
                                <li key={address.id} className="flex items-start gap-3 rounded-xl border border-border p-4">
                                    <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-accent" />
                                    <div>
                                        <p className="font-medium">{address.address}</p>
                                        <p className="text-sm text-muted">
                                            {content.profile.zipcode}: {address.zipcode}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <a
                    href="/orders"
                    className="self-start rounded-lg bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-hover"
                >
                    {content.profile.viewOrders}
                </a>
            </div>
        </div>
    );
}

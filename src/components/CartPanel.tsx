type CartPanelInfo = {
    title: string;
}

export default function CartPanel({ title }: CartPanelInfo) {
    return (
        <div>
            <h2 className="text-lg font-semibold">
                {title}
            </h2>
        </div>
    );
}

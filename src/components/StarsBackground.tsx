// Animated starfield. Fills its nearest parent that has `relative` on it.
export default function StarsBackground({ className = "" }: { className?: string }) {
    return (
        <div className={`stars-bg ${className}`} aria-hidden="true">
            <div className="stars-small" />
            <div className="stars-medium" />
            <div className="stars-large" />
        </div>
    );
}

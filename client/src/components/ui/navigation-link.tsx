import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "wouter";

interface NavigationLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isExternal?: boolean;
}

/**
 * Ghost-style navigation link with icon and arrow
 * WCAG AA compliant with proper focus states
 */
export function NavigationLink({ href, icon: Icon, label, isExternal = false }: NavigationLinkProps) {
    const className = "group flex items-center gap-3 text-[16px] font-medium text-slate-700 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 rounded-md px-2 py-1";

    const content = (
        <>
            <Icon
                className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors"
                strokeWidth={2}
                aria-hidden="true"
            />
            <span>{label}</span>
            <ArrowRight
                className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all"
                strokeWidth={2}
                aria-hidden="true"
            />
        </>
    );

    if (isExternal) {
        return (
            <a href={href} className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}

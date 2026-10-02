"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/trends", label: "Tendances", icon: "📊" },
  { href: "/colors", label: "Couleurs", icon: "🎨" },
  { href: "/furniture", label: "Meubles", icon: "🛋️" },
  { href: "/tableware", label: "Art de la table", icon: "🍽️" },
  { href: "/chatbot", label: "Chatbot IA", icon: "💬" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
          <span className="text-xl">🏠</span>
          <span className="text-sm">objo.design</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-amber-50 text-amber-700"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

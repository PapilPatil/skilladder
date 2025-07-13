import { Link, useLocation } from "wouter";
import { User, Star, Plus } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", id: "dashboard" },
    { href: "/skills", label: "My Skills", id: "skills" },
    { href: "/endorsements", label: "Endorsements", id: "endorsements" },
    { href: "/directory", label: "Directory", id: "directory" },
  ];

  return (
    <header className="bronze-gradient shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Plus className="text-white text-2xl" />
            <h1 className="text-white text-xl font-bold">SkillAdder</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`transition-colors duration-300 ${
                  location === item.href
                    ? "text-white font-semibold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="gamification-badge text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>Level 5</span>
            </div>
            <div className="w-8 h-8 bronze-300 rounded-full flex items-center justify-center">
              <User className="text-bronze-700 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

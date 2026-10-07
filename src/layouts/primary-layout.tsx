import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
// import BubbleMenu from "@/components/bubble-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { portfolioData } from "@/data/portfolio-data";

interface PrimaryLayoutProps {
  children: React.ReactNode;
}

export default function PrimaryLayout({ children }: PrimaryLayoutProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-primary/20">
      {/* Top Header Navigation */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isSticky
            ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm py-2.5"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Avatar className="h-10 w-10 border-2 border-primary/20 transition-transform group-hover:scale-105">
              <AvatarImage src="/logo512.png" alt={portfolioData.name} />
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight block leading-tight text-foreground group-hover:text-primary transition-colors">
                {portfolioData.name}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {portfolioData.titles.join(" • ")}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              activeProps={{
                className: "text-foreground font-semibold bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="px-3 py-1.5 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              activeProps={{
                className: "text-foreground font-semibold bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="px-3 py-1.5 rounded-md transition-colors"
            >
              About
            </Link>
            <Link
              to="/projects"
              activeProps={{
                className: "text-foreground font-semibold bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="px-3 py-1.5 rounded-md transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/resume"
              activeProps={{
                className: "text-foreground font-semibold bg-muted",
              }}
              inactiveProps={{
                className: "text-muted-foreground hover:text-foreground",
              }}
              className="px-3 py-1.5 rounded-md transition-colors"
            >
              CV / Resume
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {children}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <div className="fixed bottom-4 inset-x-0 z-50 px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-fit mx-auto">
          {/* <BubbleMenu /> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/30 text-xs text-muted-foreground py-6 text-center">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} {portfolioData.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href={portfolioData.socials.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href={portfolioData.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={portfolioData.socials.email}
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

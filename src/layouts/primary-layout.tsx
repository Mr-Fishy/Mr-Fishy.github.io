import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { portfolioData } from "@/data/portfolio-data";

interface PrimaryLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/interactive", label: "Interactive" },
  { to: "/coursework", label: "Coursework" },
  { to: "/resume", label: "CV / Resume" },
];

export default function PrimaryLayout({ children }: PrimaryLayoutProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-primary/20">
      {/* Top Header Navigation */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isSticky || isMobileMenuOpen
            ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-2.5"
            : "bg-transparent py-4 sm:py-6"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
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
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{
                    className: "text-foreground font-semibold bg-muted",
                  }}
                  inactiveProps={{
                    className: "text-muted-foreground hover:text-foreground",
                  }}
                  className="px-3 py-1.5 rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border mt-3 pt-3 pb-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col gap-1">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    activeProps={{
                      className: "text-foreground font-semibold bg-muted",
                    }}
                    inactiveProps={{
                      className:
                        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    }}
                    className="px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-3 mt-2 border-t border-border/60 flex items-center gap-4 px-3 text-xs text-muted-foreground">
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
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
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

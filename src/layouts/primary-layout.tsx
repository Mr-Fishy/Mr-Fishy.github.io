interface PrimaryLayoutProps {
  children: React.ReactNode;
  isHome: boolean;
}

export function PrimaryLayout({ children, isHome }: PrimaryLayoutProps) {
  return (
    <div className="p-8">
      <div className="flex flex-row">
        <div>
          <h1>Evan Fish</h1>

          {isHome && (
            <div>
              <h2>Developer</h2>
              <h2>System Designer</h2>
              <h2>Project Manager</h2>
            </div>
          )}
        </div>

        <div>
          <img src="#" alt="My portrait!" />
        </div>
      </div>

      {children}

      <nav></nav>
    </div>
  );
}

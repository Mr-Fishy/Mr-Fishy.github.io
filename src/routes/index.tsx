import { createFileRoute } from "@tanstack/react-router";
import { PrimaryLayout } from "@/layouts/primary-layout";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <PrimaryLayout isHome={true}>
      <div>
        
      </div>
    </PrimaryLayout>
  );
}

/**
 * routes/interactive/fr-math.tsx
 *
 * Dedicated route for the Falcon Racing Drivetrain Calculator subsite.
 */

import { createFileRoute } from "@tanstack/react-router";
import { FrMathApp } from "@/interactive/fr-math/components/FrMathApp";
import PrimaryLayout from "@/layouts/primary-layout";

export const Route = createFileRoute("/interactive/fr-math")({
  component: FrMathPage,
});

function FrMathPage() {
  return (
    <PrimaryLayout>
      <div className="animate-in fade-in-50 duration-500">
        <FrMathApp />
      </div>
    </PrimaryLayout>
  );
}

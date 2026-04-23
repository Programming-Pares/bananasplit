import { type PropsWithChildren } from "react";

import { BottomNav } from "@/components/common/bottom-nav";
import { cn } from "@/lib/utils";

type MobileShellProps = PropsWithChildren<{
  className?: string;
  showBottomNav?: boolean;
}>;

export function MobileShell({
  children,
  className,
  showBottomNav = true,
}: MobileShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,232,160,0.88),_transparent_32%),linear-gradient(180deg,#fffef8_0%,#fff8df_100%)]">
      <div className="mx-auto min-h-screen max-w-3xl">
        <main
          className={cn(
            "flex min-h-screen flex-col border-0 bg-background/88 px-3 py-3.5 shadow-none backdrop-blur sm:min-h-[calc(100vh-2rem)] sm:px-4 sm:py-4 sm:shadow-[0_24px_60px_rgba(86,66,17,0.12)]",
            className,
          )}
        >
          <div className="min-h-0 flex-1">{children}</div>
          {showBottomNav ? (
            <div className="sticky bottom-0 z-40 -mx-3 mt-3 px-3 pb-[max(1rem,var(--safe-area-bottom))] pt-2 sm:-mx-4 sm:px-4">
              <BottomNav />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

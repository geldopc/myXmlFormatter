import { Outlet } from "react-router-dom";
import { Navbar } from "@modules/Navbar";

type AppLayoutProps = {
  title?: string;
};

export function AppLayout({ title }: AppLayoutProps) {
  return (
    <div id="app-layout" className="grain h-screen bg-background text-foreground flex flex-col">
      <Navbar title={title} />
      <main id="main-content" className="flex-1 pt-14 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

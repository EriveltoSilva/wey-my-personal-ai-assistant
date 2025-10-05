import { AppSidebar } from "@/components/sidebar-components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Check if current path matches chat with ID pattern (/chat/[uuid])
  const isChatConversation = /^\/chat\/[a-f0-9-]{36}$/i.test(location.pathname);

  return (
    <SidebarProvider>
      <SidebarInset
        className="relative z-20 bg-[#000] bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: !isChatConversation ? "url(/wey.gif)" : "none",
          // backgroundImage: "url(/ai-stop.gif)",
          // backgroundImage: "url(/ai-thinking.gif)",
          zIndex: 1,
        }}
      >
        <div className="flex flex-1 flex-col gap-4 bg-transparent relative z-20">{children}</div>
      </SidebarInset>
      <AppSidebar />
    </SidebarProvider>
  );
};

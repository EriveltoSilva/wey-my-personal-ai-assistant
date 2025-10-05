import { Forward, MoreHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";

export function NavChats({
  data,
  deleteChat,
}: {
  deleteChat: (chatId: string) => Promise<void>;
  data: {
    title: string;
    id: string;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Últimas conversas</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to={`/chat`}>
              {/* <item.icon /> */}
              <span>Novo Chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {data.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link to={`/chat/${item.id}`}>
                {/* <item.icon /> */}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Link to={`/chat/${item.id}`} className="flex gap-2">
                    <Forward className="text-muted-foreground" />
                    <span>Ir para Chat</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <a href={`/chat/${item.id}`} className="flex gap-2">
                    <Share className="text-muted-foreground" />
                    <span>Compartilhar Chat</span>
                  </a>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button
                    onClick={async () => {
                      await deleteChat(item.id);
                    }}
                    className="flex w-full items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="text-red-800" />
                    <span className="text-red-800 hover:text-red-500">Excluir Chat</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        {/* <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem> */}
      </SidebarMenu>
    </SidebarGroup>
  );
}

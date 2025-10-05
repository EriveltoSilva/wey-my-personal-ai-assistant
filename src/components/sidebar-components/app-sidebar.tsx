import * as React from "react";
import { useLocation } from "react-router-dom";

import { Sidebar, SidebarContent, SidebarFooter, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/hooks/use-auth";
import type { ChatResponse } from "@/types/chats";
import { NavChats } from "./nav-chats";
import { NavUser } from "./nav-user";

// const data = {
//   teams: [
//     {
//       name: "DBTD",
//       logo: GalleryVerticalEnd,
//       plan: "RIT",
//     },
//   ],
//   agentData: [
//     {
//       name: "(Indisponivel) Mestre de Leis",
//       url: "#",
//       icon: Frame,
//     },
//     {
//       name: "(Indisponivel) Analisador de CV Expert",
//       url: "#",
//       icon: PieChart,
//     },
//   ],
// };

interface ChatMenuItem {
  id: string;
  title: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useAuth();
  const location = useLocation();
  const [chatList, setChatList] = React.useState<ChatResponse[]>([]);
  const [chatMenuItems, setChatMenuItems] = React.useState<ChatMenuItem[]>([]);

  const user = {
    name: session?.fullName as string,
    email: session?.username as string,
    avatar: null,
  };

  const loadMyChatList = React.useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/chats`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatList(data);
      }
    } catch (error) {
      console.error("Error loading chat list:", error);
    }
  }, [session]);

  const deleteChat = async (chatId: string) => {
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        await loadMyChatList();
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const mapChatListToMenuItems = React.useCallback((chatList: ChatResponse[]): ChatMenuItem[] => {
    return chatList?.map((chat) => ({
      id: chat.id,
      title: chat.title,
    }));
  }, []);

  React.useEffect(() => {
    loadMyChatList();
  }, [loadMyChatList, location.pathname]);

  React.useEffect(() => {
    setChatMenuItems(mapChatListToMenuItems(chatList));
  }, [chatList, mapChatListToMenuItems]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <div className="flex items-center justify-end px-1 pt-4">
        <SidebarTrigger className="-ml-1" />
      </div>
      {/* <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        </SidebarHeader> */}
      <SidebarContent>
        {/*<NavAgents data={data.agentData} />*/}
        <NavChats data={chatMenuItems} deleteChat={deleteChat} />
        {/* <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

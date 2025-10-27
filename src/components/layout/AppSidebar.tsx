import { useLocation, useNavigate } from "react-router-dom";
import { Home, Ticket, Users, Calendar, ShoppingCart, Package, Truck, MessageSquare, FileText, Settings, LogOut, Wrench } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Dietario", url: "/dietario", icon: Calendar },
  { title: "Ventas", url: "/ventas", icon: ShoppingCart },
  { title: "Stock", url: "/stock", icon: Package },
  { title: "Furgonetas", url: "/furgonetas", icon: Truck },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Protocolos", url: "/protocolos", icon: FileText },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada");
      navigate("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">TPV Manager</span>
            <span className="text-xs text-sidebar-foreground/60">Gestión Técnica</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}
                    >
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/configuracion">
                    <Settings className="h-4 w-4" />
                    <span>Configuración</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

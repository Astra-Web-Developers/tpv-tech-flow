import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Calendar,
  Settings,
  ShoppingCart,
  MessageCircle,
  Truck,
  Wrench,
  Package,
  FileText,
  Book,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Dietario", url: "/dietario", icon: Calendar },
  { title: "Ventas", url: "/ventas", icon: ShoppingCart },
  { title: "Chat", url: "/chat", icon: MessageCircle },
];

const adminItems = [
  { title: "Técnicos", url: "/tecnicos", icon: Users, adminOnly: true },
  { title: "Furgonetas", url: "/furgonetas", icon: Truck, adminOnly: true },
  { title: "Equipos SAT", url: "/equipos-sat", icon: Wrench, adminOnly: true },
  { title: "Proveedores", url: "/proveedores", icon: DollarSign, adminOnly: true },
  { title: "Stock", url: "/stock", icon: Package, adminOnly: true },
  { title: "Protocolos", url: "/protocolos", icon: FileText, adminOnly: true },
  { title: "Manuales", url: "/manuales", icon: Book, adminOnly: true },
  { title: "Configuración", url: "/configuracion", icon: Settings, adminOnly: true },
];

export function AppSidebarNew() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const loadUserRoles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        setUserRoles(data?.map(r => r.role) || []);
      }
    };
    loadUserRoles();
  }, []);

  const isAdmin = userRoles.includes('admin');

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <span className="font-semibold">SERVISA</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const isActive = currentPath === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

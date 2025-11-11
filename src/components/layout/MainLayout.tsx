import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "@supabase/supabase-js";

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

const MainLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Cargar notificaciones
  useEffect(() => {
    if (user) {
      cargarNotificaciones();
      // Actualizar notificaciones cada 30 segundos
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const cargarNotificaciones = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotificaciones(data || []);
      setNotificacionesNoLeidas(data?.filter(n => !n.leida).length || 0);
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    }
  };

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      const { error } = await supabase
        .from("notificaciones")
        .update({ leida: true })
        .eq("id", notificacionId);

      if (error) throw error;

      // Actualizar el estado local
      setNotificaciones(prev =>
        prev.map(n => (n.id === notificacionId ? { ...n, leida: true } : n))
      );
      setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const { error } = await supabase
        .from("notificaciones")
        .update({ leida: true })
        .eq("usuario_id", user?.id)
        .eq("leida", false);

      if (error) throw error;

      // Actualizar el estado local
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNotificacionesNoLeidas(0);
    } catch (error) {
      console.error("Error marcando todas las notificaciones como leídas:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              {/* Notificaciones */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificacionesNoLeidas > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {notificacionesNoLeidas > 9 ? "9+" : notificacionesNoLeidas}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold text-sm">Notificaciones</h4>
                    {notificacionesNoLeidas > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                        onClick={marcarTodasComoLeidas}
                      >
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                        <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notificaciones.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                              !notif.leida ? "bg-primary/5" : ""
                            }`}
                            onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="font-medium text-sm">{notif.titulo}</h5>
                              {!notif.leida && (
                                <div className="h-2 w-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{notif.mensaje}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notif.created_at).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Email del usuario */}
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;

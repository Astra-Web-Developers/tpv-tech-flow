import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Plus, Users, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Conversacion {
  id: string;
  nombre: string | null;
  es_grupo: boolean;
  created_at: string;
  ultimo_mensaje?: string;
  mensajes_no_leidos?: number;
}

interface Mensaje {
  id: string;
  contenido: string;
  created_at: string;
  usuario_id: string;
  archivo_url: string | null;
  archivo_nombre: string | null;
  usuario?: {
    nombre: string;
    email: string;
  };
}

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

const Chat = () => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCurrentUser();
    loadConversaciones();
    loadUsuarios();
    
    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel('mensajes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mensajes'
      }, () => {
        if (selectedChat) {
          loadMensajes(selectedChat);
        }
        loadConversaciones();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .eq("activo", true);

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const loadConversaciones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("participantes_conversacion")
        .select(`
          conversacion_id,
          conversaciones (
            id,
            nombre,
            es_grupo,
            created_at
          )
        `)
        .eq("usuario_id", user.id);

      if (error) throw error;

      const conversacionesData = data?.map(p => p.conversaciones).filter(Boolean) || [];
      setConversaciones(conversacionesData as any);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
      toast.error("Error al cargar conversaciones");
    }
  };

  const loadMensajes = async (conversacionId: string) => {
    try {
      const { data, error } = await supabase
        .from("mensajes")
        .select(`
          *,
          profiles:usuario_id (
            nombre,
            email
          )
        `)
        .eq("conversacion_id", conversacionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMensajes(data?.map(m => ({
        ...m,
        usuario: m.profiles as any
      })) || []);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      toast.error("Error al cargar mensajes");
    }
  };

  const createConversacion = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Selecciona al menos un usuario");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Crear conversación
      const { data: conversacion, error: convError } = await supabase
        .from("conversaciones")
        .insert({
          nombre: isGroupChat ? groupName : null,
          es_grupo: isGroupChat,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Añadir participantes
      const participantes = [user.id, ...selectedUsers].map(userId => ({
        conversacion_id: conversacion.id,
        usuario_id: userId
      }));

      const { error: partError } = await supabase
        .from("participantes_conversacion")
        .insert(participantes);

      if (partError) throw partError;

      toast.success("Conversación creada");
      setIsNewChatOpen(false);
      setSelectedUsers([]);
      setGroupName("");
      setIsGroupChat(false);
      loadConversaciones();
      setSelectedChat(conversacion.id);
    } catch (error) {
      console.error("Error creando conversación:", error);
      toast.error("Error al crear conversación");
    }
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !selectedChat || !currentUser) return;

    try {
      const { error } = await supabase
        .from("mensajes")
        .insert({
          conversacion_id: selectedChat,
          usuario_id: currentUser.id,
          contenido: nuevoMensaje
        });

      if (error) throw error;

      setNuevoMensaje("");
      loadMensajes(selectedChat);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error("Error al enviar mensaje");
    }
  };

  const filteredConversaciones = conversaciones.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    searchTerm === ""
  );

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Chat</h1>
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Conversación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Conversación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="grupo"
                  checked={isGroupChat}
                  onCheckedChange={(checked) => setIsGroupChat(checked as boolean)}
                />
                <Label htmlFor="grupo">Crear grupo</Label>
              </div>

              {isGroupChat && (
                <div>
                  <Label htmlFor="groupName">Nombre del grupo</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Ej: Equipo de soporte"
                  />
                </div>
              )}

              <div>
                <Label>Seleccionar usuarios</Label>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {usuarios.map((usuario) => (
                    <div key={usuario.id} className="flex items-center space-x-2 py-2">
                      <Checkbox
                        checked={selectedUsers.includes(usuario.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, usuario.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== usuario.id));
                          }
                        }}
                      />
                      <span>{usuario.nombre} ({usuario.email})</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <Button onClick={createConversacion} className="w-full">
                Crear Conversación
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-4 h-full">
        <div className="col-span-4">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversaciones.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedChat(conv.id);
                    loadMensajes(conv.id);
                  }}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedChat === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {conv.es_grupo ? <Users className="h-4 w-4" /> : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {conv.nombre || "Conversación"}
                        </p>
                        {conv.mensajes_no_leidos && conv.mensajes_no_leidos > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conv.mensajes_no_leidos}
                          </Badge>
                        )}
                      </div>
                      {conv.ultimo_mensaje && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.ultimo_mensaje}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>

        <div className="col-span-8">
          {selectedChat ? (
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    {conversaciones.find(c => c.id === selectedChat)?.nombre || "Conversación"}
                  </h3>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {mensajes.map((mensaje) => {
                    const isOwnMessage = mensaje.usuario_id === currentUser?.id;
                    return (
                      <div
                        key={mensaje.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {!isOwnMessage && mensaje.usuario && (
                            <p className="text-xs font-semibold mb-1">
                              {mensaje.usuario.nombre}
                            </p>
                          )}
                          <p className="text-sm">{mensaje.contenido}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(mensaje.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && enviarMensaje()}
                    className="flex-1"
                  />
                  <Button onClick={enviarMensaje}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Selecciona una conversación para empezar</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

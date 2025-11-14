import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Check } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["app_role"];

interface RoleManagerProps {
  userId: string;
  userName: string;
  onRolesUpdated?: () => void;
}

const AVAILABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "admin", label: "Administrador", description: "Acceso completo al sistema" },
  { value: "tecnico", label: "Técnico", description: "Gestión de tickets y clientes" },
  { value: "comercial", label: "Comercial", description: "Gestión de ventas" },
  { value: "proveedor", label: "Proveedor", description: "Acceso limitado como proveedor" },
];

export function RoleManager({ userId, userName, onRolesUpdated }: RoleManagerProps) {
  const [open, setOpen] = useState(false);
  const [currentRoles, setCurrentRoles] = useState<UserRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserRoles();
    }
  }, [open, userId]);

  const loadUserRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;

      const roles = data?.map((r) => r.role) || [];
      setCurrentRoles(roles);
      setSelectedRoles(roles);
    } catch (error) {
      console.error("Error cargando roles:", error);
      toast.error("Error al cargar roles del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    try {
      setLoading(true);

      // Roles a eliminar
      const rolesToRemove = currentRoles.filter((role) => !selectedRoles.includes(role));
      // Roles a agregar
      const rolesToAdd = selectedRoles.filter((role) => !currentRoles.includes(role));

      // Eliminar roles
      if (rolesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .in("role", rolesToRemove);

        if (deleteError) throw deleteError;
      }

      // Agregar nuevos roles
      if (rolesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(
            rolesToAdd.map((role) => ({
              user_id: userId,
              role: role,
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success("Roles actualizados correctamente");
      setCurrentRoles(selectedRoles);
      setOpen(false);

      // Llamar callback para refrescar la lista
      if (onRolesUpdated) {
        onRolesUpdated();
      }
    } catch (error: any) {
      console.error("Error actualizando roles:", error);
      toast.error(error.message || "Error al actualizar roles");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "tecnico":
        return "default";
      case "comercial":
        return "secondary";
      case "proveedor":
        return "outline";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    return AVAILABLE_ROLES.find((r) => r.value === role)?.label || role;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">
          <Shield className="h-4 w-4 mr-2" />
          Gestionar Roles
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gestionar Roles de {userName}</DialogTitle>
          <DialogDescription>
            Selecciona los roles que tendrá este usuario en el sistema
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Roles actuales */}
            {currentRoles.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Roles Actuales:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentRoles.map((role) => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)}>
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Selección de roles */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Seleccionar Roles:</Label>
              {AVAILABLE_ROLES.map((role) => (
                <div
                  key={role.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={role.value}
                    checked={selectedRoles.includes(role.value)}
                    onCheckedChange={() => handleToggleRole(role.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={role.value}
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      {role.label}
                      {selectedRoles.includes(role.value) && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveRoles} className="flex-1" disabled={loading}>
                Guardar Cambios
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRoles(currentRoles);
                  setOpen(false);
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

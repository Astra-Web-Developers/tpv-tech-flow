import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit2, FileX } from "lucide-react";
import { Cliente } from "@/types/cliente";
import { descargarLogo } from "@/utils/cliente/exportUtils";

interface ClienteHeaderProps {
  cliente: Cliente;
  editMode: boolean;
  uploadingLogo: boolean;
  onEditToggle: () => void;
  onCancel: () => void;
  onSave: () => void;
  onToggleActivo: () => void;
}

export const ClienteHeader = ({
  cliente,
  editMode,
  uploadingLogo,
  onEditToggle,
  onCancel,
  onSave,
  onToggleActivo,
}: ClienteHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button variant="outline" size="icon" onClick={() => navigate("/clientes")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {cliente.logo_url && (
          <div className="relative group/logo">
            <div className="w-20 h-20 rounded-xl border-2 border-border overflow-hidden flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm transition-all duration-300 group-hover/logo:shadow-md group-hover/logo:border-primary/50">
              <img
                src={cliente.logo_url}
                alt={`Logo ${cliente.nombre}`}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = "none";
                }}
              />
            </div>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-7 w-7 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 shadow-lg"
              onClick={() => descargarLogo(cliente.logo_url!, cliente.nombre)}
              title="Descargar logo"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold truncate">{cliente.nombre}</h1>
          {cliente.cif && <p className="text-muted-foreground font-mono">CIF: {cliente.cif}</p>}
          {!cliente.activo && (
            <Badge variant="secondary" className="mt-1">
              Cliente Archivado
            </Badge>
          )}
        </div>
      </div>
      {editMode ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={uploadingLogo}>
            {uploadingLogo ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEditToggle}>
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant={cliente.activo ? "destructive" : "default"}
            onClick={onToggleActivo}
          >
            {cliente.activo ? (
              <>
                <FileX className="h-4 w-4 mr-2" />
                Archivar Cliente
              </>
            ) : (
              "Reactivar Cliente"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

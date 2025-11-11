import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfigurableSelect } from "@/components/ConfigurableSelect";
import { IncidenciasEquipo } from "@/components/IncidenciasEquipo";
import { Wrench, Plus } from "lucide-react";

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  numero_serie_bdp: string | null;
  numero_serie_wind: string | null;
  numero_serie_store_manager: string | null;
  numero_serie_cashlogy: string | null;
  numero_serie_impresora: string | null;
  contraseñas: string | null;
  tpv: string | null;
  wind: string | null;
  ram: string | null;
  impresora: string | null;
  software: string | null;
  v: string | null;
  tbai: string | null;
  c_inteligente: string | null;
  instalacion: string | null;
  pendrive_c_seg: string | null;
  garantia_inicio: string | null;
  garantia_fin: string | null;
  fecha_instalacion: string | null;
}

interface EquiposSectionProps {
  equipos: Equipo[];
  dialogEquipoOpen: boolean;
  setDialogEquipoOpen: (open: boolean) => void;
  nuevoEquipo: {
    tipo: string;
    marca: string;
    modelo: string;
    numero_serie: string;
    numero_serie_bdp: string;
    numero_serie_wind: string;
    numero_serie_store_manager: string;
    numero_serie_cashlogy: string;
    numero_serie_impresora: string;
    contraseñas: string;
    tpv: string;
    wind: string;
    ram: string;
    impresora: string;
    software: string;
    v: string;
    tbai: string;
    c_inteligente: string;
    instalacion: string;
    pendrive_c_seg: string;
    garantia_inicio: string;
    garantia_fin: string;
  };
  setNuevoEquipo: (equipo: any) => void;
  equipoConfigs: Record<string, string[]>;
  onAgregarEquipo: () => void;
}

export const EquiposSection = ({
  equipos,
  dialogEquipoOpen,
  setDialogEquipoOpen,
  nuevoEquipo,
  setNuevoEquipo,
  equipoConfigs,
  onAgregarEquipo,
}: EquiposSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Equipos del Cliente
        </h3>
        <Dialog open={dialogEquipoOpen} onOpenChange={setDialogEquipoOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Equipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agregar Equipo</DialogTitle>
              <DialogDescription>Registra un nuevo equipo del cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Equipo</Label>
                <Input
                  value={nuevoEquipo.tipo}
                  onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, tipo: e.target.value })}
                  placeholder="Ej: TPV, Cash Guard, Balanza"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TPV</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.tpv}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, tpv: value })}
                    options={equipoConfigs.tpv || []}
                    placeholder="Seleccionar TPV..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sistema Operativo (WIND)</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.wind}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, wind: value })}
                    options={equipoConfigs.wind || []}
                    placeholder="Seleccionar SO..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RAM</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.ram}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, ram: value })}
                    options={equipoConfigs.ram || []}
                    placeholder="Seleccionar RAM..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Impresora</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.impresora}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, impresora: value })}
                    options={equipoConfigs.impresora || []}
                    placeholder="Seleccionar Impresora..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Software</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.software}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, software: value })}
                    options={equipoConfigs.software || []}
                    placeholder="Seleccionar Software..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Versión (V.)</Label>
                  <Input
                    value={nuevoEquipo.v}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, v: e.target.value })}
                    placeholder="Versión..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={nuevoEquipo.marca}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, marca: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={nuevoEquipo.modelo}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, modelo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Número de Serie</Label>
                <Input
                  value={nuevoEquipo.numero_serie}
                  onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie: e.target.value })}
                />
              </div>

              {/* Nuevos campos de números de serie */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm">Números de Serie Específicos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nº Serie BDP</Label>
                    <Input
                      value={nuevoEquipo.numero_serie_bdp}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie_bdp: e.target.value })}
                      placeholder="Número de serie BDP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nº Serie WIND</Label>
                    <Input
                      value={nuevoEquipo.numero_serie_wind}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie_wind: e.target.value })}
                      placeholder="Número de serie WIND"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nº Serie Store Manager</Label>
                    <Input
                      value={nuevoEquipo.numero_serie_store_manager}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie_store_manager: e.target.value })}
                      placeholder="Número de serie Store Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nº Serie Cashlogy</Label>
                    <Input
                      value={nuevoEquipo.numero_serie_cashlogy}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie_cashlogy: e.target.value })}
                      placeholder="Número de serie Cashlogy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nº Serie Impresora</Label>
                    <Input
                      value={nuevoEquipo.numero_serie_impresora}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie_impresora: e.target.value })}
                      placeholder="Número de serie impresora"
                    />
                  </div>
                </div>
              </div>

              {/* Contraseñas */}
              <div className="space-y-2">
                <Label>Contraseñas</Label>
                <Textarea
                  value={nuevoEquipo.contraseñas}
                  onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, contraseñas: e.target.value })}
                  placeholder="Contraseñas y accesos del equipo..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TBAI</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.tbai}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, tbai: value })}
                    options={equipoConfigs.tbai || []}
                    placeholder="Seleccionar..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caja Inteligente</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.c_inteligente}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, c_inteligente: value })}
                    options={equipoConfigs.c_inteligente || []}
                    placeholder="Seleccionar..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Instalación</Label>
                  <Input
                    type="date"
                    value={nuevoEquipo.instalacion}
                    onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, instalacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pendrive C.Seg</Label>
                  <ConfigurableSelect
                    value={nuevoEquipo.pendrive_c_seg}
                    onChange={(value) => setNuevoEquipo({ ...nuevoEquipo, pendrive_c_seg: value })}
                    options={equipoConfigs.pendrive_c_seg || []}
                    placeholder="Seleccionar..."
                  />
                </div>
              </div>

              {/* Garantía */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold text-sm">Garantía</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio Garantía</Label>
                    <Input
                      type="date"
                      value={nuevoEquipo.garantia_inicio}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, garantia_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Fin Garantía</Label>
                    <Input
                      type="date"
                      value={nuevoEquipo.garantia_fin}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, garantia_fin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={onAgregarEquipo} className="w-full">
                Agregar Equipo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {equipos.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No hay equipos registrados</p>
      ) : (
        <div className="space-y-4">
          {equipos.map((equipo: any) => {
            // Calcular estado de garantía
            const garantiaInicio = equipo.garantia_inicio ? new Date(equipo.garantia_inicio) : null;
            const garantiaFin = equipo.garantia_fin ? new Date(equipo.garantia_fin) : null;
            const hoy = new Date();
            const garantiaVigente = garantiaInicio && garantiaFin && hoy >= garantiaInicio && hoy <= garantiaFin;
            const garantiaCaducada = garantiaFin && hoy > garantiaFin;

            return (
              <div key={equipo.id} className="p-4 border-2 rounded-lg bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-lg">{equipo.tipo}</p>
                    {(garantiaInicio || garantiaFin) && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={garantiaVigente ? "default" : "destructive"}
                          className={garantiaVigente ? "bg-green-600" : "bg-red-600"}
                        >
                          {garantiaVigente ? "Garantía Vigente" : garantiaCaducada ? "Garantía Caducada" : "Garantía"}
                        </Badge>
                        {garantiaFin && (
                          <span className="text-xs text-muted-foreground">
                            hasta {new Date(garantiaFin).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                  {equipo.tpv && <p><span className="text-muted-foreground">TPV:</span> {equipo.tpv}</p>}
                  {equipo.wind && <p><span className="text-muted-foreground">SO:</span> {equipo.wind}</p>}
                  {equipo.ram && <p><span className="text-muted-foreground">RAM:</span> {equipo.ram}</p>}
                  {equipo.impresora && <p><span className="text-muted-foreground">Impresora:</span> {equipo.impresora}</p>}
                  {equipo.software && <p><span className="text-muted-foreground">Software:</span> {equipo.software}</p>}
                  {equipo.v && <p><span className="text-muted-foreground">Versión:</span> {equipo.v}</p>}
                  {equipo.marca && <p><span className="text-muted-foreground">Marca:</span> {equipo.marca}</p>}
                  {equipo.modelo && <p><span className="text-muted-foreground">Modelo:</span> {equipo.modelo}</p>}
                  {equipo.numero_serie && <p><span className="text-muted-foreground">S/N:</span> {equipo.numero_serie}</p>}
                  {equipo.numero_serie_bdp && <p><span className="text-muted-foreground">S/N BDP:</span> {equipo.numero_serie_bdp}</p>}
                  {equipo.numero_serie_wind && <p><span className="text-muted-foreground">S/N WIND:</span> {equipo.numero_serie_wind}</p>}
                  {equipo.numero_serie_store_manager && <p><span className="text-muted-foreground">S/N Store Manager:</span> {equipo.numero_serie_store_manager}</p>}
                  {equipo.numero_serie_cashlogy && <p><span className="text-muted-foreground">S/N Cashlogy:</span> {equipo.numero_serie_cashlogy}</p>}
                  {equipo.numero_serie_impresora && <p><span className="text-muted-foreground">S/N Impresora:</span> {equipo.numero_serie_impresora}</p>}
                  {equipo.tbai && <p><span className="text-muted-foreground">TBAI:</span> {equipo.tbai}</p>}
                  {equipo.c_inteligente && <p><span className="text-muted-foreground">Caja Inteligente:</span> {equipo.c_inteligente}</p>}
                  {equipo.pendrive_c_seg && <p><span className="text-muted-foreground">Pendrive C.Seg:</span> {equipo.pendrive_c_seg}</p>}
                  {equipo.instalacion && (
                    <p className="col-span-2"><span className="text-muted-foreground">Instalación:</span> {new Date(equipo.instalacion).toLocaleDateString()}</p>
                  )}
                  {equipo.contraseñas && (
                    <p className="col-span-2"><span className="text-muted-foreground">Contraseñas:</span> <span className="whitespace-pre-wrap">{equipo.contraseñas}</span></p>
                  )}
                </div>

                <IncidenciasEquipo equipoId={equipo.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

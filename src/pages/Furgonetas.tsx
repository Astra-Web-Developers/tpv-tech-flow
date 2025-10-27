import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Truck, AlertCircle, Wrench, Package, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Furgoneta {
  id: string;
  matricula: string;
  marca: string;
  modelo: string;
  anio: number | null;
  ultima_itv: string | null;
  proxima_itv: string | null;
  estado: string;
  notas: string | null;
}

interface Mantenimiento {
  id: string;
  fecha: string;
  taller: string | null;
  descripcion: string;
  costo: number | null;
  furgoneta_id: string;
}

const Furgonetas = () => {
  const [furgonetas, setFurgonetas] = useState<Furgoneta[]>([]);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false);
  const [isAsignacionOpen, setIsAsignacionOpen] = useState(false);
  const [selectedFurgoneta, setSelectedFurgoneta] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    anio: new Date().getFullYear(),
    ultima_itv: "",
    proxima_itv: "",
    estado: "disponible",
    notas: ""
  });
  const [mantenimientoData, setMantenimientoData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    taller: "",
    descripcion: "",
    costo: 0
  });
  const [asignacionData, setAsignacionData] = useState({
    tecnico_id: "",
    motivo: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadFurgonetas(), loadMantenimientos(), loadTecnicos()]);
    } finally {
      setLoading(false);
    }
  };

  const loadFurgonetas = async () => {
    try {
      const { data, error } = await supabase
        .from("furgonetas")
        .select("*")
        .order("matricula");

      if (error) throw error;
      setFurgonetas(data || []);
    } catch (error) {
      console.error("Error cargando furgonetas:", error);
      toast.error("Error al cargar furgonetas");
    }
  };

  const loadMantenimientos = async () => {
    try {
      const { data, error } = await supabase
        .from("mantenimientos_furgonetas")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw error;
      setMantenimientos(data || []);
    } catch (error) {
      console.error("Error cargando mantenimientos:", error);
    }
  };

  const loadTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setTecnicos(data || []);
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("furgonetas")
        .insert({
          ...formData,
          ultima_itv: formData.ultima_itv || null,
          proxima_itv: formData.proxima_itv || null
        });

      if (error) throw error;

      toast.success("Furgoneta añadida exitosamente");
      setIsDialogOpen(false);
      loadFurgonetas();
      resetForm();
    } catch (error: any) {
      console.error("Error añadiendo furgoneta:", error);
      toast.error("Error al añadir furgoneta");
    }
  };

  const handleMantenimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFurgoneta) return;

    try {
      const { error } = await supabase
        .from("mantenimientos_furgonetas")
        .insert({
          furgoneta_id: selectedFurgoneta,
          ...mantenimientoData,
          costo: mantenimientoData.costo || null,
          taller: mantenimientoData.taller || null
        });

      if (error) throw error;

      toast.success("Mantenimiento registrado");
      setIsMantenimientoOpen(false);
      loadMantenimientos();
      setMantenimientoData({
        fecha: new Date().toISOString().split('T')[0],
        taller: "",
        descripcion: "",
        costo: 0
      });
    } catch (error: any) {
      console.error("Error registrando mantenimiento:", error);
      toast.error("Error al registrar mantenimiento");
    }
  };

  const handleAsignacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFurgoneta) return;

    try {
      const { error: asignError } = await supabase
        .from("asignaciones_furgonetas")
        .insert({
          furgoneta_id: selectedFurgoneta,
          tecnico_id: asignacionData.tecnico_id,
          motivo: asignacionData.motivo || null
        });

      if (asignError) throw asignError;

      // Actualizar estado de la furgoneta
      const { error: furgoError } = await supabase
        .from("furgonetas")
        .update({ estado: "asignada" })
        .eq("id", selectedFurgoneta);

      if (furgoError) throw furgoError;

      toast.success("Furgoneta asignada");
      setIsAsignacionOpen(false);
      loadFurgonetas();
      setAsignacionData({ tecnico_id: "", motivo: "" });
    } catch (error: any) {
      console.error("Error asignando furgoneta:", error);
      toast.error("Error al asignar furgoneta");
    }
  };

  const resetForm = () => {
    setFormData({
      matricula: "",
      marca: "",
      modelo: "",
      anio: new Date().getFullYear(),
      ultima_itv: "",
      proxima_itv: "",
      estado: "disponible",
      notas: ""
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible": return "success";
      case "asignada": return "default";
      case "en_mantenimiento": return "warning";
      default: return "secondary";
    }
  };

  const getDiasParaITV = (fecha: string | null) => {
    if (!fecha) return null;
    const hoy = new Date();
    const fechaITV = new Date(fecha);
    const diff = Math.ceil((fechaITV.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando furgonetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Furgonetas</h1>
          <p className="text-muted-foreground">Gestión de vehículos y mantenimientos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Furgoneta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Añadir Furgoneta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ultima_itv">Última ITV</Label>
                  <Input
                    id="ultima_itv"
                    type="date"
                    value={formData.ultima_itv}
                    onChange={(e) => setFormData({ ...formData, ultima_itv: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="proxima_itv">Próxima ITV</Label>
                  <Input
                    id="proxima_itv"
                    type="date"
                    value={formData.proxima_itv}
                    onChange={(e) => setFormData({ ...formData, proxima_itv: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Añadir Furgoneta</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="furgonetas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="furgonetas">Furgonetas</TabsTrigger>
          <TabsTrigger value="mantenimientos">Mantenimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="furgonetas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {furgonetas.map((furgoneta) => {
              const diasITV = getDiasParaITV(furgoneta.proxima_itv);
              const itvProxima = diasITV !== null && diasITV <= 30;
              
              return (
                <Card key={furgoneta.id} className={`hover:shadow-lg transition-shadow ${itvProxima ? "border-destructive" : ""}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{furgoneta.matricula}</CardTitle>
                      </div>
                      <Badge variant={getEstadoColor(furgoneta.estado)}>
                        {furgoneta.estado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{furgoneta.marca} {furgoneta.modelo}</p>
                      {furgoneta.anio && (
                        <p className="text-sm text-muted-foreground">Año: {furgoneta.anio}</p>
                      )}
                    </div>

                    {furgoneta.proxima_itv && (
                      <div className={`p-2 rounded ${itvProxima ? "bg-destructive/10" : "bg-muted"}`}>
                        <div className="flex items-center gap-2">
                          {itvProxima && <AlertCircle className="h-4 w-4 text-destructive" />}
                          <span className="text-sm font-medium">Próxima ITV:</span>
                        </div>
                        <p className="text-sm">{new Date(furgoneta.proxima_itv).toLocaleDateString()}</p>
                        {diasITV !== null && (
                          <p className={`text-xs ${itvProxima ? "text-destructive" : "text-muted-foreground"}`}>
                            {diasITV > 0 ? `En ${diasITV} días` : "Vencida"}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Dialog open={isAsignacionOpen && selectedFurgoneta === furgoneta.id} onOpenChange={(open) => {
                        setIsAsignacionOpen(open);
                        if (open) setSelectedFurgoneta(furgoneta.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Asignar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Asignar Furgoneta - {furgoneta.matricula}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAsignacion} className="space-y-4">
                            <div>
                              <Label>Técnico</Label>
                              <Select value={asignacionData.tecnico_id} onValueChange={(value) => setAsignacionData({ ...asignacionData, tecnico_id: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar técnico" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tecnicos.map((tec) => (
                                    <SelectItem key={tec.id} value={tec.id}>
                                      {tec.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="motivo_asig">Motivo</Label>
                              <Textarea
                                id="motivo_asig"
                                value={asignacionData.motivo}
                                onChange={(e) => setAsignacionData({ ...asignacionData, motivo: e.target.value })}
                                rows={3}
                              />
                            </div>

                            <Button type="submit" className="w-full">Asignar Furgoneta</Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isMantenimientoOpen && selectedFurgoneta === furgoneta.id} onOpenChange={(open) => {
                        setIsMantenimientoOpen(open);
                        if (open) setSelectedFurgoneta(furgoneta.id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Wrench className="h-3 w-3 mr-1" />
                            Mant.
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Añadir Mantenimiento - {furgoneta.matricula}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleMantenimiento} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="fecha_mant">Fecha</Label>
                                <Input
                                  id="fecha_mant"
                                  type="date"
                                  value={mantenimientoData.fecha}
                                  onChange={(e) => setMantenimientoData({ ...mantenimientoData, fecha: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="taller">Taller</Label>
                                <Input
                                  id="taller"
                                  value={mantenimientoData.taller}
                                  onChange={(e) => setMantenimientoData({ ...mantenimientoData, taller: e.target.value })}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="descripcion_mant">Descripción *</Label>
                              <Textarea
                                id="descripcion_mant"
                                value={mantenimientoData.descripcion}
                                onChange={(e) => setMantenimientoData({ ...mantenimientoData, descripcion: e.target.value })}
                                required
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="costo">Costo (€)</Label>
                              <Input
                                id="costo"
                                type="number"
                                step="0.01"
                                value={mantenimientoData.costo}
                                onChange={(e) => setMantenimientoData({ ...mantenimientoData, costo: parseFloat(e.target.value) })}
                              />
                            </div>

                            <Button type="submit" className="w-full">Registrar Mantenimiento</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {furgonetas.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay furgonetas registradas</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mantenimientos" className="space-y-4">
          <div className="space-y-2">
            {mantenimientos.map((mant) => {
              const furgoneta = furgonetas.find(f => f.id === mant.furgoneta_id);
              return (
                <Card key={mant.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{furgoneta?.matricula || "Furgoneta"}</p>
                          <p className="text-sm text-muted-foreground">{mant.descripcion}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(mant.fecha).toLocaleDateString()}
                            {mant.taller && ` · ${mant.taller}`}
                          </p>
                        </div>
                      </div>
                      {mant.costo && (
                        <Badge variant="secondary">{mant.costo.toFixed(2)} €</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {mantenimientos.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay mantenimientos registrados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Furgonetas;

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
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown, Edit } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockItem {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  cantidad: number;
  nivel_minimo: number;
  precio_unitario: number | null;
  proveedor_id: string | null;
  ubicacion: string | null;
  activo: boolean;
  proveedores?: { nombre: string } | null;
}

interface Movimiento {
  id: string;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  created_at: string;
  stock: { nombre: string };
  profiles?: { nombre: string } | null;
}

const Stock = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMovimientoOpen, setIsMovimientoOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    cantidad: 0,
    nivel_minimo: 5,
    precio_unitario: 0,
    proveedor_id: "",
    ubicacion: "",
    activo: true
  });
  const [movimientoData, setMovimientoData] = useState({
    tipo: "entrada",
    cantidad: 0,
    motivo: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadStock(), loadMovimientos(), loadProveedores()]);
    } finally {
      setLoading(false);
    }
  };

  const loadStock = async () => {
    try {
      const { data, error } = await supabase
        .from("stock")
        .select(`
          *,
          proveedores (nombre)
        `)
        .order("nombre");

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error cargando stock:", error);
      toast.error("Error al cargar stock");
    }
  };

  const loadMovimientos = async () => {
    try {
      const { data, error } = await supabase
        .from("movimientos_stock")
        .select(`
          *,
          stock (nombre),
          profiles:usuario_id (nombre)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovimientos(data as any || []);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    }
  };

  const loadProveedores = async () => {
    try {
      const { data, error } = await supabase
        .from("proveedores")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setProveedores(data || []);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("stock")
        .insert({
          ...formData,
          proveedor_id: formData.proveedor_id || null
        });

      if (error) throw error;

      toast.success("Artículo añadido al stock");
      setIsDialogOpen(false);
      loadStock();
      resetForm();
    } catch (error: any) {
      console.error("Error añadiendo artículo:", error);
      toast.error("Error al añadir artículo");
    }
  };

  const handleMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: movError } = await supabase
        .from("movimientos_stock")
        .insert({
          stock_id: selectedItem,
          tipo: movimientoData.tipo,
          cantidad: movimientoData.cantidad,
          motivo: movimientoData.motivo,
          usuario_id: user.id
        });

      if (movError) throw movError;

      // Actualizar cantidad en stock
      const item = items.find(i => i.id === selectedItem);
      if (item) {
        const nuevaCantidad = movimientoData.tipo === "entrada" 
          ? item.cantidad + movimientoData.cantidad
          : item.cantidad - movimientoData.cantidad;

        const { error: stockError } = await supabase
          .from("stock")
          .update({ cantidad: nuevaCantidad })
          .eq("id", selectedItem);

        if (stockError) throw stockError;
      }

      toast.success("Movimiento registrado");
      setIsMovimientoOpen(false);
      loadData();
      setMovimientoData({ tipo: "entrada", cantidad: 0, motivo: "" });
    } catch (error: any) {
      console.error("Error registrando movimiento:", error);
      toast.error("Error al registrar movimiento");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      categoria: "",
      cantidad: 0,
      nivel_minimo: 5,
      precio_unitario: 0,
      proveedor_id: "",
      ubicacion: "",
      activo: true
    });
  };

  const filteredItems = items.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsBajoMinimo = items.filter(item => item.cantidad <= item.nivel_minimo);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock</h1>
          <p className="text-muted-foreground">Gestión de inventario y almacén</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Añadir Artículo al Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cantidad">Cantidad Inicial *</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nivel_minimo">Nivel Mínimo</Label>
                    <Input
                      id="nivel_minimo"
                      type="number"
                      value={formData.nivel_minimo}
                      onChange={(e) => setFormData({ ...formData, nivel_minimo: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio Unitario</Label>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      value={formData.precio_unitario}
                      onChange={(e) => setFormData({ ...formData, precio_unitario: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Proveedor</Label>
                    <Select value={formData.proveedor_id} onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedores.map((prov) => (
                          <SelectItem key={prov.id} value={prov.id}>
                            {prov.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      placeholder="Ej: Almacén A - Estantería 3"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Añadir Artículo</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {itemsBajoMinimo.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {itemsBajoMinimo.length} artículos por debajo del nivel mínimo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {itemsBajoMinimo.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{item.nombre}</span>
                  <Badge variant="destructive">
                    {item.cantidad} / {item.nivel_minimo}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Artículos en Stock</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{item.nombre}</CardTitle>
                    </div>
                    <Dialog open={isMovimientoOpen && selectedItem === item.id} onOpenChange={(open) => {
                      setIsMovimientoOpen(open);
                      if (open) setSelectedItem(item.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Mover
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Registrar Movimiento - {item.nombre}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleMovimiento} className="space-y-4">
                          <div>
                            <Label>Tipo de Movimiento</Label>
                            <Select value={movimientoData.tipo} onValueChange={(value) => setMovimientoData({ ...movimientoData, tipo: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entrada">Entrada</SelectItem>
                                <SelectItem value="salida">Salida</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="cantidad_mov">Cantidad</Label>
                            <Input
                              id="cantidad_mov"
                              type="number"
                              value={movimientoData.cantidad}
                              onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: parseInt(e.target.value) })}
                              required
                              min="1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="motivo">Motivo</Label>
                            <Textarea
                              id="motivo"
                              value={movimientoData.motivo}
                              onChange={(e) => setMovimientoData({ ...movimientoData, motivo: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <Button type="submit" className="w-full">Registrar Movimiento</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.descripcion && (
                      <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cantidad:</span>
                      <Badge variant={item.cantidad <= item.nivel_minimo ? "destructive" : "default"}>
                        {item.cantidad} uds
                      </Badge>
                    </div>
                    {item.categoria && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Categoría:</span>
                        <Badge variant="secondary">{item.categoria}</Badge>
                      </div>
                    )}
                    {item.ubicacion && (
                      <p className="text-sm text-muted-foreground">📍 {item.ubicacion}</p>
                    )}
                    {item.precio_unitario && (
                      <p className="text-sm font-medium">{item.precio_unitario.toFixed(2)} € / ud</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No se encontraron artículos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-4">
          <div className="space-y-2">
            {movimientos.map((mov) => (
              <Card key={mov.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {mov.tipo === "entrada" ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium">{mov.stock.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(mov.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={mov.tipo === "entrada" ? "success" : "destructive"}>
                        {mov.tipo === "entrada" ? "+" : "-"}{mov.cantidad} uds
                      </Badge>
                      {mov.motivo && (
                        <p className="text-sm text-muted-foreground mt-1">{mov.motivo}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {movimientos.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No hay movimientos registrados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;

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
import { Plus, Search, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Venta {
  id: string;
  numero: number;
  fecha: string;
  cliente_id: string | null;
  tecnico_id: string | null;
  telefono_contacto: string | null;
  email: string | null;
  estado: string;
  seguimiento: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  clientes?: { nombre: string } | null;
  profiles?: { nombre: string } | null;
}

interface Producto {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

const Ventas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<Producto[]>([{
    descripcion: "",
    cantidad: 1,
    precio_unitario: 0,
    total: 0
  }]);
  const [formData, setFormData] = useState({
    cliente_id: "",
    telefono_contacto: "",
    email: "",
    fecha: new Date().toISOString().split('T')[0],
    fecha_entrega: "",
    estado: "pendiente",
    metodo_pago: "",
    seguimiento: "contactado",
    descuento: 0,
    notas: ""
  });

  useEffect(() => {
    loadVentas();
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const loadVentas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some(r => r.role === "admin");

      let query = supabase
        .from("ventas")
        .select(`
          *,
          clientes (nombre),
          profiles:tecnico_id (nombre)
        `)
        .order("numero", { ascending: false });

      if (!isAdmin) {
        query = query.eq("tecnico_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVentas((data || []) as any);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = () => {
    setProductos([...productos, {
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      total: 0
    }]);
  };

  const actualizarProducto = (index: number, campo: string, valor: any) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [campo]: valor,
      total: campo === 'cantidad' || campo === 'precio_unitario' 
        ? (campo === 'cantidad' ? valor : nuevosProductos[index].cantidad) * 
          (campo === 'precio_unitario' ? valor : nuevosProductos[index].precio_unitario)
        : nuevosProductos[index].total
    };
    setProductos(nuevosProductos);
  };

  const eliminarProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const calcularTotales = () => {
    const subtotal = productos.reduce((sum, p) => sum + p.total, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva - formData.descuento;
    return { subtotal, iva, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const totales = calcularTotales();

      const { data: venta, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          ...formData,
          tecnico_id: user.id,
          created_by: user.id,
          subtotal: totales.subtotal,
          iva: totales.iva,
          total: totales.total,
          fecha_entrega: formData.fecha_entrega || null
        })
        .select()
        .single();

      if (ventaError) throw ventaError;

      const productosInsert = productos.map(p => ({
        venta_id: venta.id,
        ...p
      }));

      const { error: productosError } = await supabase
        .from("productos_ventas")
        .insert(productosInsert);

      if (productosError) throw productosError;

      toast.success("Venta creada exitosamente");
      setIsDialogOpen(false);
      loadVentas();
      resetForm();
    } catch (error: any) {
      console.error("Error creando venta:", error);
      toast.error("Error al crear venta");
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      telefono_contacto: "",
      email: "",
      fecha: new Date().toISOString().split('T')[0],
      fecha_entrega: "",
      estado: "pendiente",
      metodo_pago: "",
      seguimiento: "contactado",
      descuento: 0,
      notas: ""
    });
    setProductos([{
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      total: 0
    }]);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "completada": return "success";
      case "pendiente": return "warning";
      case "cancelada": return "destructive";
      default: return "default";
    }
  };

  const getSeguimientoColor = (seguimiento: string) => {
    switch (seguimiento) {
      case "aprobado": return "success";
      case "denegado": return "destructive";
      case "cerrado": return "secondary";
      default: return "default";
    }
  };

  const filteredVentas = ventas.filter(v =>
    v.numero.toString().includes(searchTerm) ||
    v.clientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totales = calcularTotales();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventas</h1>
          <p className="text-muted-foreground">Gestión de ventas y referencias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Referencia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Referencia de Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono contacto</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono_contacto}
                    onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fecha_entrega">Fecha entrega</Label>
                  <Input
                    id="fecha_entrega"
                    type="date"
                    value={formData.fecha_entrega}
                    onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Método de pago</Label>
                  <Select value={formData.metodo_pago} onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="bizum">Bizum</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Productos y Servicios</Label>
                  <Button type="button" size="sm" onClick={agregarProducto}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir
                  </Button>
                </div>
                <div className="space-y-2">
                  {productos.map((producto, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Input
                          placeholder="Descripción"
                          value={producto.descripcion}
                          onChange={(e) => actualizarProducto(index, 'descripcion', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Cant."
                          value={producto.cantidad}
                          onChange={(e) => actualizarProducto(index, 'cantidad', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="Precio"
                          value={producto.precio_unitario}
                          onChange={(e) => actualizarProducto(index, 'precio_unitario', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          value={producto.total.toFixed(2)}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => eliminarProducto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{totales.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%):</span>
                    <span className="font-semibold">{totales.iva.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Label htmlFor="descuento">Descuento:</Label>
                    <Input
                      id="descuento"
                      type="number"
                      className="w-32"
                      value={formData.descuento}
                      onChange={(e) => setFormData({ ...formData, descuento: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{totales.total.toFixed(2)} €</span>
                  </div>
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
                <Button type="submit" className="flex-1">Crear Referencia</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar ventas por número o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredVentas.map((venta) => (
          <Card key={venta.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Venta #{venta.numero} - {venta.clientes?.nombre || "Sin cliente"}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getEstadoColor(venta.estado)}>
                    {venta.estado}
                  </Badge>
                  <Badge variant={getSeguimientoColor(venta.seguimiento)}>
                    {venta.seguimiento}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">{new Date(venta.fecha).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Técnico</p>
                  <p className="font-medium">{venta.profiles?.nombre || "Sin asignar"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {venta.total.toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVentas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron ventas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Ventas;

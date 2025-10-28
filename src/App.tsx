import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NuevoTicket from "./pages/NuevoTicket";
import DetalleTicket from "./pages/DetalleTicket";
import Clientes from "./pages/Clientes";
import DetalleCliente from "./pages/DetalleCliente";
import Dietario from "./pages/Dietario";
import NotFound from "./pages/NotFound";
import Tecnicos from "./pages/Tecnicos";
import Chat from "./pages/Chat";
import Ventas from "./pages/Ventas";
import Stock from "./pages/Stock";
import Furgonetas from "./pages/Furgonetas";
import Protocolos from "./pages/Protocolos";
import ImportarClientes from "./pages/ImportarClientes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/nuevo" element={<NuevoTicket />} />
            <Route path="/tickets/:id" element={<DetalleTicket />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<DetalleCliente />} />
            <Route path="/dietario" element={<Dietario />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/tecnicos" element={<Tecnicos />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/furgonetas" element={<Furgonetas />} />
            <Route path="/protocolos" element={<Protocolos />} />
            <Route path="/importar-clientes" element={<ImportarClientes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

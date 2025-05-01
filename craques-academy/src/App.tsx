import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Alunos from "./pages/Alunos";
import Mensalidades from "./pages/Mensalidades";
import Avaliacoes from "./pages/Avaliacoes";
import Relatorios from "./pages/Relatorios";
import Scout from "./pages/Scout";
import NotFound from "./pages/NotFound";
import Configuracoes from "./pages/Configuracoes";
import GameReports from "./pages/GameReports";
import Receitas from "./pages/Receitas";
import Login from "./pages/Login";
import { useContext } from "react";
import { UserContext, UserProvider } from "./context/UserContext";
import { NoPermissionMessage } from "@/components/auth/NoPermissionMessage";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredPermissions: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, requiredPermissions }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Administradores têm acesso a todos os módulos
  if (user.role === 'admin') {
    return element;
  }

  const hasPermission = requiredPermissions.every(permission => 
    user.permissions && user.permissions.includes(permission)
  );

  if (!hasPermission) {
    return (
      <>
        <NoPermissionMessage />
        <Navigate to="/dashboard" replace />
      </>
    );
  }

  return element;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={<Index />} requiredPermissions={["dashboard"]} />} />
            <Route path="/alunos" element={<ProtectedRoute element={<Alunos />} requiredPermissions={["alunos"]} />} />
            <Route path="/mensalidades" element={<ProtectedRoute element={<Mensalidades />} requiredPermissions={["mensalidades"]} />} />
            <Route path="/receitas" element={<ProtectedRoute element={<Receitas />} requiredPermissions={["receitas"]} />} />
            <Route path="/avaliacoes" element={<ProtectedRoute element={<Avaliacoes />} requiredPermissions={["avaliacoes"]} />} />
            <Route path="/scout" element={<ProtectedRoute element={<Scout />} requiredPermissions={["scout"]} />} />
            <Route path="/relatorio-jogos" element={<ProtectedRoute element={<GameReports />} requiredPermissions={["relatorios"]} />} />
            <Route path="/relatorios" element={<ProtectedRoute element={<Relatorios />} requiredPermissions={["relatorios"]} />} />
            <Route path="/configuracoes" element={<ProtectedRoute element={<Configuracoes />} requiredPermissions={["configuracoes"]} />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </UserProvider>
  </QueryClientProvider>
);

export default App;

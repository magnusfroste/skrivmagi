import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StoryBuilder from "./pages/StoryBuilder";
import StoryView from "./pages/StoryView";
import MySagor from "./pages/MySagor";
import PublicDiscovery from "./pages/PublicDiscovery";
import PublicStoryView from "./pages/PublicStoryView";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassManagement from "./pages/ClassManagement";
import ClassOverview from "./pages/ClassOverview";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/skapa" element={<StoryBuilder />} />
            <Route path="/saga/:id" element={<StoryView />} />
            <Route path="/mina-sagor" element={<MySagor />} />
            <Route path="/sagoscenen" element={<PublicDiscovery />} />
            <Route path="/sagoscenen/visa/:slug" element={<PublicStoryView />} />
            <Route path="/larare" element={<TeacherDashboard />} />
            <Route path="/klass" element={<ClassManagement />} />
            <Route path="/min-klass" element={<ClassOverview />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

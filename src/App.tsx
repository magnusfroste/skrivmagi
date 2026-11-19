import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hem from "./pages/Hem";
import Skapa from "./pages/Skapa";
import Saga from "./pages/Saga";
import MinaSagor from "./pages/MinaSagor";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hem />} />
        <Route path="/skapa" element={<Skapa />} />
        <Route path="/saga/:id" element={<Saga />} />
        <Route path="/mina-sagor" element={<MinaSagor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
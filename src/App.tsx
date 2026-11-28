import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hem from "./pages/Hem";
import Skapa from "./pages/Skapa";
import Saga from "./pages/Saga";
import MinaSagor from "./pages/MinaSagor";
import NotFound from "./pages/NotFound";

// Rösten är inläst med OmniVoice (k2-fsa, CC BY-NC) via Shipholms taltjänst.
// Attributionen ska synas i appen – inte bara på startskärmen.
const ROST_ATTRIBUTION =
  "Rösten är inläst med OmniVoice. Voice: OmniVoice (k2-fsa, CC BY-NC). " +
  "Built with Higgs Materials licensed from Boson AI USA, Inc., Copyright Boson AI USA, Inc., " +
  "All Rights Reserved and Meta Llama 3 licensed under the Meta Llama 3 Community License, " +
  "Copyright Meta Platforms, Inc., All Rights Reserved.";

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
      <p className="rost-attribution mx-auto w-full max-w-4xl px-4 pb-6 pt-2 text-[10px] leading-snug text-muted-foreground/60">
        {ROST_ATTRIBUTION}
      </p>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
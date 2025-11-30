import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/landing/AnimatedSection";
import { 
  Sparkles, 
  BookOpen, 
  Palette, 
  Volume2, 
  Bot, 
  Share2, 
  Mic, 
  Download,
  GraduationCap,
  Users,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Puzzle,
  PenTool,
  Wand2,
  Star,
  Heart,
  Zap
} from "lucide-react";

const Landing = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Sagobyggaren</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => scrollToSection('for-larare')}>
              För lärare
            </Button>
            <Link to="/auth">
              <Button variant="outline">Logga in</Button>
            </Link>
            <Link to="/auth">
              <Button>Kom igång</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Nytt: AI-genererade bilder till din saga!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-fade-in">
            Bygg din egen saga! ✨
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Dra, släpp och skapa magiska berättelser med AI-hjälp. 
            Perfekt för elever i årskurs 1-3!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 gap-2">
                <Palette className="h-5 w-5" />
                Börja bygga!
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 gap-2"
              onClick={() => scrollToSection('hur-fungerar')}
            >
              <BookOpen className="h-5 w-5" />
              Se hur det fungerar
            </Button>
          </div>

          {/* Floating elements animation */}
          <div className="relative mt-16 h-64 overflow-hidden">
            <div className="absolute left-1/4 top-0 animate-bounce delay-100">
              <Star className="h-12 w-12 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="absolute right-1/4 top-8 animate-bounce delay-300">
              <Heart className="h-10 w-10 text-pink-400 fill-pink-400" />
            </div>
            <div className="absolute left-1/3 top-16 animate-bounce delay-500">
              <BookOpen className="h-14 w-14 text-purple-400" />
            </div>
            <div className="absolute right-1/3 top-4 animate-bounce delay-700">
              <Sparkles className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hur-fungerar" className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Så enkelt fungerar det 🧩
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Tre enkla steg till din egen saga
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay={0} direction="up">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-pink-200 bg-pink-50/50 h-full">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🃏</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Välj kort</h3>
                  <p className="text-muted-foreground">
                    Välj karaktärer, platser och händelser från färdiga kort
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={150} direction="up">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-purple-200 bg-purple-50/50 h-full">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🏗️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Bygg din saga</h3>
                  <p className="text-muted-foreground">
                    Dra korten till inledning, huvuddel och avslutning
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300} direction="up">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50/50 h-full">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🔊</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Dela och lyssna</h3>
                  <p className="text-muted-foreground">
                    Få din saga uppläst med en riktig sagoröst!
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Three modes */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Välj din nivå 🎮
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Något för alla – oavsett hur mycket hjälp du vill ha
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AnimatedSection delay={0} direction="left">
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                <div className="h-3 bg-gradient-to-r from-green-400 to-green-500" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Puzzle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Pusselläge</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Enklast!</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Dra och släpp färdiga kort för att bygga din saga. AI:n hjälper dig att skriva texten.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Perfekt för:</span> Åk 1-2
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={150} direction="up">
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-400" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <PenTool className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Halv-fritt läge</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Lagom svårt</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Använd kort som inspiration och skriv egna meningar. AI:n ger förslag när du kör fast.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Perfekt för:</span> Åk 2-3
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300} direction="right">
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                <div className="h-3 bg-gradient-to-r from-purple-400 to-pink-400" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Wand2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Fritt läge</h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Utmaning!</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Skriv helt fritt med stöd från AI-coachen som ger tips och idéer längs vägen.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Perfekt för:</span> Åk 3-4
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Magic features */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Magiska funktioner ✨
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Allt du behöver för att skapa fantastiska sagor
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Volume2, color: 'blue', title: 'Sagoröst', desc: 'Lyssna på din saga med en riktig berättarröst' },
              { icon: Palette, color: 'pink', title: 'AI-bilder', desc: 'Få unika bilder till varje del av sagan' },
              { icon: Bot, color: 'purple', title: 'AI-coach', desc: 'En snäll hjälpare som ger tips när du fastnar' },
              { icon: Share2, color: 'green', title: 'Spara & dela', desc: 'Visa din saga för familj och vänner' },
              { icon: Mic, color: 'orange', title: 'Spela in', desc: 'Läs upp sagan själv och spela in din röst' },
              { icon: Download, color: 'teal', title: 'Ladda ner', desc: 'Skriv ut din saga som en riktig bok' },
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 100} direction="scale">
                <div className="flex items-start gap-4 p-4">
                  <div className={`p-3 bg-${feature.color}-100 rounded-xl shrink-0`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section id="for-larare" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full mb-4">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm font-medium">För pedagoger</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ett digitalt verktyg som stöttar läroplanen
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sagobyggaren är utformat för att stötta undervisningen i svenska enligt Lgr22
              </p>
            </div>
          </AnimatedSection>

          {/* Lgr22 quotes */}
          <AnimatedSection delay={100} direction="left">
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="bg-background border-l-4 border-l-primary">
                <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Koppling till Lgr22 – Svenska, åk 1-3
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">CENTRALT INNEHÅLL – SKRIVA</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Handstil och att skriva med digitala verktyg</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Berättande texter med tydlig <strong>inledning</strong>, <strong>handling</strong> och <strong>avslutning</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Beskrivande och förklarande texter med logisk ordning</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">SYFTE</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Formulera sig och kommunicera i tal och skrift</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Anpassa språket efter olika syften och mottagare</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Urskilja språkliga strukturer och följa språkliga normer</span>
                      </li>
                    </ul>
                  </div>
                </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>

          {/* Three pedagogical benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AnimatedSection delay={0} direction="up">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="p-3 bg-blue-100 rounded-xl w-fit mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Strukturstöd</h3>
                  <p className="text-muted-foreground text-sm">
                    Zonerna (inledning/huvuddel/avslutning) visualiserar narrativ struktur. 
                    Eleverna lär sig berättelseform genom görande.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={150} direction="up">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="p-3 bg-green-100 rounded-xl w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Differentiering</h3>
                  <p className="text-muted-foreground text-sm">
                    Tre nivåer möter varje elev där de är. Pusselläge för nybörjare, 
                    fritt läge för avancerade skribenter.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300} direction="up">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <div className="p-3 bg-purple-100 rounded-xl w-fit mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Lärarvy & Uppföljning</h3>
                  <p className="text-muted-foreground text-sm">
                    Se alla elevers sagor i realtid. Kommentera och ge feedback direkt 
                    i verktyget med färgkodad status.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Tillgängligt för alla ♿
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Designat för att alla elever ska kunna delta
            </p>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {[
              "Uppläsning av all text",
              "Dyslexivänligt typsnitt",
              "Taligenkänning (diktera)",
              "Högkontrastläge",
              "Fungerar på surfplatta",
              "Responsiv design"
            ].map((feature, index) => (
              <AnimatedSection key={feature} delay={index * 50} direction="scale">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* For students */}
            <AnimatedSection delay={0} direction="left">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2">För elever</h3>
                <p className="mb-6 text-white/90">
                  Skapa ditt konto och börja bygga sagor direkt!
                </p>
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Kom igång gratis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* For teachers */}
            <AnimatedSection delay={150} direction="right">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">👩‍🏫</div>
                <h3 className="text-2xl font-bold mb-2">För lärare</h3>
                <p className="mb-6 text-white/90">
                  Skapa lärarkonto för att följa dina elevers arbete
                </p>
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Registrera som lärare
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-background border-t">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-bold">Sagobyggaren</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ett pedagogiskt verktyg för kreativt skrivande i skolan
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

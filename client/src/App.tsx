import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import MarketplacePage from "@/pages/marketplace";
import NoteDetailPage from "@/pages/note-detail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/note/:id" component={NoteDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

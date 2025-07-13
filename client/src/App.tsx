import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { AchievementNotification } from "@/components/achievement-notification";
import Dashboard from "@/pages/dashboard";
import Skills from "@/pages/skills";
import Endorsements from "@/pages/endorsements";
import Directory from "@/pages/directory";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/skills" component={Skills} />
      <Route path="/endorsements" component={Endorsements} />
      <Route path="/directory" component={Directory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-white text-black">
          <Navbar />
          <Router />
          <AchievementNotification />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

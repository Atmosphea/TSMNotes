import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import MarketplacePage from "@/pages/marketplace_new";
import NoteDetailPage from "@/pages/note-detail";
import SellingPage from "@/pages/selling";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Navigation from "@/components/ui/navigation";
import Footer2 from "@/components/ui/footer2";
import { useAuth } from "@/contexts/AuthContext";

function Router() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Switch>
      <Route path="/">
        {() => isAuthenticated ? <Redirect to="/marketplace" /> : <LandingPage />}
      </Route>
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/login">
        {() => isAuthenticated ? <Redirect to="/marketplace" /> : <LoginPage />}
      </Route>
      <Route path="/signup">
        {() => isAuthenticated ? <Redirect to="/marketplace" /> : <SignupPage />}
      </Route>
      <Route path="/note/:id" component={NoteDetailPage} />
      <Route path="/selling">
        {() => (
          <ProtectedRoute>
            <SellingPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/faq" component={() => (<div className="container mx-auto py-12"><h1 className="text-4xl font-bold">FAQ</h1></div>)} />
      <Route path="/my-listings">
        {() => (
          <ProtectedRoute>
            <div className="container mx-auto py-12">
              <h1 className="text-4xl font-bold">My Listings</h1>
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <>
          {/* Fixed footer that sits at the bottom */}
          <Footer2 />
          
          {/* Main content that scrolls over the footer */}
          <div className="content-wrapper">
            <div className="flex flex-col">
              <Navigation />
              <div className="flex-grow">
                <Router />
              </div>
              <Toaster />
            </div>
          </div>
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
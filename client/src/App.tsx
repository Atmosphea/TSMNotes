import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import MarketplacePage from "@/pages/marketplace";
import NoteDetailPage from "@/pages/note-detail";
import SellingPage from "@/pages/selling";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Navigation from "@/components/ui/navigation";
import Footer2 from "@/components/ui/footer2";
import InquiriesPage from "@/pages/inquiries";
import MyInquiriesPage from "@/pages/my-inquiries";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
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
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route
        path="/faq"
        component={() => (
          <div className="container mx-auto py-12">
            <h1 className="text-4xl font-bold">FAQ</h1>
          </div>
        )}
      />
      <Route path="/my-listings">
        {() => (
          <ProtectedRoute>
            <div className="container mx-auto py-12">
              <h1 className="text-4xl font-bold">My Listings</h1>
            </div>
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/inquiries">
        <ProtectedRoute>
          <InquiriesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/my-inquiries">
        <ProtectedRoute>
          <MyInquiriesPage />
        </ProtectedRoute>
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

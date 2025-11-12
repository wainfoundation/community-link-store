import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Discover from "./pages/Discover";
import Auth from "./pages/Auth";
import SellerDashboard from "./pages/SellerDashboard";
import CreateProduct from "./pages/CreateProduct";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import Withdrawals from "./pages/Withdrawals";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Discover />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<SellerDashboard />} />
              <Route path="/create" element={<CreateProduct />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/withdrawals" element={<Withdrawals />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/:username" element={<Store />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

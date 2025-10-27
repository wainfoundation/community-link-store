import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <Package className="h-6 w-6" />
          DigiSell
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

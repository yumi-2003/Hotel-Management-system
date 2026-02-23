import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, ChevronDown } from "lucide-react";

export default function Footer() {
  const [open, setOpen] = useState({
    quick: false,
    support: false,
  });

  return (
    <footer className="bg-spa-deep dark:bg-[#0a1f1f] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold tracking-wide">Comftay</h2>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              Comfort stays, made simple. Discover premium rooms and smooth
              booking.
            </p>

            <div className="mt-6 flex gap-4">
              <Link
                to="/instagram"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Instagram size={18} />
              </Link>

              <Link
                to="/facebook"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Facebook size={18} />
              </Link>

              <Link
                to="/twitter"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <button
              onClick={() => setOpen({ ...open, quick: !open.quick })}
              className="w-full flex justify-between items-center text-left lg:cursor-default"
            >
              <h3 className="text-lg font-semibold">Quick Links</h3>

              <ChevronDown
                className={`lg:hidden transition ${
                  open.quick ? "rotate-180" : ""
                }`}
                size={18}
              />
            </button>

            <ul
              className={`mt-4 space-y-3 text-sm text-white/70 overflow-hidden transition-all duration-300
              ${open.quick ? "max-h-60" : "max-h-0"}
              lg:max-h-full lg:mt-4`}
            >
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="hover:text-white">
                  Rooms
                </Link>
              </li>
              <li>
                <Link to="/amenities" className="hover:text-white">
                  Amenities
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white">
                  Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <button
              onClick={() => setOpen({ ...open, support: !open.support })}
              className="w-full flex justify-between items-center text-left lg:cursor-default"
            >
              <h3 className="text-lg font-semibold">Support</h3>

              <ChevronDown
                className={`lg:hidden transition ${
                  open.support ? "rotate-180" : ""
                }`}
                size={18}
              />
            </button>

            <ul
              className={`mt-4 space-y-3 text-sm text-white/70 overflow-hidden transition-all duration-300
              ${open.support ? "max-h-60" : "max-h-0"}
              lg:max-h-full lg:mt-4`}
            >
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-white">
                  Policies
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold">Stay Updated</h3>
            <p className="mt-4 text-sm text-white/70">
              Get offers and updates directly to your inbox.
            </p>

            <form className="mt-5 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2 rounded-xl bg-white/10 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-spa-teal hover:bg-spa-teal-dark transition text-sm text-white font-medium"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="my-10 border-t border-white/10"></div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-white/60">
          <p>© {new Date().getFullYear()} Comftay. All rights reserved.</p>

          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// src/components/Footer.tsx
import React from "react";
import { Shield, Twitter, Facebook, Linkedin, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Footer(): JSX.Element {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <motion.footer
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
      className="mt-12 bg-[rgba(10,26,47,0.6)] border-t border-white/6 text-[#F7F4EE]"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-[#D4A017]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#D4A017]" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">NILARVS</div>
                <div className="text-xs text-[#D7D4CC]">National ID‑Linked Academic Verification</div>
              </div>
            </div>

            <p className="text-sm text-[#D7D4CC] max-w-xs">
              National ID–linked digital academic records — secure, auditable, and trusted across institutions.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#D7D4CC]">
              <li>
                <Link to="/verify" className="hover:text-[#F7F4EE] transition-opacity">
                  Verify Record
                </Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-[#F7F4EE] transition-opacity">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F7F4EE] transition-opacity">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Institutions</h4>
            <ul className="space-y-2 text-sm text-[#D7D4CC]">
              <li>
                <Link to="/portal" className="hover:text-[#F7F4EE] transition-opacity">
                  Registrar Login
                </Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-[#F7F4EE] transition-opacity">
                  Admin Access
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F7F4EE] transition-opacity">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-[#D7D4CC]">
              <li>support@nilarvs.gov</li>
              <li>+251 911 000 000</li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>

            <div className="mt-4 flex items-center gap-3">
              <a aria-label="Twitter" href="#" className="p-2 rounded-md bg-white/6 hover:bg-white/8">
                <Twitter className="h-4 w-4 text-[#F7F4EE]" />
              </a>
              <a aria-label="Facebook" href="#" className="p-2 rounded-md bg-white/6 hover:bg-white/8">
                <Facebook className="h-4 w-4 text-[#F7F4EE]" />
              </a>
              <a aria-label="LinkedIn" href="#" className="p-2 rounded-md bg-white/6 hover:bg-white/8">
                <Linkedin className="h-4 w-4 text-[#F7F4EE]" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#D7D4CC] opacity-70">© {new Date().getFullYear()} NILARVS. All rights reserved.</div>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-[#D7D4CC] hover:text-[#F7F4EE]">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-[#D7D4CC] hover:text-[#F7F4EE]">
              Terms
            </Link>

            <button
              onClick={scrollTop}
              aria-label="Back to top"
              className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/6 hover:bg-white/8 text-[#F7F4EE]"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="text-sm">Top</span>
            </button>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;


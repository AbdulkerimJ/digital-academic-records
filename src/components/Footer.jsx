import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Mail, Phone, MapPin, Globe, ExternalLink, ArrowUp } from "lucide-react";
import { isPortalSubdomain, getPortalUrl, getMainUrl } from "@/lib/domain";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const isPortal = isPortalSubdomain();

  const renderFooterLink = (item) => {
    if (item.isExternal) {
      return (
        <a href={item.path} className="hover:text-accent transition-colors flex items-center gap-2">
          {item.icon} {item.label}
        </a>
      );
    }
    return (
      <Link to={item.path} className="hover:text-accent transition-colors flex items-center gap-2">
        {item.icon} {item.label}
      </Link>
    );
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-accent/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <a href={getMainUrl()} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-accent flex items-center justify-center rounded-sm">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">NAR</span>
            </a>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs font-body">
              The National Academic Registry (NAR) is the official government registry for academic credentials.
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-sm w-fit">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Secure Registry</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-accent font-display font-bold uppercase tracking-[0.1em] text-xs mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70 font-body">
              <li>{renderFooterLink({ label: "Record Verification", path: isPortal ? `${getMainUrl()}/verify` : "/verify", icon: <Globe className="h-3 w-3" />, isExternal: isPortal })}</li>
              <li>{renderFooterLink({ label: "Student Portal", path: getPortalUrl(), icon: <ExternalLink className="h-3 w-3" />, isExternal: !isPortal })}</li>
              <li>{renderFooterLink({ label: "Registry Information", path: isPortal ? `${getMainUrl()}/about` : "/about", icon: <ExternalLink className="h-3 w-3" />, isExternal: isPortal })}</li>
              <li>{renderFooterLink({ label: "Institutional Support", path: isPortal ? `${getMainUrl()}/contact` : "/contact", icon: <ExternalLink className="h-3 w-3" />, isExternal: isPortal })}</li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="text-accent font-display font-bold uppercase tracking-[0.1em] text-xs mb-6">Governance</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70 font-body">
              <li><a href="#" className="hover:text-accent transition-colors">Ministry of Education</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">National ID Program (Fayda)</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy & Data Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-accent font-display font-bold uppercase tracking-[0.1em] text-xs mb-6">Official Contact</h4>
            <div className="space-y-4 text-sm text-primary-foreground/70 font-body">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>Arada Subcity, Addis Ababa,<br />Federal Democratic Republic of Ethiopia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent shrink-0" />
                <span>+251 11 123 4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent shrink-0" />
                <span>registry@moe.gov.et</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-primary-foreground/50 font-medium">
            &copy; {currentYear} Federal Democratic Republic of Ethiopia. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={scrollTop}
              className="h-10 w-10 rounded-sm bg-accent flex items-center justify-center text-primary hover:bg-accent/90 transition-all shadow-md"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 hover:text-accent transition-colors">Security</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 hover:text-accent transition-colors">Legal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


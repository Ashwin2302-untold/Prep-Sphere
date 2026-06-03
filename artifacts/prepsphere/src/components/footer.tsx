import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Prepsphere</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The digital home for serious learners. Ace every test with structured, smart, and confidence-building prep.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Exams</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">SAT & ACT</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">LSAT & Bar Exam</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">MCAT</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">GRE & GMAT</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nursing (NCLEX)</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">IT Certifications</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Mock Exams</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Smart Flashcards</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Study Plans</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Prepsphere Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-muted-foreground hover:text-primary">Twitter</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">LinkedIn</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">Instagram</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

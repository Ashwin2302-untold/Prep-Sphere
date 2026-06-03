import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, BookOpen, BrainCircuit, LineChart, Target, Zap, Clock, ShieldCheck, GraduationCap } from "lucide-react";
import heroImg from "@/assets/images/hero.png";
import mockExamsImg from "@/assets/images/mock-exams.png";
import analyticsImg from "@/assets/images/analytics.png";
import studyPlanImg from "@/assets/images/study-plan.png";

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-background to-background"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-2xl"
              >
                <motion.div variants={fadeUp} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-accent mr-2"></span>
                  New: AI-Powered Study Plans
                </motion.div>
                <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary mb-6 leading-[1.1]">
                  Don't just study.<br />
                  <span className="text-accent">Engineer your success.</span>
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                  The all-in-one preparation platform for serious learners. From SATs to the Bar Exam, get structured, smart, and confidence-building prep that leaves nothing to chance.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-14 px-8 text-base bg-accent hover:bg-accent/90 text-white rounded-xl" data-testid="hero-cta-start">
                    Start Prep Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl border-primary/20 text-primary hover:bg-primary/5" data-testid="hero-cta-demo">
                    Explore Exams
                  </Button>
                </motion.div>
                <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4 text-sm text-muted-foreground font-medium">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 50,000+ ambitious students</p>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative lg:ml-auto w-full max-w-[600px]"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] lg:aspect-auto lg:h-[600px]">
                  <img 
                    src={heroImg} 
                    alt="Focused student studying at night" 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                    <div className="bg-background/95 backdrop-blur rounded-xl p-4 shadow-lg border border-white/20 flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                          <Target className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold">Mock Exam Score</p>
                      </div>
                      <p className="text-2xl font-bold font-display">94% <span className="text-xs font-normal text-green-600 ml-1">+4% this week</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* LOGO CLOUD / EXAMS COVERED */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">Comprehensive prep for every major milestone</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-70 grayscale">
              {['SAT & ACT', 'LSAT', 'MCAT', 'GRE', 'GMAT', 'BAR EXAM', 'NCLEX', 'AWS CERT'].map((exam) => (
                <div key={exam} className="text-xl md:text-2xl font-bold font-display tracking-tight text-primary">
                  {exam}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE PILLARS GRID */}
        <section id="features" className="py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Everything you need, nothing you don't.</h2>
              <p className="text-lg text-muted-foreground">We stripped away the fluff to build a platform that focuses purely on retention, repetition, and results.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="h-6 w-6" />,
                  title: "Adaptive Mock Exams",
                  desc: "Practice tests that adapt to your skill level, simulating the exact pressure and format of the real thing."
                },
                {
                  icon: <BrainCircuit className="h-6 w-6" />,
                  title: "Smart Flashcards",
                  desc: "Spaced repetition algorithms ensure you review concepts exactly when you're about to forget them."
                },
                {
                  icon: <LineChart className="h-6 w-6" />,
                  title: "Granular Analytics",
                  desc: "Don't guess what to study. Our analytics pinpoint your exact weak spots down to the sub-topic."
                },
                {
                  icon: <Clock className="h-6 w-6" />,
                  title: "Personalized Schedules",
                  desc: "Tell us your test date and available hours. We generate a day-by-day plan to get you there."
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Verified Question Banks",
                  desc: "Thousands of questions sourced from actual past exams and verified by top-percentile scorers."
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Quick Review Mode",
                  desc: "Have 5 minutes? Knock out a micro-quiz while waiting in line to keep your streak alive."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-accent mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE 1: MOCK EXAMS */}
        <section className="py-24 bg-muted/50 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="order-2 lg:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border aspect-[4/3] bg-background">
                  <img src={mockExamsImg} alt="Mock exam interface on tablet" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="order-1 lg:order-2 max-w-xl"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Train like you fight.</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our mock exam engine replicates the exact interface, timing, and pressure of your actual test day. Build stamina and eliminate test anxiety before you even step into the room.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Exact UI replication for digital exams",
                    "Strict timing and section breaks",
                    "Post-exam deep dive answer explanations"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-primary font-medium">
                      <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="h-12 px-6 rounded-xl" data-testid="btn-learn-mocks">
                  Explore Exam Engine
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURE 2: STUDY PLAN */}
        <section className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="max-w-xl"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <Clock className="h-6 w-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">A plan that respects your time.</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Stop wondering what to study today. Prepsphere generates a dynamic, daily schedule based on your test date, your weaknesses, and the exact hours you have available.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Adapts instantly if you miss a day",
                    "Balances new learning with spaced review",
                    "Integrates with Google Calendar & Apple Calendar"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-primary font-medium">
                      <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border aspect-[4/3] bg-background">
                  <img src={studyPlanImg} alt="Organized study desk" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURE 3: ANALYTICS */}
        <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="order-2 lg:order-1"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/3] bg-background">
                  <img src={analyticsImg} alt="Study analytics dashboard" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="order-1 lg:order-2 max-w-xl"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-accent mb-6">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Turn weaknesses into weapons.</h2>
                <p className="text-lg text-primary-foreground/80 mb-8">
                  Our granular analytics engine breaks down your performance topic by topic. Know exactly where you're losing points so you can target your study time with surgical precision.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                    <p className="text-4xl font-bold mb-1">3x</p>
                    <p className="text-sm text-primary-foreground/70">Faster score improvement</p>
                  </div>
                  <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                    <p className="text-4xl font-bold mb-1">98%</p>
                    <p className="text-sm text-primary-foreground/70">Pass rate for active users</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">The proofs in the scores.</h2>
              <p className="text-lg text-muted-foreground">Join thousands of students who traded anxiety for confidence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "I was stuck at 162 on the LSAT for months. Prepsphere's analytics showed me I was losing all my points on conditional logic games. Targeted that, scored 171 on test day.",
                  author: "Sarah M.",
                  exam: "LSAT Score: 171",
                  school: "Now at Columbia Law"
                },
                {
                  quote: "Working full-time while studying for the CPA felt impossible. The daily generated study plan literally saved my sanity. Just passed all 4 sections.",
                  author: "David L.",
                  exam: "CPA Certified",
                  school: "Senior Accountant"
                },
                {
                  quote: "The mock exam UI is so similar to the real MCAT that when I sat down for the actual test, I felt zero anxiety. It just felt like another Tuesday on Prepsphere.",
                  author: "Elena R.",
                  exam: "MCAT Score: 518",
                  school: "Med School Bound"
                }
              ].map((testimonial, i) => (
                <motion.div 
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-muted/30 rounded-2xl p-8 border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 text-accent mb-6">
                      {[1,2,3,4,5].map(star => (
                        <svg key={star} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                  <div>
                    <p className="font-bold text-primary">{testimonial.author}</p>
                    <p className="text-sm font-medium text-accent">{testimonial.exam}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.school}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-3xl p-8 md:p-16 text-center overflow-hidden relative border shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
              <div className="relative z-10 max-w-2xl mx-auto">
                <GraduationCap className="h-16 w-16 text-accent mx-auto mb-8" />
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to crush your goal?</h2>
                <p className="text-xl text-primary-foreground/80 mb-10">
                  Join Prepsphere today. Try our mock exams and smart study planner free for 7 days. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-14 px-8 text-base bg-accent hover:bg-accent/90 text-white rounded-xl" data-testid="cta-bottom-start">
                    Start 7-Day Free Trial
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-xl border-white/20 text-white hover:bg-white/10" data-testid="cta-bottom-pricing">
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

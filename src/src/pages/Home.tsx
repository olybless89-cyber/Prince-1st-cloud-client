import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Globe, BarChart3, Zap, Lock, CreditCard,
  HeadphonesIcon, ChevronRight, ArrowRight, Star,
  ChevronLeft, ChevronRight as ChevronRightIcon, TrendingUp, Award, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const heroSlides = [
  {
    id: 1,
    image: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200266690.png',
    eyebrow: 'Institutional Intelligence',
    title: 'Future-Ready',
    highlight: 'Digital Banking',
    subtitle: 'Harness AI-powered financial tools to grow, protect, and optimise your wealth across global markets.',
    cta: 'Open an Account',
    ctaLink: '/register',
  },
  {
    id: 2,
    image: 'https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200292510.png',
    eyebrow: 'Global Markets',
    title: 'Seamless',
    highlight: 'Wealth Management',
    subtitle: 'Access 120+ global markets and move capital instantly with zero-friction cross-border transactions.',
    cta: 'Explore Investments',
    ctaLink: '/investment',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fit=crop',
    eyebrow: 'Elite Banking',
    title: 'Institutional',
    highlight: 'Private Banking',
    subtitle: 'White-glove concierge service backed by bank-grade security, built for high-net-worth individuals.',
    cta: 'Learn More',
    ctaLink: '/services',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80&fit=crop',
    eyebrow: 'Intelligent Growth',
    title: 'Smarter',
    highlight: 'Investment Solutions',
    subtitle: 'Data-driven portfolio strategies with up to 150% ROI across curated institutional investment tiers.',
    cta: 'View Portfolios',
    ctaLink: '/investment',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1600&q=80&fit=crop',
    eyebrow: 'Security First',
    title: 'Protected',
    highlight: 'Global Transfers',
    subtitle: 'Military-grade encryption and real-time fraud monitoring protect every transaction you make.',
    cta: 'Secure Your Wealth',
    ctaLink: '/register',
  },
];

const features = [
  { icon: Shield, title: 'Wealth Protection', desc: 'Multi-layered institutional security protocols and AES-256 encryption protecting your global assets 24/7.' },
  { icon: Globe, title: 'Global Connectivity', desc: 'Instant cross-border transactions and multi-currency accounts accessible from 120+ countries worldwide.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'AI-driven financial insights and automated portfolio optimisation to maximise your investment returns.' },
];

const investmentPlans = [
  { name: 'Micro Tier', roi: '150%', min: '$500', max: '$2,999', duration: '5 Days', tag: 'Entry Level' },
  { name: 'Growth Plus', roi: '16%', min: '$100', max: '$25,000', duration: '60 Days', tag: 'Recommended', featured: true },
  { name: 'Alpha Elite', roi: '2.5%', min: '$25,000', max: '$100,000', duration: '60 Days', tag: 'Institutional' },
];

const stats = [
  { value: '$2.4B+', label: 'Assets Under Management', icon: TrendingUp },
  { value: '500K+', label: 'Active Global Investors', icon: Users },
  { value: '120+', label: 'Countries Reached', icon: Globe },
  { value: '99.9%', label: 'Transaction Uptime', icon: Award },
];

const testimonials = [
  { name: 'Jameson Thorne', role: 'Portfolio Manager, London', text: 'The institutional-grade tools and white-glove service at Gray Haven Bank are unparalleled. My portfolio has never been more secure or more productive.' },
  { name: 'Elena Rodriguez', role: 'Global Logistics CEO', text: 'Switching to their digital core was a game changer for my global transactions. Speed, security, and absolute transparency.' },
  { name: 'Dr. Alan Grant', role: 'Fintech Researcher', text: 'Gray Haven Bank represents the future of institutional finance. Their focus on digital innovation and user experience is unmatched.' },
  { name: 'Robert Ford', role: 'Private Wealth Manager', text: 'I appreciate the transparency. No hidden fees, great rates, and a support team that actually cares about your financial success.' },
  { name: 'Linda Garcia', role: 'International Trade Director', text: 'The international wire transfer speed is unmatched. I can move funds to my overseas partners instantly. Highly recommended.' },
];

const trustLogos = [
  'SWIFT', 'ISO 27001', 'PCI DSS', 'FDIC Insured', 'FCA Regulated', 'SEC Compliant',
];

export default function HomePage() {
  const [slide, setSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const goToSlide = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSlide(idx);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => goToSlide((slide + 1) % heroSlides.length), [slide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide((slide - 1 + heroSlides.length) % heroSlides.length), [slide, goToSlide]);

  useEffect(() => {
    const t = setInterval(nextSlide, 6000);
    return () => clearInterval(t);
  }, [nextSlide]);

  const current = heroSlides[slide];

  return (
    <div className="w-full overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          HERO — Full-bleed image slider
      ═══════════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen min-h-[680px] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-[8000ms]"
              style={{ transform: i === slide ? 'scale(1)' : 'scale(1.05)' }}
            />
            {/* Multi-layer overlay for premium dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#020d0c]/90 via-[#013d36]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020d0c]/80 via-transparent to-[#020d0c]/30" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col justify-center max-w-7xl mx-auto px-6 md:px-10">
          <div
            className={cn(
              'max-w-2xl transition-all duration-500',
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            )}
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-sm text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {current.eyebrow}
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              {current.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#4ecdc4]">
                {current.highlight}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
              {current.subtitle}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={current.ctaLink}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 text-base rounded-xl teal-glow">
                  {current.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="border border-white/25 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-base rounded-xl backdrop-blur-sm">
                  Account Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Slide counter + progress bar */}
          <div className="absolute bottom-12 left-6 md:left-10 z-20 flex items-center gap-6">
            <div className="flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === slide
                      ? 'w-10 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  )}
                />
              ))}
            </div>
            <span className="text-white/40 text-sm font-mono">
              {String(slide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </span>
          </div>

          {/* Arrow controls */}
          <div className="absolute bottom-10 right-6 md:right-10 z-20 flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/30 hover:border-primary/50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary/30 hover:border-primary/50 transition-all"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-white/30 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-card border-y border-border py-5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-xs font-bold tracking-widest text-muted-foreground uppercase opacity-60 hover:opacity-100 transition-opacity">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          FEATURE CARDS
      ═══════════════════════════════════════════════════════ */}
      <section className="section-muted py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Why Gray Haven Bank</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Built for the Elite</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every feature engineered to serve institutional-grade clients with the precision and discretion they deserve.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-3xl p-10 text-center group hover:-translate-y-3 transition-all duration-500 border border-border hover:border-primary/30">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-500">
                  <Icon className="w-9 h-9 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT — Split image + text
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Digital-First Experience</div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
                Modern Banking,<br />Redefined for You
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We've engineered a global banking architecture that fuses institutional strength with a friction-less digital interface — built for the world's most ambitious investors.
              </p>
              <ul className="space-y-4 mb-10">
                {['Instant Global Fund Transfers', 'AI-Powered Investment Insights', 'Multi-Currency Virtual Cards', '24/7 Priority Concierge Support'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/digital-banking">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-5 rounded-xl font-bold">
                  Discover All Features <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Right: stacked images */}
            <div className="relative h-[480px] hidden md:block">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200266690.png"
                  alt="Digital banking analytics"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#013d36]/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200292510.png"
                  alt="Global financial markets"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#013d36]/60 to-transparent" />
              </div>
              {/* Floating stat card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card rounded-2xl p-5 border border-primary/30 teal-glow shadow-2xl z-10 w-44">
                <div className="text-xs text-muted-foreground mb-1">Portfolio Growth</div>
                <div className="text-3xl font-black text-primary">+48.2%</div>
                <div className="text-xs text-muted-foreground mt-1">YTD Average Return</div>
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-1 rounded-full bg-primary/20 overflow-hidden h-1.5">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${60 + i * 8}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INVESTMENT PLANS
      ═══════════════════════════════════════════════════════ */}
      <section className="section-muted py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Investment Portfolios</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Elite Wealth Plans</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Choose from our institutional-grade investment strategies designed to maximise your global returns.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {investmentPlans.map((plan) => (
              <div key={plan.name} className={cn(
                'rounded-3xl p-8 border transition-all hover:-translate-y-2 duration-300',
                plan.featured ? 'bg-primary border-primary teal-glow' : 'glass-card border-border hover:border-primary/30'
              )}>
                <div className={cn('text-xs font-bold uppercase tracking-widest mb-3', plan.featured ? 'text-primary-foreground/70' : 'text-primary')}>{plan.tag}</div>
                <div className={cn('text-6xl font-black mb-1', plan.featured ? 'text-primary-foreground' : 'text-foreground')}>{plan.roi}</div>
                <div className={cn('text-sm mb-6', plan.featured ? 'text-primary-foreground/70' : 'text-muted-foreground')}>ROI · {plan.duration}</div>
                <div className="font-bold text-2xl mb-6">{plan.name}</div>
                <div className={cn('text-sm space-y-2 mb-8', plan.featured ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  <div>Min: <span className="font-semibold">{plan.min}</span></div>
                  <div>Max: <span className="font-semibold">{plan.max}</span></div>
                </div>
                <Link to="/investment">
                  <Button className={cn('w-full rounded-xl font-bold py-5', plan.featured ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/investment">
              <Button variant="ghost" className="border border-border text-muted-foreground hover:text-primary hover:border-primary px-8">
                View All Portfolios <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS — Full bleed teal banner with background image
      ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200292510.png"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#013d36]/97 via-[#02796b]/90 to-[#013d36]/97" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">Institutional Trust</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Scaling Your Global Future</h2>
            <p className="text-white/60 max-w-lg mx-auto text-sm">Managing billions in assets across the globe — delivering the liquidity and stability that high-performance investors demand.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">{value}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS — Auto-scrolling carousel
      ═══════════════════════════════════════════════════════ */}
      <section className="section-muted py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Social Proof</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Trusted Globally</h2>
            <p className="text-muted-foreground">Hear from the world's most sophisticated investors.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card rounded-3xl p-8 relative border border-border hover:border-primary/30 transition-colors group">
                <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none select-none">"</div>
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-primary text-primary" />)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-[#013d36] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">{t.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA — Image background
      ═══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://miaoda-conversation-file.s3cdn.medo.dev/user-czp3l9tbwef4/app-dkpgdv8fqio1/20260808/image_1786200266690.png"
            alt="CTA background"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-[#020d0c]/85" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Smart. Secure. Reliable.</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Open an account<br />in minutes
          </h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
            Manage your wealth seamlessly and secure your financial future with next-generation digital banking tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-10 py-6 text-base rounded-xl font-bold teal-glow">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="border border-white/25 text-white hover:bg-white/10 hover:border-white/50 px-10 py-6 text-base rounded-xl">
                Talk to an Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

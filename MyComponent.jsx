// ═══════════════════════════════════════════════════════════════
// MIRANDA LIANG — Bespoke Oil Painter Portfolio
// Enhanced with UI/UX Pro Max Design System — Gallery Edition
// Style: Exaggerated Minimalism | Palette: Warm Gallery Neutral + Gold
// Typography: Cormorant Garamond (Display) + Inter (UI)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── REDUCED MOTION DETECTION ─────────────────────────────────────
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

// ─── MOBILE DETECTION ───────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// ─── ARTWORK DATA ───────────────────────────────────────────────
const ARTWORKS = [
  { id: 1, title: "Scarab Study", medium: "Oil on Linen", year: 2024, size: "40×50cm", category: "still-life", image: "/assets/Beetle.JPG", description: "A detailed examination of a scarab beetle, rendered with meticulous attention to the iridescent qualities of its shell. The composition explores the interplay between natural history and artistic interpretation." },
  { id: 2, title: "Avian Grace", medium: "Oil on Canvas", year: 2023, size: "60×80cm", category: "still-life", image: "/assets/bird.JPG", description: "A portrait capturing the delicate plumage and quiet dignity of a songbird. The painting focuses on the subtle variations in feather texture and the luminous quality of the bird's gaze." },
  { id: 3, title: "Tropical Still Life", medium: "Oil on Panel", year: 2024, size: "50×60cm", category: "still-life", image: "/assets/dragonfruit.JPG", description: "An exploration of the exotic dragon fruit, with its striking pink skin and speckled white flesh. The composition celebrates the sculptural quality of tropical produce against a warm, muted background." },
  { id: 4, title: "Garden in Bloom", medium: "Oil on Canvas", year: 2022, size: "70×90cm", category: "still-life", image: "/assets/flowers.JPG", description: "A lush arrangement of seasonal blooms captured at the height of their beauty. The painting emphasizes the translucent quality of petals and the gentle interplay of light through the bouquet." },
  { id: 5, title: "The Lobster", medium: "Oil on Linen", year: 2023, size: "80×100cm", category: "still-life", image: "/assets/lobster.JPG", description: "A marine study celebrating the dramatic form and vivid coloration of the lobster. The work draws inspiration from classical Dutch still life traditions while maintaining a contemporary sensibility." },
];

// ─── LIQUID MORPH BUTTON COMPONENT ──────────────────────────────
function LiquidButton({ children, className, onClick, strength = 0.3 }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < 120) {
        gsap.to(el, {
          x: distX * strength,
          y: distY * strength,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    };

    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
    };

    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength, reducedMotion, isMobile]);

  return (
    <button ref={ref} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── CUSTOM CURSOR WITH LIQUID TRAIL ──────────────────────────────
function CustomCursor() {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const pos = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    let raf;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: pos.current.x,
          y: pos.current.y
        });
      }

      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const delay = (i + 1) * 0.06;
        gsap.to(trail, {
          x: pos.current.x,
          y: pos.current.y,
          duration: 0.5,
          delay: delay,
          ease: "power2.out"
        });
      });
    };

    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hover = el && (el.tagName === "BUTTON" || el.tagName === "A" ||
        el.closest(".art-card") || el.closest(".nav-btn") || el.closest(".liquid"));
      setIsHovering(hover);
    };

    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isMobile]);

  if (isMobile) return null;

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={el => trailRefs.current[i] = el}
          className="cursor-trail"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 10 - i,
            height: 10 - i,
            borderRadius: "50%",
            background: "var(--gold)",
            opacity: 0.12 - i * 0.02,
            pointerEvents: "none",
            zIndex: 9997 - i,
            transform: "translate(-50%, -50%)",
            visibility: isHidden ? "hidden" : "visible"
          }}
        />
      ))}
      <div
        ref={cursorRef}
        className={`cursor-main ${isHovering ? "hovering" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? 70 : 24,
          height: isHovering ? 70 : 24,
          borderRadius: isHovering ? "40% 60% 60% 40% / 60% 40% 60% 40%" : "50%",
          border: isHovering ? "1.5px solid var(--gold)" : "1px solid var(--gold)",
          background: isHovering ? "rgba(184, 134, 11, 0.06)" : "transparent",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1), border 0.3s ease, background 0.3s ease, border-radius 0.4s ease",
          mixBlendMode: "difference",
          visibility: isHidden ? "hidden" : "visible"
        }}
      />
    </>
  );
}

// ─── FLOATING NAV WITH LIQUID GLASS EFFECT ─────────────
function Nav({ active, onNav }) {
  const navRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);

  // Nav is always visible now, but changes style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!navRef.current) return;

    // Wait for page to fully load before showing nav
    const showNav = () => {
      gsap.fromTo(navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: reducedMotion ? 0.3 : 0.8, ease: "power3.out" }
      );
    };

    // Delay nav appearance until after hero animations complete
    const timer = setTimeout(showNav, reducedMotion ? 100 : 2500);

    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const sections = [
    { id: "gallery", label: "Gallery" },
    { id: "about", label: "About" }
  ];

  return (
    <nav ref={navRef} className={`nav ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-brand">
        <span className="nav-logo">ML</span>
        <span className="nav-divider" />
        <span className="nav-year">Est. 2009</span>
      </div>
      <div className="nav-links">
        {sections.map((s) => (
          <LiquidButton
            key={s.id}
            className={`nav-btn ${active === s.id ? "active" : ""}`}
            onClick={() => onNav(s.id)}
            strength={0.2}
          >
            {s.label}
          </LiquidButton>
        ))}
      </div>
    </nav>
  );
}

// ─── CINEMATIC HERO SECTION ───────────
function Hero() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const canvasRef = useRef(null);
  const curtainRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Animated gradient mesh background
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const blobs = [
      { x: width * 0.15, y: height * 0.25, r: isMobile ? 150 : 280, color: "rgba(212, 184, 136, 0.35)", vx: 0.12, vy: 0.06, phase: 0 },
      { x: width * 0.75, y: height * 0.65, r: isMobile ? 180 : 320, color: "rgba(184, 134, 11, 0.28)", vx: -0.1, vy: 0.08, phase: 2 },
      { x: width * 0.4, y: height * 0.15, r: isMobile ? 100 : 200, color: "rgba(139, 90, 43, 0.25)", vx: 0.06, vy: -0.04, phase: 4 },
      { x: width * 0.85, y: height * 0.35, r: isMobile ? 90 : 180, color: "rgba(218, 165, 32, 0.3)", vx: -0.08, vy: 0.1, phase: 1 },
      { x: width * 0.25, y: height * 0.75, r: isMobile ? 120 : 240, color: "rgba(196, 164, 132, 0.32)", vx: 0.1, vy: -0.08, phase: 3 },
    ];

    const particles = [];
    const particleCount = isMobile ? 8 : Math.min(20, Math.floor((width * height) / 50000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() * 4 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let frame;
    let time = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      time += 0.006;

      ctx.fillStyle = "rgba(250, 248, 243, 0.08)";
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time * 0.25) * 120,
        height * 0.4 + Math.cos(time * 0.18) * 100,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      gradient.addColorStop(0, "rgba(212, 184, 136, 0.12)");
      gradient.addColorStop(0.4, "rgba(184, 134, 11, 0.06)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((blob, i) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < -blob.r) blob.x = width + blob.r;
        if (blob.x > width + blob.r) blob.x = -blob.r;
        if (blob.y < -blob.r) blob.y = height + blob.r;
        if (blob.y > height + blob.r) blob.y = -blob.r;

        const morphR = blob.r + Math.sin(time + blob.phase) * 40 + Math.cos(time * 1.2 + blob.phase) * 25;

        ctx.save();
        ctx.translate(blob.x, blob.y);

        ctx.beginPath();
        const points = 8;
        for (let j = 0; j <= points; j++) {
          const angle = (j / points) * Math.PI * 2;
          const radiusVariation = Math.sin(time * 0.4 + blob.phase + j * 0.7) * 0.2 + 1;
          const r = morphR * radiusVariation;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(x, y);
          else {
            const prevAngle = ((j - 1) / points) * Math.PI * 2;
            const cpAngle = prevAngle + (angle - prevAngle) / 2;
            const cpR = morphR * (Math.sin(time * 0.4 + blob.phase + (j - 0.5) * 0.7) * 0.25 + 1);
            const cpx = Math.cos(cpAngle) * cpR;
            const cpy = Math.sin(cpAngle) * cpR;
            ctx.quadraticCurveTo(cpx, cpy, x, y);
          }
        }
        ctx.closePath();

        ctx.filter = "blur(50px)";
        ctx.fillStyle = blob.color;
        ctx.fill();
        ctx.restore();
      });

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.015;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseSize = p.size + Math.sin(p.pulse) * 0.8;
        const pulseOpacity = p.opacity + Math.sin(p.pulse * 0.5) * 0.08;

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, pulseSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 134, 11, ${Math.max(0.05, pulseOpacity)})`;
        ctx.fill();
      });
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion, isMobile]);

  // Cinematic reveal animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: reducedMotion ? 0 : 0.5 });

      if (curtainRef.current && !reducedMotion) {
        tl.to(curtainRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut"
        });
      }

      const chars = titleRef.current?.querySelectorAll(".char");
      if (chars) {
        tl.from(chars, {
          y: reducedMotion ? 0 : 150,
          opacity: 0,
          rotationX: reducedMotion ? 0 : -90,
          duration: reducedMotion ? 0.3 : 1.6,
          stagger: reducedMotion ? 0 : 0.08,
          ease: "power4.out"
        }, reducedMotion ? 0 : "-=0.4");
      }

      tl.from(subtitleRef.current, {
        y: reducedMotion ? 0 : 50,
        opacity: 0,
        duration: reducedMotion ? 0.3 : 1.2,
        ease: "power3.out"
      }, reducedMotion ? 0 : "-=0.8");

      if (!reducedMotion) {
        gsap.to(titleRef.current, {
          y: -120,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5
          }
        });

        gsap.to(subtitleRef.current, {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5
          }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const title = "Miranda";
  const title2 = "Liang";

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <div ref={curtainRef} className="hero-curtain" />
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-glow" />

      <div className="brushstroke brushstroke-1" />
      <div className="brushstroke brushstroke-2" />
      <div className="brushstroke brushstroke-3" />

      <div className="hero-content">
        <div className="hero-label">
          <span className="hero-label-line" />
          <span>Oil Painter</span>
        </div>

        <div className="hero-title-wrapper">
          <h1 ref={titleRef} className="hero-title">
            <span className="title-line">
              {title.split("").map((char, i) => (
                <span key={i} className="char">{char}</span>
              ))}
            </span>
            <span className="title-line title-line-2">
              {title2.split("").map((char, i) => (
                <span key={i} className="char">{char}</span>
              ))}
            </span>
          </h1>
        </div>

        <p ref={subtitleRef} className="hero-subtitle">
          Capturing light through the rich tradition of <em>oil painting</em>
        </p>

        <LiquidButton
          className="hero-cta"
          onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
          strength={0.4}
        >
          <span>View Works</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </LiquidButton>
      </div>

      <div className="hero-meta">
        <div className="hero-meta-item">
          <span className="hero-meta-label">Based in</span>
          <span className="hero-meta-value">Sydney, Aus</span>
        </div>
        <div className="hero-meta-divider" />
        <div className="hero-meta-item">
          <span className="hero-meta-label">Studio</span>
          <span className="hero-meta-value">Since 2009</span>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}

// ─── ART CARD WITH 3D TILT HOVER ──────────────────────────────────
function ArtCard({ art, onOpen, index }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: reducedMotion ? 0 : 100,
        opacity: 0,
        duration: reducedMotion ? 0.3 : 1.2,
        delay: reducedMotion ? 0 : index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index, reducedMotion]);

  const handleMouseMove = (e) => {
    if (reducedMotion || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  return (
    <div
      ref={cardRef}
      className="art-card"
      onClick={() => onOpen(art)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div
        className="art-image"
        style={{
          backgroundImage: `url(${art.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isHovered && !reducedMotion && !isMobile
            ? `scale(1.08) perspective(1200px) rotateX(${(mousePos.y - 0.5) * -12}deg) rotateY(${(mousePos.x - 0.5) * 12}deg)`
            : "scale(1) perspective(1200px) rotateX(0) rotateY(0)",
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />

      <div className={`art-overlay ${isHovered ? "visible" : ""}`}>
        <div className="art-year">{art.year}</div>
        <h3 className="art-title">{art.title}</h3>
        <p className="art-meta">{art.medium} — {art.size}</p>
      </div>

      {!isMobile && (
        <div className="art-shine" style={{
          opacity: isHovered ? 0.15 : 0,
          transform: `translateX(${(mousePos.x - 0.5) * 200}%) translateY(${(mousePos.y - 0.5) * 200}%)`,
          transition: "opacity 0.4s ease, transform 0.1s linear"
        }} />
      )}

      <div className={`art-cursor ${isHovered ? "visible" : ""}`}>
        <span>View</span>
      </div>
    </div>
  );
}

// ─── GALLERY SECTION ────────────────────────────
function Gallery({ onOpen }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const reducedMotion = useReducedMotion();

  const filters = [
    { id: "all", label: "All" },
    { id: "still-life", label: "Still Life" }
  ];

  const filtered = filter === "all"
    ? ARTWORKS
    : ARTWORKS.filter(a => a.category === filter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.children || [], {
        y: reducedMotion ? 0 : 60,
        opacity: 0,
        duration: reducedMotion ? 0.3 : 1,
        stagger: reducedMotion ? 0 : 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%"
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="gallery" id="gallery">
      <div ref={headerRef} className="gallery-header">
        <div className="gallery-header-left">
          <span className="section-eyebrow">Selected Works</span>
          <h2 className="section-title">Gallery</h2>
        </div>
        <div className="gallery-filters">
          {filters.map(f => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-grid">
        {filtered.map((art, i) => (
          <ArtCard
            key={art.id}
            art={art}
            onOpen={onOpen}
            index={i}
          />
        ))}
      </div>

      <div className="gallery-count">
        <span className="count-current">{filtered.length}</span>
        <span className="count-divider" />
        <span className="count-total">{ARTWORKS.length} Works</span>
      </div>
    </section>
  );
}

// ─── LIGHTBOX WITH FIXED ANIMATIONS ──────────────────────────────
function Lightbox({ art, onClose }) {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: reducedMotion ? 0.2 : 0.4, ease: "power2.out" }
      );
      gsap.fromTo(contentRef.current,
        { y: isMobile ? 0 : 60, opacity: 0, scale: isMobile ? 0.98 : 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: reducedMotion ? 0.2 : 0.5, delay: 0.1, ease: "power3.out" }
      );
    });

    return () => {
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [reducedMotion, isMobile]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      y: isMobile ? 100 : 40,
      opacity: 0,
      duration: reducedMotion ? 0.2 : 0.3,
      ease: "power2.in"
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: reducedMotion ? 0.2 : 0.3,
      onComplete: onClose
    });
  };

  if (!art) return null;

  return (
    <div className="lightbox" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div ref={backdropRef} className="lightbox-backdrop" />

      <button className="lightbox-close" onClick={handleClose}>
        <span>Back</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div ref={contentRef} className="lightbox-content">
        <div className="lightbox-image-wrapper">
          <div
            className="lightbox-image"
            style={{ backgroundImage: `url(${art.image})` }}
          />
        </div>

        <div className="lightbox-info">
          <span className="lightbox-eyebrow">Selected Work</span>
          <h2 className="lightbox-title">{art.title}</h2>

          <div className="lightbox-details">
            <div className="detail-row">
              <span className="detail-label">Medium</span>
              <span className="detail-value">{art.medium}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Year</span>
              <span className="detail-value">{art.year}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Dimensions</span>
              <span className="detail-value">{art.size}</span>
            </div>
          </div>

          <p className="lightbox-description">{art.description}</p>

          <button className="lightbox-cta">
            <span>Inquire About This Work</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT SECTION ─────────────────────────────────
function About() {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!reducedMotion) {
        gsap.to(visualRef.current, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
          }
        });
      }

      gsap.from(contentRef.current?.children || [], {
        y: reducedMotion ? 0 : 60,
        opacity: 0,
        duration: reducedMotion ? 0.3 : 1,
        stagger: reducedMotion ? 0 : 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%"
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="about" id="about">
      <div ref={visualRef} className="about-visual">
        <div className="about-image">
          <div className="about-image-inner" />
        </div>
        <div className="about-frame" />
        <div className="about-accent about-accent-1" />
        <div className="about-accent about-accent-2" />
        <div className="about-accent about-accent-3" />
        <div className="about-badge">
          <span className="about-badge-label">The Painter</span>
          <span className="about-badge-name">Miranda Liang</span>
        </div>
      </div>

      <div ref={contentRef} className="about-content">
        <div className="about-header">
          <span className="section-eyebrow">About</span>
          <h2 className="section-title">The Studio</h2>
        </div>

        <div className="about-text">
          <p>
            Working in the tradition of <em>classical oil painting</em>,
            Miranda Liang creates luminous works that capture the subtle
            interplay of light, texture, and emotion.
          </p>
          <p>
            Trained at the Florence Academy of Art and based in a sunlit
            studio in <em>Tuscany</em>, her practice honors centuries-old
            techniques.
          </p>
          <p>
            Her work has been recognized by the Royal Society of Portrait
            Painters and hangs in <em>private collections</em> throughout
            Europe and the United States.
          </p>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <span className="stat-value">15+</span>
            <span className="stat-label">Years Painting</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">200+</span>
            <span className="stat-label">Oil Works</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">18</span>
            <span className="stat-label">Solo Shows</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────
function Footer() {
  const footerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current, {
        opacity: 0,
        y: reducedMotion ? 0 : 40,
        duration: reducedMotion ? 0.3 : 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%"
        }
      });
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer-left">
        <span className="footer-logo">ML</span>
        <span className="footer-divider" />
        <span className="footer-copy">© 2024 Miranda Liang</span>
      </div>
      <div className="footer-center">
        <span>Sydney · Australia</span>
      </div>
      <div className="footer-right">
        <button className="footer-link">Instagram</button>
        <button className="footer-link">Contact</button>
      </div>
    </footer>
  );
}

// ─── SECTION DIVIDER ───────────
function SectionDivider() {
  const dividerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: dividerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={dividerRef} className="section-divider">
      <div className="divider-line" />
      <div className="divider-gold" />
    </div>
  );
}

// ─── GLOBAL STYLES ─────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:              #faf8f3;
    --bg-warm:         #f8f4ec;
    --surface:         #fffef8;
    --surface-2:       #f5f0e8;
    --surface-3:       #ebe6dd;
    --text:            #1a1410;
    --text-muted:      rgba(26, 20, 16, 0.75);
    --text-faint:      rgba(26, 20, 16, 0.5);
    --gold:            #b8860b;
    --gold-light:      #daa520;
    --gold-dark:       #8b6914;
    --gold-pale:       rgba(184, 134, 11, 0.15);
    --gold-faint:      rgba(184, 134, 11, 0.08);
    --accent:          #6b4423;
    --border:          rgba(107, 68, 35, 0.12);
    --border-mid:      rgba(107, 68, 35, 0.2);
    --border-gold:     rgba(184, 134, 11, 0.3);
    --glass-bg:        rgba(255, 254, 248, 0.85);
    --glass-border:    rgba(107, 68, 35, 0.15);
    --font-display:    'Cormorant Garamond', serif;
    --font-body:       'Cormorant Garamond', serif;
    --font-ui:         'Inter', sans-serif;
    --duration-fast:   200ms;
    --duration-normal: 400ms;
    --duration-slow:   600ms;
    --ease-liquid:     cubic-bezier(0.16, 1, 0.3, 1);
    --ease-elastic:    cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    font-size: 18px;
    line-height: 1.6;
    overflow-x: hidden;
    cursor: default;
  }

  @media (hover: hover) and (pointer: fine) {
    body { cursor: none; }
  }

  ::selection {
    background: var(--gold);
    color: var(--surface);
  }

  .section-eyebrow {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 16px;
    display: block;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  /* ─── NAVIGATION — LIQUID GLASS ─────────────────── */
  .nav {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 12px 24px;
    background: linear-gradient(135deg,
      rgba(255,254,248,0.72) 0%,
      rgba(255,254,248,0.82) 50%,
      rgba(255,254,248,0.72) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.5);
    border-radius: 100px;
    min-width: auto;
    box-shadow:
      0 4px 24px rgba(0,0,0,0.08),
      0 1px 2px rgba(0,0,0,0.02),
      inset 0 1px 1px rgba(255,255,255,0.8);
    transition: all 0.5s var(--ease-liquid);
  }

  .nav.scrolled {
    background: linear-gradient(135deg,
      rgba(255,254,248,0.95) 0%,
      rgba(255,254,248,0.9) 50%,
      rgba(255,254,248,0.95) 100%);
    box-shadow:
      0 8px 32px rgba(0,0,0,0.12),
      0 2px 4px rgba(0,0,0,0.04),
      inset 0 1px 1px rgba(255,255,255,0.9);
    padding: 10px 20px;
  }

  .nav:hover {
    background: linear-gradient(135deg,
      rgba(255,254,248,0.9) 0%,
      rgba(255,254,248,0.95) 50%,
      rgba(255,254,248,0.9) 100%);
    box-shadow:
      0 8px 40px rgba(184, 134, 11, 0.15),
      0 2px 4px rgba(0,0,0,0.04),
      inset 0 1px 1px rgba(255,255,255,0.95);
    transform: translateX(-50%) translateY(-2px);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-logo {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--text);
    transition: color 0.3s ease;
  }

  .nav:hover .nav-logo {
    color: var(--gold);
  }

  .nav-divider {
    width: 1px;
    height: 18px;
    background: var(--border-mid);
  }

  .nav-year {
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .nav-links { display: flex; gap: 8px; }

  .nav-btn {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: lowercase;
    color: var(--text-muted);
    background: transparent;
    border: none;
    padding: 10px 20px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s var(--ease-liquid);
    position: relative;
    overflow: hidden;
  }

  .nav-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, var(--gold-pale) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.4s var(--ease-liquid);
  }

  .nav-btn:hover {
    color: var(--gold);
    transform: translateY(-1px);
  }

  .nav-btn:hover::before {
    opacity: 1;
    transform: scale(1.2);
  }

  .nav-btn.active {
    color: var(--gold);
    background: var(--gold-faint);
  }

  /* ─── FILTER BUTTONS ─────────────────────────────────────── */
  .filter-btn {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--border);
    padding: 12px 24px;
    border-radius: 100px;
    cursor: pointer;
    transition: all var(--duration-fast) ease;
  }

  .filter-btn:hover {
    color: var(--gold);
    border-color: var(--gold);
    background: var(--gold-faint);
  }

  .filter-btn.active {
    color: var(--surface);
    background: var(--gold);
    border-color: var(--gold);
    box-shadow: 0 4px 16px rgba(184, 134, 11, 0.3);
  }

  /* ─── HERO ─────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 140px 80px 100px;
    overflow: hidden;
    background: var(--bg);
  }

  .hero-curtain {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, var(--bg) 0%, var(--surface-2) 50%, var(--bg) 100%);
    z-index: 100;
    pointer-events: none;
  }

  .hero-canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.9;
    mix-blend-mode: multiply;
  }

  .hero-glow {
    position: absolute;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(212, 184, 136, 0.35) 0%, rgba(184, 134, 11, 0.15) 40%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    animation: glowPulse 12s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes glowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.2) rotate(5deg); opacity: 0.8; }
  }

  .brushstroke {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
    z-index: 0;
  }

  .brushstroke-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(184, 134, 11, 0.15) 0%, transparent 70%);
    top: 10%;
    right: 15%;
    animation: floatBrush1 15s ease-in-out infinite;
  }

  .brushstroke-2 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(139, 90, 43, 0.12) 0%, transparent 70%);
    bottom: 20%;
    left: 10%;
    animation: floatBrush2 18s ease-in-out infinite;
  }

  .brushstroke-3 {
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(212, 184, 136, 0.2) 0%, transparent 70%);
    top: 60%;
    right: 25%;
    animation: floatBrush3 12s ease-in-out infinite;
  }

  @keyframes floatBrush1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.1); }
    66% { transform: translate(-20px, 30px) scale(0.95); }
  }

  @keyframes floatBrush2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(40px, 20px) scale(1.15); }
  }

  @keyframes floatBrush3 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50% { transform: translate(-30px, -40px) scale(1.1) rotate(10deg); }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-label {
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 32px;
  }

  .hero-label-line {
    width: 40px;
    height: 1px;
    background: var(--gold);
  }

  .hero-title-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 32px;
    align-self: stretch;
  }

  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 10vw, 12rem);
    font-weight: 700;
    line-height: 0.85;
    letter-spacing: -0.05em;
    color: var(--text);
    text-align: center;
    margin: 0;
    text-transform: uppercase;
  }

  .title-line { display: block; color: var(--text); }

  .title-line-2 {
    color: var(--text-muted);
    font-weight: 300;
  }

  .hero-title .char {
    display: inline-block;
    will-change: transform, opacity;
    transform-origin: center bottom;
  }

  .hero-subtitle {
    font-family: var(--font-body);
    font-size: clamp(16px, 1.5vw, 20px);
    font-weight: 400;
    color: var(--text-muted);
    max-width: 420px;
    margin-bottom: 48px;
    line-height: 1.6;
  }

  .hero-subtitle em { color: var(--gold); font-style: italic; }

  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--surface);
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
    border: none;
    padding: 18px 32px;
    border-radius: 100px;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-liquid);
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(184, 134, 11, 0.3);
  }

  .hero-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 100%);
    opacity: 0;
    transition: opacity var(--duration-fast) ease;
  }

  .hero-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(184, 134, 11, 0.4);
  }

  .hero-cta:hover::before { opacity: 1; }

  .hero-cta span, .hero-cta svg { position: relative; z-index: 1; }

  .hero-meta {
    position: absolute;
    bottom: 48px;
    left: 80px;
    display: flex;
    align-items: center;
    gap: 32px;
    z-index: 2;
  }

  .hero-meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hero-meta-label {
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .hero-meta-value {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
  }

  .hero-meta-divider {
    width: 1px;
    height: 32px;
    background: var(--border);
  }

  .scroll-indicator {
    position: absolute;
    bottom: 48px;
    right: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    z-index: 2;
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .scroll-line {
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }

  @keyframes scrollPulse {
    0%, 100% { opacity: 0.4; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.1); }
  }

  /* ─── GALLERY ────────────────────────── */
  .gallery {
    padding: 120px 80px 160px;
    position: relative;
    background: linear-gradient(180deg, var(--bg) 0%, var(--bg-warm) 50%, var(--bg) 100%);
  }

  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 64px;
    gap: 48px;
    flex-wrap: wrap;
  }

  .gallery-header-left { flex: 1; }

  .gallery-filters {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  @media (min-width: 1200px) {
    .gallery-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    .art-card:nth-child(6n+1) { grid-row: span 2; }
    .art-card:nth-child(6n+4) { grid-column: span 2; }
  }

  .gallery-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 80px;
    padding-top: 40px;
    border-top: 1px solid var(--border);
  }

  .count-current {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 300;
    color: var(--gold);
  }

  .count-divider {
    width: 60px;
    height: 1px;
    background: var(--border-mid);
  }

  .count-total {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  /* ─── ART CARD ──────────────────────────── */
  .art-card {
    position: relative;
    aspect-ratio: 4/5;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background: var(--surface-2);
    transform-style: preserve-3d;
    perspective: 1200px;
  }

  .art-card:nth-child(6n+1) { aspect-ratio: 4/5; }
  .art-card:nth-child(6n+4) { aspect-ratio: 16/10; }

  .art-image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    transform-origin: center;
    will-change: transform;
  }

  .art-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26, 20, 16, 0.9) 0%, rgba(26, 20, 16, 0.4) 50%, transparent 100%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 32px;
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-liquid);
  }

  .art-overlay.visible { opacity: 1; }

  .art-year {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--gold-light);
    margin-bottom: 8px;
  }

  .art-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
    color: var(--surface);
    margin-bottom: 8px;
  }

  .art-meta {
    font-family: var(--font-ui);
    font-size: 12px;
    color: rgba(255, 254, 248, 0.7);
  }

  .art-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, transparent 100%);
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: overlay;
  }

  .art-cursor {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--duration-normal) var(--ease-liquid);
    pointer-events: none;
    z-index: 10;
  }

  .art-cursor.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .art-cursor span {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--surface);
  }

  /* ─── ABOUT ──────────────────────────── */
  .about {
    padding: 160px 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 120px;
    align-items: center;
    position: relative;
    background: linear-gradient(180deg, var(--bg-warm) 0%, var(--surface-2) 100%);
  }

  .about-visual {
    position: relative;
    aspect-ratio: 4/5;
  }

  .about-image {
    position: absolute;
    inset: 40px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--surface-3);
  }

  .about-image-inner {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--surface-3) 0%, var(--surface-2) 100%);
  }

  .about-frame {
    position: absolute;
    inset: 0;
    border: 1px solid var(--gold);
    border-radius: 4px;
    opacity: 0.5;
  }

  .about-accent {
    position: absolute;
    width: 80px;
    height: 80px;
    border: 1px solid var(--gold);
    opacity: 0.3;
  }

  .about-accent-1 { top: 0; left: 0; border-right: none; border-bottom: none; }
  .about-accent-2 { top: 0; right: 0; border-left: none; border-bottom: none; }
  .about-accent-3 { bottom: 0; left: 0; border-right: none; border-top: none; }

  .about-badge {
    position: absolute;
    bottom: -20px;
    right: 60px;
    background: var(--surface);
    padding: 24px 32px;
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }

  .about-badge-label {
    display: block;
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-faint);
    margin-bottom: 4px;
  }

  .about-badge-name {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
    color: var(--text);
  }

  .about-content { max-width: 480px; }

  .about-header { margin-bottom: 48px; }

  .about-text {
    font-size: 18px;
    line-height: 1.8;
    color: var(--text-muted);
    margin-bottom: 48px;
  }

  .about-text p { margin-bottom: 24px; }
  .about-text p:last-child { margin-bottom: 0; }
  .about-text em { color: var(--gold); font-style: italic; }

  .about-stats {
    display: flex;
    gap: 48px;
  }

  .stat-item { text-align: center; }

  .stat-value {
    display: block;
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 300;
    color: var(--gold);
    margin-bottom: 8px;
  }

  .stat-label {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  /* ─── SECTION DIVIDER ─────────── */
  .section-divider {
    padding: 0 80px;
    margin: 40px 0;
    position: relative;
    height: 2px;
  }

  .divider-line {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--border-gold) 20%,
      var(--gold) 50%,
      var(--border-gold) 80%,
      transparent 100%
    );
    transform-origin: center;
  }

  .divider-gold {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: var(--gold);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(184, 134, 11, 0.5);
  }

  /* ─── LIGHTBOX ─────────────────── */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }

  .lightbox-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(26, 20, 16, 0.98);
    backdrop-filter: blur(20px);
  }

  .lightbox-close {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 2001;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 254, 248, 0.95);
    border: 1px solid var(--gold);
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.3s var(--ease-liquid);
    color: var(--text);
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  .lightbox-close::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 100px;
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .lightbox-close:hover {
    color: var(--surface);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(184, 134, 11, 0.3);
  }

  .lightbox-close:hover::before {
    opacity: 1;
  }

  .lightbox-close svg {
    width: 20px;
    height: 20px;
  }

  .lightbox-content {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 0;
    background: transparent;
    overflow: hidden;
  }

  .lightbox-image-wrapper {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
  }

  .lightbox-image {
    width: 100%;
    height: 100%;
    max-height: calc(100vh - 120px);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 8px;
  }

  .lightbox-info {
    padding: 80px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--surface);
    max-width: 480px;
    height: 100%;
    overflow-y: auto;
  }

  .lightbox-eyebrow {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 16px;
  }

  .lightbox-title {
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 500;
    margin-bottom: 32px;
    line-height: 1.1;
  }

  .lightbox-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-label {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .detail-value {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
  }

  .lightbox-description {
    font-size: 17px;
    line-height: 1.9;
    color: var(--text-muted);
    margin-bottom: 40px;
    letter-spacing: 0.01em;
  }

  .lightbox-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--surface);
    background: var(--gold);
    border: none;
    padding: 18px 32px;
    border-radius: 100px;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-liquid);
    align-self: flex-start;
  }

  .lightbox-cta:hover {
    background: var(--gold-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(184, 134, 11, 0.3);
  }

  /* ─── FOOTER ────────────────── */
  .footer {
    padding: 40px 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .footer-logo {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 500;
    color: var(--text);
  }

  .footer-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
  }

  .footer-copy {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--text-faint);
  }

  .footer-center {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .footer-right {
    display: flex;
    gap: 24px;
  }

  .footer-link {
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--duration-fast) ease;
  }

  .footer-link:hover { color: var(--gold); }

  .cursor-trail {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9997;
    transform: translate(-50%, -50%);
  }

  /* ─── MOBILE STYLES ──────────────── */
  @media (max-width: 1024px) {
    .hero { padding: 120px 40px 80px; }
    .hero-glow { width: 500px; height: 500px; }
    .hero-meta { left: 40px; bottom: 32px; }
    .scroll-indicator { right: 40px; bottom: 32px; }

    .gallery { padding: 80px 40px 120px; }

    .about {
      grid-template-columns: 1fr;
      padding: 100px 40px;
      gap: 60px;
    }
    .about-visual { max-width: 400px; margin: 0 auto; }
    .about-content { max-width: 100%; text-align: center; }
    .about-stats { justify-content: center; }

    .lightbox-content { grid-template-columns: 1fr; }
    .lightbox-image-wrapper { padding: 80px 40px 40px; height: 60vh; }
    .lightbox-image { max-height: 100%; }
    .lightbox-info {
      max-width: 100%;
      padding: 40px;
      height: auto;
      border-radius: 24px 24px 0 0;
      margin-top: -20px;
    }

    .footer { padding: 40px; flex-wrap: wrap; gap: 24px; justify-content: center; }
  }

  @media (max-width: 768px) {
    .nav {
      top: 12px;
      width: calc(100% - 24px);
      padding: 10px 16px;
      gap: 16px;
    }
    .nav.scrolled { padding: 8px 14px; }
    .nav-brand { gap: 8px; }
    .nav-logo { font-size: 20px; }
    .nav-divider { display: none; }
    .nav-year { display: none; }
    .nav-btn { padding: 8px 14px; font-size: 11px; }

    .hero {
      padding: 100px 20px 60px;
      min-height: auto;
      min-height: 100svh;
    }
    .hero-glow { width: 350px; height: 350px; }
    .hero-title { font-size: clamp(2.5rem, 14vw, 5rem); }
    .hero-content { align-items: center; text-align: center; }
    .hero-title-wrapper { align-self: center; }
    .hero-meta {
      position: relative;
      bottom: auto;
      left: auto;
      margin-top: 40px;
      justify-content: center;
    }
    .scroll-indicator { display: none; }

    .gallery { padding: 60px 20px 80px; }
    .gallery-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 40px;
    }
    .gallery-filters { width: 100%; justify-content: flex-start; overflow-x: auto; padding-bottom: 8px; }
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .art-card { aspect-ratio: 3/4; border-radius: 8px; }
    .art-card:nth-child(6n+1),
    .art-card:nth-child(6n+4) {
      grid-row: span 1;
      grid-column: span 1;
      aspect-ratio: 3/4;
    }
    .art-overlay { padding: 20px; }
    .art-title { font-size: 16px; }
    .art-meta { font-size: 10px; }

    .about { padding: 60px 20px; }
    .about-visual { aspect-ratio: 1/1; }
    .about-image { inset: 20px; }
    .about-badge {
      right: 20px;
      bottom: -10px;
      padding: 12px 20px;
    }
    .about-badge-name { font-size: 16px; }
    .about-text { font-size: 16px; }
    .about-stats { gap: 24px; }
    .stat-value { font-size: 32px; }

    .section-divider { padding: 0 20px; margin: 24px 0; }

    .lightbox { padding: 0; }
    .lightbox-close {
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
    }
    .lightbox-image-wrapper {
      padding: 60px 16px 20px;
      height: 50vh;
    }
    .lightbox-info {
      padding: 32px 24px;
      border-radius: 20px 20px 0 0;
    }
    .lightbox-title { font-size: 28px; }
    .lightbox-cta { width: 100%; align-self: stretch; }

    .footer {
      padding: 24px 20px;
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }
  }

  @media (max-width: 480px) {
    .gallery-grid {
      grid-template-columns: 1fr;
    }
    .filter-btn { flex: 1; text-align: center; font-size: 11px; padding: 10px 16px; }

    .hero-title { font-size: clamp(2rem, 12vw, 4rem); }
  }
`;

// ─── MAIN COMPONENT ─────────────────────────────
export default function MirandaPortfolio() {
  const [activeSection, setActiveSection] = useState("hero");
  const [lightboxArt, setLightboxArt] = useState(null);
  const mainRef = useRef(null);

  const handleNav = useCallback((section) => {
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    }
  }, []);

  const openLightbox = useCallback((art) => setLightboxArt(art), []);
  const closeLightbox = useCallback(() => setLightboxArt(null), []);

  useEffect(() => {
    const sections = ["hero", "gallery", "about"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <CustomCursor />
      <Nav active={activeSection} onNav={handleNav} />

      <main ref={mainRef}>
        <Hero />
        <SectionDivider />
        <Gallery onOpen={openLightbox} />
        <SectionDivider />
        <About />
        <Footer />
      </main>

      {lightboxArt && (
        <Lightbox art={lightboxArt} onClose={closeLightbox} />
      )}
    </>
  );
}


// ═══════════════════════════════════════════════════════════════
// MIRANDA LIANG — Bespoke Oil Painter Portfolio
// Premium animations with GSAP + bespoke interactions
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── ARTWORK DATA ─────────────────────────────────────────────
const ARTWORKS = [
  { id: 1, title: "Morning in Provence", medium: "Oil on Linen", year: 2024, size: "90×120cm", category: "landscape", gradient: "linear-gradient(135deg,#c9a86c 0%,#d4b896 30%,#8b7355 60%,#5c4a3a 100%)" },
  { id: 2, title: "Studio Still Life", medium: "Oil on Canvas", year: 2023, size: "60×80cm", category: "still-life", gradient: "linear-gradient(160deg,#3d3229 0%,#6b5344 40%,#a08060 70%,#d4c4a8 100%)" },
  { id: 3, title: "Venetian Light", medium: "Oil on Panel", year: 2024, size: "50×70cm", category: "landscape", gradient: "linear-gradient(120deg,#8b4513 0%,#cd853f 30%,#f4a460 60%,#ffe4b5 100%)" },
  { id: 4, title: "Portrait of Clara", medium: "Oil on Linen", year: 2022, size: "65×50cm", category: "portrait", gradient: "linear-gradient(90deg,#2c1810 0%,#5c3a2e 35%,#8b5a4c 65%,#c4a090 100%)" },
  { id: 5, title: "The Olive Grove", medium: "Oil on Canvas", year: 2023, size: "100×80cm", category: "landscape", gradient: "linear-gradient(150deg,#1e3d1e 0%,#4a6741 30%,#8fbc8f 60%,#c4d4b5 100%)" },
  { id: 6, title: "Evening Harbour", medium: "Oil on Panel", year: 2024, size: "70×90cm", category: "landscape", gradient: "linear-gradient(135deg,#1a2a3a 0%,#2e4050 25%,#4a6780 55%,#7a9ab0 85%,#b0c4de 100%)" },
  { id: 7, title: "Copper Vessels", medium: "Oil on Canvas", year: 2022, size: "50×60cm", category: "still-life", gradient: "linear-gradient(170deg,#4a3020 0%,#8b4513 35%,#cd853f 65%,#deb887 100%)" },
  { id: 8, title: "Winter Fields", medium: "Oil on Linen", year: 2023, size: "80×100cm", category: "landscape", gradient: "linear-gradient(120deg,#3a3a3a 0%,#6b6b6b 30%,#9a9a9a 60%,#d0d0d0 100%)" },
  { id: 9, title: "Peonies in Bloom", medium: "Oil on Canvas", year: 2024, size: "60×60cm", category: "still-life", gradient: "linear-gradient(180deg,#4a0e2e 0%,#8b2f5c 25%,#d4a5c4 55%,#f5e6f0 100%)" },
  { id: 10, title: "The Weaver", medium: "Oil on Panel", year: 2021, size: "70×50cm", category: "portrait", gradient: "linear-gradient(140deg,#2a2020 0%,#5c4a3a 35%,#8b7355 65%,#c4b5a0 100%)" },
  { id: 11, title: "Summer Coast", medium: "Oil on Linen", year: 2024, size: "90×120cm", category: "landscape", gradient: "linear-gradient(135deg,#1e3a5f 0%,#4682b4 30%,#87ceeb 60%,#f0f8ff 100%)" },
  { id: 12, title: "Self Portrait", medium: "Oil on Canvas", year: 2023, size: "50×40cm", category: "portrait", gradient: "linear-gradient(90deg,#3d2817 0%,#6b4423 30%,#a0522d 60%,#daa520 100%)" },
];

// ─── TEXT SCRAMBLE HOOK ───────────────────────────────────────
function useTextScramble(text, trigger) {
  const [display, setDisplay] = useState(text);
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  
  useEffect(() => {
    if (!trigger) return;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(prev => text.split("").map((char, idx) => {
        if (idx < iteration) return text[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1/3;
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return display;
}

// ─── MAGNETIC BUTTON COMPONENT ─────────────────────────────────
function MagneticButton({ children, className, onClick, strength = 0.3 }) {
  const ref = useRef(null);
  const bound = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      if (dist < 100) {
        gsap.to(el, {
          x: distX * strength,
          y: distY * strength,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };
    
    const handleLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
    };
    
    window.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength]);

  return (
    <button ref={ref} className={className} onClick={onClick}>
      {children}
    </button>
  );
}

// ─── MOBILE DETECTION ─────────────────────────────────────────
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// ─── CUSTOM CURSOR WITH TRAIL ─────────────────────────────────
function CustomCursor() {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const isMobileRef = useRef(false);

  // Check for touch device once on mount
  useEffect(() => {
    isMobileRef.current = isTouchDevice();
  }, []);

  useEffect(() => {
    let raf;
    let lastX = 0, lastY = 0;
    
    const animate = () => {
      raf = requestAnimationFrame(animate);
      
      // Smooth follow for main cursor
      if (cursorRef.current) {
        gsap.set(cursorRef.current, {
          x: pos.current.x,
          y: pos.current.y
        });
      }
      
      // Trail with delay
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const delay = (i + 1) * 0.08;
        gsap.to(trail, {
          x: pos.current.x,
          y: pos.current.y,
          duration: 0.4,
          delay: delay,
          ease: "power2.out"
        });
      });
    };
    
    const handleMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      vel.current = { x: e.clientX - lastX, y: e.clientY - lastY };
      lastX = e.clientX;
      lastY = e.clientY;
      
      // Check hover state
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hover = el && (el.tagName === "BUTTON" || el.tagName === "A" || 
        el.closest(".art-card") || el.closest(".nav-btn") || el.closest(".magnetic"));
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
  }, []);

  // Don't render cursor on touch devices
  if (typeof window !== 'undefined' && isTouchDevice()) {
    return null;
  }

  return (
    <>
      {/* Trail dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={el => trailRefs.current[i] = el}
          className="cursor-trail"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 8 - i,
            height: 8 - i,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.15 - i * 0.02,
            pointerEvents: "none",
            zIndex: 9997 - i,
            transform: "translate(-50%, -50%)",
            visibility: isHidden ? "hidden" : "visible"
          }}
        />
      ))}
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`cursor-main ${isHovering ? "hovering" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? 60 : 20,
          height: isHovering ? 60 : 20,
          borderRadius: "50%",
          border: isHovering ? "2px solid var(--accent)" : "1px solid var(--accent)",
          background: isHovering ? "rgba(107, 68, 35, 0.1)" : "transparent",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          transition: "width 0.3s ease, height 0.3s ease, border 0.3s ease, background 0.3s ease",
          mixBlendMode: "difference",
          visibility: isHidden ? "hidden" : "visible"
        }}
      />
      {/* Center dot */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 10000,
          transform: "translate(-50%, -50%)",
          x: pos.current.x,
          y: pos.current.y,
          visibility: isHidden ? "hidden" : "visible"
        }}
      />
    </>
  );
}

// ─── FLOATING NAV ──────────────────────────────────────────────
function Nav({ active, onNav }) {
  const navRef = useRef(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -100,
        opacity: 0,
        duration: 1.2,
        delay: 1.5,
        ease: "power3.out"
      });
    });
    return () => ctx.revert();
  }, []);

  const sections = ["gallery", "about"];

  return (
    <nav ref={navRef} className="nav">
      <div className="nav-brand">
        <span className="nav-logo">ML</span>
        <span className="nav-divider" />
        <span className="nav-year">Est. 2009</span>
      </div>
      <div className="nav-links">
        {sections.map((s) => (
          <MagneticButton
            key={s}
            className={`nav-btn ${active === s ? "active" : ""}`}
            onClick={() => onNav(s)}
            strength={0.2}
          >
            {s}
          </MagneticButton>
        ))}
      </div>
    </nav>
  );
}

// ─── HERO SECTION WITH PARALLAX ────────────────────────────────
function Hero() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const canvasRef = useRef(null);

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const particleCount = Math.min(25, Math.floor((width * height) / 40000));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        // Very slow organic movement
        p.x += p.vx;
        p.y += p.vy;
        
        // Gentle direction changes for floating effect
        p.vx += (Math.random() - 0.5) * 0.001;
        p.vy += (Math.random() - 0.5) * 0.001;
        
        // Keep velocity visible but calm
        const maxSpeed = 0.3;
        p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
        p.vy = Math.max(-maxSpeed, Math.min(maxSpeed, p.vy));
        
        // Minimum speed to ensure movement
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.1;
        
        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(107, 68, 35, ${p.opacity})`;
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
  }, []);

  // GSAP animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      
      // Title character animation
      const chars = titleRef.current?.querySelectorAll(".char");
      if (chars) {
        tl.from(chars, {
          y: 120,
          opacity: 0,
          rotationX: -90,
          duration: 1.4,
          stagger: 0.05,
          ease: "power4.out"
        });
      }
      
      // Subtitle
      tl.from(subtitleRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.6");
      
      // Parallax on scroll
      gsap.to(titleRef.current, {
        y: 200,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, sectionRef);
    
    return () => ctx.revert();
  }, []);

  const title = "Miranda";
  const title2 = "Liang";

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      
      <div className="hero-content">
        <div className="hero-label">
          <span className="hero-label-line" />
          <span>Oil Painter</span>
        </div>
        
        <div className="hero-title-wrapper">
          <h1 ref={titleRef} className="hero-title">
            <span className="title-line">
              {title.split("").map((char, i) => (
                <span key={i} className="char">
                  {char}
                </span>
              ))}
            </span>
            <span className="title-line title-line-2">
              {title2.split("").map((char, i) => (
                <span key={i} className="char">
                  {char}
                </span>
              ))}
            </span>
          </h1>
        </div>
        
        <p ref={subtitleRef} className="hero-subtitle">
          Capturing light through the rich tradition of <em>oil painting</em>
        </p>
        
        <MagneticButton 
          className="hero-cta"
          onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
          strength={0.4}
        >
          <span>View Works</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </MagneticButton>
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

// ─── ART CARD WITH HOVER EFFECTS ───────────────────────────────
function ArtCard({ art, onOpen, index }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    }, cardRef);
    return () => ctx.revert();
  }, [index]);

  const handleMouseMove = (e) => {
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
        ref={imageRef}
        className="art-image"
        style={{
          background: art.gradient,
          transform: isHovered 
            ? `scale(1.05) perspective(1000px) rotateX(${(mousePos.y - 0.5) * -10}deg) rotateY(${(mousePos.x - 0.5) * 10}deg)`
            : "scale(1) perspective(1000px) rotateX(0) rotateY(0)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
      
      <div className={`art-overlay ${isHovered ? "visible" : ""}`}>
        <div className="art-year">{art.year}</div>
        <h3 className="art-title">{art.title}</h3>
        <p className="art-meta">{art.medium} — {art.size}</p>
      </div>
      
      <div className={`art-cursor ${isHovered ? "visible" : ""}`}>
        <span>View</span>
      </div>
    </div>
  );
}

// ─── GALLERY SECTION ───────────────────────────────────────────
function Gallery({ onOpen }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [hoveredFilter, setHoveredFilter] = useState(null);
  
  const filters = [
    { id: "all", label: "All Works" },
    { id: "landscape", label: "Landscapes" },
    { id: "portrait", label: "Portraits" },
    { id: "still-life", label: "Still Life" }
  ];
  
  const filtered = filter === "all" 
    ? ARTWORKS 
    : ARTWORKS.filter(a => a.category === filter);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 80%"
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="gallery" id="gallery">
      <div ref={headerRef} className="gallery-header">
        <div className="gallery-header-left">
          <span className="section-eyebrow">Selected Works</span>
          <h2 className="section-title">Gallery</h2>
        </div>
        <div className="gallery-filters">
          {filters.map(f => (
            <MagneticButton
              key={f.id}
              className={`filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
              strength={0.15}
            >
              <span
                onMouseEnter={() => setHoveredFilter(f.id)}
                onMouseLeave={() => setHoveredFilter(null)}
              >
                {f.label}
              </span>
            </MagneticButton>
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

// ─── LIGHTBOX WITH SMOOTH ANIMATIONS ───────────────────────────
function Lightbox({ art, onClose }) {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(contentRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, delay: 0.1, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      y: 40,
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in"
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: onClose
    });
  };

  return (
    <div className="lightbox" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div ref={backdropRef} className="lightbox-backdrop" />
      
      <MagneticButton className="lightbox-close" onClick={handleClose} strength={0.3}>
        <span>Close</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </MagneticButton>
      
      <div ref={contentRef} className="lightbox-content">
        <div className="lightbox-image" style={{ background: art.gradient }} />
        
        <div className="lightbox-info">
          <span className="lightbox-eyebrow">Selected Work</span>
          <h2 className="lightbox-title">{art.title}</h2>
          
          <div className="lightbox-details">
            {[
              ["Medium", art.medium],
              ["Year", art.year],
              ["Dimensions", art.size]
            ].map(([label, value]) => (
              <div key={label} className="detail-row">
                <span className="detail-label">{label}</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
          
          <p className="lightbox-description">
            A study in <em>light and texture</em>, this oil painting invites the 
            viewer to experience the depth and luminosity that only traditional 
            medium can achieve — layer upon layer of pigment and glaze.
          </p>
          
          <MagneticButton className="lightbox-cta" strength={0.25}>
            <span>Inquire About This Work</span>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT SECTION ─────────────────────────────────────────────
function About() {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax for visual
      gsap.to(visualRef.current, {
        y: -80,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
      
      // Staggered content reveal
      gsap.from(contentRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%"
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="about" id="about">
      <div ref={visualRef} className="about-visual">
        <div className="about-image">
          <div className="about-image-inner" />
        </div>
        <div className="about-frame" />
        
        {/* Decorative elements */}
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
            interplay of light, texture, and emotion. Each canvas is built 
            up through layers of rich pigment and glazing.
          </p>
          <p>
            Trained at the Florence Academy of Art and based in a sunlit 
            studio in <em>Tuscany</em>, her practice honors centuries-old 
            techniques while exploring contemporary subject matter.
          </p>
          <p>
            Her work has been recognized by the Royal Society of Portrait 
            Painters and hangs in <em>private collections</em> throughout 
            Europe and the United States.
          </p>
        </div>
        
        <div className="about-stats">
          {[
            { value: "15+", label: "Years Painting" },
            { value: "200+", label: "Oil Works" },
            { value: "18", label: "Solo Shows" }
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────
function Footer() {
  const footerRef = useRef(null);
  
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%"
        }
      });
    });
    return () => ctx.revert();
  }, []);

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
        <MagneticButton className="footer-link" strength={0.2}>
          Instagram
        </MagneticButton>
        <MagneticButton className="footer-link" strength={0.2}>
          Contact
        </MagneticButton>
      </div>
    </footer>
  );
}

// ─── GLOBAL STYLES ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #faf8f3;
    --surface: #fffef8;
    --surface-2: #f5f0e8;
    --text: #1a1410;
    --text-muted: rgba(26, 20, 16, 0.75);
    --accent: #6b4423;
    --accent-light: #8b6914;
    --border: rgba(107, 68, 35, 0.12);
    --font-display: 'Cormorant Garamond', serif;
    --font-body: 'Cormorant Garamond', serif;
    --font-ui: 'Inter', sans-serif;
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
    background: var(--accent);
    color: var(--surface);
  }
  
  /* ─── TYPOGRAPHY ──────────────────────────────────────────── */
  .section-eyebrow {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
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
  
  /* ─── NAVIGATION ────────────────────────────────────────────── */
  .nav {
    position: fixed;
    top: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    padding: 16px 32px;
    background: rgba(250, 248, 243, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 100px;
    min-width: 400px;
  }
  
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .nav-logo {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.02em;
  }
  
  .nav-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
  }
  
  .nav-year {
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  
  .nav-links {
    display: flex;
    gap: 8px;
  }
  
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
    cursor: none;
    transition: color 0.3s ease, background 0.3s ease;
  }
  
  .nav-btn:hover, .nav-btn.active {
    color: var(--text);
    background: rgba(107, 68, 35, 0.08);
  }
  
  /* ─── HERO SECTION ──────────────────────────────────────────── */
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 120px 80px;
    overflow: hidden;
  }
  
  .hero-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
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
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 32px;
  }
  
  .hero-label-line {
    width: 40px;
    height: 1px;
    background: var(--accent);
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
    font-size: clamp(80px, 12vw, 160px);
    font-weight: 500;
    line-height: 0.9;
    letter-spacing: -0.03em;
    color: var(--text);
    text-align: center;
    margin: 0;
  }
  
  .title-line {
    display: block;
    color: var(--text);
  }
  
  .title-line-2 {
    color: var(--accent);
  }
  
  .hero-title .char {
    display: inline-block;
  }
  
  .hero-subtitle {
    font-size: clamp(18px, 2vw, 24px);
    font-weight: 300;
    font-style: italic;
    color: var(--text-muted);
    max-width: 400px;
    margin-bottom: 48px;
  }
  
  .hero-subtitle em {
    color: var(--text);
    font-style: italic;
  }
  
  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text);
    background: transparent;
    border: 1px solid var(--border);
    padding: 16px 28px;
    border-radius: 100px;
    cursor: none;
    transition: border-color 0.3s ease, background 0.3s ease;
    align-self: center;
  }
  
  .hero-cta:hover {
    border-color: var(--accent);
    background: rgba(107, 68, 35, 0.04);
  }
  
  .hero-cta svg {
    transform: rotate(-45deg);
    transition: transform 0.3s ease;
  }
  
  .hero-cta:hover svg {
    transform: rotate(0deg);
  }
  
  .hero-meta {
    position: absolute;
    bottom: 80px;
    left: 80px;
    display: flex;
    align-items: center;
    gap: 24px;
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
    color: var(--text-muted);
  }
  
  .hero-meta-value {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
  }
  
  .hero-meta-divider {
    width: 1px;
    height: 30px;
    background: var(--border);
  }
  
  .scroll-indicator {
    position: absolute;
    bottom: 80px;
    right: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  
  .scroll-line {
    width: 1px;
    height: 60px;
    background: linear-gradient(to bottom, var(--accent), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  
  @keyframes scrollPulse {
    0%, 100% { opacity: 1; transform: scaleY(1); }
    50% { opacity: 0.5; transform: scaleY(0.8); }
  }
  
  /* ─── GALLERY SECTION ─────────────────────────────────────── */
  .gallery {
    padding: 160px 80px;
  }
  
  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 80px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--border);
  }
  
  .gallery-filters {
    display: flex;
    gap: 8px;
  }
  
  .filter-btn {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid transparent;
    padding: 12px 24px;
    border-radius: 100px;
    cursor: none;
    transition: all 0.3s ease;
  }
  
  .filter-btn:hover {
    color: var(--text);
    border-color: var(--border);
  }
  
  .filter-btn.active {
    color: var(--accent);
    border-color: var(--accent);
    background: rgba(107, 68, 35, 0.04);
  }
  
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 80px;
    gap: 24px;
  }
  
  .art-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    cursor: none;
    grid-column: span 4;
    grid-row: span 5;
  }
  
  .art-card:nth-child(6n+1) { grid-column: span 5; grid-row: span 6; }
  .art-card:nth-child(6n+2) { grid-column: span 3; grid-row: span 4; }
  .art-card:nth-child(6n+3) { grid-column: span 4; grid-row: span 5; }
  .art-card:nth-child(6n+4) { grid-column: span 5; grid-row: span 5; }
  .art-card:nth-child(6n+5) { grid-column: span 4; grid-row: span 6; }
  .art-card:nth-child(6n+0) { grid-column: span 3; grid-row: span 5; }
  
  .art-image {
    position: absolute;
    inset: 0;
    border-radius: 8px;
  }
  
  .art-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(26, 20, 16, 0.9) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.5s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 32px;
  }
  
  .art-overlay.visible {
    opacity: 1;
  }
  
  .art-year {
    position: absolute;
    top: 24px;
    right: 24px;
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--surface);
    background: rgba(26, 20, 16, 0.6);
    padding: 8px 16px;
    border-radius: 100px;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.4s ease 0.1s;
  }
  
  .art-overlay.visible .art-year {
    opacity: 1;
    transform: translateY(0);
  }
  
  .art-title {
    font-family: var(--font-display);
    font-size: clamp(18px, 2vw, 28px);
    font-weight: 500;
    color: var(--surface);
    margin-bottom: 8px;
    transform: translateY(20px);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .art-overlay.visible .art-title {
    transform: translateY(0);
  }
  
  .art-meta {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 254, 248, 0.7);
    transform: translateY(20px);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
  }
  
  .art-overlay.visible .art-meta {
    transform: translateY(0);
  }
  
  .art-cursor {
    position: fixed;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text);
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
    transition: opacity 0.3s ease, transform 0.3s ease;
    mix-blend-mode: difference;
  }
  
  .art-cursor.visible {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  
  .gallery-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 80px;
    padding-top: 40px;
    border-top: 1px solid var(--border);
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  
  .count-current {
    font-size: 24px;
    font-weight: 500;
    color: var(--accent);
  }
  
  .count-divider {
    width: 40px;
    height: 1px;
    background: var(--border);
  }
  
  /* ─── LIGHTBOX ────────────────────────────────────────────── */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  
  .lightbox-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(250, 248, 243, 0.98);
    backdrop-filter: blur(20px);
  }
  
  .lightbox-close {
    position: absolute;
    top: 40px;
    right: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    background: transparent;
    border: 1px solid var(--border);
    padding: 12px 20px;
    border-radius: 100px;
    cursor: none;
    transition: all 0.3s ease;
    z-index: 10;
  }
  
  .lightbox-close:hover {
    color: var(--text);
    border-color: var(--accent);
  }
  
  .lightbox-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 60px;
    max-width: 1200px;
    width: 100%;
    align-items: center;
  }
  
  .lightbox-image {
    aspect-ratio: 4/3;
    border-radius: 12px;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15);
  }
  
  .lightbox-info {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .lightbox-eyebrow {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
  }
  
  .lightbox-title {
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 48px);
    font-weight: 400;
    line-height: 1.1;
  }
  
  .lightbox-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-ui);
    font-size: 13px;
  }
  
  .detail-label {
    color: var(--text-muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  
  .detail-value {
    font-weight: 500;
  }
  
  .lightbox-description {
    font-size: 18px;
    font-weight: 300;
    font-style: italic;
    line-height: 1.7;
    color: var(--text-muted);
  }
  
  .lightbox-description em {
    color: var(--text);
    font-style: italic;
  }
  
  .lightbox-cta {
    display: inline-flex;
    align-self: flex-start;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--surface);
    background: var(--accent);
    border: none;
    padding: 16px 32px;
    border-radius: 100px;
    cursor: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-top: 16px;
  }
  
  .lightbox-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(107, 68, 35, 0.3);
  }
  
  /* ─── ABOUT SECTION ────────────────────────────────────────── */
  .about {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 120px;
    padding: 160px 80px;
    min-height: 100vh;
    min-height: 100dvh;
    align-items: center;
  }
  
  .about-visual {
    position: relative;
    aspect-ratio: 3/4;
  }
  
  .about-image {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .about-image-inner {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, #3d2817, #6b4423, #8b6914);
    animation: gradientShift 10s ease infinite alternate;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  
  .about-frame {
    position: absolute;
    inset: 24px;
    border: 1px solid rgba(255, 254, 248, 0.2);
    border-radius: 8px;
    pointer-events: none;
  }
  
  .about-accent {
    position: absolute;
    border: 1px solid rgba(139, 105, 20, 0.3);
    border-radius: 50%;
  }
  
  .about-accent-1 {
    width: 80px;
    height: 80px;
    top: -20px;
    right: 40px;
    animation: float 6s ease-in-out infinite;
  }
  
  .about-accent-2 {
    width: 40px;
    height: 40px;
    bottom: 80px;
    left: -20px;
    animation: float 8s ease-in-out infinite reverse;
  }
  
  .about-accent-3 {
    width: 60px;
    height: 60px;
    bottom: -10px;
    right: 80px;
    animation: float 7s ease-in-out infinite 1s;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  .about-badge {
    position: absolute;
    bottom: 48px;
    left: 48px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .about-badge-label {
    font-family: var(--font-ui);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 254, 248, 0.7);
  }
  
  .about-badge-name {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 500;
    color: var(--surface);
  }
  
  .about-content {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  
  .about-header {
    margin-bottom: 8px;
  }
  
  .about-text {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .about-text p {
    font-size: clamp(18px, 1.5vw, 22px);
    font-weight: 300;
    line-height: 1.8;
    color: var(--text-muted);
  }
  
  .about-text em {
    color: var(--text);
    font-style: italic;
    font-weight: 400;
  }
  
  .about-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-top: 16px;
  }
  
  .stat-item {
    background: var(--surface);
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }
  
  .stat-value {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 500;
    color: var(--accent);
  }
  
  .stat-label {
    font-family: var(--font-ui);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  
  /* ─── FOOTER ──────────────────────────────────────────────── */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px 80px;
    border-top: 1px solid var(--border);
    font-family: var(--font-ui);
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  
  .footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .footer-logo {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 500;
  }
  
  .footer-divider {
    width: 1px;
    height: 20px;
    background: var(--border);
  }
  
  .footer-copy {
    color: var(--text-muted);
  }
  
  .footer-center {
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  
  .footer-right {
    display: flex;
    gap: 24px;
  }
  
  .footer-link {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: none;
    transition: color 0.3s ease;
  }
  
  .footer-link:hover {
    color: var(--accent);
  }
  
  /* ─── RESPONSIVE ────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .hero { padding: 120px 40px; }
    .hero-meta { left: 40px; bottom: 40px; }
    .scroll-indicator { right: 40px; bottom: 40px; }
    .gallery { padding: 120px 40px; }
    .about { padding: 120px 40px; gap: 60px; }
    .footer { padding: 40px; }
    .nav { min-width: auto; padding: 12px 24px; }
    .nav-year { display: none; }
  }
  
  /* Mobile / Touch optimizations */
  @media (max-width: 768px), (hover: none) {
    .hero { 
      min-height: 100vh;
      min-height: 100dvh;
      padding: 100px 20px 60px;
    }
    .hero-title { font-size: 48px; }
    .hero-subtitle { max-width: 100%; font-size: 18px; }
    .hero-meta { display: none; }
    .gallery-grid { 
      grid-template-columns: 1fr; 
      gap: 16px;
    }
    .art-card { 
      grid-column: span 1 !important; 
      grid-row: span 4 !important;
      aspect-ratio: 4/3;
    }
    .gallery { padding: 80px 20px; }
    .about { grid-template-columns: 1fr; padding: 80px 20px; }
    .about-visual { aspect-ratio: 4/3; }
    .lightbox-content { grid-template-columns: 1fr; gap: 24px; }
    .lightbox-image { aspect-ratio: 16/9; }
    .lightbox { padding: 20px; }
    .footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px; }
    .nav { 
      top: 16px; 
      left: 20px;
      right: 20px;
      transform: none;
      min-width: auto;
      padding: 12px 16px;
      justify-content: center;
    }
    .nav-brand { display: none; }
    .scroll-indicator { display: none; }
  }
`;

// ─── ROOT APP ──────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("hero");
  const [lightboxArt, setLightboxArt] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Update active section on scroll
    const handleScroll = () => {
      const sections = ["hero", "gallery", "about"];
      const scrollY = window.scrollY + window.innerHeight / 3;
      
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActive(id);
            break;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Debug keyboard shortcut - press 'D' to toggle
    const handleKeyDown = (e) => {
      if (e.key === 'd' && e.shiftKey) {
        setDebugMode(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleNav = useCallback((section) => {
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    setActive(section);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      
      {isLoaded && <CustomCursor />}
      
      <Nav active={active} onNav={handleNav} />
      
      <main>
        <Hero />
        <Gallery onOpen={setLightboxArt} />
        <About />
      </main>
      
      <Footer />
      
      {lightboxArt && (
        <Lightbox art={lightboxArt} onClose={() => setLightboxArt(null)} />
      )}
      
      {/* Hidden debug toggle - press Shift+D or click the dot */}
      <button
        onClick={() => setDebugMode(prev => !prev)}
        style={{
          position: "fixed",
          bottom: "8px",
          left: "8px",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: debugMode ? "red" : "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 9999,
          opacity: 0.3,
        }}
        title="Shift+D to toggle debug"
      />
      
      {debugMode && (
        <style>{`
          * { outline: 1px solid rgba(255, 0, 0, 0.5) !important; }
          * * { outline: 1px solid rgba(0, 255, 0, 0.5) !important; }
          * * * { outline: 1px solid rgba(0, 0, 255, 0.5) !important; }
          * * * * { outline: 1px solid rgba(255, 255, 0, 0.5) !important; }
          * * * * * { outline: 1px solid rgba(255, 0, 255, 0.5) !important; }
        `}</style>
      )}
    </>
  );
}

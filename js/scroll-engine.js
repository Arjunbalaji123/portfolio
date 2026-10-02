/**
 * Enhanced Scroll Engine & Kinematics Controller for Clang Nguyen Portfolio
 * Features pinned 3D deck fan out, kinetic text split, top progress bar, and card depth parallax.
 */
class SpatialScrollEngine {
  constructor() {
    this.lenis = null;
  }

  init() {
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with smooth momentum physics
    this.lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, e.scroll / scrollHeight));

      // Update Top Scroll Progress Bar
      const progressBar = document.getElementById('scroll-progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
      }

      // Rotate dial disc based on scroll distance
      const dial = document.querySelector('.dial-disc');
      if (dial) {
        dial.style.transform = `translateX(-50%) rotate(${e.scroll * 0.25}deg)`;
      }

      // Play spatial audio tone
      if (window.spatialAudio) {
        window.spatialAudio.playScrollTone(progress);
      }
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Setup Master ScrollTriggers
    this.setupScrollTriggers();
  }

  setupScrollTriggers() {
    // 1. PINNED HERO 3D DECK OPENING TIMELINE
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=140%',
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
      }
    });

    // A. Initial Stack state -> Spread out into 3D Fan Arc
    heroTl.fromTo('#card-1',
      { x: 0, rotation: 0, y: 0, scale: 0.9, z: -50 },
      { x: -260, rotation: -22, y: 35, scale: 1, z: 0, ease: 'power2.out' },
      0
    );

    heroTl.fromTo('#card-2',
      { x: 0, rotation: 0, y: 0, scale: 0.9, z: -25 },
      { x: -130, rotation: -10, y: 15, scale: 1, z: 20, ease: 'power2.out' },
      0
    );

    heroTl.fromTo('#card-3',
      { scale: 0.95, y: 0 },
      { scale: 1.08, y: -20, z: 60, ease: 'power2.out' },
      0
    );

    heroTl.fromTo('#card-4',
      { x: 0, rotation: 0, y: 0, scale: 0.9, z: -25 },
      { x: 130, rotation: 10, y: 15, scale: 1, z: 20, ease: 'power2.out' },
      0
    );

    heroTl.fromTo('#card-5',
      { x: 0, rotation: 0, y: 0, scale: 0.9, z: -50 },
      { x: 260, rotation: 22, y: 35, scale: 1, z: 0, ease: 'power2.out' },
      0
    );

    // B. Kinetic Title & Red Stripe Parallax Expansion
    heroTl.to('#title-outline', {
      x: 35,
      y: 20,
      opacity: 0.8,
      ease: 'none'
    }, 0);

    heroTl.to('#title-solid', {
      x: -15,
      ease: 'none'
    }, 0);

    heroTl.to('#hero-red-stripe', {
      scaleY: 1.3,
      opacity: 0.9,
      ease: 'none'
    }, 0);

    // 2. SELECTED WORKS BENTO GRID ENTRANCE STAGGER
    gsap.from('.section-title-trigger', {
      scrollTrigger: {
        trigger: '#selected-works',
        start: 'top 75%',
        end: 'top 30%',
        toggleActions: 'play none none reverse'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    gsap.from('.gallery-card', {
      scrollTrigger: {
        trigger: '#gallery-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      y: 80,
      opacity: 0,
      rotateX: 15,
      scale: 0.95,
      stagger: 0.15,
      duration: 0.9,
      ease: 'power3.out'
    });

    // 3. CONTACT CARD FLOATING PERSPECTIVE ENTRY
    gsap.from('#contact-card-container', {
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 75%',
        toggleActions: 'play none none reverse'
      },
      y: 70,
      rotateX: -15,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  }

  scrollToSection(target) {
    if (this.lenis) {
      this.lenis.scrollTo(target, { duration: 1.4 });
    }
  }
}

window.scrollEngine = new SpatialScrollEngine();

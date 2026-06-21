# Biman Bangladesh Airlines — Cinematic Concept Redesign

A premium, animated concept site for Biman Bangladesh Airlines. Bangladesh-flag theme
(bottle green + red sun), built as a single static page with GSAP-driven motion.

> Concept / fan redesign. Not affiliated with Biman Bangladesh Airlines. The 787 imagery
> is AI-generated and the logo is used for illustrative purposes only.

## Highlights
- **Animated hero** — rising red sun over a green dawn, drifting stars, a real cutout
  Boeing 787 flying across the sky, and a landmark skyline (Gherkin, mosque, spire).
- **Interactive booking widget** — trip tabs, city swap, a themed **range calendar**
  (depart → return) and a **passenger / cabin selector**.
- **Flight network map** — animated great-circle arcs from Dhaka with little planes in motion.
- **Sticky scroll storytelling**, count-up stats, and a cinematic 787 fleet showcase.

## Tech
Plain HTML/CSS/JS. [GSAP + ScrollTrigger](https://gsap.com) from CDN. No build step.

## Run locally
```bash
python3 -m http.server 8743
# open http://localhost:8743
```

## Structure
```
index.html        markup
css/styles.css    design system + components
js/main.js        preloader, hero, calendar, passengers, route map, scroll motion
assets/           logo (SVG) + optimized 787 imagery (WebP)
```

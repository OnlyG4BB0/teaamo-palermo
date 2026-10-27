# Design System Master File — TeaAmo Bubble Tea (Sweet & Coffee) Palermo

> **LOGIC:** Global Source of Truth for TeaAmo Bubble Tea - Sweet & Coffee (Viale Strasburgo, 378 — Palermo).

---

**Project:** TeaAmo Bubble Tea Palermo (`teaamo-palermo`)
**Category:** Bubble Tea Lounge, Sweet Bakery & Late-Night SmashBurger (12:30 – 03:30)
**Design Dials:** Variance 8/10 (Bento & Asymmetric Interactive Showcase) | Motion 9/10 (Complex Choreography + 3D Cup Physics) | Density 4/10 (Spacious Experience)

---

## Global Rules

### Brand & Semantic Color Palette (Day "Pink Sweet Lounge" & Night "03:30 SpacePolly Lounge")

| Role | Day Mode (Pink Sweet Lounge) | Night Mode (03:30 Cosmic Lounge) | CSS Variable |
|------|------------------------------|----------------------------------|--------------|
| Primary (TeaAmo Rose) | `#E11D48` (4.6:1 on white) | `#FF5C8A` | `--color-primary` |
| Brand Logo Coral | `#FC5B7D` | `#FF6B96` | `--color-brand-coral` |
| Brand Blush Diamond | `#FDE4EA` | `#2D162B` | `--color-brand-blush` |
| Secondary (Taro Purple) | `#7C3AED` | `#A78BFA` | `--color-secondary` |
| Accent (Boba Caramel / Gold) | `#B45309` | `#F59E0B` | `--color-accent` |
| Matcha Fresh | `#059669` | `#34D399` | `--color-matcha` |
| Background | `#FFF7F9` | `#120817` | `--color-background` |
| Surface / Card | `#FFFFFF` | `#1E1026` | `--color-card` |
| Foreground (Primary Text) | `#230C1A` (15.8:1) | `#FFF5F8` (16.2:1) | `--color-foreground` |
| Muted Text | `#643850` (6.8:1) | `#D8B4C8` (8.4:1) | `--color-muted-foreground` |
| Border | `#FBCFE8` | `#3D204B` | `--color-border` |

### Typography

- **Heading Font:** `Fredoka` (600, 700 — rounded, bubbly, expressive)
- **Subheading / UI Font:** `Nunito` (600, 700, 800, 900)
- **Body Font:** `DM Sans` (400, 500, 700 — geometric legibility)
- **Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap');
```

### Core Interactive Experiences
1. **Interactive Physics Boba Canvas & Floating Elements:** Subtle background pearls and flavour orbs with mouse repulsion and `prefers-reduced-motion` support.
2. **Hero 3D Interactive Cup Showcase:** Live flavor switcher (*Taro Love*, *Strawberry Cloud*, *Matcha Uji*, *Mango Pop*, *PokéBall Limited Edition*) with 3D perspective tilt, rising carbonation/boba physics, and official TeaAmo heart-cream topper.
3. **Boba Lab (4-Step Interactive Cup Builder):** Progressive disclosure funnel where users customize Base, Flavour, Toppings/Pearls (up to 3), and Sweetness/Ice, generating an interactive TeaAmo Recipe Card ready to order on Glovo, Deliveroo, JustEat, or in-store at Viale Strasburgo 378.
4. **Day Sweet vs. Late-Night SpacePolly Mode (Open until 03:30 AM):** Showcases both the iconic pink Sweet & Bubble Tea soul (Bubble Waffles, Crepes, Pancake Torre, Frozen Yogurt) and the planetary **SmashBurger & SpacePolly** lineup (*Giove*, *Saturno*, *Plutone*, *Marte*).
5. **Verified Links Integration:**
   - Google Business & Reviews (`https://share.google/mQuebwYXC9WtTkPSz`)
   - Instagram (`https://www.instagram.com/teaamo_bubbletea/`)
   - Linktree Hub (`https://linktr.ee/TeaAmoBubbleTeaPA`)
   - Glovo, Deliveroo, and JustEat direct ordering links.

### Strict UI/UX Pro Max Quality Checklist
- [x] No emojis used as structural icons (100% vector SVGs via `lucide-react` and custom SVG illustrations)
- [x] All interactive elements use `cursor-pointer` and stable non-layout-shifting hover/press states
- [x] Text contrast >= 4.5:1 across both Day Sweet Mode and Night 03:30 Lounge Mode
- [x] Full keyboard navigation (`focus-visible` rings) and `prefers-reduced-motion` compliance
- [x] Responsive across 375px (mobile), 768px (tablet), 1024px, and 1440px (desktop)

# Beam Calculator

A professional, deployable structural beam analysis web application.

![Beam Calculator](./public/favicon.svg)

## Features

- **Geometry inputs**: Length, Breadth, Depth (rectangular cross-section)
- **Point load**: Magnitude (N) and position (m from left)
- **UDL**: Intensity (N/m) with configurable start and end positions
- **Material**: Modulus of Elasticity E (N/m²)
- **Boundary conditions**: Left and right support — Fixed, Pin, Roller, or Free
- **Results**:
  - Shear Force Diagram (SFD)
  - Bending Moment Diagram (BMD)
  - Deflection Curve
  - Support reactions (RA, RB, moments)
  - Maximum values with positions
- **Calculation steps**: Expandable section showing formulas and substitutions
- **Live beam diagram**: Updates as you type
- **Light / Dark theme**
- **Equilibrium verification** (ΣFy check)

## Supported Configurations

| Left | Right | Type |
|------|-------|------|
| Pin | Roller | Simply supported |
| Roller | Pin | Simply supported (reversed) |
| Fixed | Free | Cantilever |
| Free | Fixed | Cantilever (reversed) |
| Fixed | Roller | Propped cantilever |
| Fixed | Pin | Propped cantilever |
| Fixed | Fixed | Fixed-fixed beam |

## Method

- **Finite Element Analysis** — Euler-Bernoulli beam theory
- **100 Hermitian beam elements** (high accuracy)
- **Gaussian elimination** with partial pivoting
- **Equilibrium-based** SFD and BMD for maximum transparency
- Second moment of area: I = b·d³/12 (rectangular section)

## Tech Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Vanilla CSS** with CSS Variables (no external UI library)
- **SVG** for all engineering diagrams (responsive, scalable)
- No backend, no database — runs entirely in the browser

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Deployment

### Netlify (Recommended)

1. Push to GitHub / GitLab
2. Connect repository in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages

```bash
npm run build
# Copy dist/ contents to your gh-pages branch
```

### Static Hosting (Apache / Nginx)

Build and copy `dist/` to your web root. Since this is a SPA with no routing, no special configuration is needed.

## Environment Variables

No environment variables required — the application runs entirely client-side.

## Calculation Assumptions

1. **Linear elastic** material (Hooke's Law)
2. **Euler-Bernoulli beam theory** — plane sections remain plane; shear deformation ignored
3. **Rectangular cross-section**: I = b·d³/12
4. **Small deflection theory** (first-order analysis)
5. **Vertical loading only** — no torsion or lateral-torsional buckling
6. Beam is of uniform cross-section throughout its length

## Sign Conventions

- **x**: 0 at left end, positive to the right
- **Forces**: upward = positive
- **Moments**: counterclockwise = positive
- **Shear V(x)**: net upward force to the LEFT of the section
- **Moment M(x)**: positive = sagging (tension at bottom)
- **Deflection**: displayed with downward positive for intuitive visualization

## Disclaimer

Results are for educational and preliminary design-check purposes only.  
Verify all critical calculations against applicable structural design standards  
(e.g., IS 456, BS 5950, AISC 360, Eurocode 3) before construction.

---

Built with ❤️ for structural engineering education.
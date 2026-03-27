# threejs_project
# Ethiopian Coffee Ceremony - 3D Visualization

## Project Overview
- **Project name**: Ethiopian Coffee Ceremony
- **Type**: Interactive 3D WebGL visualization
- **Core functionality**: Immersive 3D scene depicting a traditional Ethiopian coffee ceremony (Bunna) with animated steam, cultural motifs, and cinematic camera
- **Target users**: Anyone seeking to experience Ethiopian coffee culture virtually

## UI/UX Specification

### Scene Layout
- **Composition**: Centered jebena (traditional clay pot) on a circular wooden medallion (mesob base), white porcelain cup beside it, decorative stones/grasses surrounding
- **Camera**: Orbits slowly around the scene at 45° elevation, distance ~4 units
- **Background**: Deep warm gradient transitioning from dark brown (#1a0f0a) to muted terracotta (#3d2420)

### Visual Design

#### Color Palette
- **Primary Brown**: #5c3a21 (jebena body)
- **Accent Red**: #8b2500 (jebena details, terracotta)
- **Gold Highlight**: #d4a853 (glowing accents, rim highlights)
- **Cream White**: #f5f0e8 (porcelain cup)
- **Steam White**: rgba(255, 250, 245, 0.3)
- **Background Dark**: #1a0f0a
- **Background Mid**: #3d2420
- **Wood Brown**: #4a3728 (mesob base)

#### Typography
- N/A (no text elements)

#### Lighting
- **Ambient**: Warm orange-tinted (#ff9944), intensity 0.4
- **Key Light**: Soft directional from upper-right, warm white (#fff4e0), intensity 1.2
- **Fill Light**: Lower intensity from left, warm amber (#ffcc88), intensity 0.5
- **Rim Light**: Behind scene, creates silhouette glow, gold (#ffd700), intensity 0.8

### Components

#### Jebena (Traditional Coffee Pot)
- **Shape**: Bulbous base with tall neck, spout on side, handle
- **Material**: Clay-textured with Ethiopian geometric patterns (十字图案, diamond, zigzag)
- **Glow Effect**: Subtle gold emission on rim and body highlights
- **Scale**: Prominent, ~0.8 units tall

#### Porcelain Cup
- **Shape**: Traditional small cup with slight taper
- **Material**: Glossy white porcelain with subtle pattern near rim
- **Scale**: ~0.3 units, positioned right of jebena
- **Coffee liquid**: Dark brown surface inside (#2a1810)

#### Steam Particles
- **Count**: 60-80 particles
- **Behavior**: Rise slowly, slight drift, fade out at top
- **Appearance**: Soft white spheres, varying sizes (0.02-0.06), transparency 0.1-0.4
- **Animation**: Gentle wobble, upward velocity with slight randomization

#### Mesob (Serving Base)
- **Shape**: Circular wooden medallion
- **Material**: Wood grain texture, dark brown
- **Scale**: ~1.5 unit radius

#### Decorative Elements
- Small incense holder nearby (optional)
- Grass/plant silhouettes around base

## Functionality Specification

### Core Features
1. **Camera Orbit**: Continuous smooth orbit around scene center, ~15 seconds per revolution
2. **Steam Animation**: Particles emit from cup, rise with physics-based drift
3. **Jebena Glow**: Pulsing subtle emission on decorative patterns
4. **Ambient Lighting**: Gentle flicker effect on key light
5. **Interactive**: Mouse orbit control (OrbitControls) with damping

### Animation Details
- **Steam rise speed**: 0.3-0.5 units/second
- **Steam spawn rate**: 2-3 per second
- **Glow pulse**: Sinusoidal, 3-second cycle
- **Camera orbit speed**: 0.1 radians/second

### Edge Cases
- Handle window resize
- Graceful WebGL fallback message

## Acceptance Criteria
- [ ] Scene loads with jebena and cup visible
- [ ] Steam particles rise continuously from cup
- [ ] Camera orbits smoothly around scene
- [ ] Ethiopian patterns visible on jebena
- [ ] Warm, inviting atmosphere achieved
- [ ] No console errors
- [ ] Responsive to window resize
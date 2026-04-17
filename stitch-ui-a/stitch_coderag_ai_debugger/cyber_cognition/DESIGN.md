# Design System Strategy: The Intelligent Terminal

## 1. Overview & Creative North Star
**Creative North Star: "The Orchestrated Monolith"**

To design for the world’s most demanding engineers, we must move beyond the "SaaS-standard" look of cards and outlines. This system adopts a philosophy of **Orchestrated Monolithism**: the UI should feel like a single, high-precision instrument rather than a collection of separate widgets. 

We achieve this through **Intentional Asymmetry** and **Tonal Depth**. By breaking the rigid, centered grid and favoring left-heavy, terminal-inspired layouts with wide, "breathing" gutters, we evoke the feeling of a mission-critical command center. The aesthetic is "Dark-first" but not flat; it uses the physics of light and layering to guide the eye through complex debugging data without overwhelming the user.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the deep void of a terminal, but energized by a "Cyan-Ion" accent that represents the speed and intelligence of the AI.

### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. They create visual noise that distracts from the code. 
*   **Instruction:** Separate the primary navigation from the main workspace using a shift from `surface_container_lowest` (#0a0f14) to `surface_container` (#1b2025). 
*   **Transition:** Use vertical whitespace or 8px "gutters" of the background color to define regions.

### Surface Hierarchy & Nesting
Treat the interface as a series of nested precision plates.
*   **Base:** `surface_dim` (#0f1419) – The global canvas.
*   **Workspace:** `surface_container_low` (#171c21) – The primary code editor or log view.
*   **Overlays:** `surface_container_high` (#252a30) – Command palettes and hovering AI insights.
*   **Nesting Logic:** An inner container (e.g., a code snippet inside a chat bubble) should always be one tier *darker* or *lighter* than its parent to create "recessed" or "elevated" depth.

### The "Glass & Gradient" Rule
To elevate the "Premium" feel, use **Glassmorphism** for floating elements like Tooltips or Popovers. 
*   **Spec:** `surface_container_highest` (#30353b) at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Texture:** Main Action Buttons should not be flat. Apply a subtle linear gradient from `primary` (#a8e8ff) to `primary_container` (#00d4ff) at a 135-degree angle to give the element a "machined" metallic sheen.

---

## 3. Typography
The type system balances the humanistic clarity of **Inter** with the technical precision of **JetBrains Mono**.

*   **Display & Headlines (Inter):** Use for high-level status and branding. Set headlines to `headline-sm` with a `-0.02em` tracking to feel authoritative and dense.
*   **Titles & Labels (Space Grotesk / Inter):** `label-md` is the workhorse for metadata. It provides a geometric, "engineered" look that distinguishes metadata from the actual code.
*   **Code & Logs (JetBrains Mono):** All technical output must use the mono-scale. This isn't just for code; use it for timestamps, memory addresses, and Git hashes to reinforce the "Developer-first" persona.
*   **Visual Hierarchy:** Use `on_surface_variant` (#bbc9cf) for secondary labels to create a three-dimensional typographic hierarchy: Primary (White) > Secondary (Grey-Blue) > Tertiary (Accent Cyan).

---

## 4. Elevation & Depth
In this system, depth is a function of light, not lines.

*   **Tonal Layering:** Instead of a shadow, place a `surface_container_high` element against a `surface_container_lowest` background. The contrast in hex values provides all the separation needed.
*   **Ambient Shadows:** For "Floating" components (Modals/AI Chat), use a specialized shadow: `0px 24px 48px -12px rgba(0, 0, 0, 0.5)`. The shadow must feel like it's absorbing light, not just casting a blur.
*   **The "Ghost Border":** Where containment is strictly required (e.g., active input states), use the `outline_variant` (#3c494e) at **20% opacity**. This creates a "glint" on the edge of the container rather than a heavy frame.
*   **Active States:** An active item is never just a color change. Use a `2px` vertical "Ion-Sliver" of `primary_container` (#00d4ff) on the left edge of a list item to indicate focus.

---

## 5. Components

### Buttons & Inputs
*   **Primary Button:** Gradient-filled (`primary` to `primary_container`). `0.25rem` (sm) radius. Text is `on_primary` (#003642), bold.
*   **Secondary/Ghost:** No background. `outline_variant` at 20% opacity. On hover, the background shifts to `surface_container_highest`.
*   **Inputs:** Use `surface_container_lowest`. On focus, the "Ghost Border" becomes 100% opaque `primary` and a subtle `0 0 0 2px` glow of the accent color (at 10% opacity) is applied.

### Engineering-Specific Components
*   **The "Diff-Stream" Card:** Used for AI-suggested code changes. Forbid dividers. Use a `surface_container_high` header bar and a `surface_container_low` body.
*   **Monospace Chips:** Selection chips for "Tags" or "Languages" should use `label-sm` (JetBrains Mono). This differentiates data types from UI actions.
*   **The "Trace" List:** For stack traces. No dividers. Use alternating background tints (Zebra-striping) using `surface` and `surface_container_low` to maintain readability in high-density views.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts (e.g., a wide left column for code and a narrow right column for AI insights).
*   **Do** favor density. Engineers prefer seeing more information at once; use `body-sm` for secondary data.
*   **Do** use the Cyan accent sparingly. It is a "laser pointer"—use it only to draw attention to critical insights or primary actions.

### Don’t
*   **Don't** use standard "Material" rounded corners. Keep it sharp (`0.25rem`) to maintain the "Terminal" aesthetic.
*   **Don't** use pure black (#000). Always use the themed backgrounds (`#0a0f14`) to allow for subtle depth layering.
*   **Don't** use 100% opaque white for text. Use `on_surface` (#dee3ea) to reduce eye strain during long debugging sessions.
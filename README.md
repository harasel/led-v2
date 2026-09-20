# LED Solutions — Commercial LED Lighting Landing Page

A conversion-focused lead-generation landing page for **LED Solutions**, an Australian commercial LED lighting company.

Static HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework.

---

## Quick start

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# Any static server works. For example:
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

> Open `index.html` through a server rather than double-clicking it. Opening it
> via `file://` blocks `fetch()`, so the form submission path cannot be tested.

---

## File structure

```
.
├── index.html      Page markup, meta tags and JSON-LD structured data
├── style.css       Design tokens and all styling
├── script.js       All interactivity (config block at the top)
├── robots.txt      Crawler directives — update the sitemap URL
├── LICENSE         MIT
└── .gitignore
```

---

## Before you go live

Everything below lives in one of three places. Work through the list in order.

### 1. `script.js` — configuration block (top of file)

| Constant | Default | What to do |
| --- | --- | --- |
| `FORM_ENDPOINT` | `''` | **Required.** Your form handler URL. While empty the form runs in dev mode: it validates, logs the payload to the console, and shows the success state without sending anything. |
| `FORM_TRANSPORT` | `'formdata'` | `'formdata'` posts `multipart/form-data` and **includes file attachments**. `'json'` posts JSON and drops them. Most providers (Formspree, Web3Forms, Netlify, PHP/Node handlers) want `formdata`. |
| `MIN_FILL_SECONDS` | `2` | Submissions faster than this are treated as bots. |
| `MAX_FILE_MB` | `10` | Per-file attachment limit. |

### 2. `index.html` — content placeholders

Search for these and replace:

- `[PHONE]` — footer link and the form error fallback (also update the `tel:` values)
- `[EMAIL]` — footer contact link
- `GTM-XXXXXXX` — two commented Google Tag Manager blocks (one in `<head>`, one after `<body>`). Uncomment both once you have a container ID.
- `https://ledsolutions.com.au/` — canonical, Open Graph and JSON-LD URLs
- The JSON-LD block — add your real phone, street address and `sameAs` social profiles
- `/privacy` and `/terms` — point at your real policy pages

### 3. Replace the demo imagery

The page now loads **four** photographs, all still hot-linked from Unsplash.
That is fine for review but not for production: you do not control uptime, the
host may rate-limit you, and hot-linking hurts Largest Contentful Paint.

| Where | `data-img` / location | What the client's photo should show |
| --- | --- | --- |
| Hero background | `index.html` line ~129 | A real LED Solutions high-bay install, wide shot, lights on |
| Before / after | `data-img="ba-before"` and `data-img="ba-after"` | **A matched pair** — same room, same camera position, same framing |
| Case study | `.cs-img` | The actual facility named in the case study |
| Final CTA background | `.cta-bg-img` | A finished office or retail fit-out |

To swap them:

1. Create `assets/img/`.
2. Export the client's photography as WebP (with a JPEG fallback) at roughly
   1800px wide for the backgrounds and 1400px for the comparison pair.
3. Replace each `https://images.unsplash.com/...` `src` with the local path.
4. Update `og:image` and `twitter:image` to an absolute URL on your own domain —
   social platforms will not render a relative path.

If an image fails to load, the script tags it with `data-failed` and the layer's
gradient background shows instead of a broken-image icon.

#### Why both comparison layers use the same photograph

The original build paired two unrelated stock interiors as "before" and "after".
That reads as a trick the moment anyone looks closely — different room, different
ceiling, different camera height — and it undercuts the exact claim the section
exists to make.

Both layers now load the **same** image, and the pre-upgrade look is produced in
CSS (`.ba-before.is-simulated`): reduced output, a green-yellow fluorescent cast,
flattened contrast, and light that pools in the centre and falls away at the
edges. That is what facility managers recognise as their old lighting, and
because it is one photograph the two frames are pixel-aligned by construction.

When the client supplies a real matched pair, point the two `data-img` sources at
them and delete the `is-simulated` class from the before layer. The CSS block is
commented and self-contained.

#### Illustrations that are no longer photographs

- **Savings formula icons** (LED / Occupancy / Dimming / Timing) were four
  unrelated stock photos — including a photograph of a wall clock standing in for
  "scheduling". They are now inline SVG in the page's existing icon language,
  which removes four network requests and reads as deliberate rather than
  decorative.
- **Testimonial avatars** were photographs of real, identifiable strangers
  presented as the faces of named clients on testimonials the markup itself
  labels as demo content. That is a misrepresentation risk under Australian
  Consumer Law and a licensing problem besides. They are now initial monograms.
  If the client provides approved headshots with written consent, drop them into
  `.test-avatar` in place of the `.test-initials` span.

---

## The before/after comparison slider

This was rebuilt. The original implementation had a structural flaw.

**What was wrong:** the "before" panel was a `50%`-wide clipping box containing an
image sized at `200%` of *that box*. That arithmetic only resolves correctly at
exactly 50%. As soon as the handle moved, the inner image was re-scaled relative
to the new box width, so the before and after photos no longer showed the same
part of the scene — the image visibly shrank and drifted out of alignment. It
looked broken precisely when the user interacted with it.

**How it works now:** both layers are full-size and identical. A single CSS custom
property, `--ba-pos`, drives a `clip-path` reveal on the before layer *and* the
handle's `left` offset, so the two can never desynchronise. Nothing is ever
scaled, so alignment holds at every position and at every viewport width.

Other fixes in the same component:

- **Touch drag no longer scrolls the page.** The old code attached `passive: true`
  touch listeners, which cannot call `preventDefault()`. Dragging on a phone
  scrolled the page instead of moving the handle. Replaced with Pointer Events
  plus `setPointerCapture` and `touch-action: none` — one code path for mouse,
  touch and pen, and the drag keeps tracking even if the pointer leaves the element.
- **A plain click no longer snaps the reveal to 0%.**
- **Full range.** Was clamped to 2–98%, so neither image could be viewed in full.
- **Keyboard support.** Arrow keys (±2), Shift+Arrow (±10), PageUp/PageDown (±10),
  Home and End. Double-click resets to centre.
- **Screen readers.** The container previously carried `role="img"`, which makes
  every descendant presentational — the slider handle was invisible to assistive
  technology. The container is now a `<figure>` and the handle is a genuine
  `role="slider"` with a live `aria-valuetext`.
- Drag updates are throttled through `requestAnimationFrame`.
- A one-time sweep animation on first scroll-into-view signals that it is
  draggable, skipped entirely under `prefers-reduced-motion`.

---

## Other fixes applied

**Lead form**

- File attachments were collected but silently discarded before sending. Added a
  `formdata` transport so they actually upload, plus a per-file size check.
- Added a honeypot field and a minimum-fill-time check for bot submissions.
- Validation now checks name and company length, a stricter email pattern, and
  Australian phone formats (`04xx`, `+61`, `(02)`, landline). Previously a single
  character passed every field.
- Errors set `aria-invalid` and `aria-describedby`, carry `role="alert"`, and focus
  moves to the first invalid field. Errors clear as the user types.
- On success, focus moves to the confirmation message so screen reader users are
  told the submission worked.
- Guarded against missing DOM nodes that previously threw during submission.

**Navigation and page**

- Escape key and backdrop click now close the mobile menu, and focus returns to
  the toggle. Resizing to desktop while it is open no longer leaves `<body>`
  scroll-locked.
- Added a skip-to-content link.
- Scroll-reveal, count-up and the savings bars now fall back to their final state
  where `IntersectionObserver` is unavailable. Previously that content stayed at
  `opacity: 0` — invisible.
- Dead `href="#"` footer links replaced with real paths.
- Added a favicon (inline SVG, no extra request), `theme-color`, Twitter Card
  tags, `robots`, and `LocalBusiness` JSON-LD.
- Cut external image requests from 14 to 4 by replacing decorative stock
  photography with inline SVG (see the imagery section above).
- Unescaped `&` characters in image URLs fixed; the page now parses clean as HTML5.
- Removed a stray nested `.zip` that was committed inside the project folder.

---

## Deploying

The page is fully static, so any host works.

**GitHub Pages** — push to `main`, then Settings → Pages → Source: *Deploy from a
branch* → `main` / `root`.

**Netlify / Vercel / Cloudflare Pages** — connect the repo. No build command, no
output directory.

Once deployed, run the URL through [PageSpeed Insights](https://pagespeed.web.dev/)
and re-check after you swap in local images — that is the single biggest
performance win available here.

---

## Browser support

Chrome, Edge, Firefox and Safari, current and previous major versions, on desktop
and mobile. Relies on `clip-path`, CSS custom properties, `aspect-ratio`, Pointer
Events and `IntersectionObserver` — all baseline-available. Where
`IntersectionObserver` is missing, animated content degrades to its final visible
state rather than disappearing.

---

## Accessibility

Keyboard-operable throughout, visible focus rings via `:focus-visible`, a skip
link, labelled form fields with announced errors, and full
`prefers-reduced-motion` support. The comparison slider implements the ARIA
slider pattern.

Automated checks do not replace a real audit. Test with a screen reader before
launch.

---

## License

MIT — see [LICENSE](LICENSE).

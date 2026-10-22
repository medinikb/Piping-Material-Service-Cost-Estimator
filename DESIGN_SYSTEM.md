# Design System Reuse Guide

Use this guide when reusing the light mode and dark mode style from this project in another web app.

## Goal

Reuse the same visual identity from `public-cs-pipe-price-calculator` so future tools feel like part of the same product family.

## Files To Reference

| Source file | What to reuse |
|---|---|
| `style.css` | Color variables, dark mode variables, page background, panel/card styles, button styles, theme toggle styles |
| `app.js` | Theme toggle logic only |
| `index.html` | Theme toggle button HTML only |

## Core CSS To Copy

Copy the `:root` color variable block and the `[data-theme="dark"]` block from `style.css`.

These variables control the full theme:

```css
:root {
  --bg: ...;
  --surface: ...;
  --surface-strong: ...;
  --text: ...;
  --muted: ...;
  --border: ...;
  --blue-dark: ...;
  --green: ...;
  --amber: ...;
}

[data-theme="dark"] {
  --bg: ...;
  --surface: ...;
  --surface-strong: ...;
  --text: ...;
  --muted: ...;
  --border: ...;
}
```

## Use Variables Instead Of Fixed Colors

In new apps, use theme variables instead of hardcoded colors:

```css
body {
  background: var(--bg);
  color: var(--text);
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
}
```

This makes light mode and dark mode work cleanly from one color system.

## Theme Toggle HTML

Place this button in the app header:

```html
<button class="theme-toggle" type="button" id="theme-toggle" aria-label="Switch to dark mode">
  <span class="theme-icon" aria-hidden="true"></span>
  <span class="sr-only" id="theme-toggle-label">Switch to dark mode</span>
</button>
```

## Theme Toggle CSS

Copy these related styles from `style.css`:

```text
.theme-toggle
.theme-icon
.sr-only
[data-theme="dark"] .theme-icon
```

## Theme Toggle Logic

Copy only the theme functions from `app.js`.

The logic should:

- read the saved theme from browser storage
- apply `data-theme="dark"` or `data-theme="light"` on the `<html>` element
- update the theme button label
- save the user's latest choice

Concept:

```text
User clicks theme button
-> app checks current theme
-> switches light to dark or dark to light
-> saves the choice in browser
-> next visit opens with the same choice
```

## Recommended Page Structure

Use this simple structure for future tools:

```html
<main class="app-shell">
  <header class="app-header">
    <div>
      <p class="section-label">Public calculator</p>
      <h1>Your App Name</h1>
      <p class="lead">Short explanation.</p>
    </div>

    <div class="header-actions">
      <!-- theme button here -->
    </div>
  </header>

  <section class="panel">
    Your app content
  </section>
</main>
```

## General Styles Worth Reusing

Copy these general layout styles when useful:

- `body`
- `.app-shell`
- `.app-header`
- `.header-actions`
- `.section-label`
- `.lead`
- `.theme-toggle`
- `.theme-icon`
- `.sr-only`
- `.primary-button`
- `.ghost-button`
- general panel/card styles

## Do Not Copy Pipe-Specific Styles Blindly

Avoid copying these unless the new app needs the same feature:

- `.price-card`
- `.what-if-panel`
- `.bom-panel`
- `.line-items-panel`
- pipe schedule and pipe calculation styles

## Business Benefit

Using this shared design system helps future apps look consistent, professional, and easier to trust. It also reduces development time because the basic layout, colors, buttons, and dark mode do not need to be redesigned every time.

## Reuse Checklist

Before building another app, confirm:

- Color variables are copied.
- Dark mode variables are copied.
- Theme button HTML is added.
- Theme button CSS is copied.
- Theme toggle JavaScript is copied.
- Main layout uses `app-shell`, `app-header`, and panel/card patterns.
- New colors use CSS variables instead of hardcoded values.


# 🎨 Design System Guide
## Lost & Found Portal

---

## 📋 Overview

This design system provides a comprehensive set of CSS variables and utility classes for consistent styling across the entire application.

**File Location:** `app/styles/design-system.css`

**Import:** Automatically imported via `app/globals.css` → Available globally

---

## 🎨 Color System

### Primary Colors
Use for main brand elements, primary buttons, and key UI components.

```css
/* Usage Examples */
.my-element {
  color: var(--color-primary-500);
  background: var(--color-primary-100);
  border-color: var(--color-primary-300);
}
```

**Available Shades:**
- `--color-primary-50` to `--color-primary-900` (lighter to darker)
- Main: `--color-primary-500` (#667eea)

### Secondary Colors
Use for accents, secondary actions, and complementary elements.

```css
.my-element {
  background: var(--color-secondary-500);
}
```

**Available Shades:**
- `--color-secondary-50` to `--color-secondary-900`
- Main: `--color-secondary-500` (#764ba2)

### Semantic Colors

#### Success (Green)
```css
/* For success messages, completed states */
color: var(--color-success-500);
background: var(--color-success-100);
```

#### Error/Danger (Red)
```css
/* For errors, warnings, delete actions */
color: var(--color-error-500);
background: var(--color-error-100);
```

#### Warning (Orange)
```css
/* For warnings, caution states */
color: var(--color-warning-500);
background: var(--color-warning-100);
```

#### Info (Blue)
```css
/* For informational messages */
color: var(--color-info-500);
background: var(--color-info-100);
```

### Neutral Colors (Grays)
```css
/* Text colors */
color: var(--color-gray-900); /* Dark text */
color: var(--color-gray-600); /* Muted text */
color: var(--color-gray-400); /* Disabled text */

/* Backgrounds */
background: var(--color-gray-50);  /* Light background */
background: var(--color-gray-100); /* Subtle background */
```

---

## 🌈 Gradients

Pre-defined gradients for consistent visual effects.

```css
/* Primary Gradient */
background: var(--gradient-primary);
/* Result: linear-gradient(135deg, #667eea 0%, #764ba2 100%) */

/* Available Gradients */
--gradient-primary
--gradient-primary-hover
--gradient-success
--gradient-error
--gradient-warning
--gradient-info
```

**Usage Example:**
```css
.hero-section {
  background: var(--gradient-primary);
}

.button:hover {
  background: var(--gradient-primary-hover);
}
```

---

## 📏 Spacing System

Based on 8px grid system for consistent spacing.

```css
/* Numeric Scale */
padding: var(--spacing-4);  /* 16px */
margin: var(--spacing-8);   /* 32px */
gap: var(--spacing-6);      /* 24px */

/* Semantic Scale */
padding: var(--spacing-sm);  /* 8px */
margin: var(--spacing-md);   /* 16px */
gap: var(--spacing-lg);      /* 24px */
```

**Available Values:**
- `--spacing-0` (0px)
- `--spacing-1` (4px)
- `--spacing-2` (8px)
- `--spacing-3` (12px)
- `--spacing-4` (16px)
- `--spacing-5` (20px)
- `--spacing-6` (24px)
- `--spacing-8` (32px)
- `--spacing-10` (40px)
- `--spacing-12` (48px)
- `--spacing-16` (64px)
- `--spacing-20` (80px)
- `--spacing-24` (96px)

**Semantic Aliases:**
- `--spacing-xs` → `--spacing-1` (4px)
- `--spacing-sm` → `--spacing-2` (8px)
- `--spacing-md` → `--spacing-4` (16px)
- `--spacing-lg` → `--spacing-6` (24px)
- `--spacing-xl` → `--spacing-8` (32px)
- `--spacing-2xl` → `--spacing-12` (48px)
- `--spacing-3xl` → `--spacing-16` (64px)

---

## 🔲 Border Radius

```css
/* Usage */
border-radius: var(--radius-md);   /* 8px - Default */
border-radius: var(--radius-lg);   /* 12px - Cards */
border-radius: var(--radius-xl);   /* 16px - Large cards */
border-radius: var(--radius-full); /* Pills/Buttons */
border-radius: var(--radius-circle); /* 50% - Avatars */
```

**Available Values:**
- `--radius-none` (0)
- `--radius-sm` (6px)
- `--radius-md` (8px)
- `--radius-lg` (12px)
- `--radius-xl` (16px)
- `--radius-2xl` (20px)
- `--radius-3xl` (24px)
- `--radius-full` (9999px)
- `--radius-circle` (50%)

---

## 🌑 Shadows

Elevation system for depth and hierarchy.

```css
/* Basic Shadows */
box-shadow: var(--shadow-sm);  /* Subtle */
box-shadow: var(--shadow-md);  /* Default */
box-shadow: var(--shadow-lg);  /* Elevated */
box-shadow: var(--shadow-xl);  /* Floating */
box-shadow: var(--shadow-2xl); /* Modal */

/* Colored Shadows */
box-shadow: var(--shadow-primary); /* Primary color glow */
box-shadow: var(--shadow-success); /* Success color glow */
box-shadow: var(--shadow-error);   /* Error color glow */
```

**Usage Example:**
```css
.card {
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-primary);
}
```

---

## 📝 Typography

### Font Families
```css
font-family: var(--font-sans); /* Default sans-serif */
font-family: var(--font-mono); /* Monospace for code */
```

### Font Sizes
```css
font-size: var(--font-size-xs);   /* 12px */
font-size: var(--font-size-sm);   /* 14px */
font-size: var(--font-size-base); /* 16px - Default */
font-size: var(--font-size-lg);   /* 18px */
font-size: var(--font-size-xl);   /* 20px */
font-size: var(--font-size-2xl);  /* 24px */
font-size: var(--font-size-3xl);  /* 30px */
font-size: var(--font-size-4xl);  /* 36px */
font-size: var(--font-size-5xl);  /* 48px */
```

### Font Weights
```css
font-weight: var(--font-weight-normal);    /* 400 */
font-weight: var(--font-weight-medium);    /* 500 */
font-weight: var(--font-weight-semibold);  /* 600 */
font-weight: var(--font-weight-bold);      /* 700 */
```

### Line Heights
```css
line-height: var(--line-height-tight);   /* 1.25 */
line-height: var(--line-height-normal);  /* 1.5 - Default */
line-height: var(--line-height-relaxed); /* 1.625 */
```

---

## ⚡ Transitions & Animations

### Durations
```css
transition-duration: var(--duration-150); /* Fast */
transition-duration: var(--duration-200); /* Base */
transition-duration: var(--duration-300); /* Slow */
```

### Timing Functions
```css
transition-timing-function: var(--ease-in);
transition-timing-function: var(--ease-out);
transition-timing-function: var(--ease-in-out);
transition-timing-function: var(--ease-smooth);
```

### Pre-defined Transitions
```css
transition: var(--transition-fast);  /* 150ms ease-out */
transition: var(--transition-base);  /* 200ms ease-in-out */
transition: var(--transition-slow);  /* 300ms ease-in-out */
transition: var(--transition-all);   /* all 200ms ease-in-out */
```

### Animation Classes
```html
<!-- Fade In -->
<div class="animate-fadeIn">Content</div>

<!-- Slide Up -->
<div class="animate-slideUp">Content</div>

<!-- Scale In -->
<div class="animate-scaleIn">Content</div>

<!-- Spin (for loaders) -->
<div class="animate-spin">⟳</div>

<!-- Pulse -->
<div class="animate-pulse">Content</div>
```

---

## 🎯 Z-Index Scale

Consistent layering system.

```css
z-index: var(--z-dropdown);        /* 1000 */
z-index: var(--z-sticky);          /* 1020 */
z-index: var(--z-fixed);           /* 1030 */
z-index: var(--z-modal-backdrop);  /* 1040 */
z-index: var(--z-modal);           /* 1050 */
z-index: var(--z-popover);         /* 1060 */
z-index: var(--z-tooltip);         /* 1070 */
z-index: var(--z-notification);    /* 1080 */
```

---

## 🛠️ Utility Classes

### Text Colors
```html
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-success">Success text</p>
<p class="text-error">Error text</p>
<p class="text-muted">Muted text</p>
```

### Background Colors
```html
<div class="bg-primary">Primary background</div>
<div class="bg-gradient-primary">Gradient background</div>
```

### Shadows
```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-primary">Primary colored shadow</div>
```

### Border Radius
```html
<div class="rounded-sm">Small radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Pill shape</div>
<div class="rounded-circle">Circle</div>
```

### Transitions
```html
<button class="transition-base">Smooth transition</button>
<div class="transition-all">Transition all properties</div>
```

---

## 📱 Responsive Design

### Breakpoints (for reference)
```css
/* Extra Small: 0px and up */
/* Small: 576px and up */
/* Medium: 768px and up */
/* Large: 992px and up */
/* Extra Large: 1200px and up */
/* 2X Large: 1400px and up */
```

**Usage in Media Queries:**
```css
@media (min-width: 768px) {
  /* Tablet and up */
}

@media (min-width: 992px) {
  /* Desktop and up */
}
```

---

## 💡 Best Practices

### ✅ DO
```css
/* Use CSS variables */
.button {
  background: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

/* Use utility classes for quick styling */
<button class="bg-gradient-primary rounded-full shadow-primary">
  Click Me
</button>
```

### ❌ DON'T
```css
/* Avoid hardcoded values */
.button {
  background: #667eea; /* ❌ Use var(--color-primary-500) */
  padding: 16px;       /* ❌ Use var(--spacing-4) */
  border-radius: 12px; /* ❌ Use var(--radius-lg) */
}
```

---

## 🔄 Migration Guide

### Replacing Hardcoded Colors

**Before:**
```css
.element {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.3);
}
```

**After:**
```css
.element {
  background: var(--gradient-primary);
  color: var(--color-primary-500);
  border-color: var(--color-primary-300);
}
```

### Replacing Hardcoded Spacing

**Before:**
```css
.card {
  padding: 16px;
  margin: 24px;
  gap: 12px;
}
```

**After:**
```css
.card {
  padding: var(--spacing-4);
  margin: var(--spacing-6);
  gap: var(--spacing-3);
}
```

---

## 🎨 Component Examples

### Button
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-base);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}
```

### Card
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

### Modal
```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: var(--backdrop-blur-md);
  z-index: var(--z-modal-backdrop);
}

.modal-content {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-modal);
}
```

---

## 📚 Additional Resources

- **Full Documentation:** See `design-system.css` for all available variables
- **Component Library:** Check existing components for usage examples
- **UI/UX Plan:** See `UI_UX_IMPROVEMENT_PLAN.md` for design guidelines

---

## 🤝 Contributing

When adding new components:
1. Use design system variables
2. Follow naming conventions
3. Maintain consistency
4. Document custom variables
5. Test responsiveness

---

**Last Updated:** 2024
**Version:** 1.0.0

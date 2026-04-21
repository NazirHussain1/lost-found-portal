# 🚀 Design System Quick Reference
## Lost & Found Portal - Cheat Sheet

---

## 🎨 Colors

### Primary
```css
var(--color-primary-500)  /* #667eea - Main brand color */
var(--gradient-primary)   /* Primary gradient */
```

### Semantic
```css
var(--color-success-500)  /* Green - Success */
var(--color-error-500)    /* Red - Error */
var(--color-warning-500)  /* Orange - Warning */
var(--color-info-500)     /* Blue - Info */
```

### Grays
```css
var(--color-gray-50)      /* Lightest */
var(--color-gray-500)     /* Medium */
var(--color-gray-900)     /* Darkest */
```

---

## 📏 Spacing

```css
var(--spacing-2)   /* 8px */
var(--spacing-4)   /* 16px - Default */
var(--spacing-6)   /* 24px */
var(--spacing-8)   /* 32px */

/* Or use semantic */
var(--spacing-sm)  /* 8px */
var(--spacing-md)  /* 16px */
var(--spacing-lg)  /* 24px */
var(--spacing-xl)  /* 32px */
```

---

## 🔲 Border Radius

```css
var(--radius-md)    /* 8px - Default */
var(--radius-lg)    /* 12px - Cards */
var(--radius-xl)    /* 16px - Large cards */
var(--radius-full)  /* Pills */
var(--radius-circle) /* 50% - Avatars */
```

---

## 🌑 Shadows

```css
var(--shadow-sm)       /* Subtle */
var(--shadow-md)       /* Default */
var(--shadow-lg)       /* Elevated */
var(--shadow-primary)  /* Colored glow */
```

---

## 📝 Typography

```css
/* Sizes */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */

/* Weights */
var(--font-weight-normal)   /* 400 */
var(--font-weight-medium)   /* 500 */
var(--font-weight-semibold) /* 600 */
var(--font-weight-bold)     /* 700 */
```

---

## ⚡ Transitions

```css
var(--transition-fast)  /* 150ms */
var(--transition-base)  /* 200ms */
var(--transition-slow)  /* 300ms */
```

---

## 🎯 Z-Index

```css
var(--z-dropdown)       /* 1000 */
var(--z-modal-backdrop) /* 1040 */
var(--z-modal)          /* 1050 */
```

---

## 🛠️ Utility Classes

```html
<!-- Colors -->
<p class="text-primary">Text</p>
<div class="bg-gradient-primary">Background</div>

<!-- Shadows -->
<div class="shadow-md">Card</div>
<div class="shadow-primary">Glowing card</div>

<!-- Radius -->
<button class="rounded-full">Pill Button</button>
<img class="rounded-circle" />

<!-- Animations -->
<div class="animate-fadeIn">Fade in</div>
<div class="animate-slideUp">Slide up</div>
```

---

## 💡 Common Patterns

### Button
```css
.my-button {
  background: var(--gradient-primary);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

### Card
```css
.my-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-gray-200);
}
```

### Input
```css
.my-input {
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  transition: var(--transition-base);
}

.my-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
```

---

## 🔄 Quick Replacements

| Old | New |
|-----|-----|
| `#667eea` | `var(--color-primary-500)` |
| `#764ba2` | `var(--color-secondary-500)` |
| `16px` | `var(--spacing-4)` |
| `12px` | `var(--radius-lg)` |
| `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` | `var(--gradient-primary)` |

---

## 📱 Breakpoints

```css
@media (min-width: 576px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 992px)  { /* lg */ }
@media (min-width: 1200px) { /* xl */ }
```

---

**Need more details?** See `DESIGN_SYSTEM_GUIDE.md`

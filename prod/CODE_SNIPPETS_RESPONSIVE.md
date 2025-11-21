# 💻 Snippets de Code - Patterns Responsive

## 1. Pattern Responsive Basique avec clamp()

```css
/* Titre responsive */
h1 {
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}

/* Texte body responsive */
p {
  font-size: clamp(0.875rem, 1.5vw, 1.125rem);
  line-height: 1.6;
}

/* Padding responsive */
.container {
  padding: clamp(1rem, 4vw, 2.5rem);
}

/* Gap responsive dans Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}
```

---

## 2. Hauteurs et Dimensions Fluides

```css
/* Carte avec hauteur fluide */
.card {
  aspect-ratio: 16 / 9;
  min-height: clamp(200px, 40vh, 450px);
  max-height: 100vh;
  border-radius: clamp(8px, 2vw, 16px);
  padding: clamp(1rem, 3vw, 1.5rem);
}

/* Image responsive */
.image {
  width: 100%;
  max-width: clamp(300px, 80vw, 1200px);
  height: auto;
  object-fit: cover;
}

/* Sidebar responsive */
.sidebar {
  width: clamp(200px, 50vw, 300px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
```

---

## 3. Typography Responsive

```css
/* Système typographique responsive */

/* H1 */
h1 {
  font-size: clamp(1.75rem, 6vw, 3.5rem);
  line-height: 1.1;
  font-weight: 800;
}

/* H2 */
h2 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  line-height: 1.2;
  font-weight: 700;
}

/* H3 */
h3 {
  font-size: clamp(1.25rem, 4vw, 1.875rem);
  line-height: 1.3;
  font-weight: 600;
}

/* Body */
body {
  font-size: clamp(0.875rem, 1.5vw, 1.125rem);
  line-height: 1.5;
}

/* Small */
small {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

/* Code */
code {
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
  font-family: 'Courier New', monospace;
}
```

---

## 4. Grilles Responsive

```css
/* Grid 1: Auto-fit */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

/* Grid 2: Auto-fill */
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: clamp(0.5rem, 1.5vw, 1.5rem);
}

/* Grid 3: Flexible */
.grid-flexible {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 30vw, 350px), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}

/* Grid avec 2 colonnes max */
.grid-max-2 {
  display: grid;
  grid-template-columns: repeat(min(2, auto-fit), 1fr);
  gap: clamp(1rem, 2vw, 1.5rem);
}
```

---

## 5. Navigation Responsive

```css
/* Navigation bar responsive */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background: #0f172a;
  gap: clamp(0.5rem, 1.5vw, 2rem);
}

nav a {
  font-size: clamp(0.875rem, 1.3vw, 1.125rem);
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1.5rem);
  border-radius: clamp(4px, 0.5vw, 8px);
}

/* Mobile menu toggle */
.menu-toggle {
  display: none;
  cursor: pointer;
  padding: clamp(0.5rem, 1vw, 0.75rem);
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  
  nav {
    flex-direction: column;
    gap: clamp(0.5rem, 2vw, 1rem);
  }
}
```

---

## 6. Formulaires Responsive

```css
/* Form inputs responsive */
input, select, textarea {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  border: 2px solid #ccc;
  border-radius: clamp(4px, 0.5vw, 8px);
  width: 100%;
  transition: all 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #06b6d4;
  box-shadow: 0 0 0 clamp(2px, 0.5vw, 4px) rgba(6, 182, 212, 0.2);
}

/* Form label responsive */
label {
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  font-weight: 600;
  margin-bottom: clamp(0.25rem, 1vw, 0.5rem);
  display: block;
}

/* Form grid responsive */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(clamp(200px, 40vw, 300px), 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

/* Buttons responsive */
button {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  font-size: clamp(0.875rem, 1.3vw, 1rem);
  border-radius: clamp(4px, 0.5vw, 8px);
  min-height: 44px; /* Tactile */
  cursor: pointer;
  transition: all 0.3s ease;
}
```

---

## 7. Sections Responsive

```css
/* Hero Section */
.hero {
  width: 100%;
  min-height: clamp(300px, 80vh, 600px);
  padding: clamp(2rem, 5vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Featured Section */
.featured {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 3vw, 2rem);
  max-width: clamp(300px, 90vw, 1200px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

@media (min-width: 768px) {
  .featured {
    grid-template-columns: 2fr 1fr;
  }
}

@media (min-width: 1024px) {
  .featured {
    grid-template-columns: 3fr 1fr;
  }
}

/* Footer responsive */
footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
  padding: clamp(1.5rem, 3vw, 3rem);
  background: #0f172a;
  color: #e2e8f0;
  margin-top: clamp(2rem, 5vw, 4rem);
}
```

---

## 8. Carousel/Slider Responsive

```css
/* Carousel container */
.carousel {
  width: 100%;
  max-width: clamp(300px, 95vw, 1200px);
  margin: 0 auto;
  overflow: hidden;
}

/* Carousel items */
.carousel-items {
  display: flex;
  gap: clamp(0.5rem, 2vw, 1.5rem);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.carousel-item {
  flex: 0 0 clamp(200px, 80vw, 400px);
  scroll-snap-align: start;
  border-radius: clamp(8px, 2vw, 16px);
  overflow: hidden;
}

/* Scroll bar styling */
.carousel-items::-webkit-scrollbar {
  height: 8px;
}

.carousel-items::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.6);
  border-radius: 4px;
}
```

---

## 9. Modal/Dialog Responsive

```css
/* Modal overlay */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 2vw, 2rem);
  z-index: 1000;
}

/* Modal content */
.modal-content {
  background: white;
  border-radius: clamp(8px, 2vw, 16px);
  width: 100%;
  max-width: clamp(300px, 90vw, 600px);
  max-height: min(90vh, 800px);
  padding: clamp(1.5rem, 3vw, 2rem);
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

/* Modal header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
  padding-bottom: clamp(1rem, 2vw, 1.5rem);
  border-bottom: 2px solid #e5e7eb;
}

.modal-header h2 {
  font-size: clamp(1.25rem, 4vw, 1.75rem);
}

/* Close button */
.modal-close {
  width: clamp(32px, 5vw, 40px);
  height: clamp(32px, 5vw, 40px);
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}
```

---

## 10. Table Responsive

```css
/* Responsive table */
.table-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: clamp(8px, 2vw, 16px);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

table th, table td {
  padding: clamp(0.75rem, 1.5vw, 1rem);
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
}

table th {
  background: #f3f4f6;
  font-weight: 600;
  position: sticky;
  top: 0;
}

/* Stack table on mobile */
@media (max-width: 640px) {
  table, thead, tbody, tr, td {
    display: block;
    width: 100%;
  }
  
  thead {
    display: none;
  }
  
  td {
    padding-left: 50%;
    position: relative;
  }
  
  td::before {
    content: attr(data-label);
    position: absolute;
    left: clamp(0.5rem, 1vw, 1rem);
    font-weight: 600;
    width: 45%;
  }
}
```

---

## 11. Accessibilité Responsive

```css
/* Focus visible pour clavier */
*:focus-visible {
  outline: clamp(2px, 0.5vw, 4px) solid #06b6d4;
  outline-offset: clamp(2px, 0.5vw, 4px);
  border-radius: 2px;
}

/* Skip link accessible */
.skip-link {
  position: absolute;
  top: -clamp(2rem, 5vw, 3rem);
  left: 0;
  background: #06b6d4;
  color: white;
  padding: clamp(0.5rem, 1vw, 0.75rem);
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: more) {
  body {
    background: black;
    color: white;
  }
  
  button, input, select {
    border-width: clamp(2px, 0.5vw, 3px);
  }
}
```

---

## 12. Animations Responsive

```css
/* Animation fluide responsive */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(clamp(-20px, -5vw, -40px));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.element {
  animation: slideIn 0.5s ease-out forwards;
}

/* Hover effects responsive */
@media (hover: hover) and (pointer: fine) {
  .button:hover {
    transform: translateY(clamp(-2px, -0.5vw, -4px));
    box-shadow: 0 clamp(4px, 1vw, 10px) 20px rgba(0, 0, 0, 0.15);
  }
}

/* No hover on touch devices */
@media (hover: none) and (pointer: coarse) {
  .button {
    transform: none;
  }
  
  .button:active {
    opacity: 0.8;
  }
}
```

---

## 13. Utils Responsive

```css
/* Spacing utilities */
.mt-responsive { margin-top: clamp(1rem, 3vw, 2rem); }
.mb-responsive { margin-bottom: clamp(1rem, 3vw, 2rem); }
.p-responsive { padding: clamp(1rem, 3vw, 2rem); }
.gap-responsive { gap: clamp(1rem, 2vw, 2rem); }

/* Width utilities */
.w-full-responsive { width: clamp(280px, 95vw, 1200px); }
.w-container { max-width: clamp(320px, 90vw, 1200px); margin: 0 auto; }

/* Text utilities */
.text-responsive { font-size: clamp(0.875rem, 1.5vw, 1.125rem); }
.text-lg-responsive { font-size: clamp(1rem, 2vw, 1.25rem); }
.text-xl-responsive { font-size: clamp(1.25rem, 3vw, 1.5rem); }

/* Display utilities */
.hidden-mobile { display: none; }
@media (min-width: 768px) {
  .hidden-mobile { display: block; }
  .hidden-desktop { display: none; }
}
```

---

## 14. Patterns Avancés

```css
/* Container queries (futur) */
@container (min-width: 400px) {
  .item {
    font-size: clamp(1rem, 1cqw, 1.25rem);
  }
}

/* Min() et Max() utilities */
.element {
  width: min(100%, 600px);
  padding: max(1rem, 2vw);
  gap: min(2rem, 5vw);
}

/* Nested media queries */
@media (min-width: 768px) {
  @media (prefers-dark-colorscheme) {
    .element {
      background: #1f2937;
      color: #f3f4f6;
    }
  }
}
```

---

## 🎯 À Copier-Coller

### Starter Template Responsive

```css
/* Base Responsive */
:root {
  --color-primary: #06b6d4;
  --color-dark: #0f172a;
  --spacing-xs: clamp(0.5rem, 1vw, 0.75rem);
  --spacing-sm: clamp(0.75rem, 1.5vw, 1rem);
  --spacing-md: clamp(1rem, 2vw, 1.5rem);
  --spacing-lg: clamp(1.5rem, 3vw, 2rem);
  --spacing-xl: clamp(2rem, 4vw, 3rem);
  --text-sm: clamp(0.8rem, 1vw, 0.875rem);
  --text-base: clamp(0.875rem, 1.5vw, 1rem);
  --text-lg: clamp(1rem, 2vw, 1.25rem);
  --text-xl: clamp(1.25rem, 3vw, 1.5rem);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--color-dark);
  background: white;
}

h1 {
  font-size: clamp(1.75rem, 6vw, 3.5rem);
}

h2 {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

h3 {
  font-size: clamp(1.25rem, 4vw, 1.875rem);
}
```

---

✅ **Prêt à utiliser! Bon coding! 🚀**


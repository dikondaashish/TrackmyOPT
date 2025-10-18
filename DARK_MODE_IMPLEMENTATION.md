# 🌓 Dark Mode Implementation Guide

## Apple-Inspired Theme System for TrackMyOPT Dashboard

---

## 🎨 **Design Philosophy**

Our theme system is inspired by Apple's design principles:
- **Clean & Minimal**: Focus on content, not chrome
- **High Contrast**: Ensures readability in all lighting conditions
- **Smooth Transitions**: Buttery smooth 200ms animations
- **True Black Dark**: Like iOS/macOS, uses true black for OLED efficiency
- **Purposeful Color**: Every color has semantic meaning

---

## 🏗️ **Architecture**

### **1. Tailwind Configuration**
```typescript
// tailwind.config.ts
{
  darkMode: 'class',  // Manual control via .dark class
  theme: {
    extend: {
      colors: {
        // HSL-based semantic colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... and more
      }
    }
  }
}
```

### **2. CSS Custom Properties**
```css
/* globals.css */
:root {
  /* Light Mode */
  --background: 0 0% 100%;       /* Pure white */
  --foreground: 240 10% 3.9%;    /* Near black */
  --primary: 211 100% 50%;       /* Apple Blue #007AFF */
}

.dark {
  /* Dark Mode */
  --background: 240 10% 3.9%;    /* True black */
  --foreground: 0 0% 98%;        /* Near white */
  --primary: 211 100% 50%;       /* Same blue */
}
```

### **3. Theme Toggle**
```typescript
// dashboard/layout.tsx
const [darkMode, setDarkMode] = useState(true);

useEffect(() => {
  const root = document.documentElement;
  if (darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}, [darkMode]);
```

---

## 🎯 **Color System**

### **Semantic Colors**

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | Pure white | True black | Main background |
| `foreground` | Near black | Near white | Primary text |
| `card` | White | Dark gray | Card backgrounds |
| `primary` | Apple Blue | Apple Blue | CTAs, links |
| `muted` | Light gray | Dark gray | Subtle backgrounds |
| `border` | Light border | Dark border | Dividers |
| `sidebar` | Off-white | Elevated black | Sidebar bg |

### **Apple Color Palette**
- **Primary Blue**: `#007AFF` - Matches iOS system blue
- **Success Green**: `#34C759` - For positive states
- **Warning Amber**: `#FF9500` - For cautions
- **Error Red**: `#FF3B30` - For errors

---

## 🧩 **Component Patterns**

### **Card Component**
```tsx
<div className="bg-card hover:bg-card/80 border border-border rounded-xl p-6 
                transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
  {/* Content */}
</div>
```

**Features:**
- Hover effect with opacity change
- Subtle shadow on hover
- Smooth 200ms transition
- Works in both themes

### **Button Component**
```tsx
<button className="bg-primary hover:bg-primary/90 text-primary-foreground
                   font-semibold transition-all duration-200 
                   hover:shadow-lg hover:shadow-primary/30">
  Click Me
</button>
```

**Features:**
- Primary color with hover state
- Glow effect on hover
- Proper contrast in both modes

### **Glass Effect**
```tsx
<div className="glass-card">
  {/* Glassmorphism effect */}
</div>
```

**CSS:**
```css
.glass-card {
  @apply bg-white/90 dark:bg-card/90 backdrop-blur-md border border-border/50;
}
```

---

## 🔄 **Theme Toggle Component**

### **Implementation**
```tsx
// Header.tsx
<button
  onClick={() => setDarkMode(!darkMode)}
  className="relative w-16 h-8 rounded-full bg-muted hover:bg-accent 
             transition-all duration-300"
>
  {/* Animated track */}
  <div className={`absolute inset-0 transition-transform ${
    darkMode ? 'translate-x-0' : 'translate-x-full'
  }`}>
    <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
  </div>
  
  {/* Sliding thumb */}
  <div className={`absolute top-1 left-1 w-6 h-6 rounded-full 
                   bg-white dark:bg-card shadow-lg transition-transform ${
    darkMode ? 'translate-x-8' : 'translate-x-0'
  }`}>
    {darkMode ? <Moon /> : <Sun />}
  </div>
</button>
```

**Features:**
- iOS-style toggle switch
- Smooth sliding animation
- Icon transitions
- Background gradient
- Hover states

---

## 📱 **Component Examples**

### **MetricCard**
```tsx
<div className="group bg-card hover:bg-card/80 border border-border rounded-xl p-6
                transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
  <p className="text-sm font-medium text-muted-foreground">Title</p>
  <p className="text-3xl font-semibold tracking-tight text-foreground">Value</p>
</div>
```

### **ToolCard**
```tsx
<div className="group bg-card border border-border rounded-xl p-6
                hover:border-primary hover:shadow-lg hover:scale-[1.02]
                transition-all duration-200 cursor-pointer">
  <div className="group-hover:scale-110 transition-transform">Icon</div>
  <h3 className="font-semibold text-foreground">Title</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

### **Info Banner**
```tsx
<div className="bg-gradient-to-br from-primary/5 to-primary/10 
                dark:from-primary/10 dark:to-primary/5 
                border border-primary/20 rounded-lg p-6">
  <p className="font-medium">Information text</p>
</div>
```

---

## ⚡ **Performance Optimizations**

### **1. CSS Transitions**
```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

### **2. Theme Persistence**
```typescript
// Save to localStorage
localStorage.setItem('tmo_dark_mode', String(darkMode));

// Load on mount
useEffect(() => {
  const savedMode = localStorage.getItem('tmo_dark_mode');
  if (savedMode !== null) {
    setDarkMode(savedMode === 'true');
  }
}, []);
```

### **3. No Flash of Unstyled Content**
- Theme applied before first paint
- Initial state set from localStorage
- Smooth class toggle on `<html>` element

---

## 🎭 **Accessibility**

### **Focus States**
```css
*:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
}
```

### **Color Contrast**
- Light mode: 7:1 contrast ratio minimum
- Dark mode: 7:1 contrast ratio minimum
- WCAG AAA compliant

### **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔧 **Customization**

### **Adding New Colors**
1. Add to `tailwind.config.ts`:
```typescript
colors: {
  myColor: 'hsl(var(--my-color))',
}
```

2. Add to `globals.css`:
```css
:root {
  --my-color: 210 100% 50%;
}

.dark {
  --my-color: 210 100% 60%;
}
```

3. Use in components:
```tsx
<div className="bg-myColor text-myColor-foreground">
  Content
</div>
```

### **Adjusting Transition Speed**
```css
/* globals.css */
* {
  transition-duration: 150ms; /* Change from 200ms */
}
```

---

## 📊 **Testing Checklist**

### **Visual Testing**
- [ ] All cards visible in both modes
- [ ] Text readable in both modes
- [ ] Borders visible but subtle
- [ ] Hover states work correctly
- [ ] Focus rings visible
- [ ] Smooth transitions

### **Functional Testing**
- [ ] Toggle switch works
- [ ] Theme persists on refresh
- [ ] Theme persists across tabs
- [ ] No flash on page load
- [ ] No console errors

### **Browser Testing**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers

---

## 🚀 **Deployment**

### **Production Build**
```bash
cd web
npm run build
```

### **Environment Variables**
No additional environment variables needed for theming.

### **CDN Considerations**
- CSS is bundled with Tailwind
- No external theme dependencies
- Fast initial load

---

## 📚 **Resources**

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [HSL Color Space](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## 💡 **Tips for Developers**

1. **Always use semantic colors**: Use `bg-card` instead of `bg-white`
2. **Test in both modes**: Toggle between themes frequently
3. **Use HSL for flexibility**: Easy to adjust lightness/saturation
4. **Leverage Tailwind variants**: Use `dark:` prefix for dark mode styles
5. **Keep transitions smooth**: 200ms is the sweet spot
6. **Think in layers**: Background → Cards → Content → Interactive elements

---

## 🐛 **Common Issues**

### **Theme not persisting**
- Check localStorage is accessible
- Verify key name matches: `tmo_dark_mode`
- Ensure layout component is client-side

### **Flash of light mode on dark**
- Apply theme class before hydration
- Use `suppressHydrationWarning` on `<html>` if needed

### **Colors not updating**
- Ensure HSL values in `globals.css`
- Check Tailwind config has `darkMode: 'class'`
- Verify `.dark` class on `<html>` element

---

**Built with ❤️ by the TrackMyOPT team**

*Last updated: October 18, 2025*

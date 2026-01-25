# Astro360 Design System

A comprehensive guide to the visual language, components, and patterns used throughout the Astro360 application.

## 1. Typography

### Display Headings
- **Heading 1**: 48px (5xl) - Font: Display, Bold
- **Heading 2**: 36px (4xl) - Font: Display, Bold
- **Heading 3**: 30px (3xl) - Font: Display, Bold

### Body Text
- **Large Body**: 18px (lg) - Used for lead paragraphs.
- **Base Body**: 16px (base) - Default size for standard reading.
- **Small Text**: 14px (sm) - Secondary information.
- **Tiny Text**: 12px (xs) - Labels and captions.

## 2. Color Palette

### Primary Colors (Celestial)
- **Cosmic Night**: Slate 900 (#0f172a)
- **Nebula Indigo**: Indigo 600 (#4f46e5)
- **Mystic Purple**: Purple 600 (#9333ea)
- **Solar Gold**: Amber 400 (#fbbf24)

### Backgrounds & Surfaces
- **Surface / Light**: Slate 50 (#f8fafc)
- **Card / White**: White (#ffffff)

## 3. Components

### Buttons
- **Primary**: Indigo background, White text.
- **Secondary**: White background, Slate border, Slate text.
- **Ghost**: Indigo-50 background, Indigo text.

### Cards
- **Card Base**: White background, rounded-xl, border-slate-100.
- **Card Hover**: Shadow-md on hover, border-slate-200 on hover.

### Form Elements
- **Input**: Rounded-xl, border-slate-200, focus ring-indigo-200.
- **Select**: Similar styling to Input.
- **Checkbox/Radio**: Indigo accent colors.

### Alerts
- **Success**: Emerald-50 bg, Emerald-700 text.
- **Error**: Rose-50 bg, Rose-700 text.
- **Warning**: Amber-50 bg, Amber-700 text.
- **Info**: Indigo-50 bg, Indigo-700 text.

## 4. Iconography
Using `lucide-react` library.
Key icons: Sparkles, Moon, Sun, Star, Heart, Calendar, User, Settings.

## 5. Animations
- **Fade In**: `animate-fade-in`
- **Slide Up**: `animate-slide-up`
- **Float**: `animate-float`

## 6. Gradients & Effects
- **Celestial Gradient**: `from-slate-900 to-indigo-900`
- **Mystic Gradient**: `from-indigo-500 to-purple-500`
- **Solar Gradient**: `from-amber-400 to-orange-500`
- **Glass Effect**: `backdrop-blur-md`, `bg-white/10`

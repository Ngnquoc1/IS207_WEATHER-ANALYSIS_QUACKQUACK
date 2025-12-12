# Weather Analysis Dashboard - Design System

## Design Philosophy
**Minimalist, Professional, Data-First.**
The new design removes decorative elements like gradients and heavy shadows to focus on content and readability. It uses a high-contrast, flat design style with subtle depth cues.

## Color Palette

### Light Theme
- **Background**: `#F8F9FA` (Neutral Gray 50)
- **Surface**: `#FFFFFF` (White)
- **Primary Brand**: `#0066CC` (Professional Blue)
- **Secondary Brand**: `#5C6BC0` (Indigo - for variety in charts/accents)
- **Text Primary**: `#1A1A1A` (Gray 900)
- **Text Secondary**: `#6C757D` (Gray 600)
- **Border**: `#E9ECEF` (Gray 200)
- **Success**: `#28A745`
- **Warning**: `#FFC107`
- **Error**: `#DC3545`

### Dark Theme
- **Background**: `#121212` (Material Dark Background)
- **Surface**: `#1E1E1E` (Dark Surface)
- **Primary Brand**: `#4D90FE` (Lighter Blue for contrast)
- **Secondary Brand**: `#7986CB` (Lighter Indigo)
- **Text Primary**: `#E0E0E0` (Gray 200)
- **Text Secondary**: `#A0A0A0` (Gray 400)
- **Border**: `#333333` (Gray 800)
- **Success**: `#4CAF50`
- **Warning**: `#FFD54F`
- **Error**: `#EF5350`

## Typography
- **Font Family**: System Stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, etc.)
- **Headings**:
  - H1: 24px / 32px, Semi-Bold (600)
  - H2: 20px / 28px, Semi-Bold (600)
  - H3: 16px / 24px, Medium (500)
- **Body**:
  - Regular: 14px / 20px, Regular (400)
  - Small: 12px / 16px, Regular (400)

## Spacing System
- **Base Unit**: 4px
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

## Component Styles

### Cards / Containers
- **Border Radius**: 12px
- **Shadow**: 
  - Light: `0 2px 4px rgba(0,0,0,0.05)`
  - Dark: `none` (use lighter background color for elevation)
- **Border**: 1px solid var(--border-color)

### Buttons
- **Primary**: Solid Brand Color, White Text, No Border. Radius 6px.
- **Secondary**: Transparent Background, Brand Color Text, 1px Border. Radius 6px.
- **Hover**: Opacity 0.9 or slight brightness adjustment.

### Inputs
- **Background**: Surface Color
- **Border**: 1px solid var(--border-color)
- **Radius**: 6px
- **Focus**: Brand Color Border + Box Shadow ring.

### Navigation / Header
- **Background**: Surface Color (Sticky)
- **Border Bottom**: 1px solid var(--border-color)
- **Shadow**: None or very subtle `0 1px 2px rgba(0,0,0,0.05)`

## Layout
- **Max Width**: 1200px (Centered)
- **Grid Gap**: 24px

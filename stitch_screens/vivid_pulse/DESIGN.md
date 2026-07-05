---
name: Vivid Pulse
colors:
  surface: '#f9f9ff'
  surface-dim: '#d4daeb'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#e2e8f9'
  surface-container-highest: '#dde2f3'
  on-surface: '#161c28'
  on-surface-variant: '#5c403a'
  inverse-surface: '#2a303d'
  inverse-on-surface: '#ecf0ff'
  outline: '#916f69'
  outline-variant: '#e5bdb6'
  surface-tint: '#ba1c00'
  primary: '#b51c00'
  on-primary: '#ffffff'
  primary-container: '#dc3214'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a5'
  secondary: '#8f4e00'
  on-secondary: '#ffffff'
  secondary-container: '#fc9d41'
  on-secondary-container: '#6b3900'
  tertiary: '#006387'
  on-tertiary: '#ffffff'
  tertiary-container: '#007daa'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8e1300'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77a'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7cd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#f9f9ff'
  on-background: '#161c28'
  surface-variant: '#dde2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  question-text:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 32px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-timer:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  column-gap: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a high-energy, high-fidelity competitive learning environment. It targets a broad demographic ranging from students to trivia enthusiasts, prioritizing clarity under pressure and emotional engagement. 

The aesthetic is **Corporate Modern with a High-Contrast Edge**. It utilizes clean, systematic layouts inherited from SaaS design but injects the urgency of gaming through vibrant gradients and tactile depth. The goal is to evoke a sense of momentum, achievement, and focus. All interactions should feel crisp and instantaneous to match the "quiz" context.

## Colors

The palette is anchored by a high-energy "Pulse Red" gradient used exclusively for primary brand moments: headers, main progress tracking, and final call-to-actions. 

- **Primary:** The #FF4B2B to #FF416C gradient signifies the active state of the quiz.
- **Success/Correct:** A vibrant green (#2ECC71) used for correct answers and completion states.
- **Warning/Secondary:** A warm orange (#FF9F43) reserved for leaderboards, "almost finished" warnings, and secondary navigation.
- **Neutral:** A deep slate (#2F3542) for text and structural lines to maintain high legibility against white backgrounds.

## Typography

This design system utilizes **Inter** across all levels to ensure maximum readability and a systematic, modern feel. 

For questions, we use a specific `question-text` role with increased line height and a medium weight to reduce eye strain. Large display styles use tighter letter spacing and heavy weights to create a sense of urgency. The `mono-timer` role must use tabular numbers to prevent layout jitter during countdowns.

## Layout & Spacing

The design system employs a **12-column fluid grid** for general layouts, which simplifies to a strict **4-column grid** for central quiz content on desktop to maintain focus.

- **Desktop:** Centralized 4-column column layout for the question card (approx. 800px max width) to prevent long line lengths.
- **Mobile:** Single column with 16px side margins. 
- **Spacing Rhythm:** Based on an 8px scale. Use `stack-lg` (32px) between the question and the answer options, and `stack-md` (16px) between individual answer choices.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and tonal layering. 

- **Level 0 (Background):** #F8F9FA.
- **Level 1 (Cards):** Pure white (#FFFFFF) with a soft, expansive shadow (0px 4px 20px rgba(0,0,0,0.05)).
- **Level 2 (Active/Hover):** When an answer is hovered or selected, the shadow intensifies (0px 8px 30px rgba(0,0,0,0.12)) to provide tactile feedback.
- **Level 3 (Modals/Overlays):** High-contrast shadows with a slight tint of the primary color in the shadow glow (0px 20px 40px rgba(255, 75, 43, 0.15)).

## Shapes

The design system uses a **Rounded** (Level 2) shape language to maintain a friendly and approachable feel while appearing modern.

- **Standard Buttons/Inputs:** 0.5rem (8px).
- **Question Cards/Containers:** 1rem (16px).
- **Badges/Status Tags:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons & Primary Actions
Primary buttons use the Brand Gradient with white text and a subtle drop shadow. Large "Start Quiz" or "Submit" buttons should use `headline-md` sizing.

### Answer Cards
Interactive cards that behave like radio buttons. On hover, apply a thin 2px border of `primary_color_hex`. On selection, the background shifts to a very light tint of the primary color (5% opacity) with a solid 2px border.

### Countdown Timer
A circular or bar-based indicator. The color should transition from `success_color_hex` to `secondary_color_hex` at 50% time, and `error_color_hex` at 10% time remaining.

### Quiz Badges
Large, pill-shaped indicators for "Category" or "Difficulty." These use `label-caps` typography and a light-gray background with dark-gray text to avoid competing with primary actions.

### Question Navigation Grid
A compact grid of squares representing question numbers. 
- **Current:** Primary color border.
- **Answered:** Solid neutral color.
- **Unanswered:** Subtle gray outline.

### Input Fields
Used for "Fill in the blank" questions. These should have a generous 16px padding and a focus state that utilizes the primary gradient as a glowing 2px ring.
# Complete Design Guidelines for Beautiful Next.js Apps (2025) - v3.0

_A comprehensive design system for creating visually stunning, intelligent, and emotionally resonant web applications that define the 2025 user experience_

**Version 3.0 | Enhanced Edition | August 2025**

---

## Table of Contents

1. [Design Philosophy & Core Principles](#philosophy)
2. [Tech Stack & Architecture](#tech-stack)
3. [Visual Excellence Standards](#visual-standards)
4. [Design Foundations](#foundations)
5. [Advanced Component Library](#advanced-components)
6. [Survey & Form Patterns](#survey-patterns)
7. [AI-Powered UI Patterns](#ai-patterns)
8. [Behavioral & Smart Features](#behavioral-features)
9. [Advanced Motion & Interactions](#advanced-motion)
10. [Widget & Embeddable Components](#widget-components)
11. [Real-time Data Visualization](#data-visualization)
12. [Layout & Spatial Design](#layout)
13. [Accessibility & Performance](#accessibility)
14. [Implementation Patterns](#implementation)
15. [Quality Standards](#quality)

---

## Design Philosophy & Core Principles {#philosophy}

### The Seven Pillars of Exceptional Design (2025)

**1. Meaningful Expression over Functional Minimalism**

- Interfaces must be personal, emotionally resonant, and dynamic
- Strategic use of color, shape, and motion creates memorable experiences
- Every interaction should feel considered and delightful
- Balance clarity with character—never boring, always intuitive

**2. Intelligence as an Interface Layer**

- AI is seamlessly integrated into the user experience
- Interfaces anticipate user needs and provide contextual assistance
- Real-time personalization based on user behavior
- Smart defaults and predictive interactions reduce friction

**3. System-First Design**

- A comprehensive design system is the foundation of every project
- Components built systematically from shared design tokens
- Consistency achieved through programmable design patterns
- Every element serves both aesthetic and functional purposes

**4. Standalone Excellence**

- Each application is a distinct, self-contained product
- Independent architecture allows for focused, specialized experiences
- Clean separation enables independent scaling and evolution
- Every app should feel complete and polished on its own

**5. Accessibility as a Cornerstone**

- Beautiful design and inclusive design are inseparable
- Every visual decision considers users with different abilities
- Accessibility enhances usability for everyone
- WCAG compliance is the baseline, not the goal

**6. Progressive Disclosure**

- Complex functionality revealed gradually based on user needs
- Smart collapsing panels that remember user preferences
- Context-aware UI that adapts to usage patterns
- Advanced features accessible without overwhelming beginners

**7. Real-time Responsiveness**

- Instant feedback for every user action
- Optimistic updates with graceful error recovery
- Live previews and real-time collaboration
- Performance that feels instantaneous

### Target Experience Goals

- **Visual Impact**: Users should say "wow" on first impression
- **Emotional Connection**: Create moments of joy and delight
- **Effortless Flow**: Complex tasks feel simple and intuitive
- **Responsive Performance**: Beautiful interfaces that load instantly
- **Inclusive Design**: Stunning visuals accessible to everyone
- **Intelligent Assistance**: AI helps without being intrusive
- **Progressive Mastery**: Users can grow from beginner to power user

---

## Tech Stack & Architecture {#tech-stack}

### Core Technologies (Production-Ready Stack)

```typescript
// Essential dependencies for a beautiful Next.js app in 2025
{
  "dependencies": {
    // Framework
    "next": "15.x",
    "react": "19.x",

    // Authentication
    "@clerk/nextjs": "latest",

    // Database & ORM
    "@neondatabase/serverless": "latest",
    "drizzle-orm": "latest",
    "drizzle-zod": "latest",

    // API Layer
    "@trpc/server": "latest",
    "@trpc/client": "latest",
    "@trpc/next": "latest",
    "@tanstack/react-query": "latest",

    // Styling
    "tailwindcss": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest",
    "@tailwindcss/typography": "latest",

    // UI Components
    "@radix-ui/react-*": "latest", // All needed primitives
    "framer-motion": "latest", // Essential for fluid animations
    "@dnd-kit/sortable": "latest", // Drag and drop
    "react-flow": "latest", // Node-based UIs

    // Forms & Validation
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",

    // Data Visualization
    "recharts": "latest",

    // Notifications & Feedback
    "sonner": "latest",

    // Utilities
    "date-fns": "latest",
    "nanoid": "latest",
    "clsx": "latest"
  }
}
```

### Architecture Principles

Each application follows a standalone architecture with:

- **Dedicated Clerk Instance**: Independent user management
- **Dedicated Neon Database**: Isolated data storage with Drizzle ORM
- **Dedicated Vercel Blob**: Separate file storage
- **Type-Safe Everything**: End-to-end type safety with TypeScript
- **Edge-Optimized**: Built for Vercel's global edge network
- **Real-time Capable**: WebSocket support for live features
- **AI-Ready**: Integration patterns for LLMs and embeddings

---

## Visual Excellence Standards {#visual-standards}

### Advanced Color Systems

```css
/* Dynamic Gradient System - Signature of Modern Design */
.gradient-aurora {
  background: linear-gradient(
    45deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

.gradient-mesh {
  background-image:
    radial-gradient(at 47% 33%, hsl(280, 80%, 65%) 0, transparent 59%),
    radial-gradient(at 82% 65%, hsl(218, 80%, 55%) 0, transparent 55%);
}

/* Glassmorphic Layers with Depth */
.glass-primary {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
}

/* Neumorphic Elements for Depth */
.neumorphic {
  background: linear-gradient(145deg, #f0f0f3, #cacace);
  box-shadow:
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
}

/* Dark Mode Optimized Gradients */
@media (prefers-color-scheme: dark) {
  .gradient-dark {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    opacity: 0.8;
  }
}
```

### Typography Evolution

```css
/* Fluid Typography System */
.text-hero {
  font-size: clamp(2.5rem, 5vw + 1rem, 6rem);
  line-height: 1.1;
  font-variation-settings: 'wght' var(--font-weight, 700);
  transition: font-variation-settings 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Gradient Text with Animation */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-text 3s linear infinite;
}

@keyframes gradient-text {
  to {
    background-position: 200% center;
  }
}

/* Kinetic Typography on Hover */
.text-kinetic {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-kinetic:hover {
  transform: translateY(-2px);
  font-variation-settings: 'wght' 900;
}

.text-kinetic::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  filter: blur(10px);
  opacity: 0.5;
  transform: translateY(5px);
}
```

---

## Design Foundations {#foundations}

### Enhanced Color Palette

```typescript
// Design tokens for consistent theming
export const colors = {
  // Primary Palette
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic Colors
  success: {
    light: '#86efac',
    DEFAULT: '#22c55e',
    dark: '#16a34a',
  },

  warning: {
    light: '#fde047',
    DEFAULT: '#eab308',
    dark: '#ca8a04',
  },

  error: {
    light: '#fca5a5',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },

  // Gradient Presets
  gradients: {
    aurora: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ocean: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
    fire: 'linear-gradient(45deg, #ff6b6b 0%, #ffd93d 100%)',
    mystic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
}
```

### Spacing & Layout System

```typescript
// Consistent spacing scale
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
}

// Responsive breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
```

---

## Advanced Component Library {#advanced-components}

### Glassmorphic Card with Variants

```typescript
// components/ui/glass-card.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const glassCardVariants = cva(
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: [
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-md backdrop-saturate-150',
          'border border-white/20 dark:border-gray-700/50',
          'shadow-xl shadow-black/5',
        ],
        glass: [
          'bg-gradient-to-br from-white/10 to-white/5',
          'dark:from-white/5 dark:to-white/[0.02]',
          'backdrop-blur-xl backdrop-saturate-200',
          'border border-white/20 dark:border-white/10',
          'shadow-2xl shadow-black/10',
        ],
        aurora: [
          'bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10',
          'backdrop-blur-xl backdrop-saturate-200',
          'border border-white/20',
          'shadow-2xl shadow-purple-500/10',
        ],
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
)

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  children: React.ReactNode
  animated?: boolean
}

export function GlassCard({
  className,
  variant,
  size,
  interactive,
  animated = false,
  children,
  ...props
}: GlassCardProps) {
  const Component = animated ? motion.div : 'div'

  return (
    <Component
      className={cn(glassCardVariants({ variant, size, interactive }), className)}
      whileHover={animated && interactive ? { y: -4 } : undefined}
      whileTap={animated && interactive ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}
```

### Animated Counter Component

```typescript
// components/ui/animated-counter.tsx
import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface AnimatedCounterProps {
  from?: number
  to: number
  duration?: number
  className?: string
  format?: (value: number) => string
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  className,
  format = (value) => Math.round(value).toLocaleString(),
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(from)
  const springValue = useSpring(motionValue, {
    damping: 100,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (isInView) {
      motionValue.set(to)
    }
  }, [motionValue, to, isInView])

  useEffect(
    () =>
      springValue.on('change', (latest) => {
        if (ref.current) {
          ref.current.textContent = format(latest)
        }
      }),
    [springValue, format]
  )

  return <span ref={ref} className={className}>{format(from)}</span>
}
```

### Gradient Text Component

```typescript
// components/ui/gradient-text.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gradientTextVariants = cva(
  'bg-clip-text text-transparent bg-gradient-to-r inline-block',
  {
    variants: {
      gradient: {
        aurora: 'from-purple-400 via-pink-400 to-blue-400',
        sunset: 'from-orange-400 via-pink-400 to-purple-400',
        ocean: 'from-blue-400 via-cyan-400 to-teal-400',
        fire: 'from-red-400 via-orange-400 to-yellow-400',
        mystic: 'from-purple-600 to-blue-600',
      },
      size: {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      animated: {
        true: 'animate-gradient-x',
        false: '',
      },
    },
    defaultVariants: {
      gradient: 'aurora',
      size: 'base',
      weight: 'semibold',
      animated: false,
    },
  }
)

interface GradientTextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof gradientTextVariants> {
  children: React.ReactNode
}

export function GradientText({
  className,
  gradient,
  size,
  weight,
  animated,
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        gradientTextVariants({ gradient, size, weight, animated }),
        animated && 'bg-[length:200%_auto]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

### Three-Panel Collapsible Layout

```typescript
// components/ui/three-panel-layout.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode
  centerPanel: React.ReactNode
  rightPanel: React.ReactNode
  leftPanelWidth?: string
  rightPanelWidth?: string
  collapsible?: boolean
  defaultCollapsed?: {
    left?: boolean
    right?: boolean
  }
}

export function ThreePanelLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelWidth = '280px',
  rightPanelWidth = '320px',
  collapsible = true,
  defaultCollapsed = {},
}: ThreePanelLayoutProps) {
  const [collapsed, setCollapsed] = useState({
    left: defaultCollapsed.left ?? false,
    right: defaultCollapsed.right ?? false,
  })

  // Keyboard shortcuts
  useEffect(() => {
    if (!collapsible) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '[') {
          e.preventDefault()
          setCollapsed(prev => ({ ...prev, left: !prev.left }))
        } else if (e.key === ']') {
          e.preventDefault()
          setCollapsed(prev => ({ ...prev, right: !prev.right }))
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [collapsible])

  return (
    <div className="flex h-full w-full relative">
      {/* Left Panel */}
      <AnimatePresence initial={false}>
        {!collapsed.left && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: leftPanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative border-r border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="h-full overflow-auto">
              {leftPanel}
            </div>
            {collapsible && (
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, left: true }))}
                className="absolute top-4 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Collapse left panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Left Panel Indicator */}
      {collapsed.left && collapsible && (
        <div
          className="w-8 border-r border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex items-center justify-center group"
          onClick={() => setCollapsed(prev => ({ ...prev, left: false }))}
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Center Panel */}
      <div className="flex-1 min-w-0">
        {centerPanel}
      </div>

      {/* Collapsed Right Panel Indicator */}
      {collapsed.right && collapsible && (
        <div
          className="w-8 border-l border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex items-center justify-center group"
          onClick={() => setCollapsed(prev => ({ ...prev, right: false }))}
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      )}

      {/* Right Panel */}
      <AnimatePresence initial={false}>
        {!collapsed.right && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: rightPanelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative border-l border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="h-full overflow-auto">
              {rightPanel}
            </div>
            {collapsible && (
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, right: true }))}
                className="absolute top-4 left-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Collapse right panel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Survey & Form Patterns {#survey-patterns}

### Advanced Question Types

```typescript
// components/survey/question-types/matrix-question.tsx
interface MatrixQuestionProps {
  question: string
  rows: string[]
  columns: string[]
  value?: Record<string, string>
  onChange: (value: Record<string, string>) => void
}

export function MatrixQuestion({
  question,
  rows,
  columns,
  value = {},
  onChange,
}: MatrixQuestionProps) {
  const handleChange = (row: string, column: string) => {
    onChange({
      ...value,
      [row]: column,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2"></th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-2 text-center text-sm">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-t">
                <td className="px-4 py-3 font-medium">{row}</td>
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleChange(row, column)}
                      className={cn(
                        'w-5 h-5 rounded-full border-2 transition-all',
                        value[row] === column
                          ? 'bg-primary border-primary scale-110'
                          : 'border-gray-300 hover:border-primary'
                      )}
                      aria-label={`Select ${column} for ${row}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### Ranking Question with Drag & Drop

```typescript
// components/survey/question-types/ranking-question.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface RankingQuestionProps {
  question: string
  items: string[]
  value?: string[]
  onChange: (value: string[]) => void
}

function SortableItem({ id, rank }: { id: string; rank: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border',
        isDragging ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-semibold">
        {rank}
      </div>
      <span className="flex-1">{id}</span>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  )
}

export function RankingQuestion({
  question,
  items,
  value = items,
  onChange,
}: RankingQuestionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = value.indexOf(active.id)
      const newIndex = value.indexOf(over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question}</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {value.map((item, index) => (
              <SortableItem key={item} id={item} rank={index + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
```

### Progressive Form with Floating Labels

```typescript
// components/forms/progressive-input.tsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export function ProgressiveInput({
  label,
  error,
  helperText,
  icon,
  className,
  ...props
}: ProgressiveInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHasValue(!!inputRef.current?.value)
  }, [props.value])

  const isFloating = isFocused || hasValue

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          className={cn(
            'peer w-full px-3 py-3 bg-transparent',
            'border-2 rounded-lg transition-all duration-200',
            'placeholder-transparent',
            icon && 'pl-10',
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:border-primary',
            'focus:outline-none',
            className
          )}
          placeholder={label}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(!!e.target.value)
          }}
          {...props}
        />
        <motion.label
          className={cn(
            'absolute left-3 transition-all duration-200 pointer-events-none',
            icon && 'left-10',
            isFloating
              ? 'top-0 -translate-y-1/2 text-xs bg-white dark:bg-gray-900 px-1'
              : 'top-1/2 -translate-y-1/2 text-base',
            error ? 'text-red-500' : 'text-gray-500 peer-focus:text-primary'
          )}
          animate={{
            y: isFloating ? '-50%' : '0%',
            scale: isFloating ? 0.75 : 1,
          }}
        >
          {label}
        </motion.label>
      </div>

      <AnimatePresence>
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              'mt-1 text-sm',
              error ? 'text-red-500' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## AI-Powered UI Patterns {#ai-patterns}

### Smart Suggestion Interface

```typescript
// components/ai/smart-suggestions.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw } from 'lucide-react'

interface SmartSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void
  getSuggestions: () => Promise<string[]>
  context?: string
}

export function SmartSuggestions({
  onSuggestionSelect,
  getSuggestions,
  context,
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const newSuggestions = await getSuggestions()
      setSuggestions(newSuggestions)
      setSelectedIndex(null)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Suggestions</span>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedIndex(index)
                  onSuggestionSelect(suggestion)
                }}
                className={cn(
                  'w-full p-3 text-left rounded-lg transition-all',
                  'border-2 hover:shadow-md',
                  selectedIndex === index
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                )}
              >
                <p className="text-sm">{suggestion}</p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {context && (
        <p className="text-xs text-gray-500 italic">
          Context: {context}
        </p>
      )}
    </div>
  )
}
```

### Expression Evaluator UI

```typescript
// components/ai/expression-evaluator.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'

interface ExpressionEvaluatorProps {
  expression: string
  variables: Record<string, any>
  onChange: (expression: string) => void
}

export function ExpressionEvaluator({
  expression,
  variables,
  onChange,
}: ExpressionEvaluatorProps) {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    try {
      // Safe expression evaluation
      const func = new Function(...Object.keys(variables), `return ${expression}`)
      const evaluated = func(...Object.values(variables))
      setResult(evaluated)
      setError(null)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid expression')
      setResult(null)
      setIsValid(false)
    }
  }, [expression, variables])

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={expression}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full p-3 pr-10 font-mono text-sm rounded-lg',
            'border-2 transition-colors',
            isValid
              ? 'border-green-500 focus:border-green-600'
              : error
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-200 dark:border-gray-700 focus:border-primary'
          )}
          rows={3}
          placeholder="Enter expression (e.g., age > 18 && country === 'US')"
        />
        <div className="absolute right-3 top-3">
          {isValid ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : error ? (
            <X className="w-5 h-5 text-red-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Variables</p>
          <div className="space-y-1">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="font-mono text-primary">{key}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {JSON.stringify(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Result</p>
          <motion.div
            key={expression}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-sm font-mono',
              isValid ? 'text-green-600' : 'text-red-600'
            )}
          >
            {isValid ? JSON.stringify(result) : error}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
```

---

## Behavioral & Smart Features {#behavioral-features}

### Smart Trigger Visualization

```typescript
// components/behavioral/trigger-visualization.tsx
import { motion } from 'framer-motion'
import { Clock, MousePointer, Zap, Users } from 'lucide-react'

interface Trigger {
  type: 'time' | 'scroll' | 'exit' | 'engagement'
  value: number
  unit?: string
  enabled: boolean
}

interface TriggerVisualizationProps {
  triggers: Trigger[]
  onToggle: (index: number) => void
  onUpdate: (index: number, value: number) => void
}

export function TriggerVisualization({
  triggers,
  onToggle,
  onUpdate,
}: TriggerVisualizationProps) {
  const icons = {
    time: Clock,
    scroll: MousePointer,
    exit: Zap,
    engagement: Users,
  }

  const labels = {
    time: 'Time on Page',
    scroll: 'Scroll Depth',
    exit: 'Exit Intent',
    engagement: 'Engagement Score',
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {triggers.map((trigger, index) => {
        const Icon = icons[trigger.type]

        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all',
              trigger.enabled
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  trigger.enabled
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">{labels[trigger.type]}</p>
                  <p className="text-xs text-gray-500">
                    {trigger.value}{trigger.unit || ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onToggle(index)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  trigger.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <motion.div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  animate={{ left: trigger.enabled ? '26px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {trigger.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={trigger.value}
                  onChange={(e) => onUpdate(index, Number(e.target.value))}
                  className="w-full"
                />
              </motion.div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
```

### Frequency Capping Interface

```typescript
// components/behavioral/frequency-capping.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, Calendar } from 'lucide-react'

interface FrequencyCappingProps {
  settings: {
    enabled: boolean
    maxImpressions: number
    timeWindow: 'hour' | 'day' | 'week' | 'month'
    cooldownPeriod: number
  }
  onChange: (settings: any) => void
}

export function FrequencyCapping({ settings, onChange }: FrequencyCappingProps) {
  const [expanded, setExpanded] = useState(settings.enabled)

  const timeWindows = [
    { value: 'hour', label: 'Per Hour', icon: Clock },
    { value: 'day', label: 'Per Day', icon: Calendar },
    { value: 'week', label: 'Per Week', icon: Calendar },
    { value: 'month', label: 'Per Month', icon: Calendar },
  ]

  return (
    <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Frequency Capping</h3>
            <p className="text-sm text-gray-500">
              Limit how often visitors see this
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const newEnabled = !settings.enabled
            onChange({ ...settings, enabled: newEnabled })
            setExpanded(newEnabled)
          }}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            settings.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
          )}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            animate={{ left: settings.enabled ? '26px' : '4px' }}
          />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">
                Maximum Impressions
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.maxImpressions}
                  onChange={(e) => onChange({
                    ...settings,
                    maxImpressions: Number(e.target.value)
                  })}
                  className="w-20 px-3 py-2 border rounded-lg"
                  min={1}
                />
                <span className="text-sm text-gray-500">times</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Time Window
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeWindows.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => onChange({ ...settings, timeWindow: value })}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border-2 transition-all',
                      settings.timeWindow === value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Cooldown Period
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={settings.cooldownPeriod}
                  onChange={(e) => onChange({
                    ...settings,
                    cooldownPeriod: Number(e.target.value)
                  })}
                  className="w-20 px-3 py-2 border rounded-lg"
                  min={0}
                />
                <span className="text-sm text-gray-500">hours before showing again</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Advanced Motion & Interactions {#advanced-motion}

### Spring Physics Animations

```typescript
// hooks/use-spring-physics.ts
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

export function useSpringPhysics() {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const bind = useDrag(
    ({ down, movement: [mx, my] }) => {
      api.start({
        x: down ? mx : 0,
        y: down ? my : 0,
        immediate: down,
        config: {
          tension: 200,
          friction: 20,
          mass: 1,
        },
      })
    },
    {
      bounds: { left: -100, right: 100, top: -100, bottom: 100 },
      rubberband: true,
    }
  )

  return { x, y, bind, animated }
}

// Usage in component
export function DraggableCard() {
  const { x, y, bind, animated } = useSpringPhysics()

  return (
    <animated.div
      {...bind()}
      style={{ x, y }}
      className="w-64 h-32 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-xl cursor-grab active:cursor-grabbing"
    >
      <p className="p-4 text-white font-semibold">Drag me around!</p>
    </animated.div>
  )
}
```

### Context-Aware Animations

```typescript
// hooks/use-reduced-motion.ts
import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Motion-safe component wrapper
export function MotionSafe({ children, fallback }: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{fallback || children}</>
  }

  return <>{children}</>
}
```

### Gesture-Based Interactions

```typescript
// components/interactions/swipe-actions.tsx
import { useSwipeable } from 'react-swipeable'
import { motion, useAnimation } from 'framer-motion'

interface SwipeActionsProps {
  onDelete?: () => void
  onArchive?: () => void
  children: React.ReactNode
}

export function SwipeActions({ onDelete, onArchive, children }: SwipeActionsProps) {
  const controls = useAnimation()

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      controls.start({ x: -100 })
      setTimeout(() => onDelete?.(), 300)
    },
    onSwipedRight: () => {
      controls.start({ x: 100 })
      setTimeout(() => onArchive?.(), 300)
    },
    onSwiping: (event) => {
      controls.start({ x: event.deltaX })
    },
    onSwipedUp: () => {
      controls.start({ x: 0 })
    },
    trackMouse: true,
  })

  return (
    <div className="relative overflow-hidden" {...handlers}>
      <motion.div
        animate={controls}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative z-10 bg-white dark:bg-gray-900"
      >
        {children}
      </motion.div>

      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center justify-start px-4">
          <span className="text-white font-medium">Archive</span>
        </div>
        <div className="flex-1 bg-red-500 flex items-center justify-end px-4">
          <span className="text-white font-medium">Delete</span>
        </div>
      </div>
    </div>
  )
}
```

---

## Widget & Embeddable Components {#widget-components}

### Embeddable Widget Pattern

```typescript
// components/widget/embeddable-widget.tsx
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  borderRadius: number
  shadow: boolean
}

export function EmbeddableWidget({ config }: { config: WidgetConfig }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Listen for postMessage events from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WIDGET_COMMAND') {
        switch (event.data.command) {
          case 'open':
            setIsOpen(true)
            break
          case 'close':
            setIsOpen(false)
            break
          case 'toggle':
            setIsOpen(prev => !prev)
            break
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  }

  if (!mounted) return null

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-50 w-14 h-14 rounded-full shadow-lg',
          'flex items-center justify-center',
          positionClasses[config.position]
        )}
        style={{
          backgroundColor: config.primaryColor,
          boxShadow: config.shadow
            ? `0 4px 20px ${config.primaryColor}40`
            : undefined,
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
        </svg>
      </motion.button>

      {/* Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'fixed z-50 w-96 max-w-[90vw] h-[600px] max-h-[80vh]',
              'bg-white dark:bg-gray-900 shadow-2xl',
              positionClasses[config.position]
            )}
            style={{
              borderRadius: `${config.borderRadius}px`,
              boxShadow: config.shadow
                ? '0 20px 60px rgba(0, 0, 0, 0.15)'
                : undefined,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ backgroundColor: config.primaryColor }}
            >
              <h3 className="text-white font-semibold">Chat with us</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Widget content here */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### Widget Theme Customizer

```typescript
// components/widget/theme-customizer.tsx
import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { motion } from 'framer-motion'

interface ThemeCustomizerProps {
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    borderRadius: number
    fontFamily: string
  }
  onChange: (theme: any) => void
  preview: React.ReactNode
}

export function ThemeCustomizer({ theme, onChange, preview }: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout'>('colors')

  const fontFamilies = [
    { value: 'inter', label: 'Inter', preview: 'The quick brown fox' },
    { value: 'roboto', label: 'Roboto', preview: 'The quick brown fox' },
    { value: 'poppins', label: 'Poppins', preview: 'The quick brown fox' },
    { value: 'playfair', label: 'Playfair Display', preview: 'The quick brown fox' },
  ]

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {(['colors', 'typography', 'layout'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md capitalize transition-all',
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activeTab === 'colors' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Primary Color
                  </label>
                  <HexColorPicker
                    color={theme.primaryColor}
                    onChange={(color) => onChange({ ...theme, primaryColor: color })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Preset Themes
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                      '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => onChange({ ...theme, primaryColor: color })}
                        className="w-full h-10 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-3">
                {fontFamilies.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onChange({ ...theme, fontFamily: font.value })}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-left transition-all',
                      theme.fontFamily === font.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <p className="font-medium mb-1">{font.label}</p>
                    <p
                      className="text-sm text-gray-600"
                      style={{ fontFamily: font.value }}
                    >
                      {font.preview}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'layout' && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Border Radius: {theme.borderRadius}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={theme.borderRadius}
                  onChange={(e) => onChange({
                    ...theme,
                    borderRadius: Number(e.target.value)
                  })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Square</span>
                  <span>Rounded</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live Preview */}
      <div className="sticky top-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 mb-3">Live Preview</p>
          <div
            className="bg-white dark:bg-gray-900 shadow-xl"
            style={{
              borderRadius: `${theme.borderRadius}px`,
              fontFamily: theme.fontFamily,
            }}
          >
            {preview}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Real-time Data Visualization {#data-visualization}

### Analytics Dashboard Pattern

```typescript
// components/analytics/analytics-dashboard.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DashboardMetric {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  sparkline: number[]
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([
    {
      label: 'Total Views',
      value: 24536,
      change: 12.5,
      trend: 'up',
      sparkline: [20, 22, 25, 28, 24, 30, 32],
    },
    {
      label: 'Engagement Rate',
      value: 68.4,
      change: -2.3,
      trend: 'down',
      sparkline: [70, 68, 69, 67, 68, 66, 68],
    },
    {
      label: 'Conversions',
      value: 1248,
      change: 8.7,
      trend: 'up',
      sparkline: [1100, 1150, 1180, 1200, 1220, 1240, 1248],
    },
    {
      label: 'Avg. Duration',
      value: 4.32,
      change: 0,
      trend: 'neutral',
      sparkline: [4.1, 4.2, 4.3, 4.3, 4.4, 4.3, 4.32],
    },
  ])

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-2xl font-bold mt-1">
                  {metric.label === 'Avg. Duration'
                    ? `${metric.value}m`
                    : metric.label === 'Engagement Rate'
                    ? `${metric.value}%`
                    : metric.value.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                metric.trend === 'up'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : metric.trend === 'down'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              )}>
                {metric.trend === 'up' && '↑'}
                {metric.trend === 'down' && '↓'}
                {metric.change !== 0 ? `${Math.abs(metric.change)}%` : '—'}
              </div>
            </div>

            {/* Sparkline */}
            <ResponsiveContainer width="100%" height={40}>
              <LineChart data={metric.sparkline.map((v, i) => ({ value: v, index: i }))}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={
                    metric.trend === 'up'
                      ? '#10b981'
                      : metric.trend === 'down'
                      ? '#ef4444'
                      : '#6b7280'
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={[
              { date: 'Mon', views: 4000, conversions: 240 },
              { date: 'Tue', views: 3000, conversions: 198 },
              { date: 'Wed', views: 5000, conversions: 380 },
              { date: 'Thu', views: 2780, conversions: 190 },
              { date: 'Fri', views: 4890, conversions: 480 },
              { date: 'Sat', views: 6390, conversions: 680 },
              { date: 'Sun', views: 5490, conversions: 520 },
            ]}
          >
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorConversions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
```

### Real-time Progress Indicators

```typescript
// components/analytics/progress-indicators.tsx
import { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface ProgressIndicatorProps {
  label: string
  value: number
  max: number
  color?: string
  animated?: boolean
  showPercentage?: boolean
}

export function CircularProgress({
  label,
  value,
  max,
  color = '#3b82f6',
  animated = true,
  showPercentage = true,
}: ProgressIndicatorProps) {
  const percentage = (value / max) * 100
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-32 h-32">
      <svg className="transform -rotate-90 w-32 h-32">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        )}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  )
}

export function SegmentedProgress({
  segments,
}: {
  segments: Array<{ label: string; value: number; color: string }>
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <div className="space-y-3">
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.label}
            initial={{ width: 0 }}
            animate={{ width: `${(segment.value / total) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
            style={{ backgroundColor: segment.color }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm">
              {segment.label}: {segment.value} ({Math.round((segment.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Accessibility & Performance {#accessibility}

### Advanced Accessibility Patterns

```typescript
// components/a11y/screen-reader-only.tsx
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only absolute left-[-10000px] w-1 h-1 overflow-hidden">
      {children}
    </span>
  )
}

// components/a11y/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50">
      <a
        href="#main-content"
        className="bg-primary text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="ml-2 bg-primary text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to navigation
      </a>
    </div>
  )
}

// components/a11y/focus-trap.tsx
import { useEffect, useRef } from 'react'

export function FocusTrap({ children, active }: {
  children: React.ReactNode
  active: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [active])

  return <div ref={containerRef}>{children}</div>
}
```

### Performance Optimization Patterns

```typescript
// hooks/use-intersection-observer.ts
import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [options])

  return { targetRef, isIntersecting }
}

// components/performance/lazy-image.tsx
export function LazyImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  })

  const [loaded, setLoaded] = useState(false)

  return (
    <div ref={targetRef as any} className="relative">
      {isIntersecting && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  )
}

// components/performance/virtual-list.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualList({ items }: { items: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {/* Render your item */}
            <div className="p-4 border-b">
              {items[virtualItem.index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Implementation Patterns {#implementation}

### Advanced TypeScript Patterns

```typescript
// Type-safe component props with discriminated unions
type ButtonProps =
  | { variant: 'primary'; icon?: never }
  | { variant: 'icon'; icon: React.ReactNode }
  | { variant: 'link'; href: string }

// Strict event handlers
type StrictEventHandler<T = Element, E = Event> = (
  event: E & { currentTarget: T }
) => void

// Deep partial type for nested updates
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

// Branded types for domain modeling
type UserId = string & { readonly brand: unique symbol }
type PostId = string & { readonly brand: unique symbol }

// Builder pattern for complex components
class ComponentBuilder<T extends Record<string, any>> {
  private config: Partial<T> = {}

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.config[key] = value
    return this
  }

  build(): T {
    return this.config as T
  }
}
```

### Error Boundary Patterns

```typescript
// components/error/error-boundary.tsx
import { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[400px] p-8"
        >
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
            {this.state.error.message}
          </p>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </motion.div>
      )
    }

    return this.props.children
  }
}
```

### Loading State Patterns

```typescript
// components/loading/skeleton.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer',
  {
    variants: {
      variant: {
        text: 'h-4 rounded',
        title: 'h-8 rounded',
        avatar: 'rounded-full',
        image: 'rounded-lg',
        card: 'rounded-xl',
      },
      width: {
        full: 'w-full',
        '3/4': 'w-3/4',
        '1/2': 'w-1/2',
        '1/3': 'w-1/3',
        '1/4': 'w-1/4',
      },
      height: {
        sm: 'h-20',
        md: 'h-32',
        lg: 'h-48',
        xl: 'h-64',
      },
    },
    defaultVariants: {
      variant: 'text',
      width: 'full',
    },
  }
)

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, width, height, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant, width, height }), className)}
      {...props}
    />
  )
}

// Usage: Content placeholder
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" width="1/3" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="3/4" />
        <Skeleton variant="text" width="1/2" />
      </div>
      <Skeleton variant="image" height="lg" />
    </div>
  )
}
```

---

## Quality Standards {#quality}

### Performance Metrics

```typescript
// Monitoring performance
export const performanceMetrics = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint < 2.5s
  FID: 100, // First Input Delay < 100ms
  CLS: 0.1, // Cumulative Layout Shift < 0.1

  // Additional metrics
  TTI: 3500, // Time to Interactive < 3.5s
  FCP: 1800, // First Contentful Paint < 1.8s
  TTFB: 600, // Time to First Byte < 600ms

  // Bundle size targets
  bundleSize: {
    initial: 200, // Initial JS < 200KB
    lazy: 150, // Lazy chunks < 150KB each
    css: 60, // CSS < 60KB
  },
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value)
        }
      }
    })

    observer.observe({
      entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
    })

    return () => observer.disconnect()
  }, [])
}
```

### Testing Standards

```typescript
// Component testing example
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlassCard } from '@/components/ui/glass-card'

describe('GlassCard', () => {
  it('renders with correct variant styles', () => {
    render(
      <GlassCard variant="aurora" data-testid="glass-card">
        Content
      </GlassCard>
    )

    const card = screen.getByTestId('glass-card')
    expect(card).toHaveClass('from-purple-500/10')
  })

  it('handles interactive states correctly', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(
      <GlassCard interactive onClick={handleClick}>
        Click me
      </GlassCard>
    )

    const card = screen.getByText('Click me')
    await user.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports animation when enabled', () => {
    const { container } = render(
      <GlassCard animated interactive>
        Animated content
      </GlassCard>
    )

    const motionDiv = container.querySelector('[style*="transform"]')
    expect(motionDiv).toBeInTheDocument()
  })
})
```

---

## Conclusion

This enhanced v3.0 of the Design Guidelines incorporates all the sophisticated patterns and improvements developed in the Segment Fox application. The key advancements include:

1. **Advanced Component Patterns** - Glassmorphic designs, animated counters, gradient text
2. **Survey-Specific UI** - Matrix questions, ranking with drag-and-drop, progressive forms
3. **AI Integration** - Smart suggestions, expression evaluators, intelligent assistance
4. **Behavioral Features** - Trigger visualization, frequency capping, smart timing
5. **Enhanced Motion** - Spring physics, context-aware animations, gesture interactions
6. **Widget Systems** - Embeddable components, theme customization, cross-origin communication
7. **Real-time Visualization** - Analytics dashboards, progress indicators, live updates
8. **Accessibility & Performance** - WCAG compliance, virtual scrolling, lazy loading

These patterns represent the cutting edge of web application design in 2025, combining visual excellence with technical sophistication to create experiences that are both beautiful and highly functional.

---

**Document Status**: v3.0 - Enhanced Edition  
**Last Updated**: August 2025  
**Next Review**: November 2025

_For implementation examples and live demos, refer to the Segment Fox application._

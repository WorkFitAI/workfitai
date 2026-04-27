# Code Standards & Codebase Structure

**Last Updated**: 2026-04-27
**Version**: 1.1.0
**Project**: WorkfitAI
**Stack**: Next.js 16 + React 19 + TailwindCSS v4 + shadcn/ui

## File Organization

### Directory Structure Conventions

**App Router** (`app/`):
- Root layout: `app/layout.tsx`
- Root styles: `app/globals.css`
- Route groups: `app/(candidate)/`, `app/(control)/`, `app/(auth)/`
- Pages: `app/[group]/page.tsx`, `app/[group]/[route]/page.tsx`

**Components** (`components/`):
- shadcn/ui auto-generated: `components/ui/` (auto-managed, do not edit)
- Feature-specific: `components/{feature}/` (e.g., `components/my-cvs/`)
- Layout: `components/layout/{portal}/` (e.g., `components/layout/candidate/`)
- Domain-specific: `components/{feature}-form.tsx`, `components/{feature}-card.tsx`

**Utilities & Services** (`lib/`):
- Core utilities: `lib/utils.ts` (cn() function)
- API clients: `lib/api-client.ts` (HTTP client with auth)
- Service layer: `lib/{feature}/` (business logic, e.g., `lib/cv/cv-service.ts`)
- Shared utilities: `lib/format.ts`, `lib/navigation.ts`
- Auth: `lib/auth/` (token store, device fingerprint, session, auth service)
- Schemas: `lib/schemas/` (Zod validation schemas)

**Hooks** (`hooks/`):
- Custom React hooks: `hooks/use{Feature}.ts`
- Data fetching hooks: `hooks/useCVs.ts` (wraps service layer + useState)
- Never place hooks in `lib/hooks/` — use root `hooks/` directory

**Types** (`types/`):
- Domain models: `types/{feature}.ts` (e.g., `types/cv.ts`)
- API types: `types/response.ts`, `types/auth.ts`
- Index for re-exports: `types/index.ts`

**Public Assets** (`public/`):
- Static images
- SVG files
- Fonts (if not using Google Fonts)

### File Naming

**React Components**: PascalCase
```
MyComponent.tsx
UserProfile.tsx
JobCard.tsx
```

**Utilities/Libraries**: camelCase
```
utils.ts
api.ts
helpers.ts
```

**Hooks**: camelCase with `use` prefix
```
useDebounce.ts
useAuth.ts
useFetch.ts
```

**Styles**: Keep in same file as component (TailwindCSS classes)

**Static Assets**: kebab-case
```
banner-hero.png
icon-arrow-right.svg
logo-primary.svg
```

**Configuration Files**: lowercase with dots
```
next.config.ts
tsconfig.json
postcss.config.js
components.json
```

## Naming Conventions

### TypeScript/JavaScript

**Variables**: camelCase
```typescript
const userName = 'John'
const isAuthenticated = true
const jobListings = []
const MAX_RETRIES = 3  // Constants in UPPER_SNAKE_CASE
```

**Functions**: camelCase
```typescript
function formatDate() {}
const validateEmail = () => {}
async function fetchData() {}
```

**Classes/Interfaces/Types**: PascalCase
```typescript
class UserService {}
interface ApiResponse<T> {}
type ComponentProps = {
  title: string
  isActive?: boolean
}
```

**Constants**: UPPER_SNAKE_CASE
```typescript
const AUTH_TOKEN_KEY = 'workfitai_auth'
const DEFAULT_PAGE_SIZE = 20
const MAX_FILE_SIZE_MB = 10
```

**React Components**: PascalCase (same as classes)
```typescript
function MyComponent() {}
export const HomePage = () => {}
```

**Props Interfaces**: ComponentNameProps
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function Button(props: ButtonProps) {}
```

## Code Quality Standards

### TypeScript

**Strict Mode**: Always enabled (tsconfig.json)
```typescript
// Good - explicit types
function add(a: number, b: number): number {
  return a + b
}

// Avoid - implicit any
function add(a, b) {
  return a + b
}
```

**Type Definitions**:
```typescript
// Good - use interfaces for component props
interface CardProps {
  title: string
  description?: string
  onClick?: () => void
}

// Avoid - loosely typed objects
const CardProps = {}
```

**Error Handling**:
```typescript
// Good - specific error handling
try {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return await response.json()
} catch (error) {
  console.error('Fetch failed:', error)
  throw error
}

// Avoid - silent failures
try {
  return await fetch(url).then(r => r.json())
} catch {
  // silent
}
```

### React Components

**Functional Components Only**:
```typescript
// Good - functional component
export function MyComponent() {
  return <div>Hello</div>
}

// Avoid - class components (unless absolutely necessary)
class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>
  }
}
```

**Props Pattern**:
```typescript
// Good
interface MyComponentProps {
  title: string
  onClose?: () => void
}

export function MyComponent({ title, onClose }: MyComponentProps) {
  return <div>{title}</div>
}

// Avoid
export function MyComponent(props) {
  return <div>{props.title}</div>
}
```

**Hooks Pattern**:
```typescript
// Good - separate concerns
function useFormState(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  return { value, setValue }
}

export function MyForm() {
  const { value, setValue } = useFormState('')
  return <input value={value} onChange={e => setValue(e.target.value)} />
}

// Avoid - logic in component
export function MyForm() {
  const [value, setValue] = useState('')
  // ... form logic in component
}
```

## Styling Standards

### TailwindCSS v4 Only

Use TailwindCSS utility classes for ALL styling. Never add custom CSS unless absolutely necessary.

**Good Patterns**:
```typescript
// Good - semantic color tokens
<div className="bg-primary text-primary-foreground p-4 rounded-md">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// Good - responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Good - dark mode via CSS variables
<div className="bg-background text-foreground">
  {/* Automatically adapts to dark mode */}
</div>

// Good - conditional classes with cn()
<button className={cn(
  "px-4 py-2 rounded-md transition-colors",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</button>
```

**Avoid**:
```typescript
// Avoid - arbitrary color values
className="bg-[#3b82f6] text-[#1e293b]"

// Avoid - inline styles
style={{ backgroundColor: 'blue', padding: '16px' }}

// Avoid - custom CSS for common patterns
// Add to globals.css instead of individual components
const classes = css`
  padding: 16px;
  background-color: blue;
`

// Avoid - Bootstrap or other CSS frameworks
className="btn btn-primary p-4"
```

### Design Tokens

Always prefer semantic tokens over arbitrary values:

```typescript
// Good - semantic tokens from globals.css
const colors = {
  background: 'bg-background',
  foreground: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
}

// Color tokens usage
<Card className="bg-card text-card-foreground border border-border">
  <Button variant="primary">Action</Button>
</Card>

// Radius tokens
<div className="rounded-sm">sm corner</div>      {/* --radius - 4px */}
<div className="rounded-md">md corner</div>      {/* --radius - 2px */}
<div className="rounded-lg">lg corner</div>      {/* --radius base */}
<div className="rounded-xl">xl corner</div>      {/* --radius + 4px */}
<div className="rounded-2xl">2xl corner</div>    {/* --radius + 8px */}
<div className="rounded-3xl">3xl corner</div>    {/* --radius + 12px */}
<div className="rounded-4xl">4xl corner</div>    {/* --radius + 16px */}

// Spacing scale (TailwindCSS standard)
<div className="gap-1 p-2 m-3">Spacing</div>
```

### Component Styling with shadcn/ui

When using shadcn/ui components, always use the `cn()` utility to merge classes:

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MyButtonProps {
  variant?: 'default' | 'custom'
  className?: string
}

export function MyButton({ variant, className }: MyButtonProps) {
  return (
    <Button
      className={cn(
        variant === 'custom' && 'bg-accent text-accent-foreground hover:bg-accent/90',
        className
      )}
    >
      Click me
    </Button>
  )
}
```

## Component Standards

### shadcn/ui Components

**Adding Components**:
```bash
# Install component
npx shadcn add button

# Install multiple components
npx shadcn add card dialog form
```

**Using Components**:
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => console.log('clicked')}>
          Action
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Component Variants** (CVA - class-variance-authority):
```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  )
}
```

### Custom Components

**File Structure**:
```typescript
// File: components/my-component.tsx

import { cn } from '@/lib/utils'

interface MyComponentProps {
  title: string
  description?: string
  className?: string
}

export function MyComponent({
  title,
  description,
  className,
}: MyComponentProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
```

**Component Best Practices**:
- Keep components under 200 lines of code
- Extract logic into custom hooks
- Use proper TypeScript types for all props
- Always apply the `cn()` utility for class merging
- Prefer composition over inheritance

## Import/Export Conventions

**Named Exports**:
```typescript
// Good - named export
export function MyComponent() {
  return <div>Hello</div>
}

// Also good - export at end
function MyComponent() {
  return <div>Hello</div>
}
export { MyComponent }

// Usage
import { MyComponent } from '@/components/my-component'
```

**Default Exports** (rare):
```typescript
// Use default export only for page components
export default function HomePage() {
  return <div>Home</div>
}

// Usage
import HomePage from '@/app/page'
```

**Path Aliases**:
```typescript
// Use @ alias for all imports
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { MyType } from '@/types'

// Avoid relative paths
import { cn } from '../../../lib/utils'  // Avoid!
```

## Performance Optimizations

### Code Splitting

Let Next.js handle automatic code splitting via dynamic imports:

```typescript
// Good - automatic code splitting
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('@/components/large-component'))

export function Dashboard() {
  return <DynamicComponent />
}

// For loading states
const DynamicComponent = dynamic(
  () => import('@/components/large-component'),
  { loading: () => <p>Loading...</p> }
)
```

### React.memo (sparingly)

```typescript
// Only use if component re-renders unnecessarily
import { memo } from 'react'

const ExpensiveComponent = memo(function ExpensiveComponent(props) {
  return <div>{/* expensive rendering */}</div>
})

export default ExpensiveComponent
```

### useCallback and useMemo (sparingly)

```typescript
import { useCallback, useMemo } from 'react'

export function MyComponent() {
  // Only use if handler is passed as dependency
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])

  // Only use for expensive computations
  const memoizedValue = useMemo(() => {
    return expensiveComputation(data)
  }, [data])

  return <button onClick={handleClick}>{memoizedValue}</button>
}
```

## Error Handling

**Try/Catch Pattern**:
```typescript
export async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error  // Re-throw or handle appropriately
  }
}
```

**Error Components**:
```typescript
// Error boundary for React errors
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <div>Something went wrong. Please try again.</div>
  }

  return <>{children}</>
}
```

## Testing

**Testing Approach** (when tests are added):
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Test behavior, not implementation
- Keep tests close to components

```typescript
// Example test (when testing is set up)
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

## Linting & Formatting

**ESLint Configuration**:
- Uses `eslint-config-next` (built-in)
- Enforces Next.js best practices
- TypeScript strict mode enabled

**Run Linting**:
```bash
npm run lint
```

**No External Formatters**:
- Do not use Prettier (handled by ESLint)
- Follow ESLint rules as the source of truth

## Common Patterns

### Form Handling
```typescript
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // API call
      await loginUser(email, password)
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-4 py-2 border border-border rounded-md"
      />
      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        className="w-full px-4 py-2 border border-border rounded-md"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90"
      >
        Sign In
      </button>
    </form>
  )
}
```

### Service Layer Pattern

**Why**: Separation of concerns — business logic (API calls, data transformation) lives in services, components only handle UI.

**Service Example** (`lib/cv/cv-service.ts`):
```typescript
import { apiClient } from "@/lib/api-client"
import type { CVMetadata, CVListResponse } from "@/types/cv"

export const cvService = {
  async listMyCVs(username: string, page = 0, size = 10) {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    return apiClient.get<ApiResponse<CVListResponse>>(`/cv/candidate/${username}?${params}`)
  },

  async uploadCV(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return apiClient.upload<ApiResponse<CVUploadResponse>>("/cv/upload", formData)
  },

  async deleteCV(cvId: string) {
    return apiClient.delete<void>(`/cv/candidate/${cvId}`)
  },
}
```

**Hook Using Service** (`hooks/useCVs.ts`):
```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import { CVMetadata } from "@/types/cv"
import { cvService } from "@/lib/cv/cv-service"

export const useCVs = (page: number) => {
  const [cvs, setCvs] = useState<CVMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCVs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await cvService.listMyCVs(username, page - 1, 10)
      setCvs(res.data?.cvs ?? [])
    } catch (err) {
      setError("Failed to load CVs")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchCVs()
  }, [fetchCVs])

  return { cvs, loading, error, refresh: fetchCVs }
}
```

**Component Using Hook** (`components/my-cvs/my-cvs-page-client.tsx`):
```typescript
"use client"

import { useCVs } from "@/hooks/useCVs"
import { CVList } from "./cv-list"
import { CVUploadDialog } from "./cv-upload-dialog"

export function MysCVsPageClient() {
  const [page, setPage] = useState(1)
  const { cvs, loading, error, refresh } = useCVs(page)

  return (
    <div className="space-y-6">
      <CVUploadDialog onSuccess={refresh} />
      {error && <p className="text-destructive">{error}</p>}
      <CVList cvs={cvs} loading={loading} onRefresh={refresh} />
    </div>
  )
}
```

### Data Fetching with Custom Hooks

Use custom hooks to wrap service calls and manage loading/error states:

```typescript
import { useEffect, useState } from 'react'

export function DataList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to fetch')
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError('Error loading data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>

  return (
    <ul>
      {data.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

## Summary

- **TypeScript**: Strict mode, explicit types always
- **React**: Functional components, hooks, props interfaces
- **Styling**: TailwindCSS v4 utilities only, semantic tokens
- **Components**: shadcn/ui + custom components with cn()
- **Organization**: Feature-based, file-based imports with @ alias
- **Performance**: Let Next.js handle optimization, use React.memo sparingly
- **Quality**: ESLint, TypeScript strict mode, proper error handling

---

**Generated**: 2026-02-14
**Maintained by**: WorkfitAI Development Team

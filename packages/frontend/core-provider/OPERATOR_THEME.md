# Operator Theme System

Multi-tenant theming system for white-label gaming platform. Allows each operator to customize colors, branding, and styling.

## 🎨 Features

- **Dynamic CSS Variables**: Theme changes at runtime without recompilation
- **Tailwind CSS v4 Integration**: Use operator colors directly in Tailwind classes
- **Type-Safe**: Full TypeScript support
- **Fallback Support**: Graceful degradation to default theme
- **Logo & Branding**: Custom logos, favicons, and brand names
- **Custom Fonts**: Operator-specific typography
- **Custom CSS**: Optional custom stylesheets per operator

## 📦 Installation

The operator theme system is included in `@ninenine/core-provider` package.

```bash
# Already installed in your monorepo
pnpm install
```

## 🚀 Usage

### 1. Wrap your app with OperatorThemeProvider

```tsx
// apps/frontend/lotto80-client/src/app/app.tsx
import { OperatorThemeProvider, getOperatorId } from '@ninenine/core-provider';

export function App() {
  const operatorId = getOperatorId(); // Auto-detect from subdomain/URL/env

  return (
    <OperatorThemeProvider
      operatorId={operatorId}
      apiBaseUrl="http://localhost:3002/api/v1"
      onThemeLoaded={(theme) => console.log('Theme loaded:', theme)}
      onThemeError={(error) => console.error('Theme error:', error)}
    >
      {/* Your app components */}
    </OperatorThemeProvider>
  );
}
```

### 2. Use operator colors in components

```tsx
// Method 1: Tailwind classes (Recommended)
<div className="bg-operator-primary text-white">
  <h1 className="text-operator-accent">Welcome</h1>
</div>;

// Method 2: Access theme via hook
import { useOperatorTheme } from '@ninenine/core-provider';

function MyComponent() {
  const { theme, loading } = useOperatorTheme();

  return (
    <div style={{ backgroundColor: theme?.colors.primary }}>
      {theme?.brandName}
    </div>
  );
}
```

### 3. Display operator logo

```tsx
import { useOperatorTheme } from '@ninenine/core-provider';

function Header() {
  const { theme } = useOperatorTheme();

  return (
    <header>
      {theme?.logo?.url && <img src={theme.logo.url} alt={theme.brandName} />}
    </header>
  );
}
```

## 🎨 Available Tailwind Classes

### Colors

- `text-operator-primary` - Primary brand color
- `text-operator-secondary` - Secondary brand color
- `text-operator-accent` - Accent/highlight color
- `text-operator-background` - Background color
- `text-operator-surface` - Card/surface color
- `text-operator-text` - Text color
- `text-operator-border` - Border color

### Backgrounds

- `bg-operator-primary`
- `bg-operator-secondary`
- `bg-operator-accent`
- `bg-operator-surface`
- etc...

### Borders

- `border-operator-primary`
- `border-operator-border`
- etc...

All classes support Tailwind modifiers: `hover:`, `focus:`, `active:`, `dark:`, etc.

## 🔧 Operator ID Detection

The system automatically detects operator ID from multiple sources (in order):

1. **Subdomain**: `operator1.yourgame.com` → `operator1`
2. **URL Parameter**: `?operator=operator1` → `operator1`
3. **Environment Variable**: `VITE_OPERATOR_ID=operator1` → `operator1`

```tsx
import { getOperatorId } from '@ninenine/core-provider';

const operatorId = getOperatorId();
// Returns: 'operator1' | undefined
```

## 📊 Backend API Structure

Your `game-provider-svc` should implement this endpoint:

```
GET /api/v1/operators/:operatorId/theme
```

**Response:**

```json
{
  "operatorId": "operator-123",
  "operatorName": "Lucky Casino",
  "theme": {
    "colors": {
      "primary": "oklch(0.646 0.222 41.116)",
      "secondary": "oklch(0.6 0.118 184.704)",
      "accent": "oklch(0.828 0.189 84.429)",
      "background": "oklch(1 0 0)",
      "surface": "oklch(0.985 0 0)",
      "text": "oklch(0.145 0 0)",
      "border": "oklch(0.922 0 0)"
    },
    "logo": {
      "url": "https://cdn.example.com/operators/operator-123/logo.png",
      "favicon": "https://cdn.example.com/operators/operator-123/favicon.ico"
    },
    "fonts": {
      "heading": "Poppins",
      "body": "Inter"
    },
    "brandName": "Lucky Casino Lotto",
    "customCss": "https://cdn.example.com/operators/operator-123/custom.css"
  }
}
```

## 🎯 Testing Different Operators

```bash
# Test with operator 1
http://localhost:4200/?operator=operator1

# Test with operator 2
http://localhost:4200/?operator=operator2

# Test default theme
http://localhost:4200

# Test with subdomain (requires DNS/hosts setup)
http://operator1.localhost:4200
```

## 💾 Database Schema Example

```prisma
model Operator {
  id           String   @id @default(cuid())
  name         String
  domain       String?  @unique

  // Theme configuration (JSON)
  theme        Json?
  logoUrl      String?
  faviconUrl   String?
  customCss    String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## 🔥 Examples

See `src/components/features/operator-theme-examples.tsx` for comprehensive examples.

## 📝 TypeScript Types

```typescript
interface OperatorThemeConfig {
  operatorId: string;
  operatorName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  logo?: {
    url: string;
    favicon?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  brandName?: string;
  customCss?: string;
}
```

## 🎨 Color Format

Use **oklch** format for colors (Tailwind v4 default):

- `oklch(0.646 0.222 41.116)` - Orange
- `oklch(0.488 0.243 264.376)` - Blue
- `oklch(1 0 0)` - White
- `oklch(0.145 0 0)` - Black

Online converter: https://oklch.com

## 🚨 Troubleshooting

### Theme not loading?

1. Check browser console for API errors
2. Verify `apiBaseUrl` is correct
3. Ensure backend endpoint returns correct JSON structure
4. Check `operatorId` is being detected correctly

### Colors not applying?

1. Verify `globals.css` includes operator color variables
2. Check if component uses `text-operator-*` or `bg-operator-*` classes
3. Inspect element to see if CSS variables are set

### Logo not showing?

1. Check `theme?.logo?.url` is valid
2. Verify CORS settings if logo is on different domain
3. Check image URL is accessible

## 📚 Related Files

- `packages/frontend/core-provider/src/providers/theme-provider.tsx` - Main provider
- `packages/frontend/core-provider/src/hooks/use-operator-theme.ts` - React hook
- `packages/frontend/core-provider/src/types/theme.ts` - TypeScript types
- `packages/frontend/core-provider/src/utils/operator-theme.ts` - Utility functions
- `packages/frontend/ui/src/globals.css` - CSS variables and Tailwind config
- `apps/frontend/lotto80-client/src/app/app.tsx` - Usage example

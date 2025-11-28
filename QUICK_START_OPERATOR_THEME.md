# 🚀 Operator Theme Quick Start Guide

## ✅ Setup Complete!

The operator theme system has been integrated into your application. Here's what was done:

### 📦 Files Created/Modified

1. **Core Provider Package** (`packages/frontend/core-provider/`)

   - ✅ `src/types/theme.ts` - TypeScript types
   - ✅ `src/contexts/operator-theme-context.tsx` - React context
   - ✅ `src/hooks/use-operator-theme.ts` - React hook
   - ✅ `src/providers/theme-provider.tsx` - Theme provider component
   - ✅ `src/utils/operator-theme.ts` - Utility functions
   - ✅ `src/index.ts` - Updated exports

2. **UI Package** (`packages/frontend/ui/`)

   - ✅ `src/globals.css` - Added operator color variables to @theme

3. **Lotto80 Client** (`apps/frontend/lotto80-client/`)
   - ✅ `src/app/app.tsx` - Integrated OperatorThemeProvider
   - ✅ `src/components/features/game-header.tsx` - Example header component
   - ✅ `src/components/features/operator-theme-examples.tsx` - Usage examples

---

## 🎯 How to Use Now

### 1. Test with Different Operators

```bash
# Terminal 1: Start your backend
cd apps/backend/game-provider-svc
pnpm run start:dev

# Terminal 2: Start frontend
cd apps/frontend/lotto80-client
pnpm run dev
```

Then open:

- Default: http://localhost:4200
- Operator 1: http://localhost:4200/?operator=operator1
- Operator 2: http://localhost:4200/?operator=operator2

### 2. Update Your Components

Simply add operator color classes to your existing components:

```tsx
// Before
<div className="bg-blue-500 text-white">
  Click me
</div>

// After - uses operator's primary color
<div className="bg-operator-primary text-white">
  Click me
</div>
```

### 3. Add Operator Logo to Header

Add the GameHeader component to your MainScreen:

```tsx
import GameHeader from '../components/features/game-header';

export default function MainScreen() {
  return (
    <div>
      <GameHeader /> {/* Add this */}
      <GamePlay />
    </div>
  );
}
```

---

## 🔧 Backend Setup Required

You need to implement the theme API endpoint in your `game-provider-svc`:

```typescript
// apps/backend/game-provider-svc/src/controllers/operator.controller.ts

@Get(':operatorId/theme')
async getOperatorTheme(@Param('operatorId') operatorId: string) {
  // Mock response for testing
  return {
    operatorId,
    operatorName: 'Test Casino',
    theme: {
      colors: {
        primary: 'oklch(0.646 0.222 41.116)',      // Orange
        secondary: 'oklch(0.6 0.118 184.704)',     // Teal
        accent: 'oklch(0.828 0.189 84.429)',       // Yellow
        background: 'oklch(1 0 0)',                 // White
        surface: 'oklch(0.985 0 0)',               // Off-white
        text: 'oklch(0.145 0 0)',                  // Dark gray
        border: 'oklch(0.922 0 0)',                // Light gray
      },
      logo: {
        url: 'https://via.placeholder.com/150x50?text=Casino+Logo',
        favicon: 'https://via.placeholder.com/32x32?text=C',
      },
      brandName: 'Test Casino Lotto 80',
    },
  };
}
```

---

## 📝 Update Your Components

Here are the components you can update to use operator theming:

### 1. Countdown Timer (`countdown-timer.tsx`)

```tsx
// Change line ~76
<motion.circle
  className={cn(
    isUrgent ? 'text-red-500' : 'text-operator-primary' // ← Use operator color
  )}
/>
```

### 2. Range Panel (`range-panel.tsx`)

```tsx
// Update panel styling
<div className="bg-operator-surface border-operator-border hover:bg-operator-accent">
  <span className="text-operator-primary">{range.key}</span>
</div>
```

### 3. Over/Under Panel (`over-under-panel.tsx`)

```tsx
<button className="bg-operator-primary hover:bg-operator-accent text-white">
  OVER
</button>
```

---

## 🎨 Available Color Classes

Replace your hardcoded colors with these operator theme classes:

| Old Class         | New Class                 | Usage               |
| ----------------- | ------------------------- | ------------------- |
| `text-blue-500`   | `text-operator-primary`   | Primary brand color |
| `bg-blue-500`     | `bg-operator-primary`     | Primary background  |
| `text-purple-500` | `text-operator-secondary` | Secondary color     |
| `text-yellow-500` | `text-operator-accent`    | Accent/highlight    |
| `bg-white`        | `bg-operator-background`  | Page background     |
| `bg-gray-100`     | `bg-operator-surface`     | Card/panel surface  |
| `text-gray-900`   | `text-operator-text`      | Body text           |
| `border-gray-300` | `border-operator-border`  | Borders             |

---

## 🧪 Testing Scenarios

### Scenario 1: Casino A (Bright Theme)

```bash
# URL: http://localhost:4200/?operator=casino-a

# Expected API Response:
{
  "colors": {
    "primary": "oklch(0.646 0.222 41.116)",    // Bright orange
    "accent": "oklch(0.828 0.189 84.429)",     // Bright yellow
    "background": "oklch(1 0 0)"                // White
  }
}
```

### Scenario 2: Casino B (Dark Theme)

```bash
# URL: http://localhost:4200/?operator=casino-b

# Expected API Response:
{
  "colors": {
    "primary": "oklch(0.488 0.243 264.376)",   // Purple
    "background": "oklch(0.145 0 0)",           // Dark
    "text": "oklch(0.985 0 0)"                  // Light text
  }
}
```

---

## 🎓 Next Steps

1. ✅ **Test the integration**: Visit with `?operator=test` parameter
2. 📝 **Implement backend API**: Add the `/operators/:id/theme` endpoint
3. 🎨 **Update components**: Replace hardcoded colors with operator classes
4. 🏗️ **Create operator dashboard**: Build admin UI for operators to customize themes
5. 📊 **Add database**: Store operator themes in your database

---

## 📚 Documentation

For full documentation, see:

- `OPERATOR_THEME.md` - Complete documentation
- `operator-theme-examples.tsx` - Code examples

## 🆘 Need Help?

Check the browser console for:

- `Operator theme loaded: {...}` - Theme loaded successfully
- `Failed to load operator theme: ...` - API error

Common issues:

1. **Theme not loading**: Check API endpoint URL and CORS settings
2. **Colors not changing**: Verify you're using `*-operator-*` classes
3. **Logo not showing**: Check image URL and CORS

---

## ✨ You're All Set!

The operator theme system is ready to use. Start testing with different operator IDs and customize your components! 🎉

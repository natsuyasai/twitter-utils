# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 必ず日本語で回答してください。
- ユーザーからの指示や仕様に疑問などがあれば作業を中断し、質問すること。
- Robert C. Martinが提唱する原則に従ってコードを作成してください。
- TDDおよびテスト駆動開発で実装する際は、すべてt-wadaの推奨する進め方に従ってください。
- リファクタリングはMartin Fowloerが推奨する進め方に従ってください。
- セキュリティルールに従うこと。
- 実装完了時に必ず「npm run check-types」と「npm run lint」を実行し、エラーや警告がない状態としてください。
- エラーや警告が発生する場合は、必ず修正してください。



## Project Overview

This is a Chrome extension for Twitter/X (x.com) that provides utility features like auto-reload, image size changing, and area removal. Built with React 19, TypeScript, Vite, and the @crxjs/vite-plugin for Chrome extension development.

## Commands

### Development
- `npm run dev` - Start Vite dev server with hot reload
- `npm run build` - Build the extension (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview the production build

### Storybook
- `npm run storybook` - Start Storybook dev server on port 6006
- `npm run build-storybook` - Build Storybook for production

### Testing
Tests are configured with Vitest and run in two modes:
- Unit tests: `vitest --project unit`
- Storybook tests: `vitest --project storybook` (runs in browser with Playwright)

Test files should be named `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` and placed in `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`.

## Architecture

### Extension Structure

The extension uses manifest v3 and consists of:
- **Content Script**: Injected into https://x.com/home (entry: `src/content-scripts/index.tsx`)
- **Background Service Worker**: `src/background/index.ts`
- **Settings UI**: `src/setting-ui/` (separate React app for extension settings)

### Content Scripts Architecture

Content scripts are organized by feature and initialized in `src/content-scripts/index.tsx`:

1. **React-based components** are rendered into a div injected at the start of document.body
2. **Vanilla JS utilities** are initialized directly (ImageSizeChanger, AreaRemove)

Key content script features:
- `auto-reload/` - Auto-refresh Twitter tabs with customizable intervals
- `image-size/` - Image size manipulation utilities
- `area-remove/` - DOM element removal utilities
- `utlis/tabs.ts` - Shared utilities for detecting active Twitter tabs

### Auto-Reload Component Structure

The auto-reload feature is refactored into a modular architecture:

**Files:**
- `AutoReload.tsx` - Main component (lightweight, orchestrates hooks)
- `constants.ts` - Interval options and defaults
- `storage.ts` - localStorage utilities for position and interval persistence
- `utils.ts` - Helper functions (isScrolling, isExecutableURL, reselectTab)

**Custom Hooks:**
- `hooks/useDraggable.ts` - Drag & drop positioning with localStorage
- `hooks/useAutoReloadInterval.ts` - Interval management and restoration
- `hooks/useAutoReloadState.ts` - State management for scroll/URL detection
- `hooks/useTabSwitchDetection.ts` - Detects Twitter tab switches

**Key Patterns:**
- Tab-specific settings: Interval preferences are saved per Twitter tab (e.g., "おすすめ", "フォロー中") using `getActiveTabName()`
- Position persistence: Component position is saved globally in localStorage
- Restoration triggers: Settings restore on component mount, tab switch, and page navigation

### Styling

- Uses SCSS modules (`.module.scss`)
- Configured with Sass support via `sass` package
- Components import styles as: `import styles from './Component.module.scss'`

### Build Configuration

- **Vite config** (`vite.config.ts`):
  - @crxjs/vite-plugin for Chrome extension bundling
  - React plugin with babel-plugin-react-compiler for optimization
  - Vitest with dual test projects (unit + storybook)
  - `define: { global: "window" }` for compatibility

- **TypeScript**:
  - Strict mode enabled
  - Separate configs for app and node environments
  - Type definitions from `@types/chrome` for extension APIs

### Storybook Integration

- Component stories in `*.stories.tsx` files
- Configured with accessibility addon (`@storybook/addon-a11y`)
- Test integration with `@storybook/addon-vitest`
- Browser testing via Playwright in Chromium

## Important Conventions

### Content Script Development

1. **Browser Environment**: Content scripts run in browser context - no need for `typeof window === 'undefined'` checks
2. **localStorage Keys**: Use tab-specific keys when settings should differ per Twitter tab. Pattern: `${KEY}-${tabName}`
3. **React Rendering**: Content script React components are rendered into a div injected at document.body start
4. **Event Listeners**: Always clean up listeners in useEffect return functions

### Component Organization

- Extract logic into custom hooks when components exceed ~100 lines
- Separate constants, utilities, and storage logic into dedicated files
- Use TypeScript interfaces for props and state types
- Keep component files focused on rendering logic only

### Testing

- Unit tests run in jsdom environment with globals enabled
- Storybook tests run in actual browser (Chromium) via Playwright
- Setup file for Storybook tests: `.storybook/vitest.setup.ts`

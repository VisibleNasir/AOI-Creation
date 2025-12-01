# 🚀 Quick Setup Guide

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git**

## Step-by-Step Setup

### 1. Create Project Structure

```bash
# Create new Vite project with React + TypeScript
npm create vite@latest aoi-map-app -- --template react-ts
cd aoi-map-app
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install leaflet react-leaflet lucide-react

# Development dependencies
npm install -D @types/leaflet tailwindcss postcss autoprefixer
npm install -D playwright @playwright/test
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-plugin-react eslint-plugin-react-hooks

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 3. Configure Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Add Leaflet CSS to index.html

**index.html:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AOI Creation Map</title>
    
    <!-- Leaflet CSS -->
    <link 
      rel="stylesheet" 
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      crossorigin=""
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 5. Copy the Main Application Code

Replace **src/App.tsx** with the provided code from the artifact.

### 6. Initialize Playwright

```bash
# Install Playwright browsers
npx playwright install

# Create playwright.config.ts (copy from artifact)
```

### 7. Create Test Files

Create `tests/` directory and add test files:
- `tests/aoi-creation.spec.ts`
- `tests/search.spec.ts`
- `tests/drawing-tool.spec.ts`
- `tests/upload.spec.ts`
- `tests/accessibility.spec.ts`

### 8. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 9. Run the Application

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### 10. Run Tests

```bash
# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

## 📁 Final Project Structure

```
aoi-map-app/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx              # Main application (your code here)
│   ├── main.tsx
│   ├── index.css
│   ├── utils/
│   │   └── performance.ts   # Performance utilities
│   └── vite-env.d.ts
├── tests/
│   ├── aoi-creation.spec.ts
│   ├── search.spec.ts
│   ├── drawing-tool.spec.ts
│   ├── upload.spec.ts
│   └── accessibility.spec.ts
├── .env.example
├── .eslintrc.json
├── .gitignore
├── .prettierrc.json
├── index.html
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🔧 Troubleshooting

### Issue: Leaflet tiles not loading

**Solution:** Check CORS settings and ensure WMS URL is correct:
```typescript
<WMSTileLayer
  url="https://www.wms.nrw.de/geobasis/wms_nw_dop"
  layers="nw_dop_rgb"
  format="image/jpeg"
/>
```

### Issue: TypeScript errors with Leaflet

**Solution:** Install type definitions:
```bash
npm install -D @types/leaflet
```

### Issue: Map not displaying

**Solution:** Ensure Leaflet CSS is loaded and container has height:
```css
.leaflet-container {
  height: 100%;
  width: 100%;
}
```

### Issue: Playwright tests timing out

**Solution:** Increase timeout in playwright.config.ts:
```typescript
use: {
  baseURL: 'http://localhost:5173',
  timeout: 30000, // 30 seconds
}
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 🎯 Next Steps

1. ✅ Application runs successfully
2. ✅ Tests pass
3. ✅ Code is linted and formatted
4. ✅ Ready to commit to Git

```bash
# Initialize Git repository
git init
git add .
git commit -m "Initial commit: AOI Creation Map Application"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/aoi-map-app.git
git branch -M main
git push -u origin main
```

## 📚 Additional Resources

- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [Leaflet API Reference](https://leafletjs.com/reference.html)
- [Playwright Documentation](https://playwright.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 💡 Tips

- Use `npm run dev` for hot-reload during development
- Run `npm run lint:fix` to auto-fix linting issues
- Run `npm run format` to format all files
- Use `npm run test:e2e:ui` for interactive test debugging
- Check `npm run type-check` before committing

## 🆘 Need Help?

If you encounter any issues:
1. Check the console for errors
2. Verify all dependencies are installed (`npm install`)
3. Clear node_modules and reinstall (`rm -rf node_modules && npm install`)
4. Check that you're using Node 20.x or higher (`node --version`)

---

**Ready to start!** Run `npm run dev` and open http://localhost:5173 🎉
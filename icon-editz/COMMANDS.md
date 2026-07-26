# Icon Editz Installation Commands

Complete reference of all commands needed to set up and run Icon Editz.

## Initial Setup

### Step 1: Navigate to Project

```bash
cd C:\Users\Gnaneshwar\Downloads\icon-editz
```

### Step 2: Install Dependencies

```bash
npm install
```

**What this does:**
- Downloads all packages from package.json
- Creates node_modules folder
- Installs React, Vite, Tailwind, Framer Motion, Three.js, etc.
- Takes 2-5 minutes depending on internet speed

**If you have issues:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use yarn
yarn install
```

### Step 3: Verify Installation

```bash
npm --version
node --version
```

You should see version numbers. Node should be 16.0.0 or higher.

---

## Development

### Start Development Server

```bash
npm run dev
```

**What this does:**
- Starts Vite dev server
- Opens browser to http://localhost:5173
- Watches for file changes
- Hot module replacement (instant updates)

**Expected output:**
```
VITE v5.0.8  ready in 400 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

**Keep this running** while you develop!

### Stop Development Server

```bash
# In terminal, press:
Ctrl + C
```

---

## Building & Deployment

### Build for Production

```bash
npm run build
```

**What this does:**
- Optimizes and bundles code
- Minifies CSS and JavaScript
- Creates dist/ folder with production files
- Ready to upload to hosting

**Expected output:**
```
vite v5.0.8 building for production...
✓ X modules transformed
dist/index.html          X.XX kB
dist/assets/index.xxxxx.js    XXX.XX kB
```

### Preview Production Build

```bash
npm run preview
```

**What this does:**
- Shows you what production site looks like
- Tests optimizations
- Runs on http://localhost:4173

### Lint Code (Optional)

```bash
npm run lint
```

**What this does:**
- Checks code for errors and warnings
- Helps maintain code quality

---

## Package Management

### Add New Package

```bash
npm install package-name
```

**Example: Add EmailJS**
```bash
npm install @emailjs/browser
```

### Update All Packages

```bash
npm update
```

### Check Outdated Packages

```bash
npm outdated
```

### Remove Package

```bash
npm uninstall package-name
```

---

## Environment Setup

### Create Environment File

```bash
# Copy example to create your env file
cp .env.example .env.local
```

Or manually create `.env.local` in root with:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## Troubleshooting Commands

### Clear Everything and Reinstall

```bash
# Remove dependencies
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install
```

### Clear Vite Cache

```bash
# Delete cache
rm -rf node_modules/.vite

# Start fresh
npm run dev
```

### Check for Issues

```bash
# Verify Node.js
node --version          # Should be 16+

# Verify npm
npm --version           # Should be 7+

# List installed packages
npm list
```

### Port Already in Use

```bash
# Windows: Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace PID)
taskkill /PID PID_NUMBER /F

# Or use different port
npm run dev -- --port 3000
```

---

## Git Commands (Version Control)

### Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### Add Remote Repository

```bash
git remote add origin https://github.com/yourusername/icon-editz.git
git branch -M main
git push -u origin main
```

### Update Repository

```bash
git add .
git commit -m "Your message"
git push
```

---

## Docker (Optional - Advanced)

### Create Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Build Docker Image

```bash
docker build -t icon-editz .
```

### Run Docker Container

```bash
docker run -p 3000:3000 icon-editz
```

---

## Advanced Npm Scripts

### Add New Script

Edit `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx",
  "format": "prettier --write \"src/**/*.{js,jsx,css}\"",
  "test": "vitest",
  "analyze": "vite-bundle-visualizer"
}
```

### Run Custom Script

```bash
npm run format      # Format code
npm run test        # Run tests
npm run analyze     # Analyze bundle
```

---

## Deployment Commands

### Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### AWS S3

```bash
# Install AWS CLI
npm install -g aws-cli

# Build
npm run build

# Deploy
aws s3 sync dist/ s3://your-bucket-name
```

---

## Performance Commands

### Check Build Size

```bash
# After building
du -sh dist/

# Detailed breakdown
npm run build -- --report
```

### Lighthouse Audit

Open DevTools (F12) → Lighthouse tab → Run Audit

---

## Useful Terminal Shortcuts

```
Ctrl + C        Stop running command
Ctrl + L        Clear terminal
Up Arrow        Previous command
Tab             Auto-complete
```

---

## Troubleshooting Quick Reference

| Issue | Command |
|-------|---------|
| npm install fails | `npm cache clean --force` then try again |
| Port 5173 in use | `npm run dev -- --port 3000` |
| Changes not showing | `Ctrl+Shift+R` (hard refresh browser) |
| Build fails | `rm -rf dist && npm run build` |
| Module not found | `npm install` again |
| Vite cache issues | `rm -rf node_modules/.vite` |

---

## Helpful Resources

### npm Documentation
```
https://docs.npmjs.com/
```

### Node.js Documentation
```
https://nodejs.org/docs/
```

### Package Search
```
https://www.npmjs.com/
```

---

## Full Setup Script (One Command)

Save as `setup.sh`:

```bash
#!/bin/bash
cd C:\Users\Gnaneshwar\Downloads\icon-editz
npm install
npm run dev
```

Run with:
```bash
chmod +x setup.sh
./setup.sh
```

---

## Common Issues & Solutions

### "npm: command not found"
```
Node.js not installed. Download from https://nodejs.org
```

### "Port 5173 already in use"
```
npm run dev -- --port 3000
```

### "Module not found"
```
npm install
rm -rf node_modules
npm install
```

### "Changes not showing"
```
Ctrl+Shift+R  (hard browser refresh)
Or clear cache in DevTools
```

### "Build file too large"
```
npm run build -- --report
Check what's taking space
Remove unused packages
```

---

**Remember**: Most issues are solved by:
1. Running `npm install` again
2. Restarting dev server
3. Hard refreshing browser
4. Clearing cache: `rm -rf node_modules && npm install`

---

For more help, see:
- README.md
- SETUP.md
- DEPLOYMENT.md
- QUICKSTART.md

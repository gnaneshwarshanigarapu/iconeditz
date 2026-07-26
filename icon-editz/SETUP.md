# Installation & Setup Guide

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm** or **yarn**: Package managers
- **Git**: For version control (optional)

## Step 1: Install Node.js

### Windows
1. Visit [nodejs.org](https://nodejs.org)
2. Download LTS version
3. Run installer and follow prompts
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### macOS
```bash
# Using Homebrew
brew install node
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm
```

## Step 2: Navigate to Project

```bash
cd icon-editz
```

## Step 3: Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

This installs all packages from `package.json`:
- React & React DOM
- Vite build tool
- Tailwind CSS
- Framer Motion
- Three.js & React Three Fiber
- React Router
- React Icons
- And more...

## Step 4: Start Development Server

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

### Expected Output
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

Open your browser and visit `http://localhost:5173`

## Common Issues & Solutions

### Issue: Port 5173 Already in Use

```bash
# On Windows
netstat -ano | findstr :5173

# On macOS/Linux
lsof -i :5173

# Kill the process or use different port
npm run dev -- --port 3000
```

### Issue: Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Permission Denied (macOS/Linux)

```bash
# Try with sudo
sudo npm install

# Or fix npm permissions
npm cache clean --force
```

## Building for Production

```bash
# Build optimized production files
npm run build

# Preview production build
npm run preview
```

Output files will be in `dist/` folder.

## Project Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter (if configured)
npm run lint
```

## File Structure Quick Reference

```
icon-editz/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── data/             # Static data files
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── styles/           # Global CSS
│   └── App.jsx           # Main app
├── index.html            # HTML entry point
├── package.json          # Dependencies
├── vite.config.js        # Vite settings
└── tailwind.config.js    # Tailwind settings
```

## Customization Quick Start

### Change Brand Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  'primary': '#9D5CFF',        // Change here
  'primary-light': '#B388FF',  // Change here
  // ...
}
```

### Add New Project

Edit `src/data/projects.js`:
```javascript
{
  id: 9,
  title: 'Your Project',
  category: 'Category',
  thumbnail: '/path/to/image.jpg',
  description: 'Description here',
  tags: ['Tag1', 'Tag2'],
}
```

### Add New Tools

Edit `src/data/tools.js`:
```javascript
{
  id: 5,
  name: 'Tool Name',
  description: 'Description',
  proficiency: 85,
  color: 'from-primary to-primary-light',
}
```

## Environment Setup

Create `.env.local` file in root:
```
VITE_API_URL=http://localhost:3000
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxxx
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

## Email Integration Setup

### Using EmailJS

1. Sign up at [emailjs.com](https://www.emailjs.com)
2. Create email service and template
3. Get your credentials:
   - Service ID
   - Template ID
   - Public Key

4. Add to `.env.local`:
```
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxxx
```

5. Install EmailJS:
```bash
npm install @emailjs/browser
```

6. Update `src/components/Contact.jsx` to use EmailJS

## Deployment Checklist

- [ ] Install all dependencies: `npm install`
- [ ] Remove console.logs from production
- [ ] Add environment variables
- [ ] Test responsive design on all devices
- [ ] Optimize images
- [ ] Build: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Push to Git repository
- [ ] Deploy to Vercel/Netlify/Hosting

## Production Deployment

### Vercel (Easiest)

1. Push to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Select repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output: `dist`
6. Add Environment Variables
7. Click "Deploy"

### Netlify

1. Build locally: `npm run build`
2. Upload `dist/` folder to Netlify
3. Or connect GitHub repository
4. Configure Build Settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add Environment Variables
6. Deploy

## Performance Optimization

```bash
# Check bundle size
npm run build

# View bundle analysis (if added)
npm run build:analyze
```

Recommendations:
- Use image optimization tools
- Lazy load components
- Monitor Core Web Vitals
- Enable GZIP compression

## Troubleshooting

### Dev server won't start
```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall
npm install
npm run dev
```

### Build fails
```bash
# Check Node version (need v16+)
node --version

# Try clean build
rm -rf dist
npm run build
```

### Styles not applying
```bash
# Rebuild Tailwind cache
npx tailwindcss -i src/styles/global.css -o src/output.css
```

## Support & Documentation

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Three.js**: https://threejs.org

## Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. 📝 Customize content
4. 🎨 Update colors and branding
5. 📸 Add project images
6. 📧 Setup email integration
7. 🚀 Deploy to production

---

**Questions? Contact: nani@iconeditz.com**

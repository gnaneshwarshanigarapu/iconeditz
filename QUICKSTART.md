# Icon Editz - Quick Start Guide

Get your Icon Editz portfolio website up and running in minutes!

## 🚀 5-Minute Setup

### 1. Open Terminal

```bash
cd C:\Users\Gnaneshwar\Downloads\icon-editz
```

### 2. Install Dependencies

```bash
npm install
```

⏱️ Takes 2-3 minutes depending on internet speed

### 3. Start Development Server

```bash
npm run dev
```

### 4. Open in Browser

Visit: **http://localhost:5173**

You should see your website live with animations and 3D background!

---

## 📝 Basic Customization (5 minutes)

### Change Text Content

**File:** `src/components/Hero.jsx`
```javascript
// Line 36: Change "I'm Nani" to your name
<span className="text-gradient">Your Name</span>

// Change job titles
const words = ['Your Job 1', 'Your Job 2', 'Your Job 3']
```

### Update Contact Info

**File:** `src/components/Contact.jsx`
```javascript
// Line 40: Change email
href="mailto:your@email.com"

// Line 50: Change phone
href="tel:+91XXXXXXXXXX"
```

### Update Social Links

**Files to update:**
- `src/components/Hero.jsx` (line 85-99)
- `src/components/Contact.jsx` (line 60-70)
- `src/components/Footer.jsx` (line 36-42)

```javascript
href="https://instagram.com/your-handle"
href="https://youtube.com/@your-channel"
href="mailto:your@email.com"
```

### Update Brand Colors

**File:** `tailwind.config.js`
```javascript
colors: {
  'primary': '#9D5CFF',              // Main purple
  'primary-light': '#B388FF',        // Light purple
  // Change these hex codes to your colors
}
```

---

## 📸 Adding Your Projects

**File:** `src/data/projects.js`

```javascript
export const projectsData = [
  {
    id: 1,
    title: 'Your Project Name',
    category: 'Instagram Reels',  // or: Wedding Videos, Birthday Videos, etc.
    thumbnail: '/projects/your-image.jpg',  // Add image to public/projects/
    videoUrl: 'https://youtube.com/embed/VIDEO_ID',
    description: 'What was the project about?',
    tags: ['CapCut', 'Smooth Transitions'],  // Your tools used
  },
  // Add more projects...
]
```

### Step-by-step:

1. **Prepare images**
   - Optimize images (max 2MB)
   - Size: 1280x720px recommended
   - Place in: `public/projects/`

2. **Add project to `projects.js`**
   - Copy structure above
   - Update all fields
   - Use YouTube embed ID

3. **Refresh browser** - Changes appear automatically!

---

## 🛠️ Adding Tools/Software

**File:** `src/data/tools.js`

```javascript
export const toolsData = [
  {
    id: 5,
    name: 'Your Software',
    icon: 'SiCapcut',  // Icon name
    description: 'What do you use it for?',
    proficiency: 90,   // 0-100
    color: 'from-primary to-primary-light',
  },
  // Add more tools...
]
```

---

## 🎨 Styling Components

### Reusable Classes

```html
<!-- Glass effect cards -->
<div class="glass-effect p-6 rounded-xl">...</div>

<!-- Purple glow -->
<div class="glow-purple">...</div>

<!-- Text gradient -->
<p class="text-gradient">Gradient text</p>

<!-- Button styles -->
<button class="px-6 py-3 bg-gradient-purple rounded-lg">Button</button>
```

### Tailwind Quick Ref

```
Spacing: p-4 (padding), m-4 (margin), gap-4 (gaps)
Colors: text-primary, bg-surface, border-primary
Sizes: text-2xl, w-full, h-10
Display: flex, grid, hidden, md:flex (responsive)
```

---

## 🔗 Changing Navigation Links

**File:** `src/components/Navbar.jsx`

```javascript
const navItems = [
  { label: 'Home', id: 'hero' },
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Tools', id: 'tools' },
  { label: 'Contact', id: 'contact' },
]
```

Each `id` must match a section ID in your pages:
```html
<section id="hero">...</section>
<section id="about">...</section>
```

---

## 📧 Setting Up Contact Form

### Option 1: EmailJS (Easiest - 10 minutes)

1. **Sign up** at [emailjs.com](https://www.emailjs.com)

2. **Get credentials**:
   - Service ID
   - Template ID
   - Public Key

3. **Add to `.env.local`**:
```
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxxx
```

4. **Install EmailJS**:
```bash
npm install @emailjs/browser
```

5. **Update Contact.jsx**:
```javascript
import emailjs from '@emailjs/browser'

const handleSubmit = async (e) => {
  e.preventDefault()
  
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      formData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    // Show success message
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## 🚀 Deploying to Web

### Option 1: Vercel (Recommended - 2 minutes)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to** [vercel.com](https://vercel.com)

3. **Click** "Import Project"

4. **Select your GitHub repo** - That's it!

### Option 2: Netlify (Also easy)

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Drag `dist/` folder** to [netlify.com](https://netlify.com)

3. **Wait 30 seconds** - Your site is live!

### Option 3: Your Own Server

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

---

## 🐛 Troubleshooting

### Dev server won't start
```bash
npm install
npm run dev
```

### Changes not showing
```bash
# Hard refresh browser
Ctrl+Shift+R  (Windows)
Cmd+Shift+R   (Mac)
```

### Styles look broken
```bash
# Rebuild Tailwind
npm run dev
# Then hard refresh
```

### 3D background not showing
- Check browser console for errors (F12)
- Try in Chrome/Firefox
- Check if WebGL is supported

---

## 📱 Testing on Mobile

### Local Testing

1. Get your computer's IP:
   ```bash
   ipconfig getifaddr en0  # Mac
   ipconfig                # Windows
   ```

2. Visit from phone: `http://YOUR_IP:5173`

### Browser DevTools

```bash
# Open DevTools
F12

# Click responsive mode
Ctrl+Shift+M

# Test different devices
```

---

## 📚 File Guide

### Important Files to Edit

```
src/components/Hero.jsx          → Change intro text
src/data/projects.js             → Add your projects
src/data/tools.js                → Add tools/software
src/components/Contact.jsx       → Change contact info
tailwind.config.js               → Change colors
.env.example                     → Environment variables
```

### Don't Edit These (Usually)

```
src/App.jsx                      → Routing setup
src/main.jsx                     → React entry point
vite.config.js                   → Build configuration
package.json                     → Dependencies
```

---

## 🎓 Learning Resources

- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion
- **Vite**: https://vitejs.dev

---

## ❓ Common Questions

**Q: How do I change the purple color?**
A: Edit `tailwind.config.js` → colors → `primary: '#9D5CFF'`

**Q: How do I add more sections?**
A: Copy a component, customize it, add to `src/pages/Home.jsx`

**Q: How do I make it a real store?**
A: Follow the ROADMAP.md → Phase 2 instructions

**Q: Can I use different 3D background?**
A: Edit `src/hooks/useThreeBackground.js` to customize Three.js objects

**Q: How do I add a domain name?**
A: Buy domain, point to your hosting (Vercel/Netlify guides included)

---

## 🎯 Next Steps

1. ✅ Start dev server: `npm run dev`
2. 📝 Update your name and bio
3. 📸 Add your project images
4. 🔗 Update social links
5. 📧 Set up email (EmailJS)
6. 🚀 Deploy to Vercel

---

## 💡 Pro Tips

- **Animations feel slow?** → Reduce `transition.duration` in `src/utils/animations.js`
- **Need more pages?** → Use React Router (already set up!)
- **Want dark mode toggle?** → Check `src/utils/store.js` → `useThemeStore`
- **Performance issues?** → Run `npm run build` and check bundle size

---

## 📞 Need Help?

1. Check README.md
2. Check SETUP.md
3. Check ROADMAP.md
4. Email: nani@iconeditz.com

---

**You're all set! Happy building! 🚀**

Start server with: `npm run dev`

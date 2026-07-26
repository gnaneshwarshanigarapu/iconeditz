# Icon Editz - Professional Video Editing Portfolio & Digital Products Platform

A modern, scalable website for a premium video editing and motion graphics business. Built with React, Vite, Tailwind CSS, Framer Motion, and Three.js for stunning visuals and smooth animations.

## 🚀 Features

### Current Features
- **Premium Dark Theme**: Black and purple neon design system
- **Interactive 3D Background**: Floating video editing elements using Three.js
- **Responsive Design**: Mobile-first approach, works on all devices
- **Smooth Animations**: Powered by Framer Motion for professional transitions
- **Portfolio Showcase**: Filterable project gallery with multiple categories
- **Contact Form**: Fully validated form (ready for EmailJS integration)
- **SEO Optimized**: Meta tags, Open Graph, structured data
- **Performance Optimized**: Code splitting, lazy loading, optimized images

### Sections
1. **Navbar** - Sticky navigation with active section indicator
2. **Hero** - Dynamic landing with typing animation and 3D effects
3. **About** - Personal story with statistics and skill bars
4. **Projects** - Filterable portfolio with categories
5. **Tools** - Software expertise showcase
6. **Contact** - Contact form with validation
7. **Footer** - Navigation and social links

## 📋 Tech Stack

- **React 18.2.0** - UI Framework
- **Vite 5.0.8** - Build tool for lightning-fast development
- **Tailwind CSS 3.3.6** - Utility-first styling
- **Framer Motion 10.16.4** - Advanced animations
- **Three.js & React Three Fiber** - Interactive 3D graphics
- **React Router DOM 6.20.0** - Routing for future multi-page support
- **React Icons 4.12.0** - Icon library
- **Zustand 4.4.7** - State management (for future store)

## 🎨 Design System

### Colors
- **Primary Purple**: `#9D5CFF`
- **Secondary Purple**: `#B388FF`
- **Background**: `#000000`
- **Surface**: `#111111`
- **Text**: `#FFFFFF`
- **Muted Text**: `#BDBDBD`

### Components
- Glassmorphism cards
- Neon purple accents
- Smooth hover effects
- Responsive grid layouts

## 📁 Project Structure

```
icon-editz/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Projects.jsx
│   │   ├── Tools.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── pages/                # Page components (future multi-page)
│   │   └── Home.jsx
│   ├── three/                # Three.js components
│   │   └── BackgroundScene.jsx
│   ├── data/                 # Static data
│   │   ├── projects.js
│   │   └── tools.js
│   ├── hooks/                # Custom React hooks
│   │   ├── useThreeBackground.js
│   │   └── useAnimation.js
│   ├── utils/                # Utility functions
│   │   ├── helpers.js
│   │   └── animations.js
│   ├── styles/               # Global styles
│   │   └── global.css
│   ├── assets/               # Images, videos, icons
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn installed
- Git (optional)

### Installation

1. **Navigate to project directory**
```bash
cd icon-editz
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start development server**
```bash
npm run dev
# or
yarn dev
```

The site will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

This generates optimized files in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 🔧 Configuration

### Tailwind CSS Customization

Edit `tailwind.config.js` to modify:
- Color scheme
- Typography
- Spacing
- Custom animations

### Vite Configuration

Edit `vite.config.js` to:
- Change port
- Modify build settings
- Add plugins

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are fully responsive using Tailwind CSS breakpoints.

## 🎬 Animation System

Framer Motion animations configured in `src/utils/animations.js`:
- `staggerContainer` - Stagger child animations
- `fadeInUp` - Fade and slide up
- `fadeInLeft/Right` - Directional fades
- `scaleIn` - Scale animation
- `hoverScale` - Interactive hover effect

### Using Animations

```jsx
<motion.div
  variants={fadeInUp}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

## 🎮 3D Background

The interactive 3D background uses Three.js and includes:
- Floating video editing elements
- Mouse interaction tracking
- Smooth animations
- Performance optimized

Located in `src/hooks/useThreeBackground.js`

## 📊 Project Management

### Adding Projects

Edit `src/data/projects.js`:
```javascript
{
  id: 1,
  title: 'Project Title',
  category: 'Category Name',
  thumbnail: '/path/to/image.jpg',
  description: 'Description',
  tags: ['Tag1', 'Tag2'],
}
```

### Adding Tools

Edit `src/data/tools.js`:
```javascript
{
  id: 1,
  name: 'Software Name',
  description: 'Description',
  proficiency: 90,
}
```

## 🔐 Environment Variables

Create `.env.local` for environment-specific settings:
```
VITE_API_URL=https://api.example.com
VITE_EMAILJS_KEY=your_emailjs_key
```

## 📧 Email Integration (Future)

To integrate EmailJS:

1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Get your Service ID, Template ID, and Public Key
3. Add to `.env.local`:
```
VITE_EMAILJS_SERVICE_ID=service_xxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxx
VITE_EMAILJS_PUBLIC_KEY=public_xxxx
```
4. Install EmailJS: `npm install @emailjs/browser`
5. Update Contact.jsx to use EmailJS

## 🏪 Future Features - Digital Store

The architecture is prepared for:

### Store Pages
- Product catalog
- Product details
- Shopping cart
- Checkout
- User dashboard

### Products to Sell
- CapCut Presets
- Premiere Pro Presets
- After Effects Templates
- LUT Packs
- PNG Packs
- Thumbnail Packs
- Motion Graphics Packs
- Editing Assets

### Future Integrations
- **Payment**: Razorpay, Stripe
- **Backend**: Firebase or Supabase
- **Authentication**: Google, GitHub OAuth
- **Storage**: Cloud storage for digital products

## 🔗 Future Routing Structure

```
/                    - Home
/portfolio           - Portfolio/Gallery
/services           - Services offered
/store              - Digital products store
/product/:id        - Product details
/blog               - Blog posts
/contact            - Contact page
/dashboard          - User dashboard (logged-in users)
/dashboard/orders   - Order history
```

Router is configured in `src/App.jsx` and ready for expansion.

## 📈 Performance Optimization

- **Code Splitting**: Automatic by Vite
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Use optimized formats (WebP)
- **Caching**: Browser caching configured
- **Compression**: Gzip enabled in production

### Performance Tips
1. Optimize images (use tools like TinyPNG)
2. Use WebP format where possible
3. Lazy load video content
4. Monitor Core Web Vitals
5. Use CDN for assets

## 🚀 Deployment

### Vercel (Recommended)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure build settings (Vite auto-detected)
5. Deploy

### Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Traditional Hosting

1. Run `npm run build`
2. Upload `dist/` folder to your hosting
3. Configure server to route to `index.html`

### Environment Variables in Production

Set in your hosting platform:
- `VITE_API_URL`
- `VITE_EMAILJS_*`
- Any other API keys

## 📞 Contact & Social

- **Email**: nani@iconeditz.com
- **Instagram**: @iconeditz
- **YouTube**: Icon Editz

## 📄 License

This project is the property of Icon Editz. All rights reserved.

## 🤝 Support

For issues or questions:
1. Check existing documentation
2. Review code comments
3. Test in development environment
4. Contact: nani@iconeditz.com

## 🎯 Future Roadmap

- [ ] Blog section
- [ ] Testimonials/Reviews
- [ ] Digital product store
- [ ] User authentication
- [ ] Order management system
- [ ] Analytics dashboard
- [ ] Email automation
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Three.js](https://threejs.org)

---

**Built with ❤️ for Icon Editz | Last Updated: 2024**

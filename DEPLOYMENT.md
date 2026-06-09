# Deployment Guide

Complete guide to deploy Icon Editz to production.

## Deployment Platforms

### 1. Vercel (Recommended - Easiest)

**Why Vercel?**
- Optimized for Vite/React
- Free tier generous
- Automatic HTTPS
- Analytics included
- Instant deployments

**Steps:**

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/icon-editz.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://api.example.com
     VITE_EMAILJS_SERVICE_ID=service_xxxxx
     VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
     VITE_EMAILJS_PUBLIC_KEY=public_xxxxx
     ```
   - Redeploy

4. **Custom Domain**
   - Settings → Domains
   - Add your custom domain
   - Update DNS records per Vercel instructions

---

### 2. Netlify

**Steps:**

1. **Prepare Build**
   ```bash
   npm run build
   ```

2. **Deploy Option A: Drag & Drop**
   - Go to [netlify.com](https://netlify.com)
   - Drag `dist` folder to deploy area
   - Done!

3. **Deploy Option B: Git Integration**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy

4. **Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add variables
   - Trigger new deploy

5. **Custom Domain**
   - Domain Management → Add custom domain
   - Update DNS

---

### 3. GitHub Pages

**Note:** Best for static sites without server

**Steps:**

1. **Update vite.config.js**
   ```javascript
   export default {
     base: '/icon-editz/', // if deploying to subdomain
     // ... rest of config
   }
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   # Install gh-pages
   npm install --save-dev gh-pages
   ```

4. **Add deploy script to package.json**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

5. **Deploy**
   ```bash
   npm run deploy
   ```

---

### 4. Traditional Web Hosting (cPanel, etc.)

**Steps:**

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Connect via FTP/SFTP
   - Upload contents of `dist/` folder to `public_html/`

3. **Configure Server**
   - Create `.htaccess` for routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Test**
   - Visit your domain
   - Test all routes

---

### 5. AWS S3 + CloudFront

**Advanced deployment**

**Steps:**

1. **Create S3 Bucket**
   - AWS Console → S3
   - Create new bucket
   - Enable static website hosting
   - Block public access settings

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::bucket-name/*"
       }
     ]
   }
   ```

3. **Upload Build**
   ```bash
   npm run build
   aws s3 sync dist/ s3://bucket-name
   ```

4. **Setup CloudFront**
   - Create distribution
   - Set origin to S3
   - Set default root object to index.html

---

## Pre-Deployment Checklist

- [ ] All npm dependencies installed and up-to-date
- [ ] Test locally: `npm run dev` works perfectly
- [ ] Production build: `npm run build` completes without errors
- [ ] No console errors or warnings
- [ ] All images optimized
- [ ] Meta tags complete and accurate
- [ ] All links working correctly
- [ ] Form validation working
- [ ] Responsive design tested on multiple devices
- [ ] Remove any console.log() statements
- [ ] Update contact information
- [ ] Add analytics tracking code
- [ ] SSL certificate configured
- [ ] Environment variables set in production
- [ ] Database connections configured (if needed)

---

## Post-Deployment Testing

### Performance
```bash
# Check with Lighthouse
# 1. Open DevTools (F12)
# 2. Click Lighthouse tab
# 3. Run Audit
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### SEO Checklist
- [ ] Meta title set
- [ ] Meta description set
- [ ] Open Graph tags included
- [ ] Sitemap submitted to Google
- [ ] robots.txt configured
- [ ] Schema markup valid

### Functionality
- [ ] Navigation works
- [ ] Links navigate correctly
- [ ] Buttons responsive to clicks
- [ ] Forms submit successfully
- [ ] 3D background displays
- [ ] Animations smooth
- [ ] Mobile layout correct
- [ ] All pages accessible

---

## Analytics & Monitoring

### Google Analytics

1. Create account at [google.com/analytics](https://google.com/analytics)
2. Get tracking ID: `G-XXXXXXXXXX`
3. Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property (your domain)
3. Verify ownership
4. Submit sitemap

---

## SSL Certificate

### For Vercel/Netlify
- Automatically provided ✅

### For Traditional Hosting
- Use Let's Encrypt (free)
- Or purchase SSL certificate
- Enable HTTP → HTTPS redirect

### For AWS
- AWS Certificate Manager (free for AWS resources)
- Or use Certbot for Let's Encrypt

---

## Performance Optimization for Production

### CDN Configuration
- Enable GZIP compression
- Cache static assets (1 year)
- Cache HTML (revalidate hourly)
- Minimize JavaScript
- Defer non-critical CSS

### Image Optimization
```bash
# Use tools like:
# - TinyPNG
# - ImageOptim
# - WebP converter

# Convert to WebP for smaller sizes
# Provide fallbacks for older browsers
```

### Monitoring
Set up alerts for:
- High error rates
- Performance degradation
- Uptime issues
- Traffic spikes

---

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Rollback Procedures

### Vercel
- Deployments → Find previous deployment → Click Redeploy

### Netlify
- Deploys → Select previous version → Restore

### GitHub Pages
```bash
git revert <commit-hash>
git push origin main
```

---

## Maintenance

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

### Monitoring Tasks
- Monthly: Check for security updates
- Weekly: Review analytics
- Daily: Check error logs

---

## Troubleshooting Deployment

### Build Fails
```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

### Site shows old version
```bash
# Hard refresh browser
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Clear CDN cache (if using)
```

### 404 errors on routes
- Ensure SPA routing configured
- Add `_redirects` file (Netlify):
  ```
  /* /index.html 200
  ```

### Environment variables not working
- Verify variable names match
- Redeploy after adding variables
- Check platform documentation

---

## Support & Help

- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **AWS Docs**: https://aws.amazon.com/documentation
- **GitHub Pages**: https://pages.github.com

---

**Need help? Contact: nani@iconeditz.com**

Last Updated: 2024

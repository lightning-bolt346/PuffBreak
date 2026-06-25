# Virtual Break Room

A minimal, interactive digital break experience built with Next.js, Tailwind CSS, and Framer Motion. 
Features include real-time chat, a dynamic particle engine, ambient audio effects, and different 'rooms' to teleport your break experience.

## Deployment to Vercel

This app is a standard Next.js application, making it perfectly suited for easy deployment to Vercel.

### Steps to Deploy

1. **Push to GitHub**
   Initialize a git repository in this project directory and push it to a new GitHub repository.

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
   - Click "Add New..." and select "Project".
   - Import the repository you just created.

3. **Configure Settings (Optional)**
   - Vercel automatically detects Next.js, so the build commands (`npm run build`) and output directory (`.next`) are pre-configured.
   - If you have environment variables, add them in the "Environment Variables" section before deploying.

4. **Deploy**
   - Click "Deploy". Vercel will build and deploy your application.
   - Once complete, you will get a live URL to access your Virtual Break Room.

### Features
*   **Immersive Modes:** Toggle between different aesthetic rooms, Stealth mode, and Zen mode.
*   **Dynamic Engine:** Uses HTML5 Canvas for real-time physics and particle generation (smoke, steam, weather).
*   **Audio ASMR:** Web Audio API synth loops for relaxing ambient sound and interactions.
*   **PWA Ready:** Includes a Web App Manifest for mobile installation and offline fallback states.

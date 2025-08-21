# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/93c0d664-a559-46ee-8888-84ccc953e5d0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/93c0d664-a559-46ee-8888-84ccc953e5d0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/93c0d664-a559-46ee-8888-84ccc953e5d0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Progressive Web App

This project includes a web app manifest, service worker based on a **Stale-While-Revalidate**
strategy and a custom install banner. The banner reappears on each session for users who
haven't installed the app. You can tweak how often it is shown across sessions by editing
`PROMPT_INTERVAL_DAYS` in `src/components/InstallPrompt.tsx`. The app can be installed on
Android and desktop and continues to work offline after the first load.

### Testing installability

1. Run `npm run build` and serve the `dist` folder or start the dev server with `npm run dev`.
2. In Chrome, open DevTools → **Application** → **Manifest** to verify the manifest and service worker.
3. Use the **Lighthouse** panel to audit the PWA or trigger the install flow via the address bar.

### Generating an Android APK

The manifest is structured for tools like [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).
To build a Trusted Web Activity APK:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://sonic-prompt-craft.app/manifest.webmanifest
bubblewrap build
```

Replace the manifest URL with your hosted domain when deploying.
# sonic-prompt-gen

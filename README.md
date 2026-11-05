# Skin R&R Website Assistant

Primary website: https://skinrr-website-assistant.onrender.com/

GitHub interface: https://Andre1Karl.github.io/skinrr-website-assistant/

The project includes the supplied Skin R&R logo and a responsive, text-only widget. GitHub Pages serves the interface, which connects to the Node backend on Render. The user explicitly approved Cloudflare Workers AI as the hosted provider. Keep Workers Free: there is a daily allowance, explicit quota errors and no paid fallback. Ollama remains an alternative local mode. Credentials are configured only in Render's server environment. No AI responses are simulated.

## Complete working source

Download [SkinRR-Website-Assistant-source.zip](SkinRR-Website-Assistant-source.zip) and extract it to `D:\SkinRR-Website-Assistant`. The ZIP includes the backend, widget, approved knowledge, brand configuration, tests, refresh/build commands, `.env.example`, MIT license, and detailed setup guide. See [WINDOWS-SETUP.md](WINDOWS-SETUP.md) for exact commands. Source is packaged as a ZIP because the connected GitHub integration could not write this new repository; the preview files were uploaded through GitHub's browser interface.

The knowledge is curated from **https://skinrr.com/** as the primary source, supplemented by the official Biltmore, Reno and North Scottsdale sites for local details. Approved passages include source URLs and verification dates. It is not a general web-search assistant. Knowledge refresh downloads review candidates and never silently approves new website content.

The chosen local model is qwen2.5:1.5b (Apache 2.0, approximately 986 MB). It runs through Ollama on your own hardware. The backend must remain between the browser and Ollama. Local use has no service fees; a public AI service requires a continuously running reachable computer or server. Do not expose Ollama itself to the Internet.

## Connecting real AI later

Host the included Node backend and Ollama on your computer/server with HTTPS and suitable access controls. Configure `ALLOWED_ORIGINS` for `https://andre1karl.github.io`. Set `PUBLIC_BACKEND_URL` to the HTTPS **backend** origin and run `node scripts/build-pages.mjs` in the source project. Upload the generated `docs/` contents to this repository root, replacing the preview files. Keep `OLLAMA_MODELS=D:\Ollama\Models` before starting Ollama or downloading weights. No browser setting should point directly to Ollama.

No live Skin R&R website has been modified. This is a test project, not the official business website. GitHub may keep hosting/security access logs; the widget adds no analytics and persists no conversations. Real Ollama generation and production WordPress hosting remain unverified; local transport, error handling, retrieval and UI checks are documented in the source package.

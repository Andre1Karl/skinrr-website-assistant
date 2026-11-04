# Skin R&R Website Assistant

## GitHub Pages preview

The `docs/` directory contains a public design preview for GitHub Pages, including the supplied Skin R&R logo. GitHub Pages serves static files; it cannot execute this Node backend or Ollama. Without a hosted backend, chat is explicitly marked offline and no AI answers are fabricated. The approved knowledge is curated from https://skinrr.com/ plus official location sites for local details, with source URLs in `knowledge/approved.json`.

To rebuild the preview, run `node scripts/build-pages.mjs`. For a future hosted Node/Ollama backend, set `$env:PUBLIC_BACKEND_URL = 'https://your-backend.example.com'`, rebuild, and commit `docs/`. Add your exact Pages origin to the backend's `ALLOWED_ORIGINS`, keep Ollama private, and configure HTTPS/streaming. This variable selects the project backend only; never put the Ollama endpoint in browser settings. Local use still reads the regular backend configuration. GitHub hosting may maintain its own infrastructure/security access logs; the assistant adds no analytics or conversation storage.

Enable Pages under repository Settings → Pages → Deploy from a branch → main → /docs. The entire project source is open source; only public widget configuration is copied into `docs/`. `.env` and raw refresh candidates are excluded from Git. No model weights or Ollama binaries are uploaded.

An MIT-licensed, text-only local assistant. Custom browser widget → Node backend → Ollama. No paid API, account, analytics, lead collection, database, embeddings service or npm packages. Conversations live in browser/server request memory only; closing/reopening the panel retains the current page session. Reloading clears it. The web pages are not fetched at chat time.

## Environment inspected, 5 November 2026

Windows computer: AMD Ryzen 5 PRO 4650G with Radeon Graphics, 15.4 GiB physical RAM. D: had approximately 114 GB free; C: only about 2.8 GB. GPU memory/acceleration could not be verified because CIM access was denied. Plan for CPU inference. Node v24.22.1 was available. Ollama was absent from PATH and localhost:11434 did not respond. No Ollama binary or model was downloaded during implementation. The source project was saved to `D:\SkinRR-Website-Assistant`, and the user-level `OLLAMA_MODELS` variable was configured and read back as `D:\Ollama\Models`. Start a new terminal to inherit that user setting.

Selected model: **qwen2.5:1.5b**, Q4_K_M, about **986 MB download**, Apache 2.0 weights. Budget approximately **2–4 GB runtime RAM** with the default 4096-token context; this is an estimate, not a measurement here. CPU first response may take time. This small model can make mistakes and may follow instructions less reliably than larger models; verify answers before any public launch. Model record: https://ollama.com/library/qwen2.5:1.5b . Ollama is MIT: https://github.com/ollama/ollama/blob/main/LICENSE . Node is distributed under MIT and third-party notices: https://github.com/nodejs/node/blob/main/LICENSE . No dependency installation is needed.

## Windows setup — all commands are PowerShell

The project is intended to be run at `D:\SkinRR-Website-Assistant`. If using the supplied ZIP instead of the already copied directory, extract the ZIP so that `package.json` sits directly in that directory. The commands below are provided for you to execute; the Ollama install and model pull were **not executed** here.

### 1. Configure D: storage BEFORE any download

```powershell
New-Item -ItemType Directory -Force -Path D:\SkinRR-Website-Assistant,D:\Ollama\Models,D:\Ollama\Runtime,D:\Downloads,D:\DevTools,D:\Temp,D:\npm-cache | Out-Null
$env:OLLAMA_MODELS = 'D:\Ollama\Models'
[Environment]::SetEnvironmentVariable('OLLAMA_MODELS', 'D:\Ollama\Models', 'User')
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NO_CLOUD = '1'
$env:TEMP = 'D:\Temp'
$env:TMP = 'D:\Temp'
$env:npm_config_cache = 'D:\npm-cache'
Set-Location D:\SkinRR-Website-Assistant
```

These process TEMP/TMP/cache settings affect tools launched from this terminal. No machine-wide TEMP changes are needed. Ollama may still create small configuration files in the user profile on C:. The portable CLI avoids GUI auto-update downloads on C:. Model data goes to D: via OLLAMA_MODELS. If a previous Ollama tray instance is running, quit it before launching the configured server; an already-running process will not inherit new variables.

### 2. Node.js, if needed (Node 22 or newer)

Check `node --version`. If it already reports version 22+, skip this block. Otherwise install the official portable Windows x64 LTS binary directly on D: without npm dependencies:

```powershell
$releases = Invoke-RestMethod https://nodejs.org/dist/index.json
$release = $releases | Where-Object { $_.lts -and [int]($_.version.TrimStart('v').Split('.')[0]) -ge 22 } | Select-Object -First 1
$nodeName = "node-$($release.version)-win-x64"
$nodeZip = "D:\Downloads\$nodeName.zip"
Invoke-WebRequest "https://nodejs.org/dist/$($release.version)/$nodeName.zip" -OutFile $nodeZip
$checks = Invoke-RestMethod "https://nodejs.org/dist/$($release.version)/SHASUMS256.txt"
$expected = (($checks -split "`n" | Where-Object { $_.Trim().EndsWith("$nodeName.zip") }) -split '\s+')[0]
if ((Get-FileHash $nodeZip -Algorithm SHA256).Hash.ToLower() -ne $expected.ToLower()) { throw 'Node download checksum mismatch' }
Expand-Archive -LiteralPath $nodeZip -DestinationPath D:\DevTools -Force
$env:Path = "D:\DevTools\$nodeName;$env:Path"
node --version
```

Add the displayed `D:\DevTools\node-...-win-x64` directory to your user PATH through Windows Environment Variables for future terminals, or repeat the `$env:Path` line each session.

### 3. Ollama portable CLI on D:

Official Windows documentation: https://docs.ollama.com/windows . The runtime ZIP is separate from the 986 MB model and can be several GB because it includes GPU libraries. Ensure sufficient D: space and leave C: downloads disabled. This CPU-capable project does not require the additional ROCm package.

```powershell
Invoke-WebRequest 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip' -OutFile 'D:\Downloads\ollama-windows-amd64.zip'
Expand-Archive -LiteralPath 'D:\Downloads\ollama-windows-amd64.zip' -DestinationPath 'D:\Ollama\Runtime' -Force
$env:Path = "D:\Ollama\Runtime;$env:Path"
# OLLAMA_MODELS was set above BEFORE downloading anything.
ollama --version
ollama serve
```

Leave that terminal running. If you prefer the GUI installer, download it to D: and run `OllamaSetup.exe /DIR="D:\Ollama\App"` with the same environment variables already configured; the portable route offers better control of large files. No installer was run by this project.

### 4. Download the chosen model (second terminal)

```powershell
$env:OLLAMA_MODELS = 'D:\Ollama\Models'
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NO_CLOUD = '1'
$env:TEMP = 'D:\Temp'
$env:TMP = 'D:\Temp'
$env:Path = "D:\Ollama\Runtime;$env:Path"
ollama pull qwen2.5:1.5b
ollama list
# Confirm the model data was written on D:
Get-ChildItem D:\Ollama\Models
```

The running Ollama SERVER must have inherited OLLAMA_MODELS. Merely setting it in the client terminal while an old tray server runs is insufficient.

### 5. Start the assistant

```powershell
Set-Location D:\SkinRR-Website-Assistant
Copy-Item .env.example .env
# No npm install: there are zero third-party project dependencies.
node --env-file=.env backend/server.mjs
```

Open http://127.0.0.1:3000 . Use `Ctrl+C` to stop. In future, preserve your edited `.env`; do not overwrite it again. `npm start` is an equivalent command. Start Ollama separately with the same D: environment before using chat.

## Files and customization

* `brand.config.json`: business/assistant names, logo URL, colors, system fonts, welcome, questions, locations, verified contact/booking links, assistant instructions, model defaults and knowledge settings. Switch this file and the knowledge base to adapt the core for OIR. Clear old Skin R&R facts and replace all location records when rebranding.
* `knowledge/approved.json`: human-reviewed passages, location IDs, retrieval tags, source URLs, verification date and conflict notes. Only these approved passages are supplied to the model. Restart the server after configuration changes. Knowledge is read per request.
* `backend/`: HTTP service, input validation, local text retrieval, Ollama streaming proxy. Model URL is server-only and cannot be selected by visitors.
* `public/`: demo, isolated widget and WordPress loader. No microphone, voice, avatar or third-party assets. A blank logo uses a typographic mark. For a local image, place it in `public/`, add its explicit filename to the server static-file map, and set `logo` to that URL; external HTTPS logos also work. Fonts default to system fonts, avoiding font downloads.
* `.env`: runtime endpoint/model, bind address, port, exact allowed origins, timeout. Environment model name overrides the brand default.

Brand contact URLs also supply the source footer for location-specific chats. Model output is rendered as plain text, with no HTML or model-generated links enabled. Clickable links are supplied independently from approved knowledge/config, so malicious model text cannot inject active content.

## Refreshing knowledge deliberately

```powershell
Set-Location D:\SkinRR-Website-Assistant
node scripts/refresh.mjs
node scripts/check-links.mjs
node --test tests/*.test.mjs
```

Refresh downloads the configured official sources into dated `knowledge/candidates/` folders on D:. It extracts text and links but does **not** replace approved content. Read the candidates as untrusted reference data. Compare with current official pages; manually edit approved passages and brand links, update `verifiedOn`, run tests, restart. Do not copy site navigation, scripts or embedded instructions into assistant instructions. A failed fetch leaves approved knowledge untouched. URL redirects during refresh are rejected for deliberate review; update the source URL after verifying the destination. Do not turn bulk scraping into automatic approval.

Biltmore's suspect number and cross-location booking ID were deliberately withheld. The main and Arizona sites disagree about opening status. Confirm these with the business before approving any new hours, opening status or booking destination. Prices and promotions are intentionally absent from the starter knowledge. A listed treatment category does not establish current local availability. No business data was invented to fill gaps.

## Privacy and operational limits

The backend binds to 127.0.0.1; keep Ollama on 127.0.0.1:11434. The browser never connects directly to Ollama. Remote endpoint changes require editing server environment variables, and no fallback provider exists. Health and generation failures produce explicit errors. The backend logs no chat bodies and does not save chats; memory is released after requests. Browser conversation survives panel close/reopen only during the loaded page session. There are no cookies, local/session storage, analytics or lead forms. Requests contain only a bounded conversation. Ollama keeps a model in memory briefly; it does not receive a request to save history.

Backend limits: 24 KB request body, 2000 characters per message, 12 alternating messages / 12,000 total characters, 10 requests/minute/IP, one active request/IP and two model requests overall, configurable generation deadline. Widget applies a shorter 1200-character input limit and five successful exchanges before suggesting a new conversation. Failed requests do not contaminate the model context. An in-memory limiter resets at restart; it is suitable for a local test, not Internet abuse protection. Untrusted cross-origin requests are rejected. No arbitrary file serving or runtime endpoint selection.

The model is probabilistic. Prompt rules and local retrieval reduce errors but do not guarantee medical safety or factual correctness, especially on a 1.5B model. Before a public launch, evaluate representative prompts, injection attempts, missing facts and location switches with the real model. The assistant must remain clearly identified as virtual, offer general information and defer personal medical decisions to qualified providers.

## WordPress later

First host the Node backend **and widget assets together** at an HTTPS origin such as `https://assistant.example.com` on a computer/server you control. Configure TLS, a reverse proxy that passes streaming responses without buffering, firewall rules and production rate limiting. Keep port 11434 private. Serve Node privately behind the proxy. Do not use a public browser URL for Ollama. Do not expose this localhost test directly to the Internet.

Add this to a WordPress Custom HTML block or enqueue it through your theme/plugin after reviewing the production configuration:

```html
<script src="https://assistant.example.com/embed.js" defer></script>
```

The loader places a floating iframe at the bottom right. It preserves the loaded widget while open/closed. It checks message origin and iframe identity before resizing. WordPress should allow the widget origin in its `script-src` and `frame-src` CSP. The API remains same-origin inside the iframe; direct cross-origin widget usage additionally needs the exact WordPress origin in `ALLOWED_ORIGINS`. Keep all source links appropriate for the new brand. The iframe uses a generic accessible title; its inner assistant name comes from brand configuration. Test the WordPress theme’s mobile layout and keyboard behavior on a real device before deployment.

Local use on your own computer has no service/API fees, apart from your existing hardware, electricity and Internet connection. Public availability requires an always-running reachable computer or server. Hosting, domain names and operations may cost money; no permanent free hosting is promised. A static-only WordPress host cannot run Node/Ollama by itself. No live Skin R&R or WordPress site was changed.

## Validation

Run `node --test tests/*.test.mjs` for retrieval isolation, context/location changes, ambiguity, missing information instructions, bounded inputs, configuration privacy, endpoint origin/static protections, rate limits, real unavailable-Ollama errors and streamed transport using an explicitly labeled test double. Test doubles are only in the test suite; the demo never uses canned AI responses.

See `TEST-RECORD.txt` for checks actually completed here and remaining checks. After Ollama setup, verify real generation manually: open/close/reopen; send “Reno phone and address”; then “What about North Scottsdale?”; ask “What’s the Biltmore phone?”; ask “How much is a facial?”; ask “Book a consultation”; try a 390-pixel viewport and a real mobile keyboard. Confirm no invented details, correct sources, location clarification, no claim of booking, focus visibility, Escape and New conversation. Stop Ollama and check the next request gives an actionable error. Transport tests do not establish real model quality.

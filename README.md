# Four Birthdays 🌹
**An interactive birthday gift website you can make your own: no coding needed, just edit one file.**

![Preview of the screens](.github/preview.jpg)

Ten animated screens that open one after another like a gift: a secret lock, your story told in four seasons with your photos, a jar of reasons, birthday candles you can actually blow out, a letter that writes itself, and a final heart tree with promise coupons. It's made for phones first and runs in any modern browser.

---

## ✨ What's inside

| # | Screen | What happens |
|---|---|---|
| 0 | **Lock** | They type a secret code. Wrong tries give playful hints that get easier. |
| 1 | **Cupid** | A tap fires an arrow into a heart. |
| 2 | **Word rose** | A rose grows out of "I love you" in dozens of languages (plus your nicknames). Tap a word to see its language. |
| 3 | **Our story** | Four chapters (spring → monsoon → summer → autumn) with draggable polaroids of your photos. Each chapter hides a golden key. |
| 4 | **Jar of reasons** | Tap or shake the phone to pull out a reason you love them. |
| 5 | **Make a wish** | Light four candles, one memory each, then blow them out for real (microphone) or press and hold. |
| 6 | **Lily bouquet** | Lilies grow and sway with your finger. Tap to grow more. |
| 7 | **The letter** | The four keys unlock an envelope, and your letter writes itself word by word. |
| 8 | **Heart of languages** | A heart fills with "I love you" in about 100 languages, then lifts into 3D. |
| 9 | **Heart tree** | A tree grows hearts. Includes four promise coupons and a hidden secret message. |

Also included: background music (built-in soft piano, or your own song), sound effects, vibration, the screen stays awake while it plays, protection against accidental back-swipes, link-preview image and app icons.

---

## 🚀 Quick start

### 1. Get your own copy
- **Recommended:** click **Use this template → Create a new repository** and set it to **Private** (your photos and letter are personal).
- Or click **Code → Download ZIP** and unzip it.

### 2. Make it yours: edit `config.js`
Open `config.js` in any text editor (Notepad, VS Code…). **Everything personal lives in this one file.**
Only change the text inside the quotes `" "` and keep the commas.

| Setting | What it changes |
|---|---|
| `HER_NAME`, `MY_NAME` | Their name and yours (used on many screens) |
| `code` | The lock-screen code (numbers only, any length) |
| `lockFirst`, `lockHints`, `lockEmpty` | Messages shown for wrong or empty codes. **Update the hints if you change the code!** |
| `music` | `""` = built-in piano, or `"music/your-song.mp3"` |
| `whatsapp` | Your number with country code, digits only (e.g. `"15551234567"`). Lets them tell you when they redeem a coupon. `""` hides it. |
| `lines` | Short sentences on each screen |
| `nicknames` | Your pet names. They appear in the rose and the 3D heart. |
| `chapters` | Your story: titles, text, photo captions, the note on the back of each photo, and which photo hides the key |
| `reasons` | The jar of reasons (add as many as you like) |
| `birthdays` | One memory per candle (4) |
| `letter` | Your letter: greeting, paragraphs, an optional right-to-left line (Urdu/Arabic/Persian), sign-off, signature |
| `couponsIntro`, `coupons` | The four promise coupons |
| `secret` | The hidden message (found by tapping their name 3 times on the last screen) |

### 3. Add your photos
Put **8 photos** in the `photos` folder with **exactly** these names:

| File | Where it shows |
|---|---|
| `spring-1.jpg`, `spring-2.jpg` | Chapter 1 · Spring |
| `monsoon-1.jpg` | Chapter 2 · the rainy window they wipe clean |
| `monsoon-2.jpg` | Chapter 2 · polaroid |
| `summer-1.jpg`, `summer-2.jpg` | Chapter 3 · Summer |
| `autumn-1.jpg`, `autumn-2.jpg` | Chapter 4 · Autumn |

Tips:
- Names are **case-sensitive** online: `Spring-1.jpg` will not work.
- Use JPG and resize to about **1200–1600 px** on the long side so it loads fast on phones.
- iPhone **.HEIC** photos must be converted to JPG first.
- A missing photo shows a soft placeholder with its file name, so you can see what's left.
- Want a different number of photos in a chapter? Add or remove `{ src: ..., caption: ..., note: ... }` lines in `config.js`.

### 4. (Optional) Add your song
Put an MP3 in the `music` folder, e.g. `music/our-song.mp3`, then set `music: "music/our-song.mp3"` in `config.js`. The song loops seamlessly with a crossfade, and short songs work too.

### 5. Test it on your computer
Run a tiny local web server inside the folder (needed for music and some features):

```bash
# in the folder that contains index.html
python -m http.server 8080
```
Then open **http://localhost:8080**. (VS Code's *Live Server* extension works too.)

**Shortcut for testing:** on `localhost` you can jump straight to any screen by adding its name to the address and reloading:
`#cupid` `#rose` `#story` `#jar` `#wish` `#lily` `#letter` `#heart` `#tree`
These shortcuts are switched off on the live site, so the lock can't be skipped.

The sample code is **142208**.

### 6. Put it online (free)

**Option A: Netlify (easiest, works with private repos)**
1. Log in at **app.netlify.com** (log in first, or the site expires).
2. **Add new site → Deploy manually** and drag the whole folder in.
3. **Site configuration → Change site name** to pick your link, e.g. `happy-birthday-xyz.netlify.app`.
4. To update later: **Deploys** → drag the folder in again.

**Option B: GitHub Pages (needs a public repo on a free account)**
1. In your repo: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
2. Your site will be at `https://YOUR-USERNAME.github.io/REPO-NAME/` after a minute.
3. ⚠️ A public repo means anyone can see your photos and letter. Prefer Netlify for anything personal.

### 7. Make the link preview work
Open `index.html` and replace `https://YOUR-SITE.netlify.app/` (in the `og:` and `twitter:` lines near the top) with your real site address, then deploy again. Now the link shows a nice preview card on WhatsApp and other apps.
You can also change the page title (`<title>…</title>`), and replace `og-image.jpg` (1200×630) and the icons.

Before sending, open the link on your own phone and go through every screen once.

---

## 🔒 Privacy: please read
- **Everything you deploy is public to anyone who has the link.** That includes your photos, your letter and `config.js`. The lock screen is part of the experience, **not real security**: the hints even reveal the code.
- So **only send the link to the person it's for**, and choose a site name that doesn't include their full name.
- Keep your repo **private** if it contains personal photos or text. Git keeps old versions too, so deleting a file later doesn't remove it from the history.
- Photos from phones often contain **GPS location** in their metadata. Remove it before uploading (most photo editors and online "EXIF remover" tools can do this).
- The site tells search engines not to index it (`robots.txt`, `noindex`).

---

## 💡 Good to know
- **Candles:** blowing uses the microphone. The phone asks for permission; if they say no, pressing and holding the cake also blows them out.
- **Jar:** shaking the phone pulls out a reason (some iPhones ask for motion permission first).
- **Coupons:** redeeming asks for a confirmation and is remembered on their device.
- **Languages:** a few phrases are written from a **male speaker** or to a **female reader** (e.g. Hindi *करता हूँ*, Urdu *کرتا ہوں*, Hausa *Ina son ki*). Change them in `js/s-heart.js` and `js/s-rose.js` if needed.
- **The number four** (four chapters, keys, candles and coupons) is built into the design. All the text around it is yours to change.
- Needs an internet connection (fonts and animation libraries load from a CDN).

---

## 📁 Files

```
index.html            page structure and styles
config.js             ← all your personal content
js/core.js            shared engine (scenes, particles, sound)
js/boot.js            start-up
js/s-*.js             one file per screen
photos/               ← your photos
music/                ← your song (optional)
og-image.jpg          link-preview image
icon-*.png, manifest  app icons ("Add to Home Screen")
_headers, robots.txt  hosting and privacy settings
```

---

## 🙏 Credits
- Animation: [GSAP](https://gsap.com) (loaded from cdnjs, under its own licence)
- Confetti: [canvas-confetti](https://github.com/catdad/canvas-confetti) (ISC)
- Fonts: [Google Fonts](https://fonts.google.com) (SIL Open Font License)

## 📄 License
[MIT](LICENSE) © 2026 shaheer-sa. Free to use, change and share. A star ⭐ is appreciated if it made someone smile.

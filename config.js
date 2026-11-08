/* =====================================================================
   EVERYTHING PERSONAL LIVES IN THIS FILE.
   Change any text inside the quotes. Keep the quotes and the commas.
   Everything below is sample text. Replace it with your own.
   ===================================================================== */

const HER_NAME = "Alex";   // the birthday person (shown on many screens)
const MY_NAME = "Sam";     // you (used for the signature and the WhatsApp button)

window.GIFT = {
  her: HER_NAME,
  me: MY_NAME,

  /* Lock screen code (numbers only, any length).
     Sample idea: 14 (their birthday) 22 (your birthday) 08 (your anniversary).
     If you change it, update lockHints below so the hints still make sense. */
  code: "142208",

  /* Background music.
     Leave "" to use the built-in soft piano.
     Or put your own song in the "music" folder and write its path, e.g. "music/our-song.mp3" */
  music: "",

  /* Your WhatsApp number with country code, digits only (e.g. "15551234567").
     When they redeem a coupon, a "tell you on WhatsApp" link appears. Leave "" to hide it. */
  whatsapp: "",

  /* ---------------- Screen 0: lock ---------------- */
  lockFirst: [                       // shown after the first wrong code
    "Nope, not that one. 😄",
    "See those little hearts? One number in each."
  ],
  lockHints: [                       // shown after each further wrong try (gets easier)
    "Three days that matter. Yours, mine, and ours.",
    "Only the day of each date. Your birthday first, then mine, then the day we became us.",
    "Okay, okay. It starts with 14. 🤍",
    "14 · 22 · 08. The three days I never forget."
  ],
  lockEmpty: "Type the numbers first. 😄",

  /* ---------------- Lines on different screens ---------------- */
  lines: {
    cupid: `for ${HER_NAME}, with all my heart`,
    cupidHint: "this heart is yours, tap it",
    roseCenter: "Forever Yours",
    rose: "Every word in this rose means the same thing, in a different language.",
    roseHint: "tap a word to see which language it's in",
    wishMake: "and make a wish.",
    wishDone: "Whatever you wished for, I hope it comes true. ❤️",
    lily1: "I wanted to give you flowers,",
    lily2: "so I grew you some.",
    lily3: "These ones will bloom forever.",
    letterSeal: "Now break the seal ♥",
    heart: "Love sounds different in every language. It means the same in all of them.",
    treeSmall: `and… this one is all for you, ${HER_NAME}`,
    treeMsg: "Every heart on this tree is a little reason I love you. Here's to many more birthdays together.",
    treeHint: "tap the tree ❤️ · psst, tap your name 3 times ✨"
  },

  /* Pet names / nicknames. They appear inside the word rose and the heart of languages.
     "meaning" is what shows when they tap the word on the rose. Add or remove lines freely. */
  nicknames: [
    { text: "My love", meaning: "what I call you" },
    { text: "Sunshine", meaning: "because you are" },
    { text: "Darling", meaning: "always" }
  ],

  /* ---------------- Screen 3: our story ----------------
     Four chapters (spring, monsoon, summer, autumn). Each chapter has photos;
     put your photos in the "photos" folder with these exact names, or change the names here.
     A missing photo shows a soft placeholder with its file name.
     "key" = which photo hides the golden key (0 = first photo). */
  chapters: [
    {
      season: "spring",
      eyebrow: "Chapter one · Spring",
      title: "The beginning",
      text: "It all started with a simple hello. I didn't know it yet, but that was the first page of my favourite story.",
      next: "then the rain came",
      key: 1,
      photos: [
        { src: "photos/spring-1.jpg", caption: "Where it all began", note: "The back of each photo holds a little note. Write a memory here." },
        { src: "photos/spring-2.jpg", caption: "Our first day", note: "The day everything changed, in the best way." }
      ]
    },
    {
      season: "monsoon",
      eyebrow: "Chapter two · Monsoon",
      title: "When the rain came",
      text: "Not every chapter was easy. There were long days and quiet nights, but we held on to each other through all of it.",
      next: "and then",
      key: 0,
      window: { src: "photos/monsoon-1.jpg", note: "Even on the cloudiest days, I was right here." },
      photos: [
        { src: "photos/monsoon-2.jpg", caption: "Words I wrote for you", note: "When I couldn't say it out loud, I wrote it down." }
      ]
    },
    {
      season: "summer",
      eyebrow: "Chapter three · Summer",
      title: "The sun came back",
      text: "Then the light found its way back. More laughter, longer talks, and the feeling that everything was going to be okay.",
      next: "and now",
      key: 1,
      photos: [
        { src: "photos/summer-1.jpg", caption: "that smile", note: "My favourite thing to see, every single time." },
        { src: "photos/summer-2.jpg", caption: "us, stronger", note: "Stronger together than we ever were apart." }
      ]
    },
    {
      season: "autumn",
      eyebrow: "Chapter four · Autumn",
      title: "Now",
      text: "Here we are today. Still growing, still learning, and I'd still choose you, every single time.",
      next: "keep going",
      key: 1,
      photos: [
        { src: "photos/autumn-1.jpg", caption: "my favourite photo of you", note: "I could look at this one forever." },
        { src: "photos/autumn-2.jpg", caption: "us, now", note: "And this is only the beginning." }
      ]
    }
  ],

  /* ---------------- Screen 4: jar of reasons ---------------- */
  reasons: [
    "The way you make ordinary days feel special.",
    "You listen, even when I ramble.",
    "You're kind to everyone, even when no one is watching.",
    "Your smile fixes my worst days.",
    "You cheer for my dreams like they're your own.",
    "You make me want to be a better person.",
    "Every good song reminds me of you now.",
    "You're my favourite person to do nothing with.",
    "You remember the little things.",
    "You make the hard days lighter.",
    "You're funny without even trying.",
    "Honestly? Everything. This jar is too small."
  ],

  /* ---------------- Screen 5: four candles, four birthdays ---------------- */
  birthdays: [
    { label: "Birthday #1", text: "Our first one together. I remember being nervous, excited, and so, so happy." },
    { label: "Birthday #2", text: "A little older, a little closer, and you were still the best part of my year." },
    { label: "Birthday #3", text: "Another year of inside jokes, late-night talks and growing together." },
    { label: "Birthday #4", text: "Today. This one couldn't fit in a box, so I made it for you instead." }
  ],

  /* ---------------- Screen 7: the letter ---------------- */
  letter: {
    greeting: `Dear ${HER_NAME},`,
    paragraphs: [
      "Happy birthday, my love.",
      "I've been thinking about what to say for days, and every draft came back to the same thing: I'm so glad you exist. Not just today, but on every ordinary day, every late-night conversation, every small moment that quietly turned into a memory.",
      "Thank you for your patience, your kindness, and the way you always seem to know exactly what I need, sometimes even before I do.",
      "I can't promise that every day will be perfect, but I can promise you this: I'll keep choosing you, celebrating you, and growing with you, one birthday at a time.",
      "So make a wish, eat too much cake, and remember how loved you are, today and every day after."
    ],
    urdu: "سالگرہ مبارک",            // optional line in Urdu/Arabic/Persian (right-to-left). Use "" to hide it.
    closing: "Happy birthday.",
    signoff: "Always yours,",
    signature: MY_NAME
  },

  /* ---------------- Screen 9: promise coupons ---------------- */
  couponsIntro: "Four little promises, ready whenever you want them.",
  coupons: [
    { title: "Breakfast in bed", text: "Any morning you choose. Coffee included." },
    { title: "Movie night, your pick", text: "No complaints, no skipping, snacks on me." },
    { title: "A whole day of yes", text: "Whatever you want to do, we do it." },
    { title: "One wish, granted", text: "Anything within reason. Okay, almost anything." }
  ],

  /* Hidden message: found by tapping their name 3 times on the last screen */
  secret: "You found the secret! Here's one more thing: you're my favourite surprise. Now go tap the tree again."
};

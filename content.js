// Single source of truth for portfolio content.
// Edit this file to update skills, projects, and links — no HTML rewrites needed.

window.SITE = {
  skills: [
    "React Native",
    "Expo",
    "TypeScript",
    "JavaScript",
    "Supabase",
    "PostgreSQL",
    "Node.js",
    "Python",
    "Rust",
    "C++",
    "HTML & CSS",
    "Git & GitHub",
  ],

  featured: [
    {
      title: "Click",
      desc: "AI-powered, topic-first social platform where users create and remix ideas into evolving conversation chains. Follow ideas, not people.",
      tags: ["TypeScript", "React Native", "Supabase"],
      href: "https://github.com/danielosinor123-gif/click",
      cover: "assets/click.svg",
      accent: "#ffd700",
    },
    {
      title: "DevHub",
      desc: "Where software projects become content. A demo-first platform for developers to showcase, share, and get AI-powered feedback on what they build.",
      tags: ["TypeScript", "AI Feedback"],
      href: "https://github.com/danielosinor123-gif/devhub",
      cover: "assets/devhub.svg",
      accent: "#ff8c42",
    },
    {
      title: "XV1 Adaptive AI Boss Mod",
      desc: "An adaptive AI overhaul for Dragon Ball Xenoverse 1. Bosses learn your playstyle, detect patterns, and evolve across six intelligence levels.",
      tags: ["C++", "Game Modding"],
      href: "https://github.com/danielosinor123-gif/XV1_AdaptiveAI_Boss_Mod",
      cover: "assets/xv1.svg",
      accent: "#ff6fae",
    },
    {
      title: "IntelHarvest",
      desc: "Competitive intelligence platform with web scraping, transcription, and AI-powered analysis.",
      tags: ["Python", "Web Scraping", "AI"],
      href: "https://github.com/danielosinor123-gif/intelharvest",
      cover: "assets/intelharvest.svg",
      accent: "#7ce7c4",
    },
  ],

  projects: [
    { title: "Taskflow", desc: "A standalone project — task and workflow tooling built with TypeScript.", tags: ["TypeScript"], href: "https://github.com/danielosinor123-gif/taskflow" },
    { title: "BlogEngine", desc: "A standalone blog engine project built with TypeScript.", tags: ["TypeScript"], href: "https://github.com/danielosinor123-gif/blogengine" },
    { title: "LinkForge", desc: "A standalone project — link and URL tooling built with TypeScript.", tags: ["TypeScript"], href: "https://github.com/danielosinor123-gif/linkforge" },
    { title: "EdgeGateway", desc: "A standalone edge gateway project written in Rust.", tags: ["Rust"], href: "https://github.com/danielosinor123-gif/edgegateway" },
    { title: "Rubrix", desc: "A Python project — tooling and experiments.", tags: ["Python"], href: "https://github.com/danielosinor123-gif/Rubrix" },
    { title: "Detrans", desc: "A JavaScript project — tooling and experiments.", tags: ["JavaScript"], href: "https://github.com/danielosinor123-gif/detrans" },
    { title: "CS50 Python Course", desc: "Work and projects completed while learning Python — variables, control flow, OOP, file handling, error handling, and practical applications.", tags: ["Python", "CS50"], href: "https://github.com/danielosinor123-gif/cs50.python-course" },
  ],

  contact: {
    email: "danielosinor123@gmail.com",
    phone: "+2349068332520",
    links: [
      { label: "Email", href: "mailto:danielosinor123@gmail.com" },
      { label: "Phone", href: "tel:+2349068332520" },
      { label: "GitHub", href: "https://github.com/danielosinor123-gif" },
      { label: "Twitter / X", href: "https://x.com/DMomoh96060" },
      { label: "Instagram", href: "https://instagram.com/momo.h413" },
    ],
  },

  // Contact form backend. Options:
  //  - "supabase": uses SUPABASE_URL + SUPABASE_ANON_KEY below
  //  - "formspree": uses FORMSPREE_ENDPOINT below
  //  - "emailjs": uses EMAILJS_* below (delivers straight to your inbox, no sender mail app needed)
  //  - "mailto": opens the user's mail client pre-filled (always works, no backend)
  formMode: "emailjs",
  EMAILJS_PUBLIC_KEY: "WCXOay1y-Se-94OU2",
  EMAILJS_SERVICE_ID: "service_j05bo1f",
  EMAILJS_TEMPLATE_ID: "template_v2djtj6",
  SUPABASE_URL: "https://ncmebnrbszlxhkrmvhxy.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbWVibnJic3pseGhrcm12aHh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjk1NDQsImV4cCI6MjA5NTgwNTU0NH0.LoXOQZlKHURUmgm3iXCYZa53Fg47_7oQBvrxmICdZ08",
  SUPABASE_TABLE: "contact_messages",
  FORMSPREE_ENDPOINT: "",
};

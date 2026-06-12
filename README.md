# AI SEO Scanner

> **The first SEO tool built for AI search engines** — ChatGPT, Claude, Perplexity.
> Input a URL, get a complete AI-readiness report in 60 seconds.

AI搜索正在全面取代传统搜索。**AI SEO Scanner** 帮你的网站在被 ChatGPT / Claude / Perplexity 引用之前抢得先机。

---

## ✨ Features

**4-Dimension AI-Readiness Audit (0-100 score)**

| Dimension | What it checks |
|---|---|
| **Schema Markup** (25) | JSON-LD completeness, Article/FAQ/Organization/Product schema |
| **Content** (25) | AI-citable structure, FAQ blocks, authoritative sourcing |
| **Technical** (25) | robots.txt AI bot rules, llms.txt, sitemap coverage |
| **Trust** (25) | E-E-A-T signals, author entities, citations |

**Free Scan**
- URL input → base score (0-100)
- 4 dimension breakdown
- Critical issue count

**Paid Full Report**
- Every issue with impact + fix + code example
- PDF export
- 30-day history

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Next.js 16 (App Router, React 18)      │
│  ├─ Landing page + URL scan UI          │
│  ├─ Report page (score + issues)        │
│  └─ User dashboard                      │
├─────────────────────────────────────────┤
│  Scan Engine (Puppeteer + Cheerio)      │
│  └─ Crawl + parse + score 4 dimensions  │
├─────────────────────────────────────────┤
│  Supabase (Postgres + Auth)             │
│  └─ users, scans, credits, payments     │
├─────────────────────────────────────────┤
│  LemonSqueezy (Payments)                │
│  └─ First offer $0.99 / Regular $9      │
└─────────────────────────────────────────┘
```

**Tech stack**: Next.js 16.2, React 18.3, TypeScript 5.4, Tailwind 3.4, Supabase JS 2.104, Puppeteer 22, Cheerio 1.0.

---

## 🚀 Quick Start

```bash
# 1. Clone & install
git clone https://github.com/phoenix7956/ai-seo-scanner.git
cd ai-seo-scanner
npm install

# 2. Set up env
cp .env.example .env.local
# Fill in Supabase + LemonSqueezy keys (see .env.example)

# 3. Initialize Supabase
# Run supabase/schema.sql in your Supabase SQL editor

# 4. Run
npm run dev
# Open http://localhost:3000
```

---

## 💰 Pricing Model

| Tier | Price | Credits |
|---|---|---|
| First scan | **FREE** | 1 |
| First purchase (new user) | **$0.99** | 5 |
| Regular pack | **$9** | 5 |

---

## 📂 Project Structure

```
ai-seo-scanner/
├── src/
│   ├── app/         # Next.js 16 App Router
│   ├── components/  # React UI
│   └── lib/         # Scan engine + Supabase client
├── supabase/
│   └── schema.sql   # DB schema
├── .github/
│   └── workflows/   # CI
├── SPEC.md          # Full product spec (zh)
├── .env.example     # Env template
└── package.json
```

---

## 🛣️ Roadmap

- [ ] **llms.txt** auto-generation (new AI-search standard)
- [ ] Perplexity citation tracking
- [ ] Multi-language support (zh / en)
- [ ] Team dashboard (compare competitors)
- [ ] API for agencies

---

## 🤝 Contributing

Issues + PRs welcome. Read [SPEC.md](./SPEC.md) for product context first.

---

## 📄 License

MIT

---

Built by [@phoenix7956](https://github.com/phoenix7956). Inspired by the question: *"When AI becomes the front door of the internet, will your website even be listed?"*

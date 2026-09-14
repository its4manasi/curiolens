# CurioLens starter

A minimal, low-cost publishing starter for short, credible stories supported by public data.

## Architecture

- **GitHub**: source code and Markdown articles
- **Cloudflare Pages**: static hosting and automatic deployments
- **Next.js**: site framework, configured as a static export
- **Public APIs**: data is fetched from the original source; the sample uses the World Bank Indicators API

This version does **not** require a database.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build the production site

```bash
npm run build
```

Next.js exports the finished static website to `out/`.

## Publish an article

Create a new `.md` file inside `content/articles/`:

```md
---
title: "Your title"
description: "One-line summary"
date: "2026-09-14"
category: "Science"
---

Your article text here.
```

To include the starter live World Bank data card, add:

```yaml
liveWorldBankIndicator: "SP.POP.TOTL"
worldBankCountry: "IND"
```

The data card is fetched in the reader's browser, so public data can update without storing the dataset in this repository.

## Deploy with GitHub + Cloudflare Pages

1. Create an empty GitHub repository.
2. Push this project to the repository.
3. In Cloudflare, go to **Workers & Pages → Create application → Pages → Import an existing Git repository**.
4. Select your GitHub repository.
5. Use the **Next.js (Static HTML Export)** preset.
6. Build command: `npx next build`
7. Build output directory: `out`
8. Deploy.

Cloudflare will give you a temporary `*.pages.dev` address. Every push to your production branch can trigger a new deployment.

## Long-term data approach

Keep articles separate from external data. Public APIs that need no secret key can be fetched directly. For APIs that need API keys, rate limiting or centralized caching, add a Cloudflare Worker as a data gateway later rather than exposing secrets in the browser.

Education data integration added.

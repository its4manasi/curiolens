import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const articlesDir = path.join(process.cwd(), 'content', 'articles');

export function getArticles() {
  return fs.readdirSync(articlesDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(articlesDir, name), 'utf8');
      const { data } = matter(raw);
      return { slug, ...data };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getArticle(slug) {
  const file = path.join(articlesDir, `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  return { slug, ...data, content };
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function fail(msg){
  console.error('[validate] ' + msg);
  process.exit(1);
}

function checkLessons(){
  const p = path.join(__dirname, '..', 'assets', 'lessons.json');
  const raw = fs.readFileSync(p, 'utf8');
  let data;
  try { data = JSON.parse(raw); } catch(e){ fail('assets/lessons.json is not valid JSON'); }
  if (typeof data.version !== 'number') fail('lessons.json: missing numeric version');
  if (!Array.isArray(data.lessons)) fail('lessons.json: lessons must be an array');
  for (const l of data.lessons){
    if (typeof l.id !== 'string') fail('lesson missing id');
    if (typeof l.number !== 'number') fail(`lesson ${l.id} missing number`);
    if (typeof l.title !== 'string') fail(`lesson ${l.id} missing title`);
    if (typeof l.minutes !== 'number') fail(`lesson ${l.id} missing minutes`);
    if (!Array.isArray(l.tags)) fail(`lesson ${l.id} missing tags array`);
  }
}

function checkLinks(){
  const files = [
    path.join(__dirname, '..', 'index.html'),
    path.join(__dirname, '..', 'parents.html'),
    path.join(__dirname, '..', 'lessons', 'index.html'),
    path.join(__dirname, '..', 'lessons', 'lesson.html'),
  ];
  const exists = (rel) => fs.existsSync(path.join(__dirname, '..', rel));
  const rels = new Set();
  for (const f of files){
    const html = fs.readFileSync(f, 'utf8');
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
    for (const h of hrefs){
      if (/^(https?:|mailto:|sms:)/i.test(h)) continue; // ignore external
      const rel = path.normalize(h.replace(/^\.\//,''));
      rels.add(rel);
    }
  }
  for (const r of rels){
    if (!exists(r)) fail(`Broken internal link: ${r}`);
  }
}

function main(){
  checkLessons();
  checkLinks();
  console.log('[validate] OK');
}

main();

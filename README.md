# NetPrep 364 – Test 2 study guide

Interactive lessons for SOFTENG 364 Test 2: Network Control, Link Layer, Security Introduction and Lab 4 (ICMP).
Step-by-step lessons with a demo on every step, a question bank, a timed mock test, a calculation lab and a cheat-sheet builder.

**Live site:** https://hazikchaudhry.github.io/netprep-364/

> Unofficial student project. Answers to past-test questions are the author's own working from the lecture slides, not an official answer key.
> No course files (slides, PDFs, past papers) are included in this repository.

## Run locally

```
npm install
npm run dev          # http://localhost:5173
npm run build:share  # one self-contained HTML file in share/index.html
```

Progress (lessons done, quiz history, cheat-sheet pins) is saved in your browser's local storage.

## Stack

React 19 · Vite · Tailwind CSS 4 · Framer Motion · lucide-react · canvas-confetti

## Layout

- `src/lessons/` – lesson text and steps, one file per module
- `src/demos/` – interactive widgets (Dijkstra, distance vector, BGP, CRC, switch learning, traceroute…)
- `src/data/questions.js` – multiple-choice question bank
- `src/data/cheatsheet.js` – facts for the cheat-sheet builder

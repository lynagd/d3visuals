# d3visuals

Practical work for the **Data Visualization (VD)** module. Each exercise is a small
[D3.js](https://d3js.org/) (v7) project that loads a CSV file and draws a chart in SVG.

Author: Lyna ([@lynagd](https://github.com/lynagd))

## Contents

| Folder | Chart(s) | Data |
|---|---|---|
| [`TP1`](./TP1) | 1st example | `named_colors_css.csv` |
| [`dotplot-barchart`](./dotplot-barchart) | Bar chart (`barchart.js`) and dot plot (`dotplot.js`) |  `us-cities.csv` |
| [`stacked barchart-densityplot`](./stacked%20barchart-densityplot) | Stacked bar chart (`index.js`) and overlapping density plot (`density.js`) | `titanic-data.csv` |
| [`boxplot`](./boxplot) | Boxplots of all numeric attributes, standardized | `abalone.csv` |


## How to run

The scripts load their CSV with `d3.csv('./file.csv')`, which the browser blocks when a page is
opened directly from the disk (`file://`). They need a local web server:

1. Open the repository folder in VS Code.
2. Install the **Live Server** extension (the "Go Live" button in the status bar).
3. Right-click the `index.html` (or `density.html`) of the exercise and choose
   **Open with Live Server**.

Any other static server works too, for example from the repository root:

```bash
python -m http.server 5001
```

then open `http://127.0.0.1:5001/boxplot/index.html` (replace the path for the other exercises).

D3 is loaded from a CDN (`cdnjs.cloudflare.com`), so an internet connection is required.

## Tech

- JavaScript (ES6), HTML, SVG
- [D3.js v7.9.0](https://d3js.org/)

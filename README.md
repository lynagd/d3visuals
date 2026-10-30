# d3visuals

Practical work (TP) for the **Data Visualization (VD)** module. Each exercise is a small
[D3.js](https://d3js.org/) (v7) project that loads a CSV file and draws a chart in SVG.

Author: Lyna ([@lynagd](https://github.com/lynagd))

## Contents

| Folder | Chart(s) | Data |
|---|---|---|
| [`dotplot-barchart`](./dotplot-barchart) | Bar chart (`barchart.js`) and dot plot (`dotplot.js`) | `named_colors_css.csv`, `us-cities.csv` |
| [`stacked barchart-densityplot`](./stacked%20barchart-densityplot) | Stacked bar chart (`index.js`) and overlapping density plot (`density.js`) | `titanic-data.csv` |
| [`boxplot`](./boxplot) | Boxplots of all numeric attributes, standardized | `abalone.csv` |

## Details

### Dot plot and bar chart (`dotplot-barchart`)
- `barchart.js` draws a bar chart, `dotplot.js` draws a dot plot.
- Both are loaded through the `index.html` of the folder.

### Stacked bar chart and density plot (`stacked barchart-densityplot`)
- **Stacked bar chart** (`index.html` + `index.js`): Titanic passengers, stacked by gender.
- **Density plot** (`density.html` + `density.js`): overlapping density curves of the age of
  male and female passengers.
  - Kernel density estimation written by hand: Gaussian kernel, bandwidth = 3,
    evaluated every 0.5 year from 0 to 80.
  - The two curves are semi-transparent so both stay visible.

### Boxplot (`boxplot`)
- One boxplot per numeric column of the abalone dataset, side by side.
- The numeric columns are detected from the data (`data.columns`), nothing is hard-coded.
- The data is used exactly as it is in the CSV (no filtering).
- Every column is **standardized** (z-score) so that attributes with very different scales
  (Height ~0.1, Rings ~10) can share one axis.
- Box = interquartile range (Q1 to Q3), solid line = median, dashed line = mean.
- Whiskers stop at the last point within 1.5 x IQR; points beyond are drawn as outliers.
- The y-axis is fixed to [-5, 7]. Height has two extreme outliers (z of about 9 and 24) that would
  flatten all the other boxes, so outliers outside this range are not drawn.

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

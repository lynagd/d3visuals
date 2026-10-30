const main = (container) => {
  const data_csv = d3.csv('./abalone.csv');
  data_csv.then((data) => {
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 560)
    svg.style('background', 'white');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 30, right: 40, bottom: 60, left: 70 };

    const attributes = data.columns.filter((column) => !isNaN(+data[0][column]));
    console.log(attributes);

    // the attributes have very different scales (0.1 for Height, 30 for Rings),
    // so each one is standardized: z = (value - mean) / standard deviation
    const stats = attributes.map((attribute) => {
        const raw = data.map((d) => +d[attribute]);
        const mean = d3.mean(raw);
        const sd = d3.deviation(raw);
        const values = raw.map((v) => (v - mean) / sd).sort(d3.ascending);

        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        // the whiskers stop at the last point within 1.5 x the interquartile range
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;
        return {
          attribute: attribute,
          mean: 0,                                  // after standardizing, the mean of every column is 0
          q1: q1,
          median: median,
          q3: q3,
          min: d3.min(values.filter((v) => v >= lowerFence)),
          max: d3.max(values.filter((v) => v <= upperFence)),
          outliers: values.filter((v) => v < lowerFence || v > upperFence)
        };
      }
    );

    console.log(stats);

    // scales
    // fixed domain: Height has two extreme outliers (z = 9 and z = 24) that would
    // squash every box. Outliers outside the domain are simply not drawn.
    const yDomain = [-5, 7];

    const xScale = d3.scaleBand()
                     .domain(attributes)
                     .range([margin.left, width - margin.right])
                     .padding(0.35);

    const yScale = d3.scaleLinear()
                     .domain(yDomain)
                     .range([height - margin.bottom, margin.top]);

    const dataset = stats.map((d) => ({
        x: xScale(d.attribute) + xScale.bandwidth() / 2,     // center of the box
        boxWidth: xScale.bandwidth(),
        yQ1: yScale(d.q1),
        yMedian: yScale(d.median),
        yMean: yScale(d.mean),
        yQ3: yScale(d.q3),
        yMin: yScale(d.min),
        yMax: yScale(d.max),
        outliers: d.outliers
                   .filter((v) => v >= yDomain[0] && v <= yDomain[1])
                   .map((v) => yScale(v)),
        attribute: d.attribute
      })
    )

    // horizontal grid lines
    const yTicks = d3.range(yDomain[0], yDomain[1] + 1, 1);

    // axes
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickValues(yTicks));

    // axis title
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(margin.top + height - margin.bottom) / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Attribute values (standardized)');

    // boxplots: one group per attribute, moved to the center of its box
    const groups = svg.selectAll('g.box')
                      .data(dataset)
                      .join('g')
                      .attr('class', 'box')
                      .attr('transform', (d) => `translate(${d.x}, 0)`)

    // whisker: vertical line from min to max
    groups.append('line')
        .attr('y1', (d) => d.yMin)
        .attr('y2', (d) => d.yMax)
        .attr('stroke', 'black')

    // whisker caps (as wide as the box)
    groups.append('line')
        .attr('x1', (d) => -d.boxWidth / 2)
        .attr('x2', (d) => d.boxWidth / 2)
        .attr('y1', (d) => d.yMin)
        .attr('y2', (d) => d.yMin)
        .attr('stroke', 'black')

    groups.append('line')
        .attr('x1', (d) => -d.boxWidth / 2)
        .attr('x2', (d) => d.boxWidth / 2)
        .attr('y1', (d) => d.yMax)
        .attr('y2', (d) => d.yMax)
        .attr('stroke', 'black')

    // the box: from q1 to q3 (the interquartile range)
    groups.append('rect')
        .attr('x', (d) => -d.boxWidth / 2)
        .attr('y', (d) => d.yQ3)
        .attr('width', (d) => d.boxWidth)
        .attr('height', (d) => d.yQ1 - d.yQ3)
        .attr('fill', '#f58f0a')
        .attr('fill-opacity', 0.6)
        .attr('stroke', 'black')

    // median: solid line
    groups.append('line')
        .attr('x1', (d) => -d.boxWidth / 2)
        .attr('x2', (d) => d.boxWidth / 2)
        .attr('y1', (d) => d.yMedian)
        .attr('y2', (d) => d.yMedian)
        .attr('stroke', 'black')
        .attr('stroke-width', 2)

    // mean: dashed line
    groups.append('line')
        .attr('x1', (d) => -d.boxWidth / 2)
        .attr('x2', (d) => d.boxWidth / 2)
        .attr('y1', (d) => d.yMean)
        .attr('y2', (d) => d.yMean)
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4')

    // outliers: points further away than the whiskers
    groups.selectAll('circle')
        .data((d) => d.outliers)
        .join('circle')
        .attr('cy', (d) => d)
        .attr('r', 3)
        .attr('fill', 'black')
        .attr('fill-opacity', 0.5)
  })
}

const container = document.getElementById('container');
main(container);
const main = (container) => {
  const data_csv = d3.csv('./coffee_analysis.csv');
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 800)
                  .attr('height', 500)
    svg.style('background', 'white');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 30, right: 170, bottom: 30, left: 30 };   // the legend goes in the right margin

    // number of coffees per roast; an empty roast is counted as 'Unknown'
    // (d3.rollup keeps the groups in the order they first appear in the csv)
    const counts = d3.rollup(
      data,
      (rows) => rows.length,
      (d) => d.roast.trim() === '' ? 'Unknown' : d.roast.trim()
    );
    const roasts = Array.from(counts, ([roast, count]) => ({ roast: roast, count: count }));
    console.log(roasts);

    // one color per roast
    const color = d3.scaleOrdinal()
                    .domain(roasts.map((d) => d.roast))
                    .range(d3.schemeSet3);

    // the pie is centered in the space left of the legend
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;
    const centerX = margin.left + (width - margin.left - margin.right) / 2;
    const centerY = height / 2;

    // d3.pie turns the counts into angles (sort(null) keeps the csv order)
    const pie = d3.pie()
                  .sort(null)
                  .value((d) => d.count);
    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(radius);

    const slices = svg.append('g')
                      .attr('transform', `translate(${centerX}, ${centerY})`)
                      .selectAll('path')
                      .data(pie(roasts))
                      .join('path')
                      .attr('d', arc)
                      .attr('fill', (d) => color(d.data.roast))
                      .attr('stroke', 'white')
                      .attr('stroke-width', 1.5)

    // hovering a slice shows its count and share
    slices.append('title')
        .text((d) => `${d.data.roast}: ${d.data.count} (${d3.format('.1%')(d.data.count / data.length)})`);

    // legend
    const legend = svg.selectAll('g.legend')
                      .data(roasts)
                      .join('g')
                      .attr('class', 'legend')
                      .attr('transform', (d, i) => `translate(${width - margin.right + 30}, ${height / 2 - roasts.length * 11 + i * 22})`)

    legend.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', (d) => color(d.roast))

    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '13px')
        .text((d) => d.roast)
  })
}

const container = document.getElementById('container');
main(container);
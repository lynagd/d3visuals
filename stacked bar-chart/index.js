const main = (container) => {
  d3.csv('./titanic-data.csv').then((data) => {
    const width = 960, height = 500;
    const margin = { top: 20, right: 100, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(container)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width)
      .attr('height', height);

    const genders = Array.from(new Set(data.map((d) => d.Gender)));
    const color = d3.scaleOrdinal(d3.schemeSet2).domain(genders);

    const grouped = Array.from(d3.group(data, (d) => d.Pclass, (d) => d.Gender))
      .sort((a, b) => d3.ascending(a[0], b[0]));

    const series = d3.stack()
      .keys(color.domain())
      .value(([, byGender], g) => byGender.get(g)?.length ?? 0)(grouped);

    const x = d3.scaleBand()
      .domain(grouped.map((d) => d[0]))
      .range([0, innerW])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, (s) => d3.max(s, (d) => d[1]))])
      .nice()
      .range([innerH, 0]);

    const g = svg.selectAll('g.chart')
      .data([null])
      .join('g')
      .attr('class', 'chart')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.selectAll('g.layer')
      .data(series)
      .join('g')
      .attr('class', 'layer')
      .attr('fill', (d) => color(d.key))
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => x(d.data[0]))
      .attr('y', (d) => y(d[1]))
      .attr('height', (d) => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth());

    g.selectAll('g.x-axis').data([null]).join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(x));

    g.selectAll('g.y-axis').data([null]).join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    svg.selectAll('text.x-label').data([null]).join('text')
      .attr('class', 'x-label')
      .attr('x', margin.left + innerW / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Class');

    svg.selectAll('text.y-label').data([null]).join('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerH / 2))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Number of passengers');

    const legend = svg.selectAll('g.legend')
      .data(color.domain())
      .join('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${width - margin.right + 15}, ${margin.top + i * 22})`);

    legend.selectAll('rect').data((d) => [d]).join('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', (d) => color(d));

    legend.selectAll('text').data((d) => [d]).join('text')
      .attr('x', 22)
      .attr('y', 13)
      .text((d) => d);
  });
};

const container = document.getElementById('container');
main(container);
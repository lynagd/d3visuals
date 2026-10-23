const main = (container) => {
  const data_csv = d3.csv('./us-cities.csv');
  console.log(data_csv);
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 1100)
    svg.style('background', 'white');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 30, right: 30, bottom: 50, left: 160 };

    const cities = data.map((d) => ({
        name: d.place.replace(/ (city|metro).*$/, ''),
        population: +d.population
      })
    ).sort((a, b) => b.population - a.population);

    // scales
    const xScale = d3.scaleLinear()
                     .domain([0, d3.max(cities, (d) => d.population)])
                     .nice()
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
                     .domain(cities.map((d) => d.name))
                     .range([margin.top, height - margin.bottom])
                     .padding(0.2);

    const dataset = cities.map((d) => ({
        x: xScale(0),
        y: yScale(d.name),
        barWidth: xScale(d.population) - xScale(0),
        barHeight: yScale.bandwidth(),
        name: d.name,
        population: d.population
      })
    )

    console.log(dataset);

    // axes
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(8, '~s'));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.append('text')
        .attr('x', (margin.left + width - margin.right) / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Population');

    // bars
    const groups = svg.selectAll('g.bar')
                      .data(dataset)
                      .join('g')
                      .attr('class', 'bar')
                      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    groups.append('rect')
        .attr('width', (d) => d.barWidth)
        .attr('height', (d) => d.barHeight)
        .attr('fill', 'teal')
  })
}

const container = document.getElementById('container');
main(container);
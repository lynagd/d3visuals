const main = (container) => {
  const data_csv = d3.csv('./titanic-data.csv');
  console.log(data_csv);
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 500)
    svg.style('background', 'white');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 30, right: 120, bottom: 60, left: 70 };

    const passengers = data.map((d) => ({
    gender: d.Gender,
    age: +d.Age}));

    console.log(passengers.length);

    const genders = d3.sort(Array.from(new Set(passengers.map((d) => d.gender))), d3.descending);
    const color = d3.scaleOrdinal()
                    .domain(genders)
                    .range(['#1f77b4', '#e6550d']);

    const bandwidth = 3;
    const kernel = (t) => Math.exp(-0.5 * t * t) / Math.sqrt(2 * Math.PI);
    const kde = (ages, x) => d3.sum(ages, (xi) => kernel((x - xi) / bandwidth))
                           / (ages.length * bandwidth);

    // the values of x where we estimate the density (every 0.5 year)
    const minAge = Math.floor(d3.min(passengers, (d) => d.age) / 10) * 10;
    const maxAge = Math.ceil(d3.max(passengers, (d) => d.age) / 10) * 10;
    const xValues = d3.range(minAge, maxAge + 0.5, 0.5);

    const grouped = d3.group(passengers, (d) => d.gender);
    const estimates = genders.map((gender) => {
        const ages = grouped.get(gender).map((d) => d.age);
        const share = ages.length / passengers.length;
        return {
          gender: gender,
          points: xValues.map((age) => ({
              age: age,
              density: kde(ages, age)
            })
          )
        };
      }
    )

    // scales
    const maxDensity = d3.max(estimates, (e) => d3.max(e.points, (p) => p.density));

    const xScale = d3.scaleLinear()
                     .domain([minAge, maxAge])
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, Math.ceil(maxDensity / 0.01) * 0.01])
                     .range([height - margin.bottom, margin.top]);

    const dataset = estimates.map((e) => ({
        gender: e.gender,
        points: e.points.map((p) => ({
            x: xScale(p.age),
            y: yScale(p.density)
          })
        )
      })
    )

    console.log(dataset);

    // horizontal grid lines
    const yTicks = d3.range(0, yScale.domain()[1] + 0.001, 0.01);  
    svg.append('g')
        .selectAll('line')
        .data(yTicks)
        .join('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#ddd');

    // axes
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(8));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickValues(yTicks).tickFormat(d3.format('.2f')));

    // axis titles
    svg.append('text')
        .attr('x', (margin.left + width - margin.right) / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('age (years)');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(margin.top + height - margin.bottom) / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('scaled density');

    const groups = svg.selectAll('g.density')
                      .data(dataset)
                      .join('g')
                      .attr('class', 'density')

    groups.append('path')
        .attr('d', (d) => d3.area()
                            .x((p) => p.x)
                            .y0(height - margin.bottom)
                            .y1((p) => p.y)(d.points))
        .attr('fill', (d) => color(d.gender))
        .attr('fill-opacity', 0.6)

    groups.append('path')
        .attr('d', (d) => d3.line()
                            .x((p) => p.x)
                            .y((p) => p.y)(d.points))
        .attr('fill', 'none')
        .attr('stroke', (d) => color(d.gender))
        .attr('stroke-width', 1.5)

    // legend
    const legend = svg.selectAll('g.legend')
                      .data(genders)
                      .join('g')
                      .attr('class', 'legend')
                      .attr('transform', (d, i) => `translate(${width - margin.right + 20}, ${margin.top + 20 + i * 22})`)

    svg.append('text')
        .attr('x', width - margin.right + 20)
        .attr('y', margin.top + 8)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('gender');

    legend.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', (d) => color(d))
        .attr('fill-opacity', 0.6)

    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .text((d) => d)
  })
}

const container = document.getElementById('container');
main(container);
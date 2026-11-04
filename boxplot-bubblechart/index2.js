const main = (container) => {
  const data_csv = d3.csv('./abalone.csv');
  console.log(data_csv);
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')
                  .data([null])
                  .join('svg')
                  .attr('width', 960)
                  .attr('height', 540)
    svg.style('background', 'white');

    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const margin = { top: 30, right: 150, bottom: 60, left: 70 };

    // names shown in the legend (the csv only contains M, F, I)
    const names = { M: 'Male', F: 'Female', I: 'Infant' };

    // the csv ends with an empty row, so we keep only the rows with a sex,
    // and only the first 100 abalones (4177 bubbles would overlap too much)
    const abalones = data.filter((d) => d.Sex !== '').slice(0, 100).map((d) => ({
        sex: d.Sex,
        length: +d.Length,
        height: +d.Height,
        rings: +d.Rings
      })
    )
    console.log(abalones.length);

    // the sexes come from the data
    const sexes = Array.from(new Set(abalones.map((d) => d.sex)));
    const color = d3.scaleOrdinal(d3.schemeDark2).domain(sexes);

    // scales
    const xScale = d3.scaleLinear()
                     .domain(d3.extent(abalones, (d) => d.length))
                     .nice()
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(abalones, (d) => d.height)])
                     .nice()
                     .range([height - margin.bottom, margin.top]);

    // the AREA of a bubble is proportional to the number of rings, so we use a sqrt scale
    const rScale = d3.scaleSqrt()
                     .domain(d3.extent(abalones, (d) => d.rings))
                     .range([3, 14]);

    const dataset = abalones.map((d) => ({
        x: xScale(d.length),
        y: yScale(d.height),
        r: rScale(d.rings),
        color: color(d.sex),
        sex: d.sex,
        length: d.length,
        height: d.height,
        rings: d.rings
      })
    ).sort((a, b) => b.r - a.r);   // big bubbles first, so the small ones stay on top

    console.log(dataset);

    // axes
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // axis titles
    svg.append('text')
        .attr('x', (margin.left + width - margin.right) / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .text('Length');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(margin.top + height - margin.bottom) / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .text('Height');

    // bubbles
    const groups = svg.selectAll('g.bubble')
                      .data(dataset)
                      .join('g')
                      .attr('class', 'bubble')
                      .attr('transform', (d) => `translate(${d.x}, ${d.y})`)

    groups.append('circle')
        .attr('r', (d) => d.r)
        .attr('fill', (d) => d.color)
        .attr('fill-opacity', 0.7)

    // legend 1: color = sex
    const legendSex = svg.selectAll('g.legend-sex')
                         .data(sexes)
                         .join('g')
                         .attr('class', 'legend-sex')
                         .attr('transform', (d, i) => `translate(${width - margin.right + 30}, ${margin.top + 20 + i * 22})`)

    svg.append('text')
        .attr('x', width - margin.right + 30)
        .attr('y', margin.top + 8)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')

    legendSex.append('rect')
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', (d) => color(d))
        .attr('fill-opacity', 0.7)

    legendSex.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .text((d) => names[d] || d)

    // legend 2: size = rings (smallest, middle and biggest value of the data)
    const minRings = d3.min(abalones, (d) => d.rings);
    const maxRings = d3.max(abalones, (d) => d.rings);
    const sizeValues = [minRings, Math.round((minRings + maxRings) / 2), maxRings];

    svg.append('text')
        .attr('x', width - margin.right + 30)
        .attr('y', margin.top + 150)
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')

    const legendSize = svg.selectAll('g.legend-size')
                          .data(sizeValues)
                          .join('g')
                          .attr('class', 'legend-size')
                          .attr('transform', (d, i) => `translate(${width - margin.right + 40}, ${margin.top + 180 + i * 36})`)

    legendSize.append('circle')
        .attr('r', (d) => rScale(d))
        .attr('fill', 'grey')
        .attr('fill-opacity', 0.7)

    legendSize.append('text')
        .attr('x', 28)
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .text((d) => d)

    // tooltip: a small text written next to the bubble we hover
    const tooltip = svg.append('text')
                       .attr('font-size', '12px')
                       .attr('font-weight', 'bold')
                       .attr('fill', 'black')
                       .attr('stroke', 'white')          // white outline so the text stays readable
                       .attr('stroke-width', 3)
                       .attr('paint-order', 'stroke')
                       .attr('pointer-events', 'none')
                       .style('display', 'none')

    groups.on('mouseover', function (event, d) {
            d3.select(this).select('circle').attr('stroke', 'black').attr('stroke-width', 1.5);
            tooltip.style('display', null)
                   .text(`Length: ${d.length}, Height: ${d.height}, Rings: ${d.rings}`);
          })
          .on('mousemove', function (event, d) {
            const [mx, my] = d3.pointer(event, svg.node());
            tooltip.attr('x', mx + 12)
                   .attr('y', my - 12)
                   .attr('text-anchor', mx > width - margin.right - 220 ? 'end' : 'start');
            if (mx > width - margin.right - 220) tooltip.attr('x', mx - 12);
          })
          .on('mouseout', function () {
            d3.select(this).select('circle').attr('stroke', null);
            tooltip.style('display', 'none');
          })
  })
}

const container = document.getElementById('container');
main(container);
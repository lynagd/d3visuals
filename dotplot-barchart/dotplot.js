const main = (container) => {
  const data_csv = d3.csv('./us-cities.csv');
  console.log(data_csv);
  data_csv.then((data) => {
    console.log(data.length);
    const svg = d3.select(container)
                  .selectAll('svg')//creates one <svg> if none exists, and reuses it if it does. This avoids duplicates if the code runs twice. 
                  .data([null])
                  .join('svg')
                  .attr('width', 1700)
                  .attr('height', 1100)//set the size in pixels.
    svg.style('background', 'white');

    const width = +svg.attr('width');//svg.attr('width') returns text (“1700”), and the + converts it to a number
    const height = +svg.attr('height');
    const margin = { top: 30, right: 60, bottom: 50, left: 160 };//The margin object reserves empty space around the plot for the axes and labels

    const cities = data.map((d) => ({//data.map(...) builds a new array with one object per city.
        name: d.place.replace(/ (city|metro).*$/, ''),
        population: +d.population
      })
    ).sort((a, b) => b.population - a.population);

    // scales
    const minPop = d3.min(cities, (d) => d.population);
    const maxPop = d3.max(cities, (d) => d.population);

    const xScale = d3.scaleLinear()//A scale converts a data value into a pixel position.
                     .domain([
                       Math.floor(minPop / 250000) * 250000,   // 365,438 → 250,000
                       Math.ceil(maxPop / 500000) * 500000     // 8,175,133 → 8,500,000
                     ])
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scalePoint()//scalePoint is for categories (the city names). It gives each name an evenly spaced position from top to bottom
                     .domain(cities.map((d) => d.name))
                     .range([margin.top, height - margin.bottom])
                     .padding(0.5);//leaves half a step of empty space at the top and bottom so the first and last dots aren’t stuck to the edges.

    const dataset = cities.map((d) => ({
        x: xScale(d.population),//computes the pixel position x (from the population)
        y: yScale(d.name),//y (from the name)
        name: d.name,//keeps the names from  the original data for later use
        population: d.population
      })
    )

    console.log(dataset);

    // axes
    // ticks every 250k: 250k, 500k, 750k, 1M, 1.25M, ...
    const xTicks = d3.range(250000, xScale.domain()[1] + 1, 250000);//d3.range(start, stop, step),The + 1 makes sure the last value (8,500,000) is included, since d3.range stops before stop. These are the positions of the labels and grid lines.

    // vertical grid lines
    svg.append('g')//each line is 2 points (x1, y1) to (x2, y2)
        .selectAll('line')
        .data(xTicks)
        .join('line')
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('stroke', '#ddd');

    // x axis
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale)
                .tickValues(xTicks)
                .tickFormat(d3.format('~s')));

    // y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // x axis title
    svg.append('text')
        .attr('x', (margin.left + width - margin.right) / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Population');

    // y axis title
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(margin.top + height - margin.bottom) / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('City');
        
    // dots
    const groups = svg.selectAll('g.dot')
                      .data(dataset)
                      .join('g')
                      .attr('class', 'dot')
                      .attr('transform', d => `translate(${d.x}, ${d.y})`)

    groups.append('circle')
        .attr('r', 5)
        .attr('fill', 'steelblue')
  })
}

const container = document.getElementById('container');
main(container);
url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
const fetchJson = fetch(url).then(response => response.json())

width = 940
height = 600
padding = 90

const yearParser = d3.timeParse('%Y')
const timeParser = d3.timeParse('%M:%S')
const yearFormat = d3.timeFormat('%Y');
const timeFormat = d3.timeFormat('%M:%S');

fetchJson.then(dataset => {

    // Scales
    const minDate = d3.min(dataset, d => yearParser(d.Year));
    const maxDate = d3.max(dataset, d => yearParser(d.Year));
    // Start the scale a little before and after the data
    const adjustedMinDate = d3.timeYear.offset(minDate, -1);
    const adjustedMaxDate = d3.timeYear.offset(maxDate, 2);
    let xScale = d3.scaleTime()
        .domain([adjustedMinDate, adjustedMaxDate])
        .range([padding, width - padding])

    let yScale = d3.scaleLinear()
        .domain([d3.max(dataset, d => timeParser(d.Time)), d3.min(dataset, d => timeParser(d.Time))])
        .range([height - padding, padding])

    // HTML Elements
    const tooltip = d3.select('#chart-container')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)

    const svg = d3.select('#chart-container')
        .append('svg')
        .attr('viewBox', '0 0 ' + width + ' ' + height)

    // Title
    svg.append('text')
        .attr('x', (width / 2))
        .attr('y', padding / 2)
        .attr('text-anchor', 'middle')
        .attr('id', 'title')
        .text('Doping in Professional Bicycle Racing');

    // Axes
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(yearFormat)
        .ticks(d3.timeYear.every(2))
        .tickSizeOuter(0)
    svg.append('g')
        .attr('transform', 'translate(0, ' + (height - padding) + ')')
        .attr('id', 'x-axis')
        .call(xAxis)

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(timeFormat)
        .tickSizeOuter(0)
    svg.append('g')
        .attr('transform', 'translate(' + padding + ', 0)')
        .attr('id', 'y-axis')
        .call(yAxis)
    svg.append('text')
        .attr('id', 'y-axis-label')
        .attr('transform', 'translate(' + (padding - 70) + ',' + height / 2 + ') rotate(-90)')
        .text('Time in Minutes')

    // Legend
    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', 'translate(600, 200)');

    const categories = ['No doping allegations', 'Riders with doping allegations'];
    const legendItems = legend.selectAll('.legend-item')
        .data(categories)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`)

    const legendRectSize = 18
    const legendColorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(['white', 'orange']);

    legendItems.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('rx', '5')
        .attr('ry', '5')
        .attr('fill', d => legendColorScale(d))

    const legendLabelOffset = 5

    legendItems.append('text')
        .attr('x', legendRectSize + legendLabelOffset)
        .attr('y', legendRectSize * 0.8)
        .attr('font-size', '1rem')
        .text(d => d);

    // Plot data
    svg.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(yearParser(d.Year)))
        .attr('cy', d => yScale(timeParser(d.Time)))
        .attr('data-xvalue', d => yearParser(d.Year))
        .attr('data-yvalue', d => timeParser(d.Time))
        .attr('r', 7)
        .attr('fill', d => d.Doping === '' ? 'white' : 'orange')
        .attr('stroke', 'black')
        .attr('class', 'dot')
        // Show tooltip on mouseover
        .on('mouseover', (event, d) => {
            const dopingNote = d.Doping === '' ? '' : '<br><br>' + d.Doping
            tooltip
                .html(d.Name + ': ' + d.Nationality + '<br>Year: ' + d.Year + ', Time: ' + d.Time + dopingNote)
                .attr('data-year', yearParser(d.Year))
                .style('opacity', 0.9)
                .style('left', event.x + 'px')
                .style('top', event.y + 'px')
        })
        .on('mouseout', function (e) {
            tooltip.style('opacity', 0);
        })

    // Move axes to foreground
    d3.select('#x-axis').raise()
    d3.select('#y-axis').raise()

})
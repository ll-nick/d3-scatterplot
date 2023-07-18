class ScatterPlotter {
    constructor(dataset, options) {
        // Store input
        if (!dataset || !options || !options.width || !options.height || !options.padding) {
            throw new Error('Invalid parameters: dataset and options with width, height, and padding are required.');
        }
        this.dataset = dataset
        this.width = options.width
        this.height = options.height
        this.padding = options.padding

        // Constants
        this.dotRadius = 7
        this.noDopingColor = 'white'
        this.dopingColor = 'orange'
        this.legendLabelOffset = 5
        this.legendRectSize = 18
        this.legendFontSize = '1rem'
        this.yearParser = d3.timeParse('%Y')
        this.timeParser = d3.timeParse('%M:%S')
        this.yearFormat = d3.timeFormat('%Y');
        this.timeFormat = d3.timeFormat('%M:%S');

        this.#createXScale()
        this.#createYScale()
        this.#createHTMLElements()

    }

    plot() {
        this.#createTitle()
        this.#createAxes()
        this.#createLegend()
        this.#plotData()
        this.#moveAxesToForeground()
    }

    #createXScale() {
        const minDate = d3.min(this.dataset, d => this.yearParser(d.Year));
        const maxDate = d3.max(this.dataset, d => this.yearParser(d.Year));
        // Start the scale a little before and after the data
        const adjustedMinDate = d3.timeYear.offset(minDate, -1);
        const adjustedMaxDate = d3.timeYear.offset(maxDate, 2);
        this.xScale = d3.scaleTime()
            .domain([adjustedMinDate, adjustedMaxDate])
            .range([this.padding, this.width - this.padding])
    }

    #createYScale() {
        this.yScale = d3.scaleLinear()
            .domain([d3.max(this.dataset, d => this.timeParser(d.Time)), d3.min(this.dataset, d => this.timeParser(d.Time))])
            .range([this.height - this.padding, this.padding])
    }

    #createHTMLElements() {
        this.tooltip = new Tooltip();

        this.svg = d3.select('#chart-container')
            .append('svg')
            .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
    }

    #createTitle() {
        this.svg.append('text')
            .attr('x', (this.width / 2))
            .attr('y', this.padding / 2)
            .attr('text-anchor', 'middle')
            .attr('id', 'title')
            .text('Doping in Professional Bicycle Racing');
    }

    #createAxes() {
        let xAxis = d3.axisBottom(this.xScale)
            .tickFormat(this.yearFormat)
            .ticks(d3.timeYear.every(2))
            .tickSizeOuter(0)
        this.svg.append('g')
            .attr('transform', 'translate(0, ' + (this.height - this.padding) + ')')
            .attr('id', 'x-axis')
            .call(xAxis)

        let yAxis = d3.axisLeft(this.yScale)
            .tickFormat(this.timeFormat)
            .tickSizeOuter(0)
        this.svg.append('g')
            .attr('transform', 'translate(' + this.padding + ', 0)')
            .attr('id', 'y-axis')
            .call(yAxis)
        this.svg.append('text')
            .attr('id', 'y-axis-label')
            .attr('transform', 'translate(' + (this.padding - 70) + ',' + this.height / 2 + ') rotate(-90)')
            .text('Time in Minutes')
    }

    #createLegend() {
        const legend = this.svg.append('g')
            .attr('id', 'legend')
            .attr('transform', 'translate(600, 200)');

        const categories = ['No doping allegations', 'Riders with doping allegations'];
        const legendItems = legend.selectAll('.legend-item')
            .data(categories)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`)


        const legendColorScale = d3.scaleOrdinal()
            .domain(categories)
            .range([this.noDopingColor, this.dopingColor]);

        legendItems.append('rect')
            .attr('width', this.legendRectSize)
            .attr('height', this.legendRectSize)
            .attr('rx', '5')
            .attr('ry', '5')
            .attr('fill', d => legendColorScale(d))

        legendItems.append('text')
            .attr('x', this.legendRectSize + this.legendLabelOffset)
            .attr('y', this.legendRectSize * 0.85)
            .attr('font-size', this.legendFontSize)
            .text(d => d);
    }

    #plotData() {

        this.svg.selectAll('circle')
            .data(this.dataset)
            .enter()
            .append('circle')
            .attr('cx', d => this.xScale(this.yearParser(d.Year)))
            .attr('cy', d => this.yScale(this.timeParser(d.Time)))
            .attr('data-xvalue', d => this.yearParser(d.Year))
            .attr('data-yvalue', d => this.timeParser(d.Time))
            .attr('r', this.dotRadius)
            .attr('fill', d => d.Doping === '' ? this.noDopingColor : this.dopingColor)
            .attr('stroke', 'black')
            .attr('class', 'dot')
            .on('mouseover', (event, d) => {
                const dopingNote = d.Doping === '' ? '' : '<br><br>' + d.Doping;
                const tooltipContent = d.Name + ': ' + d.Nationality + '<br>Year: ' + d.Year + ', Time: ' + d.Time + dopingNote;
                const dataYear = this.yearParser(d.Year)
                this.tooltip.showTooltip(tooltipContent, event.x, event.y, dataYear);
            })
            .on('mouseout', (e) => {
                this.tooltip.hideTooltip();
            })
    }

    #moveAxesToForeground() {
        d3.select('#x-axis').raise()
        d3.select('#y-axis').raise()
    }
}
import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import * as d3 from 'd3';

type Margin = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type Timescale = {
  timescale: string;
  totalAmount: number;
  totalProfit: number;
  totalRevenue: number;
};

type Trend = {
  timescale: string;
  total: number;
};

export const MultiLine = component$(() => {
  const svgWidth = 960;
  const svgHeight = 500;
  const margin: Margin = {left: 50, top: 20, right: 80, bottom: 30};
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;
  const data: Timescale[] = [
    {
      'timescale': '早', 
      'totalAmount': 20, 
      'totalProfit': 200, 
      'totalRevenue': 400
    },
    {
      'timescale': '午', 
      'totalAmount': 40, 
      'totalProfit': 300, 
      'totalRevenue': 600
    },
    {
      'timescale': '晚', 
      'totalAmount': 70, 
      'totalProfit': 100, 
      'totalRevenue': 800
    },
    {
      'timescale': '深夜', 
      'totalAmount': 100, 
      'totalProfit': 800, 
      'totalRevenue': 900
    }];
  const trendLabels = {
      'totalAmount': '銷售數量',
      'totalProfit': '總收入金額',
      'totalRevenue': '總分潤金額'
  };
  const svgRef = useSignal<Element>();
  useVisibleTask$(() => {
    const svg = d3.select('svg');
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Ranges
    const x = d3.scaleBand().rangeRound([0, width]).padding(1);
    const y = d3.scaleLinear().rangeRound([height, 0]);
    const z = d3.scaleOrdinal(['#036888','#0D833C','#D2392A']);

    const line = d3.line()
      .x(d => x(d.timescale))
      .y(d => y(d.total));

    z.domain(['totalAmount', 'totalProfit', 'totalRevenue']);

    const trends = z.domain().map(name => ({name, values: data.map(item => ({timescale: item.timescale, total: item[name]}))}));
    x.domain(data.map(d => d.timescale));
    y.domain([0, d3.max(trends, c => d3.max(c.values, v => v.total))]);
    console.log(x('早'));
    console.log(x('午'));

    // Legend
    const legend = g.selectAll('g')
      .data(trends)
      .enter()
      .append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', width - 140)
      .attr('y', (d, i) => height /2 - (i + 1) * 20)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', d => z(d.name));

    legend.append('text')
      .attr('x', width - 128)
      .attr('y', (d, i) => height / 2 - (i + 1) * 20 + 10)
      .style('fill', 'black')
      .text(d => trendLabels[d.name]);

    // Lines
    const trend = g.selectAll('.trend')
      .data(trends)
      .enter()
      .append('g')
      .attr('class', 'trend');

    trend.append('path')
      .attr('style', 'fill: none; stroke-width: 3px')
      .attr('d', d => line(d.values))
      .style('stroke', d => z(d.name));

    // Axes
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis-y')
      .call(d3.axisLeft(y).ticks(10));

    // Hover lines
    const focus = g.append('g')
      .attr('class', 'focus')
      .attr('class', 'x-hover-line hover-line')
      .style('stroke-dasharray', '3,3')
      .style('stroke-width', '2px')
      .style('stroke', 'black')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', height);

    // Hover figures
    const points = g.selectAll('.points')
      .data(trends)
      .enter()
      .append('g')
      .attr('class', 'points')
      .append('text');

    trend 
      .style('fill', '#fff')
      .style('stroke', d => z(d.name))
      .selectAll('circle.line')
      .data(d => d.values)
      .enter()
      .append('circle')
      .attr('r', 5)
      .style('stroke-width', 3)
      .attr('cx', d => x(d.timescale))
      .attr('cy', d => y(d.total));

    const timescales = data.map(name => x(name.timescale));

    function mouseover() {
      focus.style('display', null);
      d3.selectAll('.points text').style('display', null);
    }

    function mouseout() {
      focus.style('display', 'none');
      d3.selectAll('.points text').style('display', 'none');
    }

    const mousemove = (event) => {
      const i = d3.bisect(timescales, event.x, 1);
      const xPos = timescales[i - 1];
      focus.attr('transform', `translate(${xPos}, 0)`);
      d3.selectAll('.points text')
        .attr('x', d => xPos + 10)
        .attr('y', d => y(d.values[i - 1].total) - 5)
        .text(d => d.values[i - 1].total)
        .style('fill', d => z(d.name));
    };

    svg.append('rect')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout)
      .on('mousemove', mousemove);
  });
  return <svg width={svgWidth} height={svgHeight} ref={svgRef}></svg>;
});
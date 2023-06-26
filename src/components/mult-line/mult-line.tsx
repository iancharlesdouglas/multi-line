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
  const width = 960;
  const height = 500;
  const margin: Margin = {left: 50, top: 20, right: 80, bottom: 30};
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
console.log('trends', trends);
    x.domain(data.map(d => d.timescale));
    y.domain([0, d3.max(trends, c => d3.max(c.values, v => v.total))]);

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

    // Hover lines
    const focus = g.append('g')
      .attr('class', 'focus')
      .attr('class', 'x-hover-line hover-line')
      .style('stoke-dasharray', '3,3')
      .style('stroke-width', '2px')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', height);

    const timescales = data.map(name => name.timescale);

    function mouseover() {
      focus.style('display', null);
    }

    function mouseout() {
      focus.style('display', 'none');
    }

    function mousemove(event) {
      const i = d3.bisect(timescales, event.x, 1);
      const di = data[i - 1];
      const xi = di.timescale);
      focus.attr('transform', `translate(${x(di.timescale)}, 0)`);
    }

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
  return <svg width={width} height={height} ref={svgRef}></svg>;
});
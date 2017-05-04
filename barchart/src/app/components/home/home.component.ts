import { Component, OnInit } from '@angular/core';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  private d3: D3;
  dataset: any;

  constructor(
    d3Service: D3Service,
    private titleService: Title,
    private data: DataService
  ) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    // title the page
    this.titleService.setTitle('Barchart - FCC');

    this.data.getJson().subscribe(
      data => {
        if (data) {
          this.dataset = data.data;
          this.drawBarchart();
        }
      }
    );
    
  }

  drawBarchart() {
    // alias d3
    let d3 = this.d3;

    // setup svg component
    const width = 1540,
          height = 600,
          padding = 60;

    const svg = d3.select("#svg")
      .append("svg")
      .attr("class", "svg")
      .attr("width", width)
      .attr("height", height);

    const minMoney = d3.min(this.dataset, (d) => Number(d[1]));
    const maxMoney = d3.max(this.dataset, (d) => Number(d[1]));
    // console.log("minMoney:", minMoney);
    // console.log("maxMoney:", maxMoney);
    const yScale = d3.scaleLinear()
      .domain([maxMoney, 0])
      .range([height - padding, padding]);
    const yScale2 = d3.scaleLinear()
      .domain([0, maxMoney])
      .range([height - padding, padding]);
    // console.log("yScale:", yScale);

    const minDate = new Date(d3.min(this.dataset, (d) => d[0]));
    const maxDate = new Date(d3.max(this.dataset, (d) => d[0]));
    // console.log("minDate:", minDate);
    // console.log("maxDate:", maxDate);
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([padding, width - padding]);
    // console.log("xScale:", xScale);

    // what's going on
    // const oneScale = yScale(this.dataset[this.dataset.length - 1][1]);
    // console.log(this.dataset[this.dataset.length - 1][1]);
    // console.log("oneScale:", oneScale);

    // create tooltip div
    let div = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let formatTime = d3.timeFormat("%Y - %B");

    // console.log("count:", this.dataset.length);
    // tooltip based on d3noob's Block
    // https://bl.ocks.org/d3noob/257c360b3650b9f0a52dd8257d7a2d73
    const barWidth = (width - padding * 2) / this.dataset.length;
    svg.selectAll("rect")
      .data(this.dataset)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => i * barWidth + padding)
        .attr("y", (d) => height - yScale(d[1]))
        .attr("width", barWidth)
        .attr("height", (d) => yScale(d[1]) - padding)
        .attr("fill", "blue")
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", 0.9);
          div.html("<h3>$" + d[1] + " Billion</h3><p>" + formatTime(new Date(d[0])) + "</p>")
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - padding) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });

    // x axis
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("transform", "translate(0, " + (height - padding) + ")")
      .call(xAxis);

    // y axis
    const yAxis = d3.axisLeft(yScale2);
    svg.append("g")
      .attr("transform", "translate(" + (padding) + ", 0)")
      .call(yAxis);

  }

}

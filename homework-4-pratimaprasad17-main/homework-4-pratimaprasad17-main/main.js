var scatterSvg;
var histogramSvg;

d3.csv("dataset/exoplanets.csv").then(function(data) {
    data = data.map(function(d) {
        var format = d3.format(".2f");
        return {
            name: d["Name"],
            distance: +format(+d["Distance"]),
            stellar_magnitude: +d["Stellar Magnitude"],
            planet_type: d["Planet type"],
            discovery_year: +format(+d["Discovery year"]),
            mass_multiplier: +format(+d["Mass multiplier"]),
            mass_wrt: d["Mass wrt"],
            radius_multiplier: +format(+d["Radius multiplier"]),
            radius_wrt: d["Radius wrt"],
            orbital_radius: +format(+d["Orbital radius"]),
            orbital_period: +format(+d["Orbital period"]),
            eccentricity: +format(+d["Eccentricity"]),
            detection_method: d["Detection method"],
        //    imgURL: d["ImageURL"] 
        };
    });

    // Assume your HTML has a select element with the id 'filterDropdown'
    const filterDropdown = d3.select('#filterDropdown');

    // Extract unique detection methods
    const uniqueMethods = Array.from(new Set(data.map(d => d.detection_method)));

    filterDropdown.append('option')
                .text('All')
                .attr('value', 'all');

    // Populate the dropdown
    uniqueMethods.forEach(method => {
    filterDropdown.append('option')
                    .text(method)
                    .attr('value', method);
    });

    filterDropdown.property('value', 'all');

// Histogram setup
const histogramMargin = { top: 10, right: 30, bottom: 30, left: 60 },
      histogramWidth = 1300 - histogramMargin.left - histogramMargin.right,
      histogramHeight = 750 - histogramMargin.top - histogramMargin.bottom;

// Create a histogram for the radius_multiplier
const xHistogram = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.radius_multiplier)])
  .range([0, histogramWidth]);

const histogram = d3.histogram()
    .value(d => d.radius_multiplier)
    .domain(xHistogram.domain())
    .thresholds(xHistogram.ticks(40));
  
const bins = histogram(data);

console.log(data);

console.log(d3.max(data, d => d.orbital_period));
console.log(d3.max(data, d => d.radius_multiplier));

console.log(typeof(d3.max(data, d => d.orbital_period)));
console.log(typeof(d3.max(data, d => d.radius_multiplier)));

console.log(typeof(d3.max(data, d=>d.distance)));

var planetType = Array.from(new Set(data.map(d => d.planet_type)));

const planetTypeColors = d3.scaleOrdinal()
    .domain(["Gas Giant", "Neptune-like", "Super Earth", "Terrestrial"])
    .range(["#2596be", "#2ca02c", "#d62728", "#9467bd"]);

// const tooltip = d3.select("#tooltip")
//     .append("tooltip")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

// function onMouseOver(event, d) {
//     tooltip.style("opacity", 1)
//         .style("display", "block")
//         .style("left", (event.pageX) + "px")
//         .style("top", (event.pageY) + "px")
//         .html(`style="width: 50px;"><strong>${d.planet_type} : </strong> </br> ${d.orbital_period} : ${d.orbital_period}</br>${d.radius_multiplier} : ${d.radius_multiplier}`)
//         .style("z-index", "999");
// }
// function onMouseOut(){
//     tooltip.style("opacity", 0)
//         .style("display", "none");
// }
const maxYValue = Math.max(
    d3.max(data, d => d.radius_multiplier),
    d3.max(bins, d => d.length)
  );

// Unified y-scale
const y = d3.scaleLinear()
  .domain([0, maxYValue])
  .range([histogramHeight, 0]); 

// // Histogram setup
// const histogramMargin = { top: 10, right: 30, bottom: 30, left: 60 },
//       histogramWidth = 860 - histogramMargin.left - histogramMargin.right,
//       histogramHeight = 800 - histogramMargin.top - histogramMargin.bottom;



histogramSvg = d3.select("#histogram")
    .append("svg")
      .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
      .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
    .append("g")
      .attr("transform", `translate(${histogramMargin.left},${histogramMargin.top})`);
  
  const yHistogram = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([histogramHeight, 0]);
  
  histogramSvg.append("g")
    .call(d3.axisLeft(yHistogram));
  
  histogramSvg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${xHistogram(d.x0)},${y(d.length)})`)
      .attr("width", d => Math.max(0, xHistogram(d.x1) - xHistogram(d.x0) - 1))
      .attr("height", d => histogramHeight - y(d.length))
      .style("fill", d => planetTypeColors(d.planet_type));
  
  
// Scatter Plot setup
const scatterMargin = { top: 10, right: 30, bottom: 30, left: 60 },
      scatterWidth = 1300 - scatterMargin.left - scatterMargin.right,
      scatterHeight = 750 - scatterMargin.top - scatterMargin.bottom;

scatterSvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom +10)
    .append("g")
    .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

// Scales for scatter plot
const x = d3.scaleLog()
  .domain([1, d3.max(data, d => +d.orbital_period)])
  .range([ 0, scatterWidth ])
  .nice();

scatterSvg.append("g")
  .attr("transform", `translate(0,${scatterHeight})`)
  .call(d3.axisBottom(x));

// const y = d3.scaleLinear()
//   .domain([0, d3.max(data, d => d.radius_multiplier)])
//   .range([ scatterHeight, 0]);

scatterSvg.append("g")
  .call(d3.axisLeft(y));

const tooltip = d3.select("#tooltip")
    .append("tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);

function onMouseOver(event, d) {
    tooltip.style("opacity", 1)
        .style("display", "block")
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px")
        .html(`style="width: 50px;"><strong>${d.planet_type} : </strong> </br> ${d.orbital_period} : ${d.orbital_period}</br>${d.radius_multiplier} : ${d.radius_multiplier}`)
        .style("z-index", "999");
}
function onMouseOut(){
    tooltip.style("opacity", 0)
        .style("display", "none");
}

// Scatter plot points
scatterSvg.append('g')
  .selectAll("dot")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", d => x(d.orbital_period) + (Math.random() - 0.5) * 10)
    .attr("cy", d => y(d.radius_multiplier) + (Math.random() - 0.5) * 10)
    .attr("r", d => Math.sqrt(d.distance) / 10)
    .style("fill", d => planetTypeColors(d.planet_type))
    .style("opacity", 0.5)
    .on("mouseover", 
    function(event, d, i) {
        const tooltipId = "tooltip-" + i;
        // Inside your mouseover function, before appending text
        const bboxPadding = 5; // Adjust padding as needed

        // Temporarily append text to calculate bounding box
        const tempText = scatterSvg.append("text").text(`Planet Type: ${d.planet_type} Period: ${d.orbital_period} days Radius Multiplier: ${d.radius_multiplier}`);
        const bbox = tempText.node().getBBox();
        tempText.remove(); // Remove temporary text

        // Append rect first to ensure it's behind the text
        scatterSvg.append("rect")
            .attr("id", "r" + tooltipId)
            .attr("x", bbox.x - bboxPadding)
            .attr("y", bbox.y - bboxPadding)
            .attr("width", bbox.width + 2 * bboxPadding)
            .attr("height", bbox.height + 2 * bboxPadding)
            .attr("fill", "white")
            .style("opacity", 0.8);
        
     
        const xPosition = d3.select(this).attr("cx");
        const yPosition = d3.select(this).attr("cy");
      
        const tooltipGroup = scatterSvg.append("text")
          .attr("id", tooltipId)
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("dy", "-1em") // Shift the whole group up
      
        // First line of the tooltip
        tooltipGroup.append("tspan")
          .attr("x", xPosition) // Align this tspan to the group's x
          .text(`Planet Type: ${d.planet_type}`)
          .style("font-weight", "bold")
          .style("fill", "blue");
      
        // Third line of the tooltip
        tooltipGroup.append("tspan")
          .attr("x", xPosition) // Align this tspan to the group's x
          .attr("dy", "1.2em") // New line
          .text(`Period: ${d.orbital_period} days`)
          .style("font-weight", "normal")
          .style("fill", "black");

        // Second line of the tooltip
        tooltipGroup.append("tspan")
            .attr("x", xPosition) // Align this tspan to the group's x
            .attr("dy", "1.2em") // New line
            .text(`Radius Multiplier: ${d.radius_multiplier}`)
            .style("font-weight", "normal")
            .style("fill", "black");
      })
      // Mouseout event
      .on("mouseout",
      function(event, d, i) {
        const tooltipId = "tooltip-" + i;
        scatterSvg.select("#" + tooltipId).remove();
        
      })
      ;

// X-axis label
scatterSvg.append("text")             
  .attr("transform",
        "translate(" + (scatterWidth/2) + " ," + 
                       (scatterHeight + scatterMargin.top + 25) + ")")
  .style("text-anchor", "middle")
  .text("Orbital Period (days)");

// Y-axis label
scatterSvg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - scatterMargin.left)
  .attr("x",0 - (scatterHeight / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Radius Multiplier");



// Event listener for the dropdown
filterDropdown.on("change", function(event) {
  // Get the selected value
  const selectedMethod = event.target.value;
    console.log(selectedMethod);
  // Filter data based on the selection, or use all data if 'All' is selected
  const filteredData = selectedMethod === "all" ? data : data.filter(d => d.detection_method === selectedMethod);

  scatterSvg.selectAll("*").remove();
  histogramSvg.selectAll("*").remove();
  scatterSvg.selectAll(".y-axis-label").remove();

//   // Histogram setup
// const histogramMargin = { top: 10, right: 30, bottom: 30, left: 60 },
//       histogramWidth = 1500 - histogramMargin.left - histogramMargin.right,
//       histogramHeight = 750 - histogramMargin.top - histogramMargin.bottom;

// Create a histogram for the radius_multiplier
const xHistogram = d3.scaleLinear()
  .domain([0, d3.max(filteredData, d => d.radius_multiplier)])
  .range([0, histogramWidth]);

const histogram = d3.histogram()
    .value(d => d.radius_multiplier)
    .domain(xHistogram.domain())
    .thresholds(xHistogram.ticks(40));
  
const bins = histogram(filteredData);

console.log(filteredData);

console.log(d3.max(filteredData, d => d.orbital_period));
console.log(d3.max(filteredData, d => d.radius_multiplier));

console.log(typeof(d3.max(filteredData, d => d.orbital_period)));
console.log(typeof(d3.max(filteredData, d => d.radius_multiplier)));

console.log(typeof(d3.max(filteredData, d=>d.distance)));

var planetType = Array.from(new Set(filteredData.map(d => d.planet_type)));

const planetTypeColors = d3.scaleOrdinal()
    .domain(["Gas Giant", "Neptune-like", "Super Earth", "Terrestrial"])
    .range(["#2596be", "#2ca02c", "#d62728", "#9467bd"]);

// const tooltip = d3.select("#tooltip")
//     .append("tooltip")
//     .attr("class", "tooltip")
//     .style("opacity", 0);

// function onMouseOver(event, d) {
//     tooltip.style("opacity", 1)
//         .style("display", "block")
//         .style("left", (event.pageX) + "px")
//         .style("top", (event.pageY) + "px")
//         .html(`style="width: 50px;"><strong>${d.planet_type} : </strong> </br> ${d.orbital_period} : ${d.orbital_period}</br>${d.radius_multiplier} : ${d.radius_multiplier}`)
//         .style("z-index", "999");
// }
// function onMouseOut(){
//     tooltip.style("opacity", 0)
//         .style("display", "none");
// }
const maxYValue = Math.max(
    d3.max(filteredData, d => d.radius_multiplier),
    d3.max(bins, d => d.length)
  );

// Unified y-scale
const y = d3.scaleLinear()
  .domain([0, maxYValue])
  .range([histogramHeight, 0]); 

// // Histogram setup
// const histogramMargin = { top: 10, right: 30, bottom: 30, left: 60 },
//       histogramWidth = 860 - histogramMargin.left - histogramMargin.right,
//       histogramHeight = 800 - histogramMargin.top - histogramMargin.bottom;



  histogramSvg = d3.select("#histogram")
    .append("svg")
      .attr("width", histogramWidth + histogramMargin.left + histogramMargin.right)
      .attr("height", histogramHeight + histogramMargin.top + histogramMargin.bottom)
    .append("g")
      .attr("transform", `translate(${histogramMargin.left},${histogramMargin.top})`);

  
  histogramSvg.append("g")
    .call(d3.axisLeft(y));
  
  histogramSvg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${xHistogram(d.x0)},${y(d.length)})`)
      .attr("width", d => Math.max(0, xHistogram(d.x1) - xHistogram(d.x0) - 1))
      .attr("height", d => histogramHeight - y(d.length))
      .style("fill", d => planetTypeColors(d.planet_type));
  
  
// Scatter Plot setup
// const scatterMargin = { top: 10, right: 30, bottom: 30, left: 60 },
//       scatterWidth = 1000 - scatterMargin.left - scatterMargin.right,
//       scatterHeight = 750 - scatterMargin.top - scatterMargin.bottom;

scatterSvg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom +10)
    .append("g")
    .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);

// Scales for scatter plot
const x = d3.scaleLog()
  .domain([1, d3.max(filteredData, d => +d.orbital_period)])
  .range([ 0, scatterWidth ])
  .nice();

scatterSvg.append("g")
  .attr("transform", `translate(0,${scatterHeight})`)
  .call(d3.axisBottom(x));

// const y = d3.scaleLinear()
//   .domain([0, d3.max(data, d => d.radius_multiplier)])
//   .range([ scatterHeight, 0]);

scatterSvg.append("g")
  .call(d3.axisLeft(y));

// Scatter plot points
scatterSvg.append('g')
  .selectAll("dot")
  .data(filteredData)
  .enter()
  .append("circle")
    .attr("cx", d => x(d.orbital_period) + (Math.random() - 0.5) * 10)
    .attr("cy", d => y(d.radius_multiplier) + (Math.random() - 0.5) * 10)
    .attr("r", d => Math.sqrt(d.distance) / 10)
    .style("fill", d => planetTypeColors(d.planet_type))
    .style("opacity", 0.5)
    .on("mouseover", 
    function(event, d, i) {
        const tooltipId = "tooltip-" + i;
        // Inside your mouseover function, before appending text
        const bboxPadding = 5; // Adjust padding as needed

        // Temporarily append text to calculate bounding box
        const tempText = scatterSvg.append("text").text(`Planet Type: ${d.planet_type} Period: ${d.orbital_period} days Radius Multiplier: ${d.radius_multiplier}`);
        const bbox = tempText.node().getBBox();
        tempText.remove(); // Remove temporary text

        // Append rect first to ensure it's behind the text
        scatterSvg.append("rect")
            .attr("id", "r" + tooltipId)
            .attr("x", bbox.x - bboxPadding)
            .attr("y", bbox.y - bboxPadding)
            .attr("width", bbox.width + 2 * bboxPadding)
            .attr("height", bbox.height + 2 * bboxPadding)
            .attr("fill", "white")
            .style("opacity", 0.8);
        
     
        const xPosition = d3.select(this).attr("cx");
        const yPosition = d3.select(this).attr("cy");
      
        const tooltipGroup = scatterSvg.append("text")
          .attr("id", tooltipId)
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("dy", "-1em") // Shift the whole group up
      
        // First line of the tooltip
        tooltipGroup.append("tspan")
          .attr("x", xPosition) // Align this tspan to the group's x
          .text(`Planet Type: ${d.planet_type}`)
          .style("font-weight", "bold")
          .style("fill", "blue");
      
        // Third line of the tooltip
        tooltipGroup.append("tspan")
          .attr("x", xPosition) // Align this tspan to the group's x
          .attr("dy", "1.2em") // New line
          .text(`Period: ${d.orbital_period} days`)
          .style("font-weight", "normal")
          .style("fill", "black");

        // Second line of the tooltip
        tooltipGroup.append("tspan")
            .attr("x", xPosition) // Align this tspan to the group's x
            .attr("dy", "1.2em") // New line
            .text(`Radius Multiplier: ${d.radius_multiplier}`)
            .style("font-weight", "normal")
            .style("fill", "black");
      })
      // Mouseout event
      .on("mouseout",
      function(event, d, i) {
        const tooltipId = "tooltip-" + i;
        scatterSvg.select("#" + tooltipId).remove();
        
      })
      ;
// X-axis label
scatterSvg.append("text")             
  .attr("transform",
        "translate(" + (scatterWidth/2) + " ," + 
                       (scatterHeight + scatterMargin.top + 25) + ")")
  .style("text-anchor", "middle")
  .text("Orbital Period (days)");

// Y-axis label
scatterSvg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - scatterMargin.left)
  .attr("x",0 - (scatterHeight / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Radius Multiplier");

});

});


// Hint: This is a good place to declare your global variables

let csv_rowCount;
let countryArray=[];
let i=0;

let male_dataPoints=[];
let female_datapoints=[];

let datapoints=[];

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];
            csv_rowCount=female_data.length;

            // Hint: This is a good spot for doing data wrangling
  
            generateDropdownArray(female_data);
            populateDropdown();
            
            // When page loads
            generateDatapoints(countryArray[0], male_data, female_data);
            drawLolliPopChart();

            // on-click of dropdown
            let dropdown=document.getElementById("countryDropdown");
            document.addEventListener("change", function (){
                datapoints=[];
                generateDatapoints(dropdown.value, male_data, female_data)
                d3.select("#lollipop-chart").selectAll("*").remove();
                drawLolliPopChart();

            });
            console.log(datapoints);
            
           
        });
 });

// Create array of countries to populate the dropdown
function generateDropdownArray(female_data_array){
    i=0; let temp;
    while(i<5){
        temp=female_data_array.columns[generateRandomNumber()];
        while(countryArray.includes(temp)){
            temp=female_data_array.columns[generateRandomNumber()];
        }
        countryArray[i]=temp;
        i++;
    }
    countryArray.sort();
}

 // Use this function to generate random number to pick random countries
 function generateRandomNumber(){
    return Math.floor(Math.random()*csv_rowCount)+1;
}

// Use this function to populate Dropdown in select
function populateDropdown(){
    var dropDown = document.getElementById("countryDropdown");
    i=0;
    while(i<5){
    var option = countryArray[i];
    var element = document.createElement("option");
    element.textContent = option;
    element.value = option;
    dropDown.appendChild(element);
    i++;
    }
}

// Use this function to convert result set (after filtering according to dropdown options) from string to number
function convertStringToNumber(filter_array, array_len){
    i=0;
    while(i<array_len){
        const indivObject = filter_array[i];
        for (const key in indivObject){
            filter_array[i][key]=parseFloat(filter_array[i][key]); 
        }
        i++;
    }
}

// Create data points for plotting
function generateDatapoints(countryKey, orig_male_data, orig_female_data){

    let selection = countryKey;
    const keys=["Year", "M", "F"];
    for(i=0; i<csv_rowCount; i++){
        const time=new Date(orig_female_data[i].Year).getFullYear()+1;
        const maleValue=parseFloat(orig_male_data[i][selection]);
        const femaleValue=parseFloat(orig_female_data[i][selection]);
        const newObject={
            Year: time,
            M: maleValue,
            F: femaleValue,
        };
        datapoints.push(newObject); 
    }
}
    

// Use this function to draw the lollipop chart.
function drawLolliPopChart() {
    console.log('trace:drawLollipopChart()');
  
// SVG dimensions and margins
const margin = { top: 50, right: 50, bottom: 50, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// SVG container
const svg = d3.select("#lollipop-chart")
    .attr("width", width*1.5 + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom+20)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Assigning male and female line colors
const colors = { male: "#008b8b", female: "#ff1493" };

// Scales for x-axis and y-axis
const xScale = d3.scaleBand()
    .domain(datapoints.map(d => d.Year))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(datapoints, d => Math.max(d.M, d.F))])
    .nice()
    .range([height, 0]);

// Create and append lollipop lines for male and female employement data
const lines = svg.selectAll(".line")
    .data(datapoints)
    .enter()
    .append("g")
    .attr("class", "line");

lines.append("line")
 
    .attr("x1", d => xScale(d.Year) + xScale.bandwidth() / 2 -5)
    .attr("y1", d => yScale(0))
    .attr("x2", d => xScale(d.Year) + xScale.bandwidth() / 2 -5)
    .attr("y2", d => yScale(0))
    .attr("stroke", colors.male)
    .attr("stroke-width", 1)
    .transition()
    .duration(1000)
    .attr("y2", d => yScale(d.M));

lines.append("line")
    .attr("x1", d => xScale(d.Year) + xScale.bandwidth() / 2 +5)
    .attr("y1", d => yScale(0))
    .attr("x2", d => xScale(d.Year) + xScale.bandwidth() / 2 +5)
    .attr("y2", d => yScale(0))
    .attr("stroke", colors.female)
    .attr("stroke-width", 1)
    .transition()
    .duration(1000)
    .attr("y2", d => yScale(d.F));

// Append lollipop circles at the top
lines.append("circle")

    .attr("cx", d => xScale(d.Year) + xScale.bandwidth() / 2 -5)
    .attr("cy", d => yScale(0))
    .attr("r", 5)
    .transition()
    .duration(1000)
    .attr("cy", d => yScale(d.M))
    .attr("fill", colors.male);

lines.append("circle")

    .attr("cx", d => xScale(d.Year) + xScale.bandwidth() / 2 +5)
    .attr("cy", d => yScale(0))
    .attr("r", 5)
    .transition()
    .duration(1000)
    .attr("cy", d => yScale(d.F))
    .attr("fill", colors.female);

// Add x-axis and y-axis

// x-axis year labels
let yearsRange = [];
const startYear = d3.min(datapoints, d=>d.Year)-1;
const endYear = d3.max(datapoints, d=>d.Year);
for (let year = startYear; year <= endYear; year += 5) {
  yearsRange.push(year);
}

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).tickValues(yearsRange))
    .selectAll("text")
    .attr("transform", "rotate(0)")
    .style("text-anchor", "middle");

svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale).ticks(10));

// X-axis label
svg.append("text")
    .attr("class", "x-label")
    .attr("x", width/2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .text("Year");

// Y-axis label
svg.append("text")
    .attr("class", "y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left-5)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text("Employment Rate");

// Legend for Lollipop chart
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 10}, 0)`);

legend.append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", colors.male);

legend.append("rect")
    .attr("x", 0)
    .attr("y", 40)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", colors.female);

legend.append("text")
    .attr("class", "legend")
    .attr("x", 30)
    .attr("y", 50)
    .text("Female Employment Rate");

legend.append("text")
    .attr("class", "legend")
    .attr("x", 30)
    .attr("y", 20)
    .text("Male Employment Rate");
}
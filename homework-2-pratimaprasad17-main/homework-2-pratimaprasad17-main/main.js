let textArea = document.getElementById("wordbox");
let donutChartSvg = d3.select("pie_svg");
let barChartSvg = d3.select("bar_svg");

let characterCounts = {};

//let tooltip;
function countCharacters() {
    textArea = document.getElementById("wordbox");
    const text = textArea.value.toLowerCase();
    characterCounts = {
        vowels: (text.match(/[aeiouy]/g) || []).length,
        consonants: (text.match(/[bcdfghjklmnpqrstvwxz]/g) || []).length,
        punctuation: (text.match(/[.,!?;:]/g) || []).length,
    };
    donutChartSvg.selectAll("*").remove();
    barChartSvg.selectAll("*").remove();
    drawDonutChart();
}

// Function to update the donut chart
function drawDonutChart() {
    const totalCount = characterCounts.vowels + characterCounts.consonants + characterCounts.punctuation;

    const data = [
        { label: "Vowels", value: characterCounts.vowels },
        { label: "Consonants", value: characterCounts.consonants },
        { label: "Punctuation", value: characterCounts.punctuation },
    ];

    const width = 500;
    const height = 350;

    const donutRadius = Math.min(width, height) / 2;
 
    const color = d3.scaleOrdinal(d3.schemeSet3);
    
    // SVG element for donut chart
    const svg = d3.select("#pie_svg")
        .append("svg")
    //    .attr("width", width)
    //    .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/1.7}, ${height/1.7})`)
    ;
    
    //Donut chart layout preparation
    const donut = d3.pie()
        .sort(null)
        .value(d=>d.value)
    ;

    //Donut chart arc data creation
    const arcData = donut(data);

    //Arc generator
    const arc =d3.arc()
        .innerRadius(donutRadius - 80)
        .outerRadius(donutRadius - 20)
    ;

    //Arc for the donut chart
    const arcs = svg.selectAll(".arc")
        .data(arcData)
        .enter()
        .append("g")
        .attr("class", "arc")
    ;

    //Draw the arcs
    arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d,i) => color(i))
    .attr("stroke", "black")
    .on("click", function(event, d) {
        drawBarChart(d.data.label, d3.select(this).attr("fill"));
        });
    
    
    // Add event listeners for mouseover and mouseout
    arcs
        .on("mouseover", function (event, d) {
            // Increase border thickness of the hovered arc
            d3.select(this)
                .attr("stroke-width", 4);

            // Show the count of the selected character type in the center
            svg.append("text")
                .attr("class", "donut-label")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text(d.data.label+": "+ d.data.value)
                .attr("font-weight", "bold");
        })
        .on("mouseout", function (event, d) {
            // Reset border thickness of the arc
            d3.select(this)
                .attr("stroke-width", 1);

            // Remove the count label from the center
            svg.select(".donut-label").remove();
        });
}

// Function to update and draw the bar chart
function drawBarChart(selectedCategory, color) {
    
    const characterNameSpan = d3.select("#character-name");
    const characterCountSpan = d3.select("#character-count");
    const textArea = document.getElementById("wordbox");
    const barChart_container = document.getElementById("bar_div");
    const container_width = barChart_container.clientWidth-80;
    const container_height = barChart_container.clientHeight-150;
    const tooltipDiv=document.getElementById("tooltip");
    
    const data = [];
    const textVal = textArea.value.toLowerCase();

    const vowel_list="aeiouy";
    const consonant_list="bcdfghjklmnpqrstvwxz";
    const punctuation_list=".,!?;:";

    //initialize count to 0 for all entries
    if(selectedCategory==="Vowels"){
        for(const char of vowel_list){
            data.push({label: char, value: 0});
        }
    }
    else if(selectedCategory==="Consonants"){
        for(const char of consonant_list){
            data.push({label: char, value: 0});
        }
    }
    else{
        for(const char of punctuation_list){
            data.push({label: char, value: 0});
        }
    }
    //count and assign actual values to available entries
    for (const char of textVal) {
        if (
            (selectedCategory === "Vowels" && vowel_list.includes(char)) ||
            (selectedCategory === "Consonants" && consonant_list.includes(char)) ||
            (selectedCategory === "Punctuation" && punctuation_list.includes(char))
        ) {
            if (data.some(item => item.label === char)) {
                const index = data.findIndex(item => item.label === char);
                data[index].value++;
            } else {
            //   data.push({ label: char, value: 1 });
            }
        }
    }

    data.sort((a, b) => d3.ascending(a.label, b.label));

    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const barWidth =23;

    barChartSvg.selectAll("*").remove();
    
    barChartSvg = d3.select("#bar_svg")
        .append("svg")
        .attr("width", container_width + margin.left - margin.right +50)
        .attr("height", container_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
    ;
    
    const allLabels = data.map(d => d.label);

    const xScale = d3.scaleBand()
        .domain(allLabels)
        .range([0, container_width])
        .padding(0.7)
    ;

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([container_height, 0])
    ;

    // create and update the bars
    const bars = barChartSvg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.label) - barWidth / 2)
        .attr("y", d => yScale(d.value))
        .attr("width", barWidth)
        .attr("height", d => container_height - yScale(d.value))
        .attr("fill", color)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", onMouseOver)
        .on("mousemove", onMouseMove)
        .on("mouseout", onMouseOut);

    const tooltip = d3.select("#tooltip")
        .append("tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function onMouseOver(event, d) {
        tooltip.style("opacity", 1)
            .style("display", "block")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
            .html(`<strong>Character : ${d.label}</br>Count : ${d.value}</strong>`)
            .style("z-index", "999");
        updateSpan(d.label, d.value);
    }

    function onMouseMove(event, d){
        tooltip.style("display", "block").style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
        updateSpan(d.label, d.value);
    }

    function onMouseOut(){
        clearSpan();
        tooltip.style("opacity", 0)
            .style("display", "none");
    }

    function updateSpan(name, count){
        characterNameSpan.text("");
        characterNameSpan.append("strong").text("'"+name+"'");

        characterCountSpan.text("");
        characterCountSpan.append("strong").text(count);
    }

    function clearSpan(){
        characterCountSpan.text("NONE");
        characterNameSpan.text("NONE");
    }    

    //create and update x-axis
    const xAxis = d3.axisBottom(xScale)
        .ticks(data, d => d.label)
    ;

    barChartSvg.append("g")
        .attr("transform", `translate(0,${container_height})`)
        .call(xAxis)
        .selectAll("text")
    //    .style("text-anchor", "middle")
    ;
     
    // create and update y-axis
    const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickSize(10)
    ;

    barChartSvg.append("g")
        .call(yAxis)
    ;

    //create and update x-axis label
    barChartSvg.selectAll(".x-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "x-label")
        .attr("x", d=> xScale(d.label) + barWidth/2 )
        .attr("y", container_height + 40)
        .style("text-anchor", "middle")
    ;
    
    // Y-axis label
    barChartSvg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -container_height / 3)
        .attr("y", -40)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
    ;
}
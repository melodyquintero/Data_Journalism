// -----------------------------------------//
//           SVG Area Sizing
// -----------------------------------------//



// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

makeResponsive();
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  };

 
  // svg params
  var svgWidth = window.innerWidth-200;
  var svgHeight = window.innerHeight-300;

  // margins
  var margin = {
    top: 50,
    right: 100,
    bottom: 100,
    left: 100
  };

  // chart area minus margins
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// -----------------------------------------//
//       Build function for Scatter
// -----------------------------------------//


// Initial Params
  var chosenXAxis = "poverty";  // poverty
  var chosenYAxis = "obesity";  // obesity

// function used for updating x/y scale var upon click on axis label
  function xyscale (data, chosenXAxis, chosenYAxis) {

    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d=>d[chosenXAxis])*0.9,
      d3.max(data, d=>d[chosenXAxis])*1.1] )
    .range([0, width]);
                   
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d=>d[chosenYAxis]*0.8),
        d3.max(data, d=>d[chosenYAxis])])
      .range([height, 0]);


    return [xLinearScale, yLinearScale];
  }

// function used for updating X/Yaxis var upon click on axis label
  function renderAxis (newXScale, newYScale, xAxis, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return [xAxis, yAxis];
  };

// function used for updating circles group with a transition to
// new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {


    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
  }

  // function used for append circle text
  function stateAbbrs(stateAbbr, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    stateAbbr.transition()
      .duration(1000)
      .attr("dx", d=> newXScale(d[chosenXAxis]))
      .attr("dy", d=> newYScale(d[chosenYAxis])+5)
    return stateAbbr;
  };

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this);
    })
    // onmouseout event
    .on("mouseout", function(d, index) {
      toolTip.hide(d);
    });

   return circlesGroup;
  };


// -----------------------------------------//
//                Run Data
// -----------------------------------------//


  // Retrieve data from the CSV file and execute everything below
  d3.csv("data.csv").then(succesHandle, errorHandle);

  function errorHandle(error) {console.log(error)};

  function succesHandle(data) {
      //console.log(data)


      // parse data
    data.forEach(function(d) {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
      d.healthcare = +d.healthcare;
    });

    // x/yLinearScale function above csv import

    var xLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[0];
    var yLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[1];

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    //append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true)
    // .attr("fill", "pink")
    // .attr("opacity", ".5");


    // Add State Abbrev.
    var stateAbbr = chartGroup.append("g").selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .classed("stateText", true)
            .text(d=> d.abbr)
            .attr("dx", d=> xLinearScale(d[chosenXAxis]))
            .attr("dy", d=> yLinearScale(d[chosenYAxis])+5)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            ;

      // Create group for  3 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");

      // Create group for  3 y- axis labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")

    var obesityLabel = ylabelsGroup.append("text")
      .attr("y", 20 - margin.left )
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("y", 40 - margin.left )
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
      .attr("y", 60 - margin.left )
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");



    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    
// -----------------------------------------//
//                Event Listener
// -----------------------------------------//

  xlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // functions here found above csv import
      // updates x,y scale for new data
      xLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[0];
      yLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[1];
    
    // updates x,y axis with transition
      xAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[0];
      yAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[1];
    
      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      // update state abbr. locations 
      stateAbbr = stateAbbrs(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis); 


          // changes classes to change bold axis label text
      if (chosenXAxis === "poverty") {
        povertyLabel
        .classed("active", true)
        .classed("inactive", false);
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", false)
        .classed("inactive", true)
      }
      else if (chosenXAxis === "age") {
        povertyLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", true)
        .classed("inactive", false);
        incomeLabel
        .classed("active", false)
        .classed("inactive", true)
      }
      else {
        povertyLabel
        .classed("active", false)
        .classed("inactive", true);
        ageLabel
        .classed("active", false)
        .classed("inactive", true);
        incomeLabel
        .classed("active", true)
        .classed("inactive", false)
      } 


    }
  });




  // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value
      chosenYAxis = value;

      // functions here found above csv import
      // updates x,y scale for new data
      xLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[0];
      yLinearScale = xyscale(data, chosenXAxis, chosenYAxis)[1];
    
    // updates x,y axis with transition
      xAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[0];
      yAxis = renderAxis(xLinearScale, yLinearScale, xAxis, yAxis)[1];
    
      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      
      // update state abbr. locations 
      stateAbbr = stateAbbrs(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis); 

          // changes classes to change bold axis label text
      if (chosenYAxis === "obesity") {
        obesityLabel
        .classed("active", true)
        .classed("inactive", false);
        smokesLabel
        .classed("active", false)
        .classed("inactive", true);
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true)
      }
      else if (chosenYAxis === "smokes") {
        obesityLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
        .classed("active", true)
        .classed("inactive", false);
        healthcareLabel
        .classed("active", false)
        .classed("inactive", true)
      }
      else {
        obesityLabel
        .classed("active", false)
        .classed("inactive", true);
        smokesLabel
        .classed("active", false)
        .classed("inactive", true);
        healthcareLabel
        .classed("active", true)
        .classed("inactive", false)
      } 


    }
  });
  }
  }







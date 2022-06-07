// Use makeResponsive function to automatically resizes the chart
function makeResponsive() {
  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");
    
  // Clear svg is not empty
  if (!svgArea.empty()) {
      svgArea.remove();
  }

  // Create svg object, dimensions defined by the window size
  var svgWidth = window.innerWidth;
  var svgHeight = window.innerHeight;

  var margin = {
      top: 50,
      right: 50,
      bottom: 100, 
      left: 80
  };


// Set the size of chart after subtracting margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Define chart and append it to a "div" in "scatter element"
var chart = d3.select("#scatter")
  .append("div")
  .classed("chart", true)

// Create an SVG wrapper and append an SVG to the id = 'scatter' in html 
var svg = chart.append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append group element
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Parameters
var chosenXAxis = 'income';
var chosenYAxis = 'healthcare';

// Use function to update the x-scale variables upon clicking on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;

}

// Use function to update the y-scale variables upon clicking on axis label

function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis])* 0.8,
    d3.max(censusData, d => d[chosenYAxis])*1.2])
    .range([height,0]);

  return yLinearScale;
}

// Use a function to update live the xAxis parameters upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Use a function to update live the y- axis parameters upon click on axis labels
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// Use a function for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup;
}

// Use a function to set X-axis for tooltips:
function styleX(value, chosenXAxis) {
  if (chosenXAxis === "income") {
    return `${value}`;
  }
  else if (chosenXAxis === "poverty") {
    return `${value}%`
  }
  else {
    return `${value}`;
  } 
}


// Use a function to update circles groups with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  //set three x-axis lebels: Income, Poverty and Age

  if (chosenXAxis === "income") {
    var xLabel = "Income [$]";
  }
  else if (chosenXAxis === "poverty") {
    var xLabel = "Poverty %";
  }
  else {
    var xLabel = "Age";
  }

  //set three y-axis lebels: healthcare, obesity, smokes
  
  if (chosenYAxis === 'healthcare') {
    var yLabel = "Healthcare status:"
  }
  else if (chosenYAxis === 'obesity') {
    var yLabel = "Obesity index:";
  }
  else {
    var yLabel = "Smokers index:"
  }

  // Create tooltip
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  return circlesGroup;

}

// Import data -> read csv file
d3.csv('./assets/data/data.csv').then(function(censusData) {
  
  // Parse Data and convert strings to integers
  censusData.forEach(function(data) {
      data.obesity = +data.obesity;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.poverty = +data.poverty;
  });

  // Linear scales for x and y-axis
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  //Assign both axis: bottom -> x, left ->y
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //Append x-axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height  })`)
    .call(bottomAxis);

  //Append y-axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  //Append initial chart circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
  // .classed('stateCircle', true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("opacity", ".5");

  
  // Append text elements to circles as labels
  var textGroup = chartGroup.selectAll(".stateText") // check this one
      .data(censusData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("dy", 2.5)
      .attr("font-size", '9px')
      .classed("stateText", true);

  // Create group for three x-axis labels(check this part, there is an error in console)
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener -> income
    .classed("active eText", true)
    .text("Household Income (Median)");

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener -> income
    .classed("inactive eText", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener -> income
    .classed("inactive eText", true)
    .text("Age (Median)");

  //console.log(height)
  //Create group for y-axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, ${height/2}) rotate(-90)`)
    // .attr("transform", "rotate(-90)");

  var healthcareLabel = ylabelsGroup.append('text')
    .classed("active eText", true)
    .attr("x", 0)
    .attr("y", -45)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)");

  var obesityLabel = ylabelsGroup.append('text')
    .classed("inactive eText", true)
    .attr("x", 0)
    .attr("y", -65)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .text("Obesite (%)");

  var smokesLabel = ylabelsGroup.append('text')
    .classed("inactive eText", true)
    .attr("x", 0)
    .attr("y", -85)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .text("Smokes (%)");

// update ToolTip function before csv import
  // add chosenYAxis first
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Event Listener: mouse click on the object (x- axis title)-> make change
  xlabelsGroup.selectAll("text").on("click", function() {
  //   // get value of selection
    var value = d3.select(this).attr("value");

    if (value !== chosenXAxis) {

  //     // replaces chosenXAxis with value
      chosenXAxis = value;

  //     // updates x scale for new data
      xLinearScale = xScale(censusData, chosenXAxis);

  //     // updates x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

  //     // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //     //
      textGroup = renderTextGroupXAxis(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //     // updates Tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    }
  });

  // If one parameter on x-axis is selected other two have to be switched to inactive
  xlabelsGroup.selectAll("text").on("click", function() {
        var value = d3.select(this).attr("value");

        if (value != chosenXAxis) {

          chosenXAxis = value; 

          xLinearScale = xScale(censusData, chosenXAxis);

  //         // Update x axis
          xAxis = renderXAxis(xLinearScale, xAxis);

  //         // Upate circle markers with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //         // Update text labels
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //         // Update tooltips
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //       // Switch between selecte parameters: click on "Poverty"
          if (chosenXAxis === "poverty") {
            povertyLabel
                .classed("active aText", true)
                .classed("inactive", false);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            } 
  //         // Click on "Age"
          else if (chosenXAxis === "age"){
              povertyLabel
                  .classed("active aText", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active aText", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
          }
  //         // Click on "Income"
          else {
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active aText", false)
                .classed("inactive", true);
            incomeLabel
                .classed("active aText", true)
                .classed("inactive", false);
          }
      }
  });

  // Event Listener: mouse click on the object (y-axis title)-> make change
  ylabelsGroup.selectAll("text").on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

  //     // replaces chosenYAxis with value
      chosenYAxis = value;

  //     // Update y-scale for new data
      yLinearScale = yScale(censusData, chosenYAxis);

  //     // Update y-axis with transition
      yAxis = renderYAxis(yLinearScale, yAxis);

  //     // Update circle markers with new y values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
      
  //     // Update text labels
      textGroup = renderTextGroupYAxis(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

  //     // Updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //     // Change classes to inactive if one paratemer is selected on y-axis:
  //     // Click on "Healthcare"
      if (chosenYAxis === "healthcare") {
          healthcareLabel
              .classed("active aText", true)
              .classed("inactive", false);
          smokesLabel
              .classed("active", false)
              .classed("inactive", true);
          obeseLabel
              .classed("active", false)
              .classed("inactive", true);
      } 
  //     //Click on "Smokes"
      else if (chosenYAxis === "smokes") {
            healthcareLabel
                .classed("active aText", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active aText", true)
                .classed("inactive", false);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
      }
  //     // Click on "Obesity"
      else {
        healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        smokesLabel
            .classed("active aText", false)
            .classed("inactive", true);
        obeseLabel
            .classed("active aText", true)
            .classed("inactive", false);
      }
    }
  });
});
}

makeResponsive();
d3.select(window).on("resize", makeResponsive);
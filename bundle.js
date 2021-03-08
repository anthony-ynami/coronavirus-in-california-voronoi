(function (React$1, ReactDOM, d3$1) {
  'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var React__default = /*#__PURE__*/_interopDefaultLegacy(React$1);
  var ReactDOM__default = /*#__PURE__*/_interopDefaultLegacy(ReactDOM);

  var csvUrl ='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv';

  var parseDay = d3$1.timeParse('%m/%d/%y');

  var editData = function (rawData) {
    //console.log(rawData.columns)
    //filter out to show only
    var caliData = rawData.filter(function (d) { return d['Province_State'] === 'California'; });
    //create arr of columns that only contain dates
  	var days = rawData.columns.slice(12);
    //iterate thru each county
    return caliData.map(function (d) {
    	var countyName = d['Admin2'];
    	//for each day create obj
      var caliTimeseries = days.map(function (day) { return ({ 	
      	date: parseDay(day),
      	deathTotal: +d[day],
        countyName: countyName
    	}); });
      caliTimeseries.countyName = countyName;
      return caliTimeseries
    });
  };


  var useData = function () {
  	var ref = React$1.useState();
  	var data = ref[0];
  	var setData = ref[1];
    
    React$1.useEffect(function () {
    	d3$1.csv(csvUrl).then(function (rawData) {
      	setData(editData(rawData));
      });
    }, []);
    
    return data
  };

  var XAxis = function (ref$1) {
    var xScale = ref$1.xScale;
    var innerHeight = ref$1.innerHeight;

    var ref = React$1.useRef();
    React$1.useEffect(function () {
      //ref's current is the dom node containing the el
    	var xAxisG = d3$1.select(ref.current);
      var xAxis = d3$1.axisBottom(xScale)
      	.tickSize(-innerHeight);
      //rotate the labels bc they are too long 
      xAxisG.call(xAxis).selectAll('.tick text')
      	.attr("transform", "translate(0,5)rotate(-45)");
    },[]);
    //d3 manages the dom in the element below, not react
  	return React.createElement( 'g', { transform: ("translate(0," + innerHeight + ")"), ref: ref })
  };

  var YAxis = function (ref$1) {
    var yScale = ref$1.yScale;
    var innerWidth = ref$1.innerWidth;

    var ref = React$1.useRef();
    React$1.useEffect(function () {
      //ref's current is the dom node containing the el
    	var yAxisG = d3$1.select(ref.current);
      var yAxis = d3$1.axisLeft(yScale)
      	.tickSize(-innerWidth)
      	.tickPadding(3)
      	//reduce log ticks to 10, with standard (~s) formatting
      	.ticks(10, "~s");
      	
    	//remove the last tick in the axis, bc it's alread in the XMarkerLine
      yAxisG.call(yAxis);

    },[]);
    
  	return React.createElement( 'g', { ref: ref })
  };

  var VoronoiOverlay = function (ref) {
  	var innerWidth = ref.innerWidth;
  	var innerHeight = ref.innerHeight;
  	var allData = ref.allData;
  	var lineGen = ref.lineGen;
  	var onHover = ref.onHover;
  	var margin = ref.margin;

  	return React$1.useMemo(function () {
      //check if it only runs once/necessary
      //console.log('memoizing');
    	var points =  allData.map(function (d) { return [
        lineGen.x()(d),
        lineGen.y()(d)
      ]; });
    	//generate polygon from given points
  		var delaunay = d3.Delaunay.from(points);
    	//apply delaunay polygon to voronoi canvas
     	var voronoi = delaunay.voronoi([0, 0, innerWidth + margin.right, innerHeight]);
    	return( 
      React.createElement( 'g', { className: "voronoi" },
      	points.map(function (point, i) { return (
    			React.createElement( 'path', {
        		onMouseEnter: function () { return onHover(allData[i]); }, d: voronoi.renderCell(i) })
    	); })
      )
  	)}, [allData, lineGen, innerWidth, innerHeight, onHover]);
  };

  var xValue = function (d) { return d.date; };
  var yValue = function (d) { return d.deathTotal; };

  var margin = {top: 45, right: 40, bottom: 95, left: 75};

  var formatDate = d3$1.timeFormat('%b %d, %Y');
  var formatComma = d3$1.format(',');

  var Tooltip = function (ref) {
    var activeRow = ref.activeRow;
    var className = ref.className;

    return (
    React__default['default'].createElement( 'text', { className: className, x: -10, y: -1, 'text-anchor': 'end' },
      activeRow.countyName, ": ", formatComma(activeRow.deathTotal),
      activeRow.deathTotal === 1 ? ' death': ' deaths', " as of ", formatDate(activeRow.date)
    ) 
  );
  };

  var LineChart = function (ref) {
    var data = ref.data;
    var width = ref.width;
    var height = ref.height;

    //chanved activeCountyName to activeRow to contain more info
    var ref$1 = React$1.useState();
    var activeRow = ref$1[0];
    var setActiveRow = ref$1[1];
    
    var innerWidth = width - margin.left - margin.right;
  	var innerHeight = height - margin.top - margin.bottom;
    
    //concat all caliTimeseries together into one arr
    //makes it accessible for voronoi polygons
    var allData = React$1.useMemo(function () { return data.reduce(
      function (accumulator, caliTimeseries) { return accumulator.concat(caliTimeseries); },
      []
    ); },[data]); 

    var epsilon = 1;
    
    var xScale = React$1.useMemo(function () { return d3$1.scaleTime()
    	.domain(d3$1.extent(allData, xValue))
    	.range([0, innerWidth]); },
      [allData, xValue]);
    
    var yScale = React$1.useMemo(function () { return d3$1.scaleLog()
    	.domain([epsilon, d3$1.max(allData, yValue)])
    	.range([innerHeight, 0]); },
      [epsilon, allData, yValue]);
    
    var lineGen = React$1.useMemo(function () { return d3$1.line()
    	.x(function (d) { return xScale(xValue(d)); })
  		.y(function (d) { return yScale(epsilon+ yValue(d)); }); },
      [xScale,xValue,yScale,epsilon,yValue]);

  	xScale.domain()[1];
    
    //useCallback to refer to cache instead of new function
    var handleVoronoiHover = React$1.useCallback(setActiveRow, []);
    
  	return (
      React__default['default'].createElement( 'svg', { width: width, height: height },
        React__default['default'].createElement( 'g', { transform: ("translate(" + (margin.left) + ", " + (margin.top) + ")") },
          React__default['default'].createElement( XAxis, { xScale: xScale, innerHeight: innerHeight }),
          React__default['default'].createElement( YAxis, { yScale: yScale, innerWidth: innerWidth }),
          data.map(function (caliTimeseries) { return (
              React__default['default'].createElement( 'path', { className: 'marker-line', d: lineGen(caliTimeseries) })
            ); }),
          activeRow ? //isolate active line
            React__default['default'].createElement( React__default['default'].Fragment, null,
          React__default['default'].createElement( 'path', { 
            className: 'marker-line active', d: lineGen(data.find(
                function (caliTimeseries){ return caliTimeseries.countyName === activeRow.countyName; })) }),
            React__default['default'].createElement( 'g', { transform: ("translate(" + (lineGen.x()(activeRow)) + "," + (lineGen.y()(activeRow)) + ")") },
              React__default['default'].createElement( 'circle', { r: 10 }), "//first text to make actual text POP ", React__default['default'].createElement( Tooltip, { className: "tooltip-stroke", activeRow: activeRow }),
              React__default['default'].createElement( Tooltip, { className: "tooltip", activeRow: activeRow })
            )
            )
          :null,
          React__default['default'].createElement( 'text', { className: 'title', transform: 'translate(0,-10)' }, "California Coronavirus Deaths Over Time"),
          React__default['default'].createElement( 'text', {
            className: "axis-label", transform: ("translate(-40," + (innerHeight/2) + ") rotate(-90)") }, "Cumulative Deaths"),
          React__default['default'].createElement( 'text', {
            className: "axis-label", transform: ("translate(" + (innerWidth/2) + "," + (innerHeight+70) + ")"), 'alignment-baseline': "hanging" }, "Time"),
  				React__default['default'].createElement( VoronoiOverlay, { 
            onHover: handleVoronoiHover, innerHeight: innerHeight, innerWidth: innerWidth, allData: allData, lineGen: lineGen, margin: margin })
        	
        )
      )
  )};

  //adaptable viewport
  var height = window.innerHeight;
  var width = window.innerWidth;

  var App = function () {
    var data = useData();
  	return data 
      ? React__default['default'].createElement( LineChart, { data: data, height: height, width: width }) 
      : null;
  };

  var rootElement = document.getElementById('root');
  ReactDOM__default['default'].render(React__default['default'].createElement( App, null ),rootElement);

}(React, ReactDOM, d3));
//# sourceMappingURL=bundle.js.map

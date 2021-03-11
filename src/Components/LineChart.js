import React, { useState, useCallback, useMemo } from 'react';
import { scaleTime, scaleLog, extent, max, line, timeFormat, format } from 'd3';

import { XAxis } from './XAxis';
import { YAxis } from './YAxis';
import { VoronoiOverlay } from './VoronoiOverlay';

const xValue = d => d.date;
const yValue = d => d.deathTotal;

const margin = { top: 45, right: 40, bottom: 95, left: 75 };

const formatDate = timeFormat('%b %d, %Y');
const formatComma = format(',')

const Tooltip = ({ activeRow, className }) => (
  <text className={className} x={-10} y={-1} text-anchor={'end'} >
    {activeRow.countyName}: {formatComma(activeRow.deathTotal)}
    {activeRow.deathTotal === 1 ? ' death' : ' deaths'} as of {formatDate(activeRow.date)}
  </text>
)

export const LineChart = ({ data, width, height }) => {
  //chanved activeCountyName to activeRow to contain more info
  const [activeRow, setActiveRow] = useState();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //concat all caliTimeseries together into one arr
  //makes it accessible for voronoi polygons
  const allData = useMemo(() => data.reduce(
    (accumulator, caliTimeseries) => accumulator.concat(caliTimeseries),
    []
  ), [data]);

  const epsilon = 1;

  const xScale = useMemo(() => scaleTime()
    .domain(extent(allData, xValue))
    .range([0, innerWidth]),
    [allData, innerWidth]);

  const yScale = useMemo(() => scaleLog()
    .domain([epsilon, max(allData, yValue)])
    .range([innerHeight, 0]),
    [epsilon, allData, innerHeight]);

  const lineGen = useMemo(() => line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(epsilon + yValue(d))),
    [xScale, yScale, epsilon])

  //const mostRecentDate = xScale.domain()[1];

  //useCallback to refer to cache instead of new function
  const handleVoronoiHover = useCallback(setActiveRow, [setActiveRow]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <XAxis xScale={xScale} innerHeight={innerHeight} />
        <YAxis yScale={yScale} innerWidth={innerWidth} />
        {//single js that returns a val
          data.map(caliTimeseries => (
            <path className='marker-line' d={lineGen(caliTimeseries)} />
          ))
        }
        {activeRow ? //isolate active line
          <>
            <path
              className='marker-line active'
              // parses data for match and returns the indexed val 
              d={lineGen(data.find(
                caliTimeseries =>
                  caliTimeseries.countyName === activeRow.countyName))} />
            <g transform={`translate(${lineGen.x()(activeRow)},${lineGen.y()(activeRow)})`}>
              <circle r={10} />
              <Tooltip className="tooltip-stroke" activeRow={activeRow} />
              <Tooltip className="tooltip" activeRow={activeRow} />
            </g>
          </>
          : null
        }
        <text className='title'
          transform='translate(0,-10)'
        >
          California Coronavirus Deaths Over Time
        </text>
        <text
          className="axis-label"
          transform={`translate(-40,${innerHeight / 2}) rotate(-90)`}
        >
          Cumulative Deaths
        </text>
        <text
          className="axis-label"
          transform={`translate(${innerWidth / 2},${innerHeight + 70})`}
          alignment-baseline="hanging"
        >
          Time
        </text>
        <VoronoiOverlay
          onHover={handleVoronoiHover}
          innerHeight={innerHeight}
          innerWidth={innerWidth}
          allData={allData}
          lineGen={lineGen}
          margin={margin}
        />
      </g>
    </svg>
  )
}
import { useRef, useEffect } from 'react';
import { select, axisBottom } from 'd3';

export const XAxis = ({ xScale, innerHeight }) => {
  const ref = useRef();
  useEffect(() => {
    //ref's current is the dom node containing the el
    const xAxisG = select(ref.current);
    const xAxis = axisBottom(xScale)
      .tickSize(-innerHeight)
    //rotate the labels bc they are too long 
    xAxisG.call(xAxis).selectAll('.tick text')
      .attr("transform", "translate(0,5)rotate(-45)")
  }, [innerHeight, xScale])
  //d3 manages the dom in the element below, not react
  return <g transform={`translate(0,${innerHeight})`} ref={ref} />
}
import {useRef, useEffect} from 'react';
import {select, axisLeft, tickFormat} from 'd3';

export const YAxis = ({yScale, innerWidth}) =>{
  const ref = useRef();
  useEffect(() => {
    //ref's current is the dom node containing the el
  	const yAxisG = select(ref.current);
    const yAxis = axisLeft(yScale)
    	.tickSize(-innerWidth)
    	.tickPadding(3)
    	//reduce log ticks to 10, with standard (~s) formatting
    	.ticks(10, "~s")
    	
  	//remove the last tick in the axis, bc it's alread in the XMarkerLine
    yAxisG.call(yAxis);

  },[])
  
	return <g ref={ref}/>
}
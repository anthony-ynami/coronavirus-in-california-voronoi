import {useMemo} from 'react';

export const VoronoiOverlay = ({
  innerWidth, 
  innerHeight, 
  allData, 
  lineGen, 
  onHover,
  margin
}) =>{
	return useMemo(() =>{
    //check if it only runs once/necessary
    //console.log('memoizing');
  	const points =  allData.map(d => [
      lineGen.x()(d),
      lineGen.y()(d)
    ]);
  	//generate polygon from given points
		const delaunay = d3.Delaunay.from(points);
  	//apply delaunay polygon to voronoi canvas
   	const voronoi = delaunay.voronoi([0, 0, innerWidth + margin.right, innerHeight]);
  	return( 
    <g className="voronoi">
    	{points.map((point, i) =>(
  			<path
      		onMouseEnter={() => onHover(allData[i])} 
      		d={voronoi.renderCell(i)}
      	/>
  	))}
    </g>
	)}, [allData, lineGen, innerWidth, innerHeight, onHover]);
};
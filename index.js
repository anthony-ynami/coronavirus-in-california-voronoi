import React from "react";
import ReactDOM from "react-dom";
import {range} from 'd3';

import {useData} from './useData';
import {LineChart} from './LineChart';

//adaptable viewport
const height = window.innerHeight;
const width = window.innerWidth;

const App = () =>{
  const data = useData();
	return data 
    ? <LineChart data={data} height={height} width={width} /> 
    : null;
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App/>,rootElement);
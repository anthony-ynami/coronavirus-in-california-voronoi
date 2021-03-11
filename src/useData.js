import {
  useState,
  useEffect
} from "react";
import {
  csv,
  timeParse
} from 'd3';

const csvUrl = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv';

//version below tied to specific commit for stability
// const csvUrl ='https://raw.githubusercontent.com/CSSEGISandData/COVID-19/bb5678530e6ed383457234c0c2f95586a2133af5/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv';

//const sum = (accumulator, currentValue) => accumulator + currentValue;

const parseDay = timeParse('%m/%d/%y')

const editData = rawData => {
  //console.log(rawData.columns)
  //filter out to show only
  const caliData = rawData.filter(d => d['Province_State'] === 'California');
  //create arr of columns that only contain dates
  const days = rawData.columns.slice(12);
  //iterate thru each county
  return caliData.map(d => {
    const countyName = d['Admin2']
    //for each day create obj
    const caliTimeseries = days.map(day => ({
      date: parseDay(day),
      deathTotal: +d[day],
      countyName
    }));
    caliTimeseries.countyName = countyName;
    return caliTimeseries
  });
};


export const useData = () => {
  const [data, setData] = useState();

  useEffect(() => {
    csv(csvUrl).then(rawData => {
      setData(editData(rawData))
    })
  }, [])

  return data
}
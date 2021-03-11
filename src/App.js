import { useData } from './useData';
import { LineChart } from './Components/LineChart';

const height = window.innerHeight;
const width = window.innerWidth;

function App() {
  const data = useData();
  return data
    ? <LineChart data={data} height={height} width={width} />
    : null;
}

export default App;

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';

const Home: NextPage = () => {
  const [data, setData] = useState<string[]>([]);

  async function getData() {
    const res = await fetch('/api/attendance', { method: 'GET' });
    const d = await res.json();
    setData(d.result);
  }
  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      <ul>
        {data.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;

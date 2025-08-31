import { useEffect, useState } from "react";

export default function Display() {
  const [queues, setQueues] = useState({
    poli1: 0,
    poli2: 0,
    poli3: 0,
    apotik: 0,
    kasir: 0,
  });

  useEffect(() => {
    const updateQueues = () => {
      const saved = localStorage.getItem("queues");
      if (saved) setQueues(JSON.parse(saved));
    };

    updateQueues();
    window.addEventListener("storage", updateQueues);
    return () => window.removeEventListener("storage", updateQueues);
  }, []);

  return (
    <div className="w-screen h-screen bg-white flex flex-col p-6">
      <h1 className="text-5xl font-extrabold text-green-700 text-center mb-8">
        Nomor Antrian
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="bg-green-600 text-white flex flex-col items-center justify-center rounded-2xl shadow-lg">
          <span className="text-5xl font-semibold">Poli 1</span>
          <span className="text-9xl mt-2 font-bold">{queues.poli1}</span>
        </div>

        <div className="bg-green-600 text-white flex flex-col items-center justify-center rounded-2xl shadow-lg">
          <span className="text-5xl font-semibold">Poli 2</span>
          <span className="text-9xl mt-2 font-bold">{queues.poli2}</span>
        </div>

        <div className="bg-green-600 text-white flex flex-col items-center justify-center rounded-2xl shadow-lg">
          <span className="text-5xl font-semibold">Poli 3</span>
          <span className="text-9xl mt-2 font-bold">{queues.poli3}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-green-500 text-white flex flex-col items-center justify-center rounded-2xl shadow-lg h-48">
          <span className="text-4xl font-semibold">Apotik</span>
          <span className="text-8xl mt-2 font-bold">{queues.apotik}</span>
        </div>

        <div className="bg-green-500 text-white flex flex-col items-center justify-center rounded-2xl shadow-lg h-48">
          <span className="text-4xl font-semibold">Kasir</span>
          <span className="text-8xl mt-2 font-bold">{queues.kasir}</span>
        </div>
      </div>
    </div>
  );
}

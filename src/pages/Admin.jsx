import { useState, useEffect, useRef } from "react";

export default function Admin() {
  const [queues, setQueues] = useState({
    poli1: 0,
    poli2: 0,
    poli3: 0,
    apotik: 0,
    kasir: 0,
  });

  // counter global hanya untuk Poli 1–3
  const [globalCounter, setGlobalCounter] = useState(0);

  // history khusus Poli 1–3 (supaya Previous ambil angka yg pernah tampil)
  const [historyPoli, setHistoryPoli] = useState({
    poli1: [],
    poli2: [],
    poli3: [],
  });

  const voiceRef = useRef(null);

  // Load voices (ambil voice Bahasa Indonesia kalau ada)
  useEffect(() => {
    const loadVoices = () => {
      if (!("speechSynthesis" in window)) return;
      const allVoices = window.speechSynthesis.getVoices();
      const indoVoice = allVoices.find((v) => v.lang?.startsWith("id"));
      voiceRef.current = indoVoice || null;
    };
    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sync ke Display via localStorage
  useEffect(() => {
    localStorage.setItem("queues", JSON.stringify(queues));
  }, [queues]);

  // Umum: text-to-speech
  const announce = (loket, number) => {
    if (!("speechSynthesis" in window)) return;
    if (number <= 0) return; // jangan umumkan 0
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(
      `Nomor antrian ${numberToBahasa(number)}, silahkan menuju ke ${poliToBahasa(loket)}`
    );
    msg.lang = "id-ID";
    msg.rate = 1.0;
    if (voiceRef.current) msg.voice = voiceRef.current;
    window.speechSynthesis.speak(msg);
  };

  // NEXT untuk Poli 1–3 (pakai global counter + catat history)
  const handleNextPoli = (key, label) => {
    setGlobalCounter((prev) => {
      const nextNumber = prev + 1;

      // update angka tampil
      setQueues((q) => ({ ...q, [key]: nextNumber }));

      // append ke history poli tsb
      setHistoryPoli((h) => ({
        ...h,
        [key]: [...(h[key] || []), nextNumber],
      }));

      announce(label, nextNumber);
      return nextNumber;
    });
  };

  // PREV untuk Poli 1–3 (pakai history; ambil angka yang benar2 tampil sebelumnya)
  const handlePrevPoli = (key, label) => {
    setHistoryPoli((h) => {
      const hist = h[key] || [];
      if (hist.length === 0) return h; // belum ada apa-apa, abaikan

      // buang angka terakhir
      const newHist = hist.slice(0, -1);
      // angka yang sekarang harus tampil = elemen terakhir newHist (atau 0 kalau kosong)
      const current = newHist.length ? newHist[newHist.length - 1] : 0;

      setQueues((q) => ({ ...q, [key]: current }));
      if (current > 0) announce(label, current);

      return { ...h, [key]: newHist };
    });
  };

  // NEXT / PREV untuk Apotik & Kasir (manual increment/decrement biasa)
  const handleNextManual = (key, label) => {
    setQueues((prev) => {
      const next = prev[key] + 1;
      const updated = { ...prev, [key]: next };
      announce(label, next);
      return updated;
    });
  };

  const handlePrevManual = (key, label) => {
    setQueues((prev) => {
      const next = prev[key] > 0 ? prev[key] - 1 : 0;
      const updated = { ...prev, [key]: next };
      if (next > 0) announce(label, next);
      return updated;
    });
  };

  // Konversi angka -> teks Indonesia (singkat)
  const numberToBahasa = (num) => {
    const satuan = [
      "nol","satu","dua","tiga","empat","lima",
      "enam","tujuh","delapan","sembilan","sepuluh","sebelas",
    ];
    if (num < 12) return satuan[num];
    if (num < 20) return satuan[num - 10] + " belas";
    if (num < 100) {
      const puluhan = Math.floor(num / 10);
      const sisa = num % 10;
      return satuan[puluhan] + " puluh" + (sisa ? " " + satuan[sisa] : "");
    }
    return num.toString();
  };

  const poliToBahasa = (poli) => {
    switch (poli) {
      case "Poli 1": return "Poli satu";
      case "Poli 2": return "Poli dua";
      case "Poli 3": return "Poli tiga";
      case "Apotik": return "Apotik";
      case "Kasir": return "Kasir";
      default: return poli;
    }
  };

  return (
    <div className="w-screen h-screen bg-white flex flex-col p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Admin Panel Antrian
      </h1>

      {/* 3 kolom Poli (pakai global + history) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["poli1", "poli2", "poli3"].map((key, idx) => (
          <div key={key} className="bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-green-600">
              Poli {idx + 1}
            </h2>
            <p className="text-7xl font-extrabold font-mono tracking-wider text-green-600 my-6">
              {queues[key]}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handlePrevPoli(key, `Poli ${idx + 1}`)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() => handleNextPoli(key, `Poli ${idx + 1}`)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2 kolom Apotik & Kasir (manual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {[
          { key: "apotik", label: "Apotik" },
          { key: "kasir", label: "Kasir" },
        ].map(({ key, label }) => (
          <div key={key} className="bg-white rounded-2xl shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-green-600">{label}</h2>
            <p className="text-7xl font-extrabold font-mono tracking-wider text-green-600 my-6">
              {queues[key]}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handlePrevManual(key, label)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() => handleNextManual(key, label)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

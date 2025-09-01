import { useState, useEffect, useRef } from "react";

export default function Admin() {
  const [queues, setQueues] = useState({
    poli1: 0,
    poli2: 0,
    poli3: 0,
    apotik: 0,
    kasir: 0,
  });

  const [voices, setVoices] = useState([]);
  const voiceRef = useRef(null);

  // Ambil voice daftar dari browser
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      // Pilih suara bahasa Indonesia kalau ada
      const indoVoice = allVoices.find((v) => v.lang.startsWith("id"));
      voiceRef.current = indoVoice || null;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Simpan ke localStorage supaya Display sync
  useEffect(() => {
    localStorage.setItem("queues", JSON.stringify(queues));
  }, [queues]);

  // Fungsi buat announce pakai SpeechSynthesis
  const announce = (loket, number) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const numText = numberToBahasa(number);
      const poliText = poliToBahasa(loket);

      const msg = new SpeechSynthesisUtterance(
        `Nomor antrian ${numText}, silahkan menuju ke ${poliText}`
      );
      msg.lang = "id-ID";
      msg.rate = 1.0;

      // kalau ada voice Indo, pakai itu
      if (voiceRef.current) {
        msg.voice = voiceRef.current;
      }

      window.speechSynthesis.speak(msg);
    }
  };

  const handleNext = (key, label) => {
  setQueues((prev) => {
    const newQueues = { ...prev, [key]: prev[key] + 1 };
    if (newQueues[key] > 0) {
      announce(label, newQueues[key]);
    }
    return newQueues;
  });
};

const handlePrev = (key, label) => {
  setQueues((prev) => {
    const newNumber = prev[key] > 0 ? prev[key] - 1 : 0;
    const newQueues = { ...prev, [key]: newNumber };

    if (newNumber > 0) {
      announce(label, newNumber);
    }

    return newQueues;
  });
};


  // Fungsi konversi angka ke teks bahasa Indonesia
  const numberToBahasa = (num) => {
    const satuan = [
      "nol",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima",
      "enam",
      "tujuh",
      "delapan",
      "sembilan",
      "sepuluh",
      "sebelas",
    ];

    if (num < 12) return satuan[num];
    if (num < 20) return satuan[num - 10] + " belas";
    if (num < 100) {
      const puluhan = Math.floor(num / 10);
      const sisa = num % 10;
      return (
        satuan[puluhan] + " puluh" + (sisa > 0 ? " " + satuan[sisa] : "")
      );
    }
    return num.toString();
  };

  const poliToBahasa = (poli) => {
    switch (poli) {
      case "Poli 1":
        return "Poli satu";
      case "Poli 2":
        return "Poli dua";
      case "Poli 3":
        return "Poli tiga";
      case "Apotik":
        return "Apotik";
      case "Kasir":
        return "Kasir";
      default:
        return poli;
    }
  };

  return (
    <div className="w-screen h-screen bg-white flex flex-col p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Admin Panel Antrian
      </h1>

      {/* 3 kolom untuk Poli */}
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
                onClick={() => handlePrev(key, `Poli ${idx + 1}`)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() => handleNext(key, `Poli ${idx + 1}`)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2 kolom untuk Apotik & Kasir */}
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
                onClick={() => handlePrev(key, label)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Previous
              </button>
              <button
                onClick={() => handleNext(key, label)}
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

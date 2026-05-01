import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageCard from "@/components/LanguageCard";
import FloatingDots from "@/components/FloatingDots";
import BrandedFrame from "@/components/BrandedFrame";
import robotPlaceholder from "@/assets/images/km0-robot.png";
import flagCa from "@/assets/images/flags/flag-ca.svg";
import flagEs from "@/assets/images/flags/flag-es.svg";
import flagEn from "@/assets/images/flags/flag-en.svg";

const languages: {id: string; flag: string; flagIsImage?: boolean; name: string; description: string; disabled?: boolean;}[] = [
  { id: "ca", flag: flagCa, flagIsImage: true, name: "Català", description: "Comença en català" },
  { id: "es", flag: flagEs, flagIsImage: true, name: "Español", description: "Empieza en español" },
  { id: "en", flag: flagEn, flagIsImage: true, name: "English", description: "Start in English", disabled: true },
];

const Language = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => navigate("/onboarding", { state: { lang: id } }), 300);
  };

  return (
    <BrandedFrame>
      {/* ── PORTRAIT body ───────────────────────────────── */}
      <div className="landscape:hidden flex-1 min-h-0 w-full max-w-[390px] sm:max-w-[560px] mx-auto flex flex-col justify-start items-stretch pt-2 pb-4 sm:py-4 gap-4 sm:gap-6">
        {/* Robot */}
        <div className="flex justify-center shrink-0">
          <div className="relative w-[230px] h-[230px] sm:w-[340px] sm:h-[340px] flex items-center justify-center">
            <FloatingDots />
            <div className="relative w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-km0-teal-400/25 border-2 border-km0-blue-700" />
              <div className="absolute inset-[14%] rounded-full bg-km0-teal-500/90" />
              <img
                src={robotPlaceholder}
                alt="KM0 LAB mascot"
                className="relative z-10 h-[70%] w-auto object-contain animate-float drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        <h2 className="text-center font-ui font-semibold text-base sm:text-xl text-km0-blue-700 shrink-0">
          Escoge tu idioma
        </h2>

        {/* En vertical-mobile (375×667) reducimos altura de cards
            (py-2 + flag más pequeña) para que las 3 quepan SIN scroll.
            En sm+ recuperamos los tamaños originales. */}
        <div className="flex flex-col gap-2 sm:gap-4 shrink-0
            [&_button]:!py-2 [&_button]:!gap-3
            [&_button>span:first-child]:!w-10 [&_button>span:first-child]:!h-10
            [&_button>span:first-child>img]:!w-7 [&_button>span:first-child>img]:!h-7
            [&_button_p:first-child]:!text-base
            [&_button_p:last-child]:!text-xs
            sm:[&_button]:!py-5 sm:[&_button]:!gap-4
            sm:[&_button>span:first-child]:!w-14 sm:[&_button>span:first-child]:!h-14
            sm:[&_button>span:first-child>img]:!w-11 sm:[&_button>span:first-child>img]:!h-11
            sm:[&_button_p:first-child]:!text-xl
            sm:[&_button_p:last-child]:!text-base">
          {languages.map((lang, i) => (
            <LanguageCard
              key={lang.id}
              flag={lang.flag}
              flagIsImage={lang.flagIsImage}
              name={lang.name}
              description={lang.description}
              selected={selected === lang.id}
              disabled={lang.disabled}
              onClick={() => handleSelect(lang.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* ── LANDSCAPE body ──────────────────────────────── */}
      <div className="hidden landscape:flex flex-1 min-h-0 w-full items-stretch">
        {/* Columna izquierda: ilustración */}
        <div className="flex-1 relative flex items-center justify-center pr-6 horizontal-mobile:pr-4">
          <FloatingDots />
          <div className="relative aspect-square h-full max-h-[min(70%,360px)] horizontal-mobile:max-h-[60%] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-km0-teal-400/25 border-2 border-km0-blue-700" />
            <div className="absolute inset-[14%] rounded-full bg-km0-teal-500/90" />
            <img
              src={robotPlaceholder}
              alt="KM0 LAB mascot"
              className="relative z-10 h-[70%] w-auto object-contain animate-float drop-shadow-lg"
            />
          </div>
        </div>

        {/* Divisor */}
        <div className="w-px bg-km0-yellow-500/60 self-stretch mx-2 horizontal-mobile:mx-1" />

        {/* Columna derecha: tarjetas */}
        <div className="flex-1 flex flex-col justify-center gap-3 horizontal-mobile:gap-2 pl-6 horizontal-mobile:pl-4
            [&_button]:py-3 horizontal-mobile:[&_button]:py-2
            [&_button]:px-4 horizontal-mobile:[&_button]:px-3
            [&_button>span:first-child]:w-11 [&_button>span:first-child]:h-11
            horizontal-mobile:[&_button>span:first-child]:w-9 horizontal-mobile:[&_button>span:first-child]:h-9
            [&_button>span:first-child>img]:w-9 [&_button>span:first-child>img]:h-9
            horizontal-mobile:[&_button>span:first-child>img]:w-7 horizontal-mobile:[&_button>span:first-child>img]:h-7
            [&_button_p:first-child]:text-lg
            horizontal-mobile:[&_button_p:first-child]:text-base
            [&_button_p:last-child]:text-sm
            horizontal-mobile:[&_button_p:last-child]:text-xs">
          {languages.map((lang, i) => (
            <LanguageCard
              key={lang.id}
              flag={lang.flag}
              flagIsImage={lang.flagIsImage}
              name={lang.name}
              description={lang.description}
              selected={selected === lang.id}
              disabled={lang.disabled}
              onClick={() => handleSelect(lang.id)}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </BrandedFrame>
  );
};

export default Language;

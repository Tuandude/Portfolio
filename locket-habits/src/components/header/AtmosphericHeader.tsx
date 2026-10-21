import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import type { TimePhase, WeatherState } from '../../types';
import { SoundService } from '../../services/sound';

interface AtmosphericHeaderProps {
  timePhase: TimePhase;
  weather: WeatherState;
  onTimeChange: (phase: TimePhase) => void;
  onWeatherChange: (weather: WeatherState) => void;
}

export const AtmosphericHeader: React.FC<AtmosphericHeaderProps> = ({
  timePhase,
  weather,
  onTimeChange,
  onWeatherChange,
}) => {
  // Neo-Brutalist Comic Palette & Typography
  const config: Record<
    TimePhase,
    {
      bg: string;
      accent: string;
      tagBg: string;
      badgeText: string;
      title: string;
      sub: string;
      caption: string;
    }
  > = {
    dawn: {
      bg: 'bg-[#FF9F1C]',
      accent: '#FFD166',
      tagBg: 'bg-[#FFE5D9]',
      badgeText: 'EARLY BIRD • 06:30',
      title: 'DAWN RUNNER',
      sub: 'BÌNH MINH TỎA NẮNG',
      caption: 'Nạp năng lượng khởi đầu chuỗi mới!',
    },
    day: {
      bg: 'bg-[#3A86FF]',
      accent: '#FFD166',
      tagBg: 'bg-[#FFD166]',
      badgeText: 'PEAK FOCUS • 12:00',
      title: 'SOLAR CHARGE',
      sub: 'NĂNG LƯỢNG RỰC CHÁY',
      caption: 'Đập tan trì hoãn, hoàn thành task!',
    },
    dusk: {
      bg: 'bg-[#8338EC]',
      accent: '#FF006E',
      tagBg: 'bg-[#FF6B8B]',
      badgeText: 'GOLDEN HOUR • 18:00',
      title: 'NEON TWILIGHT',
      sub: 'HOÀNG HÔN RETRO',
      caption: 'Tổng kết ngày, chuẩn bị locket lên đèn!',
    },
    night: {
      bg: 'bg-[#18181B]',
      accent: '#9B5DE5',
      tagBg: 'bg-[#3A86FF]',
      badgeText: 'MIDNIGHT COMIX • 23:00',
      title: 'CYBER LUNAR',
      sub: 'MẶT TRĂNG CÚ ĐÊM',
      caption: 'Bảo toàn chuỗi ngày trước khi ngủ!',
    },
  };

  const current = config[timePhase];

  const handleNextPhase = () => {
    SoundService.playClick();
    const phases: TimePhase[] = ['dawn', 'day', 'dusk', 'night'];
    const next = phases[(phases.indexOf(timePhase) + 1) % phases.length];
    onTimeChange(next);
  };

  const handleNextWeather = () => {
    SoundService.playClick();
    const weathers: WeatherState[] = ['clear', 'cloudy', 'rainy'];
    const next = weathers[(weathers.indexOf(weather) + 1) % weathers.length];
    onWeatherChange(next);
  };

  return (
    <div className="relative w-full rounded-[32px] brutal-border-3 brutal-shadow-lg overflow-hidden mb-5 bg-[#FDFBF7]">
      {/* Top Graphic Banner with Halftone Comic Texture */}
      <div className={`relative ${current.bg} p-5 text-[#18181B] transition-colors duration-500 overflow-hidden`}>
        {/* Retro Halftone Dot Pattern Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#18181B 2px, transparent 2px)`,
            backgroundSize: '12px 12px',
          }}
        />

        {/* Rain Effect: Dynamic Comic Rain Storm with Dense Angled Slashes and Splash Ripples */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {/* Multiple staggered rain columns covering the whole banner */}
            {[
              { x: '3%', delay: 0, dur: 0.42, len: 'h-8' },
              { x: '9%', delay: 0.18, dur: 0.38, len: 'h-10' },
              { x: '16%', delay: 0.05, dur: 0.45, len: 'h-7' },
              { x: '23%', delay: 0.25, dur: 0.4, len: 'h-11' },
              { x: '30%', delay: 0.12, dur: 0.36, len: 'h-9' },
              { x: '37%', delay: 0.28, dur: 0.44, len: 'h-8' },
              { x: '44%', delay: 0.02, dur: 0.39, len: 'h-10' },
              { x: '51%', delay: 0.21, dur: 0.43, len: 'h-7' },
              { x: '58%', delay: 0.08, dur: 0.37, len: 'h-11' },
              { x: '65%', delay: 0.29, dur: 0.41, len: 'h-9' },
              { x: '72%', delay: 0.15, dur: 0.46, len: 'h-8' },
              { x: '79%', delay: 0.04, dur: 0.35, len: 'h-10' },
              { x: '86%', delay: 0.22, dur: 0.42, len: 'h-8' },
              { x: '93%', delay: 0.11, dur: 0.38, len: 'h-11' },
              // Second layer with staggered timing & lighter contrast for depth
              { x: '6%', delay: 0.31, dur: 0.48, len: 'h-6' },
              { x: '19%', delay: 0.35, dur: 0.47, len: 'h-8' },
              { x: '33%', delay: 0.22, dur: 0.5, len: 'h-7' },
              { x: '48%', delay: 0.39, dur: 0.45, len: 'h-9' },
              { x: '62%', delay: 0.27, dur: 0.52, len: 'h-7' },
              { x: '76%', delay: 0.33, dur: 0.46, len: 'h-8' },
              { x: '90%', delay: 0.24, dur: 0.49, len: 'h-6' },
            ].map((drop, i) => (
              <motion.div
                key={i}
                initial={{ y: -60 }}
                animate={{ y: 260 }}
                transition={{
                  duration: drop.dur,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: drop.delay,
                }}
                style={{ left: drop.x }}
                className={`absolute w-1 ${drop.len} bg-[#18181B] -rotate-20 rounded-full opacity-70`}
              />
            ))}

            {/* Bottom Comic Splash Drops bouncing on the footer border */}
            <div className="absolute bottom-1 inset-x-0 flex justify-around px-4">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`splash-${i}`}
                  animate={{
                    scale: [0.6, 1.4, 0.6],
                    opacity: [0.3, 0.9, 0.3],
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.12,
                  }}
                  className="w-2.5 h-1 bg-[#18181B] rounded-full"
                />
              ))}
            </div>
          </div>
        )}

        {/* Header Control Pill Bar */}
        <div className="flex justify-between items-center relative z-20 mb-3">
          {/* Issue Tag / Stamp */}
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 ${current.tagBg} text-[#18181B] brutal-border brutal-shadow-sm font-black text-[10px] tracking-widest uppercase rounded-lg`}>
              {current.badgeText}
            </span>
            <span className="px-2 py-1 bg-white text-[#18181B] brutal-border font-black text-[10px] rounded-lg tracking-wider">
              {weather === 'clear' ? '☀️ CLEAR' : weather === 'cloudy' ? '☁️ OVERCAST' : '🌧️ DOWNPOUR'}
            </span>
          </div>

          {/* Quick Retro Action Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNextPhase}
              className="px-2.5 py-1 bg-white hover:bg-[#FFD166] text-[#18181B] brutal-border brutal-shadow-sm rounded-xl font-black text-[11px] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Chuyển buổi tiếp theo"
            >
              <RefreshCw size={12} strokeWidth={3} /> Buổi
            </button>
            <button
              onClick={handleNextWeather}
              className="px-2.5 py-1 bg-white hover:bg-[#FF6B8B] hover:text-white text-[#18181B] brutal-border brutal-shadow-sm rounded-xl font-black text-[11px] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Đổi thời tiết"
            >
              Thời Tiết
            </button>
          </div>
        </div>

        {/* Middle Main Showcase: Bold Typography + Unique Brutalist Mascot Artwork */}
        <div className="relative flex items-center justify-between z-20 my-2">
          {/* Left: Punchy Retro Comic Headlines */}
          <div className="flex flex-col text-left flex-1 pr-2">
            <div className="inline-block bg-[#18181B] text-white px-2 py-0.5 font-black text-[9px] uppercase tracking-widest brutal-shadow-sm w-fit rounded-md mb-1.5">
              WEATHER ISSUE #{timePhase.toUpperCase()}
            </div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-[2.5px_2.5px_0px_#18181B] uppercase">
              {current.title}
            </h1>
            <p className="text-xs font-black text-[#18181B] bg-white px-2 py-0.5 mt-1.5 rounded-lg brutal-border brutal-shadow-sm w-fit">
              {current.sub}
            </p>
          </div>

          {/* Right: Unique Retro Neo-Brutalist Vector Celestial Illustration */}
          <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
            <motion.div
              key={timePhase}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-24 h-24 select-none"
            >
              {timePhase === 'night' ? (
                /* RETRO CRESCENT CYBER MOON */
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[4px_4px_0px_#18181B]">
                  {/* Star sparkles */}
                  <polygon points="15,14 18,22 26,25 18,28 15,36 12,28 4,25 12,22" fill="#FFD166" stroke="#18181B" strokeWidth="2.5" />
                  <polygon points="85,12 87,17 92,19 87,21 85,26 83,21 78,19 83,17" fill="#FF6B8B" stroke="#18181B" strokeWidth="2" />

                  {/* Bold Crescent Body */}
                  <path
                    d="M 52,8 A 42,42 0 1 0 92,52 A 32,32 0 0 1 52,8 Z"
                    fill="#FFFDF0"
                    stroke="#18181B"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />

                  {/* Angular Neo-Brutalist Sunglasses */}
                  <polygon points="36,36 68,42 62,56 38,50" fill="#18181B" stroke="#18181B" strokeWidth="2" />
                  <line x1="40" y1="41" x2="58" y2="45" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />

                  {/* Cool Smirk */}
                  <path d="M 44,65 Q 54,72 58,62" fill="none" stroke="#18181B" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              ) : (
                /* RETRO EXPLODING SUNBURST / SOLAR STAR */
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[4px_4px_0px_#18181B]">
                  {/* Rotating 8-point Brutalist Sunburst Rays */}
                  <polygon
                    points="50,2 62,26 88,14 76,40 98,50 76,60 88,86 62,74 50,98 38,74 12,86 24,60 2,50 24,40 12,14 38,26"
                    fill={timePhase === 'dusk' ? '#FF5400' : '#FFD166'}
                    stroke="#18181B"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />

                  {/* Inner Core Circle */}
                  <circle cx="50" cy="50" r="23" fill={timePhase === 'dusk' ? '#FF006E' : '#FFAE00'} stroke="#18181B" strokeWidth="3.5" />

                  {/* Retro 80s Cyber Viper Sunglasses */}
                  <polygon points="30,42 70,42 65,55 35,55" fill="#18181B" stroke="#18181B" strokeWidth="2.5" />
                  {/* Neon Lens reflection */}
                  <line x1="34" y1="46" x2="48" y2="46" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="52" y1="46" x2="66" y2="46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Smug comic grin with tooth highlight */}
                  <path d="M 39,63 Q 50,73 61,63 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
                  <line x1="50" y1="63" x2="50" y2="69" stroke="#18181B" strokeWidth="2" />
                </svg>
              )}

              {/* Overcast Cloud (Geometric Comic Style covering 50%) */}
              {weather === 'cloudy' && (
                <div className="absolute -bottom-2 -left-4 z-30">
                  <svg width="68" height="42" viewBox="0 0 68 42" className="drop-shadow-[3px_3px_0px_#18181B]">
                    <path
                      d="M 12,38 L 56,38 A 10,10 0 0 0 58,18 A 14,14 0 0 0 34,10 A 12,12 0 0 0 12,24 A 8,8 0 0 0 12,38 Z"
                      fill="#FFFFFF"
                      stroke="#18181B"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    <line x1="20" y1="32" x2="50" y2="32" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="26" y1="26" x2="44" y2="26" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              {/* Downpour Thunder / Rain Cloud Overlay with Raindrops & Lightning Bolt */}
              {weather === 'rainy' && (
                <div className="absolute -bottom-2 -left-3 z-30 flex flex-col items-center">
                  {/* Heavy Storm Cloud with Bold Inking */}
                  <svg width="74" height="46" viewBox="0 0 74 46" className="drop-shadow-[3px_3px_0px_#18181B]">
                    <path
                      d="M 14,40 L 60,40 A 11,11 0 0 0 62,20 A 15,15 0 0 0 38,11 A 13,13 0 0 0 14,26 A 9,9 0 0 0 14,40 Z"
                      fill="#3A86FF"
                      stroke="#18181B"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    {/* Shadow inking lines */}
                    <line x1="22" y1="34" x2="54" y2="34" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="28" y1="28" x2="48" y2="28" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                  </svg>

                  {/* 3 Comic Raindrops pouring under cloud */}
                  <div className="flex gap-2 -mt-1">
                    {[0, 1, 2].map((idx) => (
                      <motion.div
                        key={idx}
                        animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.4, repeat: Infinity, delay: idx * 0.15 }}
                        className="w-1.5 h-3.5 bg-[#FFD166] rounded-full border border-[#18181B] -rotate-12"
                      />
                    ))}
                  </div>

                  {/* Lightning badge */}
                  <div className="absolute -top-1 -right-3">
                    <div className="bg-[#FFD166] text-[#18181B] p-1.5 rounded-xl brutal-border brutal-shadow-sm font-black flex items-center justify-center">
                      <Zap size={16} fill="#18181B" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Strip: Vintage Comic Editorial Style */}
      <div className="bg-[#FFFFFF] border-t-3 border-[#18181B] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#52B788] brutal-border inline-block" />
          <span className="font-black text-xs text-[#18181B] uppercase tracking-wide">
            {current.caption}
          </span>
        </div>
        <span className="font-black text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded brutal-border">
          LOCKET V2.0
        </span>
      </div>
    </div>
  );
};

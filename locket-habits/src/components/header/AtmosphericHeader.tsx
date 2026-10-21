import { motion } from 'framer-motion';
import { Sun, Moon, Cloud, CloudRain, Sparkles, Droplets } from 'lucide-react';
import type { TimePhase, WeatherState } from '../../types';

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
  // Atmospheric theme styles
  const themes: Record<TimePhase, { bg: string; text: string; skyBorder: string; orbColor: string; title: string }> = {
    dawn: {
      bg: 'from-[#FFAE74] via-[#FFD166] to-[#FFE5D9]',
      text: '#18181B',
      skyBorder: '#FF9E64',
      orbColor: '#FF7B54',
      title: 'Bình Minh Rạng Rỡ 🌄',
    },
    day: {
      bg: 'from-[#60A5FA] via-[#93C5FD] to-[#E0E7FF]',
      text: '#18181B',
      skyBorder: '#3B82F6',
      orbColor: '#FFD166',
      title: 'Ngày Mới Tràn Năng Lượng ☀️',
    },
    dusk: {
      bg: 'from-[#8338EC] via-[#FF006E] to-[#FB5607]',
      text: '#FFFFFF',
      skyBorder: '#3A0CA3',
      orbColor: '#FFBE0B',
      title: 'Hoàng Hôn Chill Chill 🌇',
    },
    night: {
      bg: 'from-[#0B091A] via-[#1B1947] to-[#2B2D42]',
      text: '#FFFFFF',
      skyBorder: '#0F0E17',
      orbColor: '#E2E8F0',
      title: 'Đêm Yên Bình Say Giấc 🌙',
    },
  };

  const currentTheme = themes[timePhase];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl brutal-border brutal-shadow mb-4">
      {/* Background Gradient */}
      <div className={`relative h-44 w-full bg-gradient-to-b ${currentTheme.bg} p-4 flex flex-col justify-between transition-colors duration-700`}>
        {/* Animated Rain Drops if Rainy */}
        {weather === 'rainy' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: `${(i * 6.5) % 100}%`, opacity: 0.8 }}
                animate={{ y: 200, opacity: 0.2 }}
                transition={{
                  duration: 0.8 + (i % 3) * 0.2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: (i * 0.05) % 0.5,
                }}
                className="absolute w-1 h-4 bg-blue-300 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Top bar inside header */}
        <div className="flex justify-between items-center z-20">
          <span
            className="px-3 py-1 rounded-full text-xs font-black brutal-border brutal-shadow-sm uppercase tracking-wide bg-white text-[#18181B]"
          >
            {timePhase.toUpperCase()} • {weather.toUpperCase()}
          </span>

          <div className="flex gap-1.5">
            <button
              onClick={() => {
                const phases: TimePhase[] = ['dawn', 'day', 'dusk', 'night'];
                const next = phases[(phases.indexOf(timePhase) + 1) % phases.length];
                onTimeChange(next);
              }}
              title="Đổi thời gian"
              className="px-2.5 py-1 bg-white brutal-border rounded-xl brutal-shadow-sm font-bold text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
            >
              {timePhase === 'night' ? <Moon size={14} /> : <Sun size={14} />} Đổi Buổi
            </button>
            <button
              onClick={() => {
                const weathers: WeatherState[] = ['clear', 'cloudy', 'rainy'];
                const next = weathers[(weathers.indexOf(weather) + 1) % weathers.length];
                onWeatherChange(next);
              }}
              title="Đổi thời tiết"
              className="px-2.5 py-1 bg-white brutal-border rounded-xl brutal-shadow-sm font-bold text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
            >
              {weather === 'rainy' ? <CloudRain size={14} /> : weather === 'cloudy' ? <Cloud size={14} /> : <Sparkles size={14} />}
            </button>
          </div>
        </div>

        {/* Chibi Sky Mascot (Sun / Moon) */}
        <div className="relative flex items-center justify-between z-20 my-auto">
          <div>
            <h2 className="text-xl font-black drop-shadow-[2px_2px_0px_#18181B] text-white tracking-wide">
              {currentTheme.title}
            </h2>
            <p className="text-xs font-bold text-white/90 drop-shadow-[1px_1px_0px_#18181B]">
              Locket thói quen của bạn hôm nay
            </p>
          </div>

          {/* Celestial Mascot */}
          <motion.div
            key={timePhase}
            initial={{ scale: 0.5, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative"
          >
            {/* Chibi Face Orb */}
            <div
              className="w-16 h-16 rounded-full brutal-border brutal-shadow flex items-center justify-center relative cursor-pointer"
              style={{ backgroundColor: currentTheme.orbColor }}
            >
              {/* Cute Chibi Face Expression */}
              <div className="flex flex-col items-center select-none">
                <div className="flex gap-2">
                  <span className="w-2 h-2.5 bg-[#18181B] rounded-full" />
                  <span className="w-2 h-2.5 bg-[#18181B] rounded-full" />
                </div>
                {/* Cheeks */}
                <div className="flex gap-4 -mt-1">
                  <span className="w-1.5 h-1 bg-pink-500/70 rounded-full" />
                  <span className="w-1.5 h-1 bg-pink-500/70 rounded-full" />
                </div>
                {/* Smile / Mouth */}
                <div className="w-2.5 h-1.5 border-b-2 border-[#18181B] rounded-b-full -mt-0.5" />
              </div>

              {/* Cloudy Overlay: 66% cover */}
              {weather === 'cloudy' && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute -bottom-2 -left-3 text-white drop-shadow-[2px_2px_0px_#18181B]"
                >
                  <Cloud size={36} fill="#FDFBF7" stroke="#18181B" strokeWidth={2.5} />
                </motion.div>
              )}

              {/* Rainy Overlay */}
              {weather === 'rainy' && (
                <div className="absolute -bottom-3 -right-2 text-blue-500 drop-shadow-[2px_2px_0px_#18181B]">
                  <Droplets size={24} fill="#60A5FA" stroke="#18181B" strokeWidth={2} />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Quick Toggles Strip */}
        <div className="flex justify-between items-center text-[10px] font-bold text-white/80 z-20">
          <span>Hôm nay, 21 Tháng 10</span>
          <span>⚡ 100% Offline Ready</span>
        </div>
      </div>
    </div>
  );
};

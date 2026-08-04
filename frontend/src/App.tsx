import { useState } from 'react';
import { 
  GitCommit, 
  GitBranch, 
  Settings, 
  Activity, 
  Volume2, 
  Play, 
  Pause, 
  Layers, 
  FileText, 
  User, 
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface Commit {
  hash: string;
  author: string;
  time: string;
  type: 'feat' | 'fix' | 'refactor' | 'chore';
  title: string;
  devNotes: string;
  pmSummary: string;
  audioScript: string;
  activeTab: 'dev' | 'pm';
  isPlaying: boolean;
}

const mockCommits: Commit[] = [
  {
    hash: 'd0a82d8',
    author: 'Tuan Dang',
    time: '2 hours ago',
    type: 'feat',
    title: 'feat(auth): implement OIDC security flow with Google Identity',
    devNotes: 'Added JWT validation logic, configured Auth middleware, and integrated OIDC client libraries for secure token exchange.',
    pmSummary: 'Tích hợp đăng nhập bằng tài khoản Google. Tính năng này giúp người dùng đăng nhập an toàn, tiện lợi và nhanh chóng hơn mà không cần nhớ mật khẩu mới.',
    audioScript: 'Bác sĩ code nhận xét: Auth flow mới trông mượt đấy, nhưng nhớ kiểm tra kỹ phần token expiration nhé, không là người dùng bị đá ra liên tục đấy!',
    activeTab: 'pm',
    isPlaying: false
  },
  {
    hash: 'b9f2k1s',
    author: 'Tuan Dang',
    time: '5 hours ago',
    type: 'fix',
    title: 'fix(api): resolve database rate limit race condition',
    devNotes: 'Implemented sliding window rate limiting on public endpoints and optimized connection pool settings to prevent DB exhaustion.',
    pmSummary: 'Khắc phục sự cố sập hệ thống khi có nhiều người truy cập cùng lúc. Giúp website chạy mượt mà và ổn định hơn trong giờ cao điểm.',
    audioScript: 'Bác sĩ code nhận xét: Rate limit chạy ổn rồi. Lần sau code cẩn thận, tí nữa thì làm sập cơ sở dữ liệu của công ty rồi đấy thanh niên!',
    activeTab: 'pm',
    isPlaying: false
  },
  {
    hash: 'e8d1a49',
    author: 'Tuan Dang',
    time: '1 day ago',
    type: 'refactor',
    title: 'refactor(core): decouple audio rendering service from API gateway',
    devNotes: 'Moved TTS synthesis code to a dedicated controller module and set up asynchronous queue processing for better scalability.',
    pmSummary: 'Tách biệt phần xử lý âm thanh khỏi luồng xử lý chính. Cải tiến này giúp hệ thống chạy nhanh hơn và dễ dàng nâng cấp các tính năng âm thanh sau này.',
    audioScript: 'Bác sĩ code nhận xét: Cấu trúc code sạch hơn rồi đấy. Điểm cộng cho việc tách module. Cứ thế phát huy nhé!',
    activeTab: 'pm',
    isPlaying: false
  }
];

function App() {
  const [commits, setCommits] = useState<Commit[]>(mockCommits);
  const [activeCommitHash, setActiveCommitHash] = useState<string>('d0a82d8');

  const toggleTab = (hash: string, tab: 'dev' | 'pm') => {
    setCommits(commits.map(c => c.hash === hash ? { ...c, activeTab: tab } : c));
  };

  const togglePlay = (hash: string) => {
    const commit = commits.find(c => c.hash === hash);
    if (!commit) return;

    if (commit.isPlaying) {
      window.speechSynthesis.cancel();
      setCommits(commits.map(c => c.hash === hash ? { ...c, isPlaying: false } : c));
    } else {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(commit.audioScript);
      utterance.lang = 'vi-VN';
      
      utterance.onend = () => {
        setCommits(prev => prev.map(c => c.hash === hash ? { ...c, isPlaying: false } : c));
      };
      
      utterance.onerror = () => {
        setCommits(prev => prev.map(c => c.hash === hash ? { ...c, isPlaying: false } : c));
      };

      setCommits(commits.map(c => {
        if (c.hash === hash) {
          return { ...c, isPlaying: true };
        }
        return { ...c, isPlaying: false };
      }));

      window.speechSynthesis.speak(utterance);
    }
  };

  const activeCommit = commits.find(c => c.hash === activeCommitHash) || commits[0];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* GitHub Header style */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#21262d] p-2 rounded-md border border-[#30363d]">
            <GitBranch className="h-5 w-5 text-[#58a6ff]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-white">Aider</span>
              <span className="text-xs bg-[#21262d] border border-[#30363d] text-[#8b949e] px-2 py-0.5 rounded-full">v1.0.0-beta</span>
            </div>
            <p className="text-xs text-[#8b949e]">The Interactive Project Biographer</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2ea44f] animate-pulse"></span>
            <span className="text-[#8b949e]">Backend: <span className="text-[#2ea44f] font-semibold">Active (Port 8085)</span></span>
          </div>
          <div className="flex items-center space-x-2 text-xs border-l border-[#30363d] pl-4">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2ea44f]"></span>
            <span className="text-[#8b949e]">Database: <span className="text-[#2ea44f] font-semibold">Firestore</span></span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Column: Sidebar Details (2 cols) */}
        <aside className="lg:col-span-3 flex flex-col space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center">
              <Activity className="h-4 w-4 text-[#8b949e] mr-2" />
              Project Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs py-1 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Total Commits</span>
                <span className="font-semibold text-white">3</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Diagrams Synced</span>
                <span className="font-semibold text-white">12</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Audio Recaps</span>
                <span className="font-semibold text-white">3</span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center">
              <Settings className="h-4 w-4 text-[#8b949e] mr-2" />
              Local Configuration
            </h3>
            <div className="space-y-2 text-xs">
              <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] font-mono break-all">
                <span className="text-[#ff7b72]">AIDER_API_URL</span>=<span className="text-[#a5d6ff]">"http://localhost:8085"</span>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] font-mono break-all">
                <span className="text-[#ff7b72]">AIDER_TOKEN</span>=<span className="text-[#a5d6ff]">"default-project"</span>
              </div>
              <p className="text-[10px] text-[#8b949e] italic mt-2">
                * Hook triggers on local git commit and auto-stages README updates.
              </p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 flex-1">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center">
              <Sparkles className="h-4 w-4 text-[#d29922] mr-2" />
              Event Info
            </h3>
            <div className="text-xs space-y-3 text-[#8b949e]">
              <p>
                <strong>Aider</strong> is developed for <span className="text-white font-semibold">AI Riser Vietnam 2026</span> under the <span className="text-white">Business Utility</span> category.
              </p>
              <div className="border border-[#30363d] p-3 rounded bg-[#0d1117] text-white font-medium flex items-center justify-between">
                <span>Google AI Studio Prompt</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#58a6ff]" />
              </div>
            </div>
          </div>
        </aside>

        {/* Middle Column: Commit Timeline (5 cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <h2 className="font-semibold text-base text-white flex items-center px-1">
            <GitCommit className="h-5 w-5 text-[#8b949e] mr-2" />
            Git Story Timeline
          </h2>

          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {commits.map((commit) => {
              const typeColor = 
                commit.type === 'feat' ? 'border-[#2ea44f] text-[#2ea44f] bg-[#2ea44f]/10' :
                commit.type === 'fix' ? 'border-[#f85149] text-[#f85149] bg-[#f85149]/10' :
                commit.type === 'refactor' ? 'border-[#bc8cff] text-[#bc8cff] bg-[#bc8cff]/10' :
                'border-[#8b949e] text-[#8b949e] bg-[#8b949e]/10';

              const isActive = commit.hash === activeCommitHash;

              return (
                <div 
                  key={commit.hash} 
                  className={`bg-[#161b22] border transition-all rounded-md p-4 cursor-pointer ${
                    isActive ? 'border-[#58a6ff] ring-1 ring-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'
                  }`}
                  onClick={() => setActiveCommitHash(commit.hash)}
                >
                  {/* Commit Header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${typeColor}`}>
                        {commit.type}
                      </span>
                      <span className="font-mono text-white font-semibold">#{commit.hash}</span>
                      <span className="text-[#8b949e]">•</span>
                      <span className="text-[#8b949e] flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {commit.author}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8b949e] flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {commit.time}
                    </span>
                  </div>

                  {/* Commit Title */}
                  <h4 className="font-semibold text-sm text-white mb-3 font-mono">
                    {commit.title}
                  </h4>

                  {/* Mode Tab selector */}
                  <div className="flex border-b border-[#30363d] mb-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTab(commit.hash, 'pm'); }}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                        commit.activeTab === 'pm' 
                          ? 'border-[#f78166] text-white' 
                          : 'border-transparent text-[#8b949e] hover:text-white'
                      }`}
                    >
                      PM Story Mode
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTab(commit.hash, 'dev'); }}
                      className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                        commit.activeTab === 'dev' 
                          ? 'border-[#f78166] text-white' 
                          : 'border-transparent text-[#8b949e] hover:text-white'
                      }`}
                    >
                      Technical Details
                    </button>
                  </div>

                  {/* Content based on tab */}
                  <div className="text-xs leading-relaxed mb-4 min-h-[60px]">
                    {commit.activeTab === 'pm' ? (
                      <p className="text-[#c9d1d9] italic bg-[#0d1117] p-3 rounded border border-[#30363d]/50">
                        "{commit.pmSummary}"
                      </p>
                    ) : (
                      <p className="text-[#8b949e] font-mono bg-[#0d1117] p-3 rounded border border-[#30363d]/50">
                        {commit.devNotes}
                      </p>
                    )}
                  </div>

                  {/* Audio Recap Widget */}
                  <div className="flex items-center space-x-3 bg-[#0d1117] border border-[#30363d] rounded p-2.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(commit.hash); }}
                      className="bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] p-2 rounded-full transition-colors flex items-center justify-center"
                    >
                      {commit.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-white flex items-center uppercase tracking-wider">
                          <Volume2 className="h-3.5 w-3.5 text-[#58a6ff] mr-1" />
                          Code Doctor Audio Recap
                        </span>
                        <span className="text-[9px] text-[#8b949e]">0:15</span>
                      </div>
                      <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-[#58a6ff] transition-all duration-[15000ms] ${commit.isPlaying ? 'w-full' : 'w-0'}`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Funny Transcript collapse */}
                  {commit.isPlaying && (
                    <div className="mt-3 text-[11px] text-[#d29922] bg-[#d29922]/5 border border-[#d29922]/20 p-2.5 rounded font-mono">
                      <strong>🔊 {commit.audioScript}</strong>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Diagram Viewer (4 cols) */}
        <section className="lg:col-span-4 flex flex-col space-y-4">
          <h2 className="font-semibold text-base text-white flex items-center px-1">
            <Layers className="h-5 w-5 text-[#8b949e] mr-2" />
            Living System Architecture
          </h2>

          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d] mb-6">
              <span className="text-xs text-[#8b949e] flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2ea44f] mr-2"></span>
                AUTO-SYNCED WITH BRANCH 'MAIN'
              </span>
              <span className="text-[10px] text-white bg-[#30363d] px-2 py-0.5 rounded font-mono font-semibold">
                commit: {activeCommit.hash}
              </span>
            </div>

            {/* Tree nodes (Power of custom node visualization) */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-6 relative">
              {/* Vertical connecting line */}
              <div className="absolute top-12 bottom-12 w-0.5 bg-[#30363d] left-1/2 transform -translate-x-1/2 z-0"></div>

              {/* Node 1: Auth Service */}
              <div className={`z-10 w-52 p-4 rounded-md border flex flex-col items-center justify-center transition-all bg-[#0d1117] ${
                activeCommit.hash === 'd0a82d8' 
                  ? 'border-[#2ea44f] shadow-[0_0_12px_rgba(46,164,79,0.15)] scale-105' 
                  : 'border-[#30363d]'
              }`}>
                <span className="text-[9px] font-semibold text-[#8b949e] mb-1">MODULE</span>
                <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">AUTH SERVICE</span>
                <div className="mt-2.5 flex items-center space-x-1.5 text-[9px] text-[#8b949e]">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeCommit.hash === 'd0a82d8' ? 'bg-[#2ea44f]' : 'bg-[#8b949e]'}`}></span>
                  <span>{activeCommit.hash === 'd0a82d8' ? 'Updated' : 'Active'}</span>
                </div>
              </div>

              {/* Node 2: Backend API */}
              <div className={`z-10 w-52 p-4 rounded-md border flex flex-col items-center justify-center transition-all bg-[#0d1117] ${
                activeCommit.hash === 'b9f2k1s' 
                  ? 'border-[#2ea44f] shadow-[0_0_12px_rgba(46,164,79,0.15)] scale-105' 
                  : activeCommit.hash === 'e8d1a49' 
                    ? 'border-[#bc8cff] shadow-[0_0_12px_rgba(188,140,255,0.15)] scale-105' 
                    : 'border-[#30363d]'
              }`}>
                <span className="text-[9px] font-semibold text-[#8b949e] mb-1">MODULE</span>
                <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">BACKEND API Gateway</span>
                <div className="mt-2.5 flex items-center space-x-1.5 text-[9px] text-[#8b949e]">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activeCommit.hash === 'b9f2k1s' ? 'bg-[#f85149]' : 
                    activeCommit.hash === 'e8d1a49' ? 'bg-[#bc8cff]' : 'bg-[#2ea44f]'
                  }`}></span>
                  <span>{
                    activeCommit.hash === 'b9f2k1s' ? 'Fixing Rate Limit' : 
                    activeCommit.hash === 'e8d1a49' ? 'Refactoring modules' : 'Active'
                  }</span>
                </div>
              </div>

              {/* Node 3: Database */}
              <div className="z-10 w-52 p-4 rounded-md border border-[#30363d] flex flex-col items-center justify-center bg-[#0d1117]">
                <span className="text-[9px] font-semibold text-[#8b949e] mb-1">DATABASE</span>
                <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">FIRESTORE</span>
                <div className="mt-2.5 flex items-center space-x-1.5 text-[9px] text-[#8b949e]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2ea44f]"></span>
                  <span>Master (Ready)</span>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-auto pt-4 border-t border-[#30363d] text-xs text-[#8b949e] flex justify-between items-center">
              <span>Stack: <strong className="text-white">Node / Firebase / GCP</strong></span>
              <span className="flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1" />
                Export Mermaid
              </span>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}

export default App;

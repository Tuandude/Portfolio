import { useState, useEffect } from 'react';
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
  ExternalLink,
  Shield,
  TrendingUp,
  Award,
  AlertTriangle,
  FileCheck
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
  decision?: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
}

const mockCommits: Commit[] = [
  {
    hash: 'pr-101',
    author: 'Tuan Dang',
    time: '2 hours ago',
    type: 'feat',
    title: 'feat(auth): implement OIDC security flow with Google Identity',
    devNotes: 'Added JWT validation logic, configured Auth middleware, and integrated OIDC client libraries for secure token exchange.',
    pmSummary: 'Tích hợp đăng nhập bằng tài khoản Google. Tính năng này giúp người dùng đăng nhập an toàn, tiện lợi và nhanh chóng hơn mà không cần nhớ mật khẩu mới.',
    audioScript: 'Bác sĩ code nhận xét: Auth flow mới trông mượt đấy, nhưng nhớ kiểm tra kỹ phần token expiration nhé, không là người dùng bị đá ra liên tục đấy!',
    activeTab: 'pm',
    isPlaying: false,
    decision: 'APPROVE'
  },
  {
    hash: 'pr-102',
    author: 'dev_b',
    time: '5 hours ago',
    type: 'fix',
    title: 'fix(api): resolve database rate limit race condition',
    devNotes: 'Implemented sliding window rate limiting on public endpoints and optimized connection pool settings to prevent DB exhaustion.',
    pmSummary: 'Khắc phục sự cố sập hệ thống khi có nhiều người truy cập cùng lúc. Giúp website chạy mượt mà và ổn định hơn trong giờ cao điểm.',
    audioScript: 'Bác sĩ code nhận xét: Rate limit chạy ổn rồi. Lần sau code cẩn thận, tí nữa thì làm sập cơ sở dữ liệu của công ty rồi đấy thanh niên!',
    activeTab: 'pm',
    isPlaying: false,
    decision: 'REQUEST_CHANGES'
  },
  {
    hash: 'pr-103',
    author: 'Tuan Dang',
    time: '1 day ago',
    type: 'refactor',
    title: 'refactor(core): decouple audio rendering service from API gateway',
    devNotes: 'Moved TTS synthesis code to a dedicated controller module and set up asynchronous queue processing for better scalability.',
    pmSummary: 'Tách biệt phần xử lý âm thanh khỏi luồng xử lý chính. Cải tiến này giúp hệ thống chạy nhanh hơn và dễ dàng nâng cấp các tính năng âm thanh sau này.',
    audioScript: 'Bác sĩ code nhận xét: Cấu trúc code sạch hơn rồi đấy. Điểm cộng cho việc tách module. Cứ thế phát huy nhé!',
    activeTab: 'pm',
    isPlaying: false,
    decision: 'COMMENT'
  }
];

function App() {
  const [commits, setCommits] = useState<Commit[]>(mockCommits);
  const [activeCommitHash, setActiveCommitHash] = useState<string>('pr-101');
  const [reports, setReports] = useState<any>(null);
  const [activeView, setActiveView] = useState<'timeline' | 'performance'>('timeline');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    // Tự động fetch dữ liệu review thực tế từ backend
    const fetchData = async () => {
      try {
        const reviewsRes = await fetch('http://localhost:8085/api/reviews');
        if (reviewsRes.ok) {
          const list = await reviewsRes.json();
          if (list && list.length > 0) {
            const formatted = list.map((r: any) => ({
              hash: `pr-${r.prNumber}`,
              author: r.author,
              time: new Date(r.timestamp).toLocaleString('vi-VN'),
              type: r.decision === 'APPROVE' ? 'feat' : r.decision === 'REQUEST_CHANGES' ? 'fix' : 'chore',
              title: r.title,
              devNotes: r.feedback,
              pmSummary: r.feedback,
              audioScript: `Bác sĩ code nhận xét PR số ${r.prNumber}: Quyết định là ${r.decision}. ${r.feedback.split('.')[0]}.`,
              activeTab: 'pm',
              isPlaying: false,
              decision: r.decision
            }));
            setCommits(formatted);
            setActiveCommitHash(formatted[0].hash);
          }
          setApiStatus('online');
        }

        const reportsRes = await fetch('http://localhost:8085/api/reports/summary');
        if (reportsRes.ok) {
          const summary = await reportsRes.json();
          setReports(summary);
        }
      } catch (err) {
        console.warn('Backend is offline. Using mock fallback data.', err);
        setApiStatus('offline');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Tự động reload sau mỗi 5s
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-[#21262d] p-2.5 rounded-md border border-[#30363d] shadow-sm">
            <GitBranch className="h-5 w-5 text-[#58a6ff]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-white tracking-tight">Aider</span>
              <span className="text-xs bg-[#238636]/20 border border-[#2ea44f]/30 text-[#56d364] px-2 py-0.5 rounded-full font-medium">v2.0.0-prod</span>
            </div>
            <p className="text-xs text-[#8b949e]">The Automated PR Review & Performance Biographer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0d1117] rounded-lg p-1 border border-[#30363d]">
          <button 
            onClick={() => setActiveView('timeline')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-2 ${
              activeView === 'timeline' 
                ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d]' 
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5" />
            <span>PR Timeline</span>
          </button>
          <button 
            onClick={() => setActiveView('performance')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center space-x-2 ${
              activeView === 'performance' 
                ? 'bg-[#21262d] text-white shadow-sm border border-[#30363d]' 
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Performance & Stats</span>
          </button>
        </div>

        {/* API Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${apiStatus === 'online' ? 'bg-[#2ea44f] animate-pulse' : 'bg-[#f85149]'}`}></span>
            <span className="text-[#8b949e]">Backend: <span className={`${apiStatus === 'online' ? 'text-[#2ea44f]' : 'text-[#f85149]'} font-semibold`}>{apiStatus === 'online' ? 'Connected (8085)' : 'Disconnected'}</span></span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Column: Sidebar Stats (3 cols) */}
        <aside className="lg:col-span-3 flex flex-col space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-white mb-4 flex items-center">
              <Activity className="h-4 w-4 text-[#58a6ff] mr-2" />
              Project Summary
            </h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Total PRs Reviewed</span>
                <span className="font-semibold text-white text-sm">{reports?.stats?.totalReviews || commits.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#21262d]">
                <span className="text-[#8b949e] flex items-center"><FileCheck className="h-3 w-3 text-[#2ea44f] mr-1" /> Approved</span>
                <span className="font-semibold text-[#56d364]">{reports?.stats?.approveCount || commits.filter(c => c.decision === 'APPROVE').length}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#21262d]">
                <span className="text-[#8b949e] flex items-center"><AlertTriangle className="h-3 w-3 text-[#f85149] mr-1" /> Request Changes</span>
                <span className="font-semibold text-[#f85149]">{reports?.stats?.requestChangesCount || commits.filter(c => c.decision === 'REQUEST_CHANGES').length}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#21262d]">
                <span className="text-[#8b949e] flex items-center"><Shield className="h-3 w-3 text-[#8b949e] mr-1" /> Commented</span>
                <span className="font-semibold text-[#8b949e]">{reports?.stats?.commentCount || commits.filter(c => c.decision === 'COMMENT').length}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1.5">
                <span className="text-[#8b949e]">Daily Active Reviews</span>
                <span className="font-semibold text-white bg-[#30363d] px-2 py-0.5 rounded-full text-[10px]">{reports?.stats?.dailyCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center">
              <Settings className="h-4 w-4 text-[#8b949e] mr-2" />
              Auto-Merge Config
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#8b949e]">Auto-Merge Feature</span>
                <span className="text-[10px] bg-[#238636]/10 text-[#56d364] border border-[#2ea44f]/20 px-2 py-0.5 rounded font-semibold uppercase">Active</span>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] font-mono break-all text-[11px]">
                <span className="text-[#ff7b72]">AUTO_MERGE</span>=<span className="text-[#a5d6ff]">"true"</span>
              </div>
              <p className="text-[10px] text-[#8b949e] leading-relaxed italic">
                * Tự động merge PR vào nhánh chính ngay sau khi bot đánh giá trạng thái APPROVE và pass CI/CD.
              </p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 flex-1 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-sm text-white mb-3 flex items-center">
                <Sparkles className="h-4 w-4 text-[#d29922] mr-2 animate-bounce" />
                Jira Integration
              </h3>
              <div className="text-xs space-y-3.5 text-[#8b949e] leading-relaxed">
                <p>
                  Hệ thống tự động quét và phân tích yêu cầu từ các thẻ Jira Link ghi nhận trong PR title/body.
                </p>
                <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d] text-[#c9d1d9] font-mono flex flex-col space-y-1 text-[10px]">
                  <div><span className="text-[#ff7b72]">JIRA_DOMAIN</span>=<span className="text-[#a5d6ff]">"atlassian.net"</span></div>
                  <div><span className="text-[#ff7b72]">REGEX_SCAN</span>=<span className="text-[#a5d6ff]">"/[A-Z]+-\d+/g"</span></div>
                </div>
              </div>
            </div>
            
            <div className="border border-[#30363d] p-3 rounded bg-[#0d1117] text-white font-medium flex items-center justify-between mt-4 hover:border-[#58a6ff] cursor-pointer transition-colors text-xs">
              <span>Documentation specs</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#58a6ff]" />
            </div>
          </div>
        </aside>

        {/* View Switcher Container (9 cols) */}
        {activeView === 'timeline' ? (
          <>
            {/* Middle Column: Commit/PR Timeline (5 cols) */}
            <section className="lg:col-span-5 flex flex-col space-y-4">
              <h2 className="font-semibold text-base text-white flex items-center px-1">
                <GitCommit className="h-5 w-5 text-[#8b949e] mr-2" />
                Pull Request Review Timeline
              </h2>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1 max-h-[70vh]">
                {commits.map((commit) => {
                  const decisionColor = 
                    commit.decision === 'APPROVE' ? 'border-[#2ea44f] text-[#2ea44f] bg-[#2ea44f]/10' :
                    commit.decision === 'REQUEST_CHANGES' ? 'border-[#f85149] text-[#f85149] bg-[#f85149]/10' :
                    'border-[#8b949e] text-[#8b949e] bg-[#8b949e]/10';

                  const isActive = commit.hash === activeCommitHash;

                  return (
                    <div 
                      key={commit.hash} 
                      className={`bg-[#161b22] border transition-all rounded-md p-4 cursor-pointer shadow-sm ${
                        isActive ? 'border-[#58a6ff] ring-1 ring-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'
                      }`}
                      onClick={() => setActiveCommitHash(commit.hash)}
                    >
                      {/* Commit Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${decisionColor}`}>
                            {commit.decision}
                          </span>
                          <span className="font-mono text-white font-semibold">{commit.hash}</span>
                          <span className="text-[#8b949e]">•</span>
                          <span className="text-[#8b949e] flex items-center">
                            <User className="h-3.5 w-3.5 mr-1" />
                            {commit.author}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8b949e] flex items-center font-mono">
                          <Calendar className="h-3 w-3 mr-1" />
                          {commit.time}
                        </span>
                      </div>

                      {/* Commit Title */}
                      <h4 className="font-semibold text-sm text-white mb-3 font-mono leading-snug">
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
                          Review Feedback
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleTab(commit.hash, 'dev'); }}
                          className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                            commit.activeTab === 'dev' 
                              ? 'border-[#f78166] text-white' 
                              : 'border-transparent text-[#8b949e] hover:text-white'
                          }`}
                        >
                          Raw JSON Output
                        </button>
                      </div>

                      {/* Content based on tab */}
                      <div className="text-xs leading-relaxed mb-4 min-h-[60px]">
                        {commit.activeTab === 'pm' ? (
                          <div className="text-[#c9d1d9] bg-[#0d1117] p-3 rounded.md border border-[#30363d]/50 whitespace-pre-wrap">
                            {commit.pmSummary}
                          </div>
                        ) : (
                          <p className="text-[#8b949e] font-mono bg-[#0d1117] p-3 rounded border border-[#30363d]/50 break-all">
                            {commit.devNotes}
                          </p>
                        )}
                      </div>

                      {/* Audio Recap Widget */}
                      <div className="flex items-center space-x-3 bg-[#0d1117] border border-[#30363d] rounded p-2.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); togglePlay(commit.hash); }}
                          className="bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] p-2 rounded-full transition-colors flex items-center justify-center shadow-sm"
                        >
                          {commit.isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-semibold text-white flex items-center uppercase tracking-wider">
                              <Volume2 className="h-3.5 w-3.5 text-[#58a6ff] mr-1" />
                              Code Doctor Audio Recap
                            </span>
                            <span className="text-[9px] text-[#8b949e] font-mono">0:15</span>
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

              <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 flex-1 flex flex-col shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#30363d] mb-6">
                  <span className="text-xs text-[#8b949e] flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ea44f] mr-2"></span>
                    AUTO-SYNCED WITH BRANCH 'MAIN'
                  </span>
                  <span className="text-[10px] text-white bg-[#30363d] px-2 py-0.5 rounded font-mono font-semibold">
                    {activeCommit.hash}
                  </span>
                </div>

                {/* Tree nodes (Power of custom node visualization) */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-6 relative">
                  {/* Vertical connecting line */}
                  <div className="absolute top-12 bottom-12 w-0.5 bg-[#30363d] left-1/2 transform -translate-x-1/2 z-0"></div>

                  {/* Node 1: Auth Service */}
                  <div className={`z-10 w-52 p-4 rounded-md border flex flex-col items-center justify-center transition-all bg-[#0d1117] ${
                    activeCommit.hash === 'pr-101' 
                      ? 'border-[#2ea44f] shadow-[0_0_12px_rgba(46,164,79,0.15)] scale-105' 
                      : 'border-[#30363d]'
                  }`}>
                    <span className="text-[9px] font-semibold text-[#8b949e] mb-1">MODULE</span>
                    <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">AUTH SERVICE</span>
                    <div className="mt-2.5 flex items-center space-x-1.5 text-[9px] text-[#8b949e]">
                      <span className={`w-1.5 h-1.5 rounded-full ${activeCommit.hash === 'pr-101' ? 'bg-[#2ea44f]' : 'bg-[#8b949e]'}`}></span>
                      <span>{activeCommit.hash === 'pr-101' ? 'Updated' : 'Active'}</span>
                    </div>
                  </div>

                  {/* Node 2: Backend API */}
                  <div className={`z-10 w-52 p-4 rounded-md border flex flex-col items-center justify-center transition-all bg-[#0d1117] ${
                    activeCommit.hash === 'pr-102' 
                      ? 'border-[#f85149] shadow-[0_0_12px_rgba(248,81,73,0.15)] scale-105' 
                      : activeCommit.hash === 'pr-103' 
                        ? 'border-[#bc8cff] shadow-[0_0_12px_rgba(188,140,255,0.15)] scale-105' 
                        : 'border-[#30363d]'
                  }`}>
                    <span className="text-[9px] font-semibold text-[#8b949e] mb-1">MODULE</span>
                    <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">BACKEND API Gateway</span>
                    <div className="mt-2.5 flex items-center space-x-1.5 text-[9px] text-[#8b949e]">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeCommit.hash === 'pr-102' ? 'bg-[#f85149]' : 
                        activeCommit.hash === 'pr-103' ? 'bg-[#bc8cff]' : 'bg-[#2ea44f]'
                      }`}></span>
                      <span>{
                        activeCommit.hash === 'pr-102' ? 'Fixing Rate Limit' : 
                        activeCommit.hash === 'pr-103' ? 'Refactoring modules' : 'Active'
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
                  <span className="flex items-center hover:text-white cursor-pointer transition-colors">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Export Mermaid
                  </span>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* Performance & Analytics view (9 cols) */
          <section className="lg:col-span-9 flex flex-col space-y-6">
            <h2 className="font-semibold text-base text-white flex items-center px-1">
              <TrendingUp className="h-5 w-5 text-[#58a6ff] mr-2" />
              Developer Performance & Reports
            </h2>

            {/* Developer Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm">
                <h3 className="font-semibold text-sm text-white mb-4 flex items-center">
                  <Award className="h-4 w-4 text-[#d29922] mr-2" />
                  Developer Quality Rankings
                </h3>
                
                <div className="space-y-4">
                  {(reports?.developers && reports.developers.length > 0) ? (
                    reports.developers.map((dev: any, index: number) => (
                      <div key={dev.name} className="bg-[#0d1117] border border-[#30363d] p-3.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#30363d] text-white text-xs h-7 w-7 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-white font-mono">{dev.name}</span>
                            <div className="flex space-x-2 text-[10px] text-[#8b949e] mt-0.5">
                              <span>Total PRs: <strong>{dev.totalPRs}</strong></span>
                              <span>•</span>
                              <span>Avg Files Changed: <strong>{dev.avgFilesChanged}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-[#238636]/10 border border-[#2ea44f]/30 text-[#56d364] px-2 py-0.5 rounded font-bold">
                            {dev.successRate}% Success Rate
                          </span>
                          <p className="text-[10px] text-[#8b949e] mt-1">{dev.approvedPRs} Approve / {dev.requestedChangesPRs} Req Changes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback mock rankings
                    <div className="space-y-3">
                      <div className="bg-[#0d1117] border border-[#30363d] p-3.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#30363d] text-white text-xs h-7 w-7 rounded-full flex items-center justify-center font-bold">1</div>
                          <div>
                            <span className="text-sm font-semibold text-white font-mono">Tuan Dang</span>
                            <div className="flex space-x-2 text-[10px] text-[#8b949e] mt-0.5">
                              <span>Total PRs: <strong>2</strong></span>
                              <span>•</span>
                              <span>Avg Files: <strong>3.2</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-[#238636]/10 border border-[#2ea44f]/30 text-[#56d364] px-2 py-0.5 rounded font-bold">100% Success Rate</span>
                          <p className="text-[10px] text-[#8b949e] mt-1">2 Approve / 0 Req Changes</p>
                        </div>
                      </div>
                      <div className="bg-[#0d1117] border border-[#30363d] p-3.5 rounded-lg flex items-center justify-between opacity-70">
                        <div className="flex items-center space-x-3">
                          <div className="bg-[#30363d] text-white text-xs h-7 w-7 rounded-full flex items-center justify-center font-bold">2</div>
                          <div>
                            <span className="text-sm font-semibold text-white font-mono">dev_b</span>
                            <div className="flex space-x-2 text-[10px] text-[#8b949e] mt-0.5">
                              <span>Total PRs: <strong>1</strong></span>
                              <span>•</span>
                              <span>Avg Files: <strong>12.0</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] px-2 py-0.5 rounded font-bold">0% Success Rate</span>
                          <p className="text-[10px] text-[#8b949e] mt-1">0 Approve / 1 Req Changes</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly/Daily Report view */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 shadow-sm flex flex-col">
                <h3 className="font-semibold text-sm text-white mb-4 flex items-center">
                  <Calendar className="h-4 w-4 text-[#8b949e] mr-2" />
                  Recent Review History
                </h3>
                
                <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[40vh] pr-1">
                  {reports?.weeklyReport && reports.weeklyReport.length > 0 ? (
                    reports.weeklyReport.map((rep: any) => {
                      const decColor = 
                        rep.decision === 'APPROVE' ? 'bg-[#238636] text-white' :
                        rep.decision === 'REQUEST_CHANGES' ? 'bg-[#da3637] text-white' :
                        'bg-[#30363d] text-[#8b949e]';
                      
                      return (
                        <div key={rep.prNumber + rep.timestamp} className="bg-[#0d1117] p-3 rounded border border-[#30363d]/50 flex items-center justify-between text-xs font-mono">
                          <div className="flex flex-col space-y-1">
                            <span className="text-white font-semibold">PR #{rep.prNumber}: {rep.title}</span>
                            <span className="text-[#8b949e] text-[10px]">Tác giả: {rep.author} • {new Date(rep.timestamp).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${decColor}`}>
                            {rep.decision}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    // Default fallback mock history list
                    <div className="space-y-2">
                      <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]/50 flex items-center justify-between text-xs font-mono">
                        <div className="flex flex-col space-y-1">
                          <span className="text-white font-semibold">PR #101: feat(auth): implementation Google Identity</span>
                          <span className="text-[#8b949e] text-[10px]">Tác giả: Tuan Dang • 2 hours ago</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#238636] text-white">APPROVE</span>
                      </div>
                      <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]/50 flex items-center justify-between text-xs font-mono">
                        <div className="flex flex-col space-y-1">
                          <span className="text-white font-semibold">PR #102: fix(api): rate limit race condition</span>
                          <span className="text-[#8b949e] text-[10px]">Tác giả: dev_b • 5 hours ago</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#da3637] text-white">REQUEST_CHANGES</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        
      </div>
    </div>
  );
}

export default App;

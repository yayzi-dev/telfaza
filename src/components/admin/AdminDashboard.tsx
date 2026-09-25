import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Users,
  Play,
  Film,
  Lock,
  Download,
  Trash2,
  Key,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  Sparkles,
  RefreshCw,
  LogOut,
  X,
  AlertTriangle,
  Check,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { liveTracker, StreamEvent, DailyStats, CountryStat, DeviceStat, LockerStats } from '../../services/liveTracker';
import { adminAuth, AuthState, AuditLogEntry } from '../../services/adminAuth';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'analytics' | 'top_titles' | 'security'>('radar');
  const [events, setEvents] = useState<StreamEvent[]>(liveTracker.getLiveStreamEvents());
  const [dailyStats, setDailyStats] = useState<DailyStats>(liveTracker.getDailyStats());
  const [lockerStats, setLockerStats] = useState<LockerStats>(liveTracker.getLockerStats());
  const [countries, setCountries] = useState<CountryStat[]>(liveTracker.getCountryDistribution());
  const [devices, setDevices] = useState<DeviceStat[]>(liveTracker.getDeviceBreakdown());
  const [topTitles, setTopTitles] = useState(liveTracker.getTopWatchedTitles());
  const [searchFilter, setSearchFilter] = useState('');
  const [filterRealOnly, setFilterRealOnly] = useState(false);

  // Security Form States
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSuccessMsg, setPwSuccessMsg] = useState<string | null>(null);
  const [pwErrorMsg, setPwErrorMsg] = useState<string | null>(null);

  const [quickPin, setQuickPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(adminAuth.getAuditLogs());
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(1800);

  // Sync with live tracker
  useEffect(() => {
    const refreshData = () => {
      setEvents(liveTracker.getLiveStreamEvents());
      setDailyStats(liveTracker.getDailyStats());
      setLockerStats(liveTracker.getLockerStats());
      setCountries(liveTracker.getCountryDistribution());
      setDevices(liveTracker.getDeviceBreakdown());
      setTopTitles(liveTracker.getTopWatchedTitles());
    };

    const unsub = liveTracker.subscribe(refreshData);
    refreshData();
    return unsub;
  }, []);

  // Session countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const state = adminAuth.getState();
      if (!state.isAuthenticated || !state.sessionExpiresAt) {
        onClose();
        return;
      }
      const left = Math.max(0, Math.ceil((state.sessionExpiresAt - Date.now()) / 1000));
      setSessionSecondsLeft(left);
      if (left <= 0) {
        adminAuth.logout();
        onClose();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    adminAuth.logout();
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccessMsg(null);
    setPwErrorMsg(null);

    if (newPw !== confirmPw) {
      setPwErrorMsg('New passwords do not match.');
      return;
    }

    const res = await adminAuth.changePassword(currentPw, newPw);
    if (res.success) {
      setPwSuccessMsg('Master password updated securely with new cryptographic salt!');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setAuditLogs(adminAuth.getAuditLogs());
      setTimeout(() => setPwSuccessMsg(null), 4000);
    } else {
      setPwErrorMsg(res.error || 'Failed to update password.');
    }
  };

  const handleSetQuickPin = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminAuth.setQuickPin(quickPin);
    setPinSuccessMsg('Quick PIN updated successfully!');
    setAuditLogs(adminAuth.getAuditLogs());
    setTimeout(() => setPinSuccessMsg(null), 3000);
  };

  const handlePanicWipe = () => {
    if (window.confirm('⚠️ WARNING: This will permanently wipe all telemetry history, reset security credentials, and lock the terminal. Are you sure?')) {
      adminAuth.panicWipe();
      onClose();
    }
  };

  const handleDownloadCSV = () => {
    const csv = liveTracker.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `perkvex-telemetry-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const json = liveTracker.exportJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `perkvex-telemetry-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format relative timestamp
  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  };

  // Filtered stream events
  const filteredEvents = events.filter((e) => {
    if (filterRealOnly && !e.isRealVisitor) return false;
    if (searchFilter.trim()) {
      return e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
             e.countryName.toLowerCase().includes(searchFilter.toLowerCase()) ||
             e.serverName.toLowerCase().includes(searchFilter.toLowerCase());
    }
    return true;
  });

  const minutesLeft = Math.floor(sessionSecondsLeft / 60);
  const secondsLeft = sessionSecondsLeft % 60;

  return (
    <div className="fixed inset-0 z-[90] bg-[#090a0d] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Cyber Command Header */}
      <header className="bg-[#0f1117] border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Brand & Live Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-2 bg-red-950/70 border border-red-600/50 rounded-xl text-red-500 shadow-md">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-mono flex items-center gap-2">
                <span>Perkvex Command Center</span>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-600/40 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE TELEMETRY
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Real-time movie streams, visitor traffic & security vault
            </p>
          </div>
        </div>

        {/* Live Counters & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
          {/* Active Viewers Now Indicator */}
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">Live Active:</span>
            <span className="text-emerald-400 font-black text-sm">{dailyStats.activeNow}</span>
          </div>

          {/* Session Timer */}
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Lockout in {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}</span>
          </div>

          {/* Logout / Lock Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl transition text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition cursor-pointer"
            title="Minimize Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-[#0b0c10] border-b border-zinc-800/60 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'radar'
              ? 'border-red-600 text-white bg-red-600/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4 text-red-500" />
          <span>Live Stream Radar</span>
          <span className="px-1.5 py-0.2 bg-red-950 text-red-400 text-[10px] rounded-full font-mono">
            {events.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-red-600 text-white bg-red-600/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Daily Visitors & Traffic</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('top_titles')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'top_titles'
              ? 'border-red-600 text-white bg-red-600/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Film className="w-4 h-4 text-amber-400" />
          <span>Top Watched Titles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-red-600 text-white bg-red-600/10'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Security & Vault Control</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* ================= TAB 1: LIVE STREAM RADAR ================= */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            {/* Filter & Live Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11131a] border border-zinc-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter streams by title, country or server..."
                  className="w-full bg-black/60 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={filterRealOnly}
                    onChange={(e) => setFilterRealOnly(e.target.checked)}
                    className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Show Real-Time Streamers Only</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setEvents(liveTracker.getLiveStreamEvents());
                  }}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition cursor-pointer"
                  title="Refresh Live Feed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Streams Table */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0d0e14] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Title & Media</th>
                      <th className="py-3 px-4">Origin / Country</th>
                      <th className="py-3 px-4">Streaming Server</th>
                      <th className="py-3 px-4">Device & Browser</th>
                      <th className="py-3 px-4">Traffic Source</th>
                      <th className="py-3 px-4 text-right">Time Elapsed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-zinc-500">
                          No active streams matching filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((evt) => (
                        <tr
                          key={evt.id}
                          className="hover:bg-zinc-900/60 transition group"
                        >
                          {/* Title & Media */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {evt.posterPath ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${evt.posterPath}`}
                                  alt={evt.title}
                                  className="w-9 h-13 object-cover rounded shadow border border-zinc-700 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-13 bg-zinc-800 rounded flex items-center justify-center text-zinc-600 shrink-0">
                                  <Film className="w-4 h-4" />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <div className="font-bold text-white text-sm group-hover:text-red-400 transition truncate max-w-[220px]">
                                  {evt.title}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="uppercase px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded font-semibold">
                                    {evt.mediaType}
                                  </span>
                                  {evt.season && (
                                    <span className="text-zinc-400">
                                      S{evt.season}:E{evt.episode || 1}
                                    </span>
                                  )}
                                  {evt.isRealVisitor && (
                                    <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold rounded flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                      REAL VISITOR
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Origin Country */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{evt.flagEmoji}</span>
                              <div>
                                <div className="font-semibold text-zinc-200">
                                  {evt.countryName}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {evt.city ? `${evt.city} • ` : ''}{evt.countryCode}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Server */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-red-950/60 border border-red-800/40 text-red-300 text-[11px] rounded-lg font-semibold inline-block">
                              {evt.serverName}
                            </span>
                          </td>

                          {/* Device */}
                          <td className="py-3 px-4 text-zinc-300">
                            <div>{evt.device}</div>
                          </td>

                          {/* Traffic Source */}
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {evt.referrer}
                          </td>

                          {/* Time */}
                          <td className="py-3 px-4 text-right">
                            <span className="text-emerald-400 font-bold">
                              {formatTimeAgo(evt.timestamp)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DAILY VISITORS & ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 4 Key Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Today's Visitors */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                  <span>Unique Visitors Today:</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">
                    {dailyStats.todayVisitors.toLocaleString()}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    +18.6% vs yesterday
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Yesterday: {dailyStats.yesterdayVisitors.toLocaleString()} unique visitors
                </p>
              </div>

              {/* Card 2: Streams Started */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                  <span>Total Streams Started:</span>
                  <Play className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">
                    {dailyStats.totalStreamsToday.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">plays</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Peak viewing hour: {dailyStats.peakHour}
                </p>
              </div>

              {/* Card 3: Real-Time Active Now */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                  <span>Active Viewers Right Now:</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {dailyStats.activeNow}
                  </span>
                  <span className="text-xs text-zinc-400">concurrently</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Across 7 VIP mirror streaming nodes
                </p>
              </div>

              {/* Card 4: Content Locker Conversions */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-xl">
                <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
                  <span>Locker Conversion Rate:</span>
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {lockerStats.conversionRate}%
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">High CR</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {lockerStats.unlocked} Unlocked / {lockerStats.prompted} Prompted
                </p>
              </div>
            </div>

            {/* 24-Hour Traffic Chart */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    24-Hour Traffic Distribution (Hourly Stream Plays)
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Viewer activity by time of day (UTC)
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Peak: {dailyStats.peakHour}
                </span>
              </div>

              {/* Bar visualization */}
              <div className="h-44 flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-zinc-800">
                {dailyStats.hourlyTraffic.map((val, idx) => {
                  const max = Math.max(...dailyStats.hourlyTraffic, 1);
                  const heightPercent = Math.max(10, Math.round((val / max) * 100));
                  const isCurrentHour = new Date().getHours() === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-8 bg-zinc-900 border border-zinc-700 text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20 shadow-lg">
                        {idx}:00 — {val} streams
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all duration-300 ${
                          isCurrentHour
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-950'
                            : 'bg-red-600/70 hover:bg-red-500'
                        }`}
                      />
                      <span className="text-[9px] font-mono text-zinc-500 hidden sm:inline">
                        {idx}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown Grid: Countries & Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Country Breakdown */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 font-mono text-white font-bold text-sm">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Top Streaming Countries</span>
                </div>

                <div className="space-y-3">
                  {countries.map((c) => (
                    <div key={c.code} className="space-y-1 font-mono text-xs">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="text-zinc-400 font-bold">
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${c.percentage}%` }}
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 font-mono text-white font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span>Devices & Hardware</span>
                </div>

                <div className="space-y-4 pt-2">
                  {devices.map((d) => (
                    <div key={d.type} className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="flex items-center gap-2 text-white font-bold">
                          {d.type === 'Mobile' ? (
                            <Smartphone className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-blue-400" />
                          )}
                          <span>{d.type} Streamers</span>
                        </span>
                        <span className="text-emerald-400 font-black text-sm">
                          {d.percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${d.percentage}%` }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TOP TITLES LEADERBOARD ================= */}
        {activeTab === 'top_titles' && (
          <div className="space-y-4">
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Top 10 Most Streamed Titles (Today & All-Time)
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Ranked by live server clicks and completed playback sessions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {topTitles.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 p-3 bg-zinc-900/70 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition"
                  >
                    <span className="text-lg font-black text-zinc-500 font-mono w-6 text-center">
                      #{idx + 1}
                    </span>
                    {item.poster ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster}`}
                        alt={item.title}
                        className="w-10 h-14 object-cover rounded shadow border border-zinc-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-zinc-800 rounded flex items-center justify-center text-zinc-600 shrink-0">
                        <Film className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pt-0.5">
                        <span className="uppercase text-[10px] px-1.5 py-0.2 bg-zinc-800 rounded">
                          {item.type}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          {item.count} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY VAULT CONTROL ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Master Password Update Form */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 font-mono text-white font-bold text-base border-b border-zinc-800 pb-3">
                <Key className="w-5 h-5 text-red-500" />
                <span>Update Master Cryptographic Password</span>
              </div>

              {pwSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pwSuccessMsg}</span>
                </div>
              )}

              {pwErrorMsg && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{pwErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">Current Password:</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter current password..."
                    required
                    className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">New Password (min 6 chars):</label>
                    <input
                      type="password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Enter new password..."
                      required
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Confirm New Password:</label>
                    <input
                      type="password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Confirm new password..."
                      required
                      className="w-full bg-black/60 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#e50914] hover:bg-red-700 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-red-950/40"
                  >
                    Save & Re-Hash Master Password
                  </button>
                </div>
              </form>
            </div>

            {/* Quick 4-Digit Security PIN */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 font-mono text-white font-bold text-base border-b border-zinc-800 pb-3">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Quick Security PIN (For Rapid Terminal Access)</span>
              </div>

              {pinSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono">
                  {pinSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSetQuickPin} className="flex items-center gap-3 font-mono text-xs">
                <input
                  type="password"
                  maxLength={6}
                  value={quickPin}
                  onChange={(e) => setQuickPin(e.target.value)}
                  placeholder="e.g. 7842"
                  className="bg-black/60 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-red-600 w-44 tracking-widest text-center"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Set PIN
                </button>
              </form>
            </div>

            {/* Data Export & Backup Controls */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl font-mono">
              <div className="flex items-center gap-2.5 text-white font-bold text-base border-b border-zinc-800 pb-3">
                <Download className="w-5 h-5 text-blue-400" />
                <span>Export Telemetry & Stream History</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Telemetry CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download Full JSON Dump</span>
                </button>

                <button
                  type="button"
                  onClick={handlePanicWipe}
                  className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold rounded-xl transition flex items-center gap-2 ml-auto cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Panic Wipe Terminal</span>
                </button>
              </div>
            </div>

            {/* Security Audit Log */}
            <div className="bg-[#11131a] border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl font-mono">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Security Audit Logs
              </h4>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-black/50 border border-zinc-850 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.event === 'login_success'
                            ? 'bg-emerald-400'
                            : log.event === 'login_failed'
                            ? 'bg-red-500'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-zinc-200 font-semibold">{log.event}</span>
                      <span className="text-zinc-500">• {log.details}</span>
                    </div>
                    <span className="text-zinc-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

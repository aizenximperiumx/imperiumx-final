import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import AnimatedBackground from './components/AnimatedBackground';
import NotificationBell from './components/NotificationBell';
import api from './services/api';
import CommandPalette from './components/CommandPalette';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TicketCreate = lazy(() => import('./pages/TicketCreate'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const MyTickets = lazy(() => import('./pages/MyTickets'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const StaffAnalytics = lazy(() => import('./pages/StaffAnalytics'));
const StaffKanban = lazy(() => import('./pages/StaffKanban'));
const ABReport = lazy(() => import('./pages/ABReport'));
const StaffHub = lazy(() => import('./pages/StaffHub'));
const Loyalty = lazy(() => import('./pages/Loyalty'));
const Referral = lazy(() => import('./pages/Referral'));
const BrowseAccounts = lazy(() => import('./pages/BrowseAccounts'));
const BundleDeals = lazy(() => import('./pages/BundleDeals'));
const GiftCards = lazy(() => import('./pages/GiftCards'));
const Terms = lazy(() => import('./pages/Terms'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Notifications = lazy(() => import('./pages/Notifications'));
const StaffReviews = lazy(() => import('./pages/StaffReviews'));
const Profile = lazy(() => import('./pages/Profile'));
const DesignSystem = lazy(() => import('./pages/DesignSystem'));
const Concept = lazy(() => import('./pages/Concept'));

function Navbar() {
  const { isAuthenticated, user, token, logout, isStaff } = useAuth();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [credit, setCredit] = React.useState<number>(0);

  React.useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !token) {
        setCredit(0);
        return;
      }
      try {
        const c = await api.get('/loyalty/credit', { headers: { Authorization: `Bearer ${token}` } });
        setCredit(Number(c?.credit || 0));
      } catch {
        setCredit(0);
      }
    };
    load();
  }, [isAuthenticated, token]);

  return (
    <nav className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-extrabold hero-title">
              IMPERIUMX
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/browse" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <GridIcon className="w-4 h-4" />
                <span>Browse</span>
              </Link>
              <Link to="/bundle" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <LayersIcon className="w-4 h-4" />
                <span>Bundles</span>
              </Link>
              <Link to="/reviews" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <StarIcon className="w-4 h-4" />
                <span>Reviews</span>
              </Link>
              <Link to="/terms" className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                <DocIcon className="w-4 h-4" />
                <span>Terms</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(v => !v)}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors inline-flex items-center gap-2"
                >
                  <DotsIcon className="w-4 h-4" />
                  <span>More</span>
                </button>
                {moreOpen && (
                  <div className="absolute left-0 mt-2 min-w-[220px] bg-black/90 border border-white/10 rounded-xl shadow-xl z-50 p-2">
                    {isAuthenticated ? (
                      <>
                        <Link to="/concept" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <SparkIcon className="w-4 h-4" />
                          <span>Concept</span>
                        </Link>
                        <Link to="/tickets" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <TicketIcon className="w-4 h-4" />
                          <span>My Tickets</span>
                        </Link>
                        <Link to="/notifications" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <BellIcon className="w-4 h-4" />
                          <span>Notifications</span>
                        </Link>
                        <Link to="/loyalty" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <MedalIcon className="w-4 h-4" />
                          <span>Loyalty</span>
                        </Link>
                        <Link to="/referral" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <ShareIcon className="w-4 h-4" />
                          <span>Referral</span>
                        </Link>
                        <Link to="/gift-cards" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <GiftIcon className="w-4 h-4" />
                          <span>Gift Cards</span>
                        </Link>
                        {isStaff && (
                          <>
                            <div className="h-px bg-white/10 my-2" />
                            <Link to="/staff/hub" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                              <ShieldIcon className="w-4 h-4" />
                              <span>Staff Suite</span>
                            </Link>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/concept" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <SparkIcon className="w-4 h-4" />
                          <span>Concept</span>
                        </Link>
                        <Link to="/login" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <LoginIcon className="w-4 h-4" />
                          <span>Login</span>
                        </Link>
                        <Link to="/register" onClick={() => setMoreOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
                          <UserPlusIcon className="w-4 h-4" />
                          <span>Register</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <NotificationBell />
                <div className="hidden md:flex flex-col items-end text-xs leading-tight">
                  <div className="text-gray-300 font-semibold">{user?.username}</div>
                  <div className="text-gray-400">{user?.points} pts • {user?.tier}</div>
                </div>
                <Link
                  to="/profile"
                  className="hidden md:inline px-3 py-2 bg-green-600/20 text-green-400 rounded-lg text-xs hover:bg-green-600/30 transition-colors"
                  title="Store Credit"
                >
                  ${credit.toFixed(2)} credit
                </Link>
                <Link
                  to="/profile"
                  className="hidden md:inline px-3 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Profile
                </Link>
                {isStaff && (
                  <div className="hidden md:flex items-center gap-2 text-xs">
                    <Link to="/staff/hub" className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
                      Staff Suite
                    </Link>
                  </div>
                )}
              </>
            )}
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <AnimatedBackground />
      <Navbar />
      <CommandPalette />
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets/create" element={<TicketCreate />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/tickets" element={<MyTickets />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/hub" element={<StaffHub />} />
          <Route path="/staff/analytics" element={<StaffAnalytics />} />
          <Route path="/staff/kanban" element={<StaffKanban />} />
          <Route path="/staff/ab" element={<ABReport />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/browse" element={<BrowseAccounts />} />
          <Route path="/bundle" element={<BundleDeals />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/staff/reviews" element={<StaffReviews />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/design" element={<DesignSystem />} />
          <Route path="/concept" element={<Concept />} />
        </Routes>
      </Suspense>
      <BottomNav />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TicketProvider>
          <AppContent />
        </TicketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}
function LayersIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}
function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 8.24l-7.19-.61L12 1 9.19 7.63 2 8.24l5.46 5.73L5.82 21z" />
    </svg>
  );
}
function DocIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function DotsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
function TicketIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 002-2V8z" />
      <path d="M12 8v8" />
    </svg>
  );
}
function BellIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2z" />
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16z" />
    </svg>
  );
}
function MedalIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M8 12l-2 6 6-3 6 3-2-6" />
    </svg>
  );
}
function ShareIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98" />
      <path d="M15.41 6.51L8.59 10.49" />
    </svg>
  );
}
function GiftIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 7v15" />
      <path d="M12 7c-1.657 0-3-1.343-3-3S10.343 1 12 3c1.657-2 3 0 3 1s-1.343 3-3 3z" />
    </svg>
  );
}
function ShieldIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
    </svg>
  );
}
function LoginIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}
function UserPlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  );
}
function SparkIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l2.5 5 5 2.5-5 2.5L12 17l-2.5-5-5-2.5 5-2.5L12 2z" />
    </svg>
  );
}

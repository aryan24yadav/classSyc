import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/sessionContext';
import { ROUTES } from './utils/constants';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import SessionRoom from './pages/SessionRoom';
import JoinSession from './pages/JoinSession';

function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <>
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-16' : ''}>{children}</main>
      {showFooter && <Footer />}
    </>
  );
}

const toastOptions = {
  duration: 3000,
  style: {
    background: '#363636',
    color: '#fff',
  },
  success: {
    iconTheme: { primary: '#10b981', secondary: '#fff' },
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#fff' },
  },
};

function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>404</h1>
        <p className='text-gray-600 text-lg'>Page not found</p>
        <a href='/' className='text-blue-600 hover:text-blue-500'>
          Go back to home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <Toaster position='top-right' toastOptions={toastOptions} />
          <div className='min-h-screen flex flex-col bg-gray-50'>
            <Routes>
              <Route path={ROUTES.HOME} element={<Layout><Home /></Layout>} />

              <Route path={ROUTES.LOGIN} element={<Layout showHeader={false} showFooter={false}><Auth /></Layout>} />
              <Route path={ROUTES.REGISTER} element={<Layout showHeader={false} showFooter={false}><Auth /></Layout>} />

              {/* Protected routes */}
              <Route
                path={ROUTES.DASHBOARD}
                element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
              />
              <Route
                path={ROUTES.ROOM}
                element={<ProtectedRoute><Layout showFooter={false}><SessionRoom /></Layout></ProtectedRoute>}
              />
              <Route
                path={ROUTES.JOIN}
                element={<ProtectedRoute><Layout><JoinSession /></Layout></ProtectedRoute>}
              />

              <Route path='*' element={<Layout showHeader={false} showFooter={false}><NotFound /></Layout>} />
            </Routes>
          </div>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;

import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CartProvider } from './lib/cart';
import { STORE } from './config/store';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Product = lazy(() => import('./pages/Product'));

function Page({ children }) {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [hash]);
  return (
    <motion.main
      id="main"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <ErrorBoundary>
        <Suspense fallback={<div className="tee-stage min-h-[88svh]" aria-busy="true" />}>{children}</Suspense>
      </ErrorBoundary>
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <Header />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Home /></Page>} />
            <Route path="/product/:slug" element={<Page><Product /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
        <Footer />
        {STORE.commerce && <CartDrawer />}
      </CartProvider>
    </MotionConfig>
  );
}

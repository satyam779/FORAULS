import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CatalogProvider } from './lib/catalog';
import { CartProvider } from './lib/cart';
import { STORE } from './config/store';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Product = lazy(() => import('./pages/Product'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'));
const Admin = lazy(() => import('./pages/admin/Admin'));

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
  const admin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  return (
    <MotionConfig reducedMotion="user">
      <CatalogProvider>
        <CartProvider>
          {!admin && <Header />}
          <AnimatePresence mode="wait">
            <Routes location={location} key={admin ? '/admin' : location.pathname}>
              <Route path="/" element={<Page><Home /></Page>} />
              <Route path="/product/:slug" element={<Page><Product /></Page>} />
              {STORE.commerce && <Route path="/checkout" element={<Page><Checkout /></Page>} />}
              {STORE.commerce && <Route path="/order/:number" element={<Page><OrderPlaced /></Page>} />}
              <Route
                path="/admin/*"
                element={
                  <ErrorBoundary>
                    <Suspense fallback={<div className="min-h-svh bg-zinc-100" aria-busy="true" />}>
                      <Admin />
                    </Suspense>
                  </ErrorBoundary>
                }
              />
              <Route path="*" element={<Page><NotFound /></Page>} />
            </Routes>
          </AnimatePresence>
          {!admin && <Footer />}
          {STORE.commerce && !admin && <CartDrawer />}
        </CartProvider>
      </CatalogProvider>
    </MotionConfig>
  );
}

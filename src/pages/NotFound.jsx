import { useMeta } from '../lib/useMeta';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useMeta('Page not found — FORAULS');
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold">This tee wandered off</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link to="/" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-paper">
        Back to the shop
      </Link>
    </div>
  );
}

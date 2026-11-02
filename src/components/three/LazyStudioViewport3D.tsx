import React, { Suspense, lazy, useEffect, useState } from 'react';
import type { StudioViewport3DProps } from './TeaAmo3DModels';

export type { ModelType, Cup3DConfig } from './TeaAmo3DModels';

// three.js + R3F live in their own chunk: the page paints (and prerenders) without them,
// then each stage streams in its WebGL viewport.
const StudioViewport3DImpl = lazy(() =>
  import('./TeaAmo3DModels').then((m) => ({ default: m.StudioViewport3D }))
);

const StageFallback: React.FC<{ className?: string }> = ({
  className = 'h-[360px] sm:h-[420px] lg:h-[440px]',
}) => (
  <div
    className={`relative w-full flex items-center justify-center overflow-hidden ${className}`}
    aria-hidden="true"
  >
    <div className="relative w-28 h-28">
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(253,94,134,0.35),transparent_70%)] animate-pulse" />
      <span className="pearl w-5 h-5 left-6 top-10" />
      <span className="pearl w-4 h-4 left-14 top-14" style={{ animationDelay: '-2s' }} />
      <span className="pearl w-6 h-6 left-12 top-4" style={{ animationDelay: '-4s' }} />
    </div>
  </div>
);

export const StudioViewport3D: React.FC<StudioViewport3DProps> = (props) => {
  // The prerender and the hydration pass both show the placeholder; the WebGL stage
  // mounts only afterwards, so lazy() never suspends during SSR or hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <StageFallback className={props.className} />;

  return (
    <Suspense fallback={<StageFallback className={props.className} />}>
      <StudioViewport3DImpl {...props} />
    </Suspense>
  );
};

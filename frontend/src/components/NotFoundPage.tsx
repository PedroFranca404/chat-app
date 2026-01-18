// src/components/NotFoundPage.tsx
import { Link } from '@tanstack/react-router'
import { memo } from 'react'

export const NotFoundPage = memo(function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral-950 font-mono text-neutral-200">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 overflow-hidden transform-gpu">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] animate-pulse rounded-full bg-purple-900/40 blur-[120px] will-change-opacity" />
        <div className="absolute top-[20%] right-[0%] h-[300px] w-[800px] rounded-full bg-indigo-900/30 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-blue-900/30 blur-[100px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-90"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)]" />
      <div className="z-20 flex flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
           <h1 className="top-0 left-1 -z-10 animate-pulse text-9xl font-black tracking-tighter text-purple-400 opacity-90 blur-sm will-change-opacity md:text-[12rem]">
             404
           </h1>
        </div>

        <div className="max-w-xl space-y-6 rounded-2xl border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur-sm ring-1 ring-white/10">
          <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
            <div className="h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
            <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
            <span className="ml-2 font-mono text-xs text-neutral-500">kernel_panic_log</span>
          </div>

          <div className="space-y-2 text-left font-mono text-sm leading-relaxed text-neutral-400">
            <p>
              <span className="text-purple-400">root@void-host:</span>
              <span className="text-neutral-600">~</span>
              <span className="text-neutral-300">$ systemd --fail --log-level emerg</span>
            </p>
            <p className="text-yellow-500/80">
              {'>'} systemd[1]: Detected unexpected termination of critical process 'router_handler'.
            </p>
            <p className="text-red-400">
              {'>'} systemd[1]: Segmentation fault (core dumped) in critical_route_resolver.
            </p>
             <p className="text-red-400">
              {'>'} systemd[1]: Failed to start Critical Route Resolver.
            </p>
            <p className="text-yellow-500/80">
              {'>'} kernel: Out of memory: Kill process 12345 (node) score 987 or sacrifice child
            </p>
            <p className="opacity-50">
              {'>'} system recovery protocols unable to establish connection...
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/"
              preload={false}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md bg-neutral-100 px-6 py-3 text-sm font-bold text-neutral-900"
            >
              <span className="relative z-10">Return to Safety</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
})
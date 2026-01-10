import { createFileRoute } from '@tanstack/react-router'
import { Code } from 'lucide-react';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

function RouteComponent() {

  //TODO:
  const onLogin = () => {}

  return (
     <div className="relative flex items-center justify-center h-screen w-full bg-[#050505] overflow-hidden font-sans text-zinc-300 selection:bg-indigo-500/30">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />

    <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl">
      <div className="flex justify-center mb-8">
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <Code className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      <h2 className="text-2xl font-light text-center text-white mb-2 tracking-tight">
        Access Terminal
      </h2>
      <p className="text-center text-zinc-500 text-sm font-mono mb-8">
        ENTER CREDENTIALS TO CONNECT
      </p>

      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          onLogin();
        }}
        className="space-y-6"
      >
        <div className="group">
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider ml-1">
            Username
          </label>
          <input
            type="text"
            className="w-full bg-transparent border-b border-zinc-700 py-3 text-indigo-100 focus:outline-hidden focus:border-indigo-500 transition-all font-mono placeholder:text-zinc-700"
            placeholder="dev_user"
          />
        </div>
        <div className="group">
          <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider ml-1">
            Password
          </label>
          <input
            type="password"
            className="w-full bg-transparent border-b border-zinc-700 py-3 text-indigo-100 focus:outline-hidden focus:border-indigo-500 transition-all font-mono placeholder:text-zinc-700"
            placeholder="••••••••"
          />
        </div>

        <button className="w-full py-4 mt-4 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/50 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group">
          <span className="group-hover:translate-x-1 transition-transform">
            Initialize Session
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </button>
      </form>
      <div className='flex justify-center m-5'>
        <p>Dont have an account?{" "}
        <a href='register' className='text-indigo-400'>Create one here.</a></p>
      </div>
    </div>
  </div>
  )
}

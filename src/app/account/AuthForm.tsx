'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success("Signed in")
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        toast.success("Account created successfully. Please Sign In below.")
        setIsLogin(true) // Switch to Sign In form
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isLogin && (
        <div>
          <label className="text-xs text-zinc-500 block mb-1.5">Full Name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent border border-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-zinc-500 block mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border border-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 block mb-1.5">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border border-white/[0.06] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white text-black py-3 text-sm font-medium hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-zinc-500 hover:text-white transition-colors duration-200"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  )
}

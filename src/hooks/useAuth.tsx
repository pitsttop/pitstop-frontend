import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { getSupabaseClient } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { isSupabaseConfigured } from '../utils/supabase/client'

interface User {
  id: string
  email: string
  name?: string
  userType: 'admin' | 'cliente'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, userType: 'admin' | 'cliente') => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string, userType?: 'admin' | 'cliente') => Promise<{ error?: string }>
  signOut: () => Promise<void>
  accessToken: string | null
  hasAdmins: boolean | null
  checkHasAdmins: () => Promise<void>
  createAdmin: (email: string, password: string, name: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Get Supabase client once at module level
const supabase = getSupabaseClient()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [hasAdmins, setHasAdmins] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    // Check for existing session
    const checkSession = async () => {
      try {
        // Skip session check if Supabase is not configured
        if (!isSupabaseConfigured()) {
          if (mounted) {
            setLoading(false)
          }
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        if (mounted && session?.access_token && session?.user) {
          setAccessToken(session.access_token)
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            userType: session.user.user_metadata?.userType || 'cliente'
          })
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()
    checkHasAdmins()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (session?.access_token && session?.user) {
          setAccessToken(session.access_token)
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            userType: session.user.user_metadata?.userType || 'cliente'
          })
        } else {
          setAccessToken(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, userType: 'admin' | 'cliente') => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase não está configurado' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Erro ao fazer login. Verifique sua configuração do Supabase.' }
    }
  }

  const checkHasAdmins = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setHasAdmins(false)
        return
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3d28263/has-admins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      })

      const data = await response.json()
      if (response.ok) {
        setHasAdmins(data.hasAdmins)
      } else {
        setHasAdmins(false)
      }
    } catch (error) {
      console.error('Error checking admins:', error)
      setHasAdmins(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, userType: 'admin' | 'cliente' = 'cliente') => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase não está configurado' }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      }

      // If creating an admin and we have admins, include the access token
      if (userType === 'admin' && hasAdmins && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3d28263/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, name, userType }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Erro ao criar conta' }
      }

      // After successful signup, sign in the user
      const signInResult = await signIn(email, password, userType)
      return signInResult
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'Erro ao criar conta. Verifique sua configuração do Supabase.' }
    }
  }

  const createAdmin = async (email: string, password: string, name: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return { error: 'Supabase não está configurado' }
      }

      if (!accessToken) {
        return { error: 'Você precisa estar logado para criar administradores' }
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d3d28263/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Erro ao criar administrador' }
      }

      return {}
    } catch (error) {
      console.error('Create admin error:', error)
      return { error: 'Erro ao criar administrador. Verifique sua configuração do Supabase.' }
    }
  }

  const signOut = async () => {
    try {
      // Clear user state immediately
      setUser(null)
      setAccessToken(null)
      setLoading(true)
      
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear any cached data or localStorage if needed
      // Note: We don't clear Supabase config as user might want to use different account
      
    } catch (error) {
      console.error('Error during sign out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    accessToken,
    hasAdmins,
    checkHasAdmins,
    createAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
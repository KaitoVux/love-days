import { createClient } from '@supabase/supabase-js'

// For this demo, we'll use mock values or environment variables
// Create a .env.local file with:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Real Supabase authentication function
export const authenticateUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  } catch (err) {
    return {
      data: { user: null, session: null },
      error: {
        message: 'An unexpected error occurred during authentication',
      },
    }
  }
}

// Function to get current session from Supabase
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    return { session, error }
  } catch (err) {
    return { session: null, error: err }
  }
}

// Function to get current user from Supabase
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  } catch (err) {
    return { user: null, error: err }
  }
}

// Function to sign out using Supabase
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    return { error: err }
  }
}

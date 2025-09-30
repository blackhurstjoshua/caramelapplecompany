import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Verify admin login credentials using Supabase Auth
export async function verifyAdminLogin(email: string, password: string): Promise<AuthResult> {
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        success: false,
        message: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Authentication failed'
      };
    }

    // Check if user is admin by checking user metadata
    const userRole = data.user.user_metadata?.role;

    if (userRole !== 'admin') {
      // Sign out the user since they're not admin
      await supabase.auth.signOut();
      return {
        success: false,
        message: 'Access denied: Admin privileges required'
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: data.user
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
}

// Get current auth state from Supabase
export async function getAuthState(): Promise<AuthState> {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return { user: null, isAuthenticated: false, isAdmin: false };
    }

    // Check if user is admin via user metadata
    const isAdmin = session.user.user_metadata?.role === 'admin';

    return {
      user: session.user,
      isAuthenticated: true,
      isAdmin
    };

  } catch (error) {
    console.error('Auth state error:', error);
    return { user: null, isAuthenticated: false, isAdmin: false };
  }
}

// Sign out user
export async function clearAuthState(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (authState: AuthState) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      callback({ user: null, isAuthenticated: false, isAdmin: false });
      return;
    }

    // Check admin status via user metadata
    const isAdmin = session.user.user_metadata?.role === 'admin';

    callback({
      user: session.user,
      isAuthenticated: true,
      isAdmin
    });
  });
}
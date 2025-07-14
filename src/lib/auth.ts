import adminCredentials from './admin-credentials.json';

interface AdminUser {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: string;
}

// Verify admin login credentials with simple string comparison
export async function verifyAdminLogin(email: string, password: string): Promise<AuthResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Find user by email
    const user = Object.entries(adminCredentials).find(([key, userData]) => 
      userData.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    const [username, userData] = user;
    
    // Simple string comparison
    if (password === userData.password) {
      return {
        success: true,
        message: 'Login successful',
        user: username
      };
    } else {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
}

// Store auth state (simple client-side storage for demo)
export function setAuthState(user: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('admin_user', user);
    sessionStorage.setItem('admin_login_time', Date.now().toString());
  }
}

export function getAuthState(): { user: string | null; isAuthenticated: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  
  const user = sessionStorage.getItem('admin_user');
  const loginTime = sessionStorage.getItem('admin_login_time');
  
  // Check if login is still valid (24 hours)
  if (user && loginTime) {
    const elapsed = Date.now() - parseInt(loginTime);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (elapsed < twentyFourHours) {
      return { user, isAuthenticated: true };
    }
  }
  
  return { user: null, isAuthenticated: false };
}

export function clearAuthState() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_login_time');
  }
} 
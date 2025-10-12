// Simple mock authentication system to replace Supabase
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'Loan Officer' | 'Applicant';
  avatar?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    username: 'john.doe',
    email: 'john@example.com',
    role: 'Loan Officer'
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'jane.smith',
    email: 'jane@example.com',
    role: 'Applicant'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    username: 'mike.johnson',
    email: 'mike@example.com',
    role: 'Loan Officer'
  }
];

class MockAuth {
  private currentUser: User | null = null;
  private sessionKey = 'mock_auth_session';

  constructor() {
    // Check for existing session on initialization
    this.loadSession();
  }

  private loadSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  private saveSession(user: User | null) {
    try {
      if (user) {
        localStorage.setItem(this.sessionKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.sessionKey);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock authentication - in real app this would be secure
    const user = mockUsers.find(u => 
      u.email === credentials.email || u.username === credentials.email
    );

    if (user && credentials.password === 'password') {
      this.currentUser = user;
      this.saveSession(user);
      return { user, error: null };
    }

    return { user: null, error: 'Invalid credentials' };
  }

  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    role: 'Loan Officer' | 'Applicant';
  }): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { user: null, error: 'User already exists' };
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: userData.name,
      username: userData.email.split('@')[0],
      email: userData.email,
      role: userData.role
    };

    mockUsers.push(newUser);
    this.currentUser = newUser;
    this.saveSession(newUser);

    return { user: newUser, error: null };
  }

  async signOut(): Promise<{ error: string | null }> {
    this.currentUser = null;
    this.saveSession(null);
    return { error: null };
  }

  getSession(): { data: { session: { user: User } | null } } {
    return {
      data: {
        session: this.currentUser ? { user: this.currentUser } : null
      }
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Mock method to simulate auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // In a real implementation, this would listen for auth changes
    // For now, we'll just call it once with the current session
    const session = this.currentUser ? { user: this.currentUser } : null;
    callback(this.currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', session);

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
}

export const mockAuth = new MockAuth();
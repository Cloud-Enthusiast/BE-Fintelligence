# Frontend Migration Steps

## 1. Remove Supabase Dependencies

### Update package.json
Remove:
```json
"@supabase/supabase-js": "^2.49.4",
```

### Delete Supabase Files
- `src/lib/supabase.ts`
- `src/types/supabase.ts`

## 2. Create API Client

### src/lib/api.ts
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string, loginType: 'officer' | 'applicant') {
    const response = await this.request<{
      token: string;
      user: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, loginType }),
    });

    this.setToken(response.token);
    return response;
  }

  async register(email: string, password: string, fullName: string, role: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, role }),
    });
  }

  async logout() {
    this.clearToken();
  }

  // Loan assessment methods
  async saveLoanAssessment(assessmentData: any) {
    return this.request('/loans/assessment', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  async getLoanAssessments() {
    return this.request('/loans/assessments');
  }

  async getLoanAssessment(id: string) {
    return this.request(`/loans/assessment/${id}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

## 3. Update AuthContext

### src/contexts/AuthContext.tsx
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

type UserRole = 'Loan Officer' | 'Applicant';

type User = {
  username: string;
  role: UserRole;
  name: string;
  avatar?: string;
  id?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, loginType?: 'officer' | 'applicant') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');
        
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          apiClient.setToken(token);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (
    username: string, 
    password: string, 
    loginType: 'officer' | 'applicant' = 'officer'
  ): Promise<boolean> => {
    try {
      const response = await apiClient.login(username, password, loginType);
      
      const userData: User = {
        username: response.user.email,
        role: response.user.role as UserRole,
        name: response.user.name,
        avatar: '/avatar-placeholder.png',
        id: response.user.id
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    apiClient.logout();

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 4. Update useEligibilityForm Hook

### src/hooks/useEligibilityForm.ts
```typescript
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { calculateEligibility } from '@/utils/eligibilityCalculator';

// ... keep existing interfaces and state logic ...

export const useEligibilityForm = (onComplete?: () => void) => {
  // ... keep existing state and handlers ...

  const handleSaveToDatabase = async () => {
    if (!result || !user?.id) {
      toast({
        title: "Error",
        description: "User not logged in or eligibility not calculated.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingToDatabase(true);

    try {
      const assessmentData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        annualRevenue: formData.annualRevenue,
        monthlyIncome: formData.monthlyIncome,
        existingLoanAmount: formData.existingLoanAmount,
        creditScore: formData.creditScore,
        loanAmount: formData.loanAmount,
        loanTerm: formData.loanTerm,
        eligibilityScore: result.score,
        isEligible: result.eligible,
        rejectionReason: result.reason || null
      };

      await apiClient.saveLoanAssessment(assessmentData);

      toast({
        title: "Assessment Saved",
        description: "Your eligibility assessment has been saved.",
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Save Failed",
        description: error.message || "There was a problem saving your assessment.",
        variant: "destructive",
      });
    } finally {
      setIsSavingToDatabase(false);
    }
  };

  // ... return existing values and functions
};
```

## 5. Environment Variables

### .env
```
VITE_API_URL=http://localhost:3001/api
```

### .env.production
```
VITE_API_URL=https://your-production-api.com/api
```
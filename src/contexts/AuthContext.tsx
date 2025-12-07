import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Subscription, BillingCycle } from "@/lib/plans";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  location: string;
  phone: string;
  avatar: string;
  coverType: 'color' | 'image';
  coverImage?: string;
  coverColor?: string;
  cardStyle: 'professional' | 'social';
  socialLinks: SocialLink[];
  subscription: Subscription;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  requestUpgrade: (reference: string, billingCycle: BillingCycle) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuario mockeado de ejemplo
const MOCK_USER: User = {
  id: "1",
  username: "mariagarcia",
  email: "maria@techcorp.com",
  name: "María García",
  title: "Product Designer",
  company: "TechCorp",
  bio: "Diseñadora de producto apasionada por crear experiencias digitales que impacten positivamente en las personas.",
  location: "Madrid, España",
  phone: "+34 612 345 678",
  avatar: "",
  coverType: 'color',
  coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cardStyle: 'professional',
  socialLinks: [
    { id: "1", platform: "linkedin", url: "https://linkedin.com/in/mariagarcia", label: "LinkedIn" },
    { id: "2", platform: "twitter", url: "https://twitter.com/mariagarcia", label: "Twitter" },
    { id: "3", platform: "instagram", url: "https://instagram.com/mariagarcia", label: "Instagram" },
  ],
  subscription: {
    plan: 'free',
    status: 'none',
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem("pulpy_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulación de login - en producción esto sería una llamada API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === MOCK_USER.email && password === "password123") {
          setUser(MOCK_USER);
          setIsAuthenticated(true);
          localStorage.setItem("pulpy_user", JSON.stringify(MOCK_USER));
          resolve();
        } else {
          reject(new Error("Credenciales inválidas"));
        }
      }, 1000);
    });
  };

  const signup = async (data: SignupData) => {
    // Simulación de signup - en producción esto sería una llamada API
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          ...MOCK_USER,
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          email: data.email,
          username: data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        };
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem("pulpy_user", JSON.stringify(newUser));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("pulpy_user");
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("pulpy_user", JSON.stringify(updatedUser));
    }
  };

  const requestUpgrade = (reference: string, billingCycle: BillingCycle) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        subscription: {
          plan: 'premium',
          billingCycle,
          status: 'pending',
          paymentReference: reference,
        },
      };
      setUser(updatedUser);
      localStorage.setItem("pulpy_user", JSON.stringify(updatedUser));
    }
  };

  const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isPremium, login, signup, logout, updateProfile, requestUpgrade }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};


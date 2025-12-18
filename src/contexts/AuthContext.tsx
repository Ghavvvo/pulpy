import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Subscription, BillingCycle } from "@/lib/plans";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from Supabase
  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;

      // Fetch social links
      const { data: socialLinks, error: linksError } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', authUser.id)
        .order('display_order', { ascending: true });

      if (linksError) throw linksError;

      // Fetch subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (subError) throw subError;

      // Map database data to User interface
      const userData: User = {
        id: profile.id,
        username: profile.username || '',
        email: authUser.email || '',
        name: profile.full_name || '',
        title: profile.title || '',
        company: profile.company || '',
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        avatar: profile.avatar_url || '',
        coverType: profile.cover_type || 'color',
        coverImage: profile.cover_image_url,
        coverColor: profile.cover_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardStyle: profile.card_style || 'professional',
        socialLinks: (socialLinks || []).map(link => ({
          id: link.id,
          platform: link.platform,
          url: link.url,
          label: link.label || link.platform,
        })),
        subscription: {
          plan: subscription?.plan || 'free',
          billingCycle: subscription?.billing_cycle,
          status: subscription?.status || 'none',
          startDate: subscription?.start_date,
          endDate: subscription?.end_date,
          paymentReference: subscription?.payment_reference,
        },
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) {
      await fetchUserProfile(data.user);
    }
  };

  const signup = async (data: SignupData) => {
    const username = data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: username,
        },
      },
    });

    if (error) throw error;
    if (authData.user) {
      await fetchUserProfile(authData.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // Update profile data
      const profileUpdate: any = {};
      if (data.name !== undefined) profileUpdate.full_name = data.name;
      if (data.username !== undefined) profileUpdate.username = data.username;
      if (data.title !== undefined) profileUpdate.title = data.title;
      if (data.company !== undefined) profileUpdate.company = data.company;
      if (data.bio !== undefined) profileUpdate.bio = data.bio;
      if (data.location !== undefined) profileUpdate.location = data.location;
      if (data.phone !== undefined) profileUpdate.phone = data.phone;
      if (data.avatar !== undefined) profileUpdate.avatar_url = data.avatar;
      if (data.coverType !== undefined) profileUpdate.cover_type = data.coverType;
      if (data.coverImage !== undefined) profileUpdate.cover_image_url = data.coverImage;
      if (data.coverColor !== undefined) profileUpdate.cover_color = data.coverColor;
      if (data.cardStyle !== undefined) profileUpdate.card_style = data.cardStyle;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Handle social links updates
      if (data.socialLinks) {
        // Delete existing links
        await supabase
          .from('social_links')
          .delete()
          .eq('user_id', user.id);

        // Insert new links
        const linksToInsert = data.socialLinks.map((link, index) => ({
          user_id: user.id,
          platform: link.platform,
          url: link.url,
          label: link.label,
          display_order: index,
        }));

        if (linksToInsert.length > 0) {
          const { error: linksError } = await supabase
            .from('social_links')
            .insert(linksToInsert);

          if (linksError) throw linksError;
        }
      }

      // Refresh user data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await fetchUserProfile(authUser);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const requestUpgrade = async (reference: string, billingCycle: BillingCycle) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan: 'premium',
          billing_cycle: billingCycle,
          status: 'pending',
          payment_reference: reference,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh user data
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await fetchUserProfile(authUser);
      }
    } catch (error) {
      console.error('Error requesting upgrade:', error);
      throw error;
    }
  };

  const isPremium = user?.subscription?.plan === 'premium' && user?.subscription?.status === 'active';

  if (loading) {
    return <div>Loading...</div>;
  }

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


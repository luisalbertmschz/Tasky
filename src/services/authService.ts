import { supabase } from '../lib/supabase';
import { User } from '../types';

export class AuthService {
  // Iniciar sesión con email y contraseña
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Obtener información del usuario
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;

        return { user: userData, session: data.session };
      }

      return { user: null, session: data.session };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            long_name: userData.longName,
            role: userData.role,
            department: userData.department,
          },
        },
      });

      if (error) throw error;

      // Crear perfil de usuario en la tabla users
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email!,
              name: userData.name!,
              long_name: userData.longName!,
              role: userData.role!,
              department: userData.department!,
              avatar: userData.avatar || '',
            },
          ]);

        if (profileError) throw profileError;
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return null;

      // Obtener información completa del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Escuchar cambios en la autenticación
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Restablecer contraseña
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
      throw error;
    }
  }
}

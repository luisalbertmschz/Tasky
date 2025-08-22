import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export class FirebaseAuthService {
  // Iniciar sesión con email y contraseña
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener información del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { 
          user: userDoc.data() as User, 
          session: { user: user } 
        };
      }
      
      return { user: null, session: { user: user } };
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  static async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear perfil de usuario en Firestore
      const newUser: User = {
        id: user.uid,
        email: user.email!,
        name: userData.name!,
        longName: userData.longName!,
        role: userData.role!,
        department: userData.department!,
        avatar: userData.avatar || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), newUser);

      return { user: newUser, session: { user: user } };
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Obtener información completa del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      return !!auth.currentUser;
    } catch (error) {
      return false;
    }
  }

  // Escuchar cambios en la autenticación
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Restablecer contraseña
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  static async updatePassword(newPassword: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      await updatePassword(user, newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
}

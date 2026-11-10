import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from './types';

const USERS_KEY = '@app_users_v1';
const SESSION_KEY = '@app_session_v1';

// Hash function para sa seguridad sa password sa storage
export const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

// Pagkuha sa tanang registered users gikan sa AsyncStorage
export const getUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Pag-register sa bag-ong user
export const registerUser = async (newUser: User): Promise<{ success: boolean; error?: string }> => {
  try {
    const users = await getUsers();
    
    // Pag-check kung naa na bay parehas nga username o email (case-insensitive para sa uniqueness)
    const existing = users.find(
      (u) => u.username.toLowerCase() === newUser.username.toLowerCase() || 
             u.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (existing) {
      return { success: false, error: 'Username or email already exists.' };
    }

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save user record.' };
  }
};

// Case-sensitive login authentication (Strict capitalization check)
export const authenticateUser = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const users = await getUsers();
    const hashed = hashPassword(pass);

    // Dili mogana kung mali ang capitalization sa username o email
    const user = users.find(
      (u) => (u.username === identifier || u.email === identifier) && 
             u.passwordHash === hashed
    );

    if (!user) {
      return { success: false, error: 'Invalid username/email or password.' };
    }

    // Pag-set sa active session (Naka-match sa imong Session interface)
    const session: Session = {
      username: user.username,
      fullName: user.fullName,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Authentication failed.' };
  }
};

// Pag-remove/delete sa user gikan sa listahan
export const removeUser = async (username: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const users = await getUsers();
    const updatedUsers = users.filter((u) => u.username !== username);
    
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove user record.' };
  }
};

// Pagkuha sa kasamtangang active session
export const getSession = async (): Promise<Session | null> => {
  try {
    const data = await AsyncStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

// Pag-clear sa session inig logout
export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};
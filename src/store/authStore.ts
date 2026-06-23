import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FbUser,
} from 'firebase/auth';
import { auth } from '../firebase';
import { resetInitState } from '../db';

export interface AuthSession {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  user: AuthSession | null;
  isAuthenticated: boolean;
  /** true enquanto o Firebase ainda restaura a sessão na inicialização. */
  initializing: boolean;
  init: () => void;
  register: (email: string, password: string, name: string) => Promise<string>;
  login: (email: string, password: string) => Promise<void>;
  /** Login/cadastro com a conta Google (popup). Retorna false se o usuário fechou o popup. */
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
}

function toSession(u: FbUser): AuthSession {
  return { id: u.uid, email: u.email ?? '', name: u.displayName ?? (u.email?.split('@')[0] ?? 'Usuário') };
}

/** Traduz códigos de erro do Firebase Auth para mensagens em pt-BR. */
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'E-mail já cadastrado. Faça login.';
    case 'auth/invalid-email': return 'E-mail inválido.';
    case 'auth/weak-password': return 'A senha deve ter ao menos 6 caracteres.';
    case 'auth/user-not-found': return 'E-mail não encontrado.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests': return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/network-request-failed': return 'Sem conexão. Verifique sua internet.';
    case 'auth/popup-blocked': return 'O navegador bloqueou o popup. Libere e tente de novo.';
    case 'auth/account-exists-with-different-credential': return 'Já existe uma conta com este e-mail usando outro método de login.';
    case 'auth/operation-not-allowed': return 'Método de login não habilitado no Firebase.';
    case 'auth/unauthorized-domain': return 'Domínio não autorizado no Firebase Authentication.';
    default: return 'Não foi possível concluir. Tente novamente.';
  }
}

let unsub: (() => void) | null = null;

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  initializing: true,

  init: () => {
    if (unsub) return;
    unsub = onAuthStateChanged(auth, (u) => {
      if (!u) resetInitState();
      set({
        user: u ? toSession(u) : null,
        isAuthenticated: !!u,
        initializing: false,
      });
    });
  },

  register: async (email, password, name) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      resetInitState();
      set({ user: { id: cred.user.uid, email: cred.user.email ?? '', name: name.trim() }, isAuthenticated: true });
      return cred.user.uid;
    } catch (e) {
      throw new Error(friendlyError((e as { code?: string }).code ?? ''));
    }
  },

  login: async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      set({ user: toSession(cred.user), isAuthenticated: true });
    } catch (e) {
      throw new Error(friendlyError((e as { code?: string }).code ?? ''));
    }
  },

  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      resetInitState();
      set({ user: toSession(cred.user), isAuthenticated: true });
      return true;
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      // Usuário fechou/cancelou o popup — não é erro.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return false;
      throw new Error(friendlyError(code));
    }
  },

  logout: async () => {
    resetInitState();
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
  },
}));

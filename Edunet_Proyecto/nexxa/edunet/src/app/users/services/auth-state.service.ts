import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthState {
  token: string | null;
  role: number | null;
  userId: number | null;
  isAuthenticated?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private state$ = new BehaviorSubject<AuthState>({ token: null, role: null, userId: null, isAuthenticated: false });

  get authState$() {
    return this.state$.asObservable();
  }

  get snapshot() {
    return this.state$.getValue();
  }

  loadFromStorage() {
    try {
      const token = localStorage.getItem('auth_token');
      const role = localStorage.getItem('auth_role');
      const userId = localStorage.getItem('auth_user_id');

      this.state$.next({
        token: token || null,
        role: role ? parseInt(role, 10) : null,
        userId: userId ? parseInt(userId, 10) : null,
        isAuthenticated: !!token
      });
    } catch (e) {
      this.state$.next({ token: null, role: null, userId: null, isAuthenticated: false });
    }
  }

  setAuth(token: string | null, role: number | null, userId: number | null) {
    try {
      if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
      if (role !== null) localStorage.setItem('auth_role', String(role)); else localStorage.removeItem('auth_role');
      if (userId !== null) localStorage.setItem('auth_user_id', String(userId)); else localStorage.removeItem('auth_user_id');
    } catch (e) {}
    this.state$.next({
      token,
      role,
      userId,
      isAuthenticated: !!token
    });
  }

  clear() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_user_id');
    } catch (e) {}
    this.state$.next({ token: null, role: null, userId: null, isAuthenticated: false });
  }
}

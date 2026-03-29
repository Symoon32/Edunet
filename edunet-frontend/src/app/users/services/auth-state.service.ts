import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthState {
  token: string | null;
  role: number | null;
  user: any | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private state$ = new BehaviorSubject<AuthState>({ token: null, role: null, user: null });

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
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      this.state$.next({
        token: token || null,
        role: role ? parseInt(role, 10) : null,
        user: user
      });
    } catch (e) {
      this.state$.next({ token: null, role: null, user: null });
    }
  }

  setAuth(token: string | null, role: number | null, user: any = null) {
    try {
      if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
      if (role !== null) localStorage.setItem('auth_role', String(role)); else localStorage.removeItem('auth_role');
      if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
    } catch (e) {}
    this.state$.next({ token, role, user });
  }

  updateUser(user: any) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {}
    const currentState = this.state$.getValue();
    this.state$.next({ ...currentState, user });
  }

  clear() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('user');
    } catch (e) {}
    this.state$.next({ token: null, role: null, user: null });
  }
}

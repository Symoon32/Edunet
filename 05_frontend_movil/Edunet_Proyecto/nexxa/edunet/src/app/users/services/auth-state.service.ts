import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthState {
  token: string | null;
  role: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private state$ = new BehaviorSubject<AuthState>({ token: null, role: null });

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
      this.state$.next({ token: token || null, role: role ? parseInt(role, 10) : null });
    } catch (e) {
      this.state$.next({ token: null, role: null });
    }
  }

  setAuth(token: string | null, role: number | null) {
    try {
      if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token');
      if (role !== null) localStorage.setItem('auth_role', String(role)); else localStorage.removeItem('auth_role');
    } catch (e) {}
    this.state$.next({ token, role });
  }

  clear() {
    try { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_role'); } catch (e) {}
    this.state$.next({ token: null, role: null });
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthStateService } from '../../users/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthStateService) {}

  canActivate(): boolean | UrlTree {
    const role = this.auth.snapshot.role;
    if (role === 4) return true;
    return this.router.parseUrl('/');
  }
}

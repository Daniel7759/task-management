import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8093'; // Cambiar por tu URL de backend
  private tokenKey = 'task_manager_token';
  private userKey = 'task_manager_user';

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);

          // Decodificar el token para obtener información adicional del usuario
          const decodedToken = this.decodeToken(response.token);

          // Combinar la información de la respuesta con la información del token
          const userInfo: LoginResponse = {
            ...response,
            username: decodedToken?.sub || decodedToken?.username || response.username,
          };

          localStorage.setItem(this.userKey, JSON.stringify(userInfo));
          this.currentUserSubject.next(userInfo);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
    );
  }

  // Mock login para desarrollo
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    if (credentials.username === 'demo' && credentials.password === 'demo123') {
      const mockResponse: LoginResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        username: 'demo',
        email: 'demo@example.com',
        roles: ['USER']
      };
      return of(mockResponse);
    }
    throw new Error('Credenciales inválidas');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  getUserName(): string {
    const user = this.getCurrentUser();
    if (user?.username) {
      return user.username;
    }

    // Si no hay usuario en currentUser, intentar obtenerlo del token
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.sub || decoded?.username || decoded?.name || 'Usuario';
    }

    return 'Usuario';
  }

  private getUserFromStorage(): LoginResponse | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false; // Si no hay fecha de expiración, no consideramos que esté expirado
    }

    // La fecha de expiración está en segundos, convertir a milisegundos
    const expDate = new Date(decoded.exp * 1000);
    return expDate <= new Date();
  }

  private decodeToken(token: string): any {
    try {
      // JWT tiene 3 partes separadas por puntos: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token JWT inválido: formato incorrecto');
        return null;
      }

      const base64Url = parts[1]; // El payload es la segunda parte
      if (!base64Url) return null;

      // Convertir base64url a base64 estándar
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Agregar padding si es necesario
      const padding = 4 - (base64.length % 4);
      if (padding !== 4) {
        base64 += '='.repeat(padding);
      }

      // Decodificar base64 y manejar caracteres UTF-8
      const jsonPayload = this.utf8Decode(atob(base64));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  }

  private utf8Decode(str: string): string {
    try {
      // Decodificar UTF-8 correctamente
      return decodeURIComponent(escape(str));
    } catch (error) {
      // Si falla el decode UTF-8, devolver la cadena original
      console.warn('No se pudo decodificar UTF-8, usando cadena original');
      return str;
    }
  }
}
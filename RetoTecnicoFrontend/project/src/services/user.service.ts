import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8093/users'; // Cambiar por tu URL de backend

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    // Simulación para desarrollo - reemplazar con llamada real al backend
    /*const mockUsers: User[] = [
      { id: 1, username: 'demo', email: 'demo@example.com', roles: ['USER'] },
      { id: 2, username: 'admin', email: 'admin@example.com', roles: ['ADMIN', 'USER'] }
    ];
    return of(mockUsers).pipe(delay(500));*/

    // Descomenta esto cuando conectes con tu backend real:
     return this.http.get<User[]>(this.baseUrl);
  }

  getUserById(id: number): Observable<User> {
    // Simulación para desarrollo
    /*const mockUser: User = { id: 1, username: 'demo', email: 'demo@example.com', roles: ['USER'] };
    return of(mockUser).pipe(delay(300));*/

    // Descomenta esto cuando conectes con tu backend real:
     return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User> {
    // Simulación para desarrollo
    /*const newUser: User = {
      id: Math.floor(Math.random() * 1000),
      username: user.username,
      email: user.email,
      roles: ['USER']
    };
    return of(newUser).pipe(delay(500));*/

    // Descomenta esto cuando conectes con tu backend real:
     return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    // Simulación para desarrollo
    /*const updatedUser: User = {
      id: id,
      username: user.username || 'demo',
      email: user.email || 'demo@example.com',
      roles: ['USER']
    };
    return of(updatedUser).pipe(delay(500));*/

    // Descomenta esto cuando conectes con tu backend real:
     return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    // Simulación para desarrollo
    /*return of(void 0).pipe(delay(300));*/

    // Descomenta esto cuando conectes con tu backend real:
     return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
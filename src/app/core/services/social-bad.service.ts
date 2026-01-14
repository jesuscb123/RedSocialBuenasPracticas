import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KpiService } from '../metrics/kpi.service';

export type Post = { userId: number; id: number; title: string; body: string; };
export type Comment = { postId: number; id: number; name: string; email: string; body: string; };

@Injectable({ providedIn: 'root' })
export class SocialBadService {
  constructor(private http: HttpClient, private kpi: KpiService) {}

  // Anti-patrón: contador HTTP en servicio (además del interceptor si lo tuvieras),
  // y sin cache: cada llamada dispara request real.
  getPosts(): Observable<Post[]> {
    this.kpi.incHttp();
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts');
  }

  getComments(postId: number): Observable<Comment[]> {
    this.kpi.incHttp();
    return this.http.get<Comment[]>(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
  }
}

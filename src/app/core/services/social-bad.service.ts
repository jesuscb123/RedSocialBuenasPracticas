import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, shareReplay, tap } from 'rxjs';
import { KpiService } from '../metrics/kpi.service';

export type Post = { userId: number; id: number; title: string; body: string; };
export type Comment = { postId: number; id: number; name: string; email: string; body: string; };

@Injectable({ providedIn: 'root' })
export class SocialBadService {
  // Cache para posts con TTL de 60 segundos
  private postsCache$?: Observable<Post[]>;
  private cacheTime = 0;
  private readonly CACHE_TTL = 60000; // 60 segundos

  constructor(private http: HttpClient, private kpi: KpiService) {}

  getPosts(): Observable<Post[]> {
    const now = Date.now();
    if (!this.postsCache$ || (now - this.cacheTime) > this.CACHE_TTL) {
      this.kpi.incCacheMiss();
      this.postsCache$ = this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts').pipe(
        tap(() => this.kpi.incHttp()),
        shareReplay(1)
      );
      this.cacheTime = now;
    } else {
      this.kpi.incCacheHit();
    }
    return this.postsCache$;
  }

  getComments(postId: number): Observable<Comment[]> {
    this.kpi.incHttp();
    return this.http.get<Comment[]>(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
  }
}

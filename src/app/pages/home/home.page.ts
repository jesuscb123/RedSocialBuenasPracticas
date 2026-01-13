import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonList, IonLabel, IonButton, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { SocialBadService, Post } from '../../core/services/social-bad.service';
import { KpiService } from '../../core/metrics/kpi.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonInput, IonList, IonLabel, IonButton, IonNote, IonSpinner
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit, OnDestroy {
  query = '';
  loading = false;
  error = '';

  posts: Post[] = [];
  filtered: Post[] = [];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private api: SocialBadService,
    private router: Router,
    public kpi: KpiService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    // KPI arranque aproximado
    const navStart = (performance.getEntriesByType('navigation')[0] as any)?.startTime ?? 0;
    this.kpi.setStartupMs(Math.round(performance.now() - navStart));

    this.loading = true;

    // Cargar posts una vez y cachear
    this.kpi.incSub();
    this.api.getPosts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: data => {
        // Limitar a 100 posts para mejor rendimiento
        this.posts = data.slice(0, 100);
        this.filtered = this.posts;
        this.kpi.setRenderItems(this.filtered.length);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando posts';
        this.loading = false;
      }
    });

    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  onInput(ev: any) {
    const t0 = performance.now();
    const value = (ev?.target?.value ?? '').toString();
    this.query = value;
    this.searchSubject.next(value);
    this.kpi.addInputSample(performance.now() - t0);
  }

  private performSearch(query: string) {
    if (query.length >= 2) {
      // Filtrar localmente
      const q = query.toLowerCase();
      this.filtered = this.posts.filter(p =>
        (p.title + ' ' + p.body).toLowerCase().includes(q)
      );
    } else {
      this.filtered = this.posts;
    }
    this.kpi.setRenderItems(this.filtered.length);
  }

  // Simplificar prettyTitle para mejor rendimiento
  prettyTitle(p: Post): string {
    return `[${p.id}] ${p.title}`;
  }

  openPost(p: Post) {
    this.router.navigate(['/detail'], { queryParams: { id: p.id, title: p.title } });
  }

  goSettings() {
    this.router.navigate(['/settings']);
  }

  trackByFn(index: number, item: Post): number {
    return item.id;
  }
}
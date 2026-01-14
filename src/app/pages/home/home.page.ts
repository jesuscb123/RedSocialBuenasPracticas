import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonList, IonLabel, IonButton, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

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
export class HomePage implements OnInit {
  query = '';
  loading = false;
  error = '';

  posts: Post[] = [];
  filtered: Post[] = [];

  constructor(
    private api: SocialBadService,
    private router: Router,
    public kpi: KpiService
  ) {}

  ngOnInit() {
    // KPI arranque aproximado
    const navStart = (performance.getEntriesByType('navigation')[0] as any)?.startTime ?? 0;
    this.kpi.setStartupMs(Math.round(performance.now() - navStart));

    this.loading = true;

    // Anti-patrón: petición 1
    this.kpi.incSub();
    this.api.getPosts().subscribe({
      next: data => {
        // Anti-patrón: inflar lista artificialmente (estrés)
        const big: Post[] = [];
        for (let i = 0; i < 10; i++) big.push(...data); // 100 * 10 = 1000
        this.posts = big;
        this.filtered = big;
        this.kpi.setRenderItems(this.filtered.length);
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando posts';
        this.loading = false;
      }
    });

    // Anti-patrón: petición 2 duplicada “solo para log”
    this.kpi.incSub();
    this.api.getPosts().subscribe({
      next: data => console.log('Posts (duplicado):', data.length),
      error: () => {}
    });

    // Anti-patrón: cache inexistente; dejamos cacheHit/miss en 0 (ratio N/A)
  }

  onInput(ev: any) {
    const t0 = performance.now();

    const value = (ev?.target?.value ?? '').toString();
    this.query = value;

    // Anti-patrón: cálculo pesado por evento
    let dummy = 0;
    for (let i = 0; i < 90000; i++) dummy += i % 5;

    // Anti-patrón: cada pulsación dispara nueva carga remota (encima duplicada)
    if (value.length >= 2) {
      this.loading = true;

      this.kpi.incSub();
      this.api.getPosts().subscribe({
        next: data => {
          // Anti-patrón: filtrar en componente y volver a inflar
          const big: Post[] = [];
          for (let i = 0; i < 10; i++) big.push(...data);
          const q = value.toLowerCase();
          this.filtered = big.filter(p =>
            (p.title + ' ' + p.body).toLowerCase().includes(q)
          );
          this.kpi.setRenderItems(this.filtered.length);
          this.loading = false;
        },
        error: () => {
          this.error = 'Error recargando posts en búsqueda';
          this.loading = false;
        }
      });

      // Duplicada extra
      this.kpi.incSub();
      this.api.getPosts().subscribe({ next: () => {}, error: () => {} });
    } else {
      // Anti-patrón: recalcular filtrado igualmente
      const q = value.toLowerCase();
      this.filtered = this.posts.filter(p =>
        (p.title + ' ' + p.body).toLowerCase().includes(q)
      );
      this.kpi.setRenderItems(this.filtered.length);
    }

    this.kpi.addInputSample(performance.now() - t0);
  }

  // Anti-patrón: función costosa llamada desde template para cada item
  prettyTitle(p: Post): string {
    let dummy = 0;
    for (let i = 0; i < 7000; i++) dummy += i % 3;
    return `[${p.id}] ${p.title.toUpperCase()}`;
  }

  openPost(p: Post) {
    // Anti-patrón: no validar, pasar datos por querystring
    this.router.navigate(['/detail'], { queryParams: { id: p.id, title: p.title } });
  }

  goSettings() {
    this.router.navigate(['/settings']);
  }
}

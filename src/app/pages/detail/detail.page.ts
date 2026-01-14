import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';

import { SocialBadService, Comment } from '../../core/services/social-bad.service';
import { KpiService } from '../../core/metrics/kpi.service';

@Component({
  standalone: true,
  selector: 'app-detail',
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonNote, IonSpinner
  ],
  templateUrl: './detail.page.html',
})
export class DetailPage implements OnInit {
  postId = 0;
  title = '';

  loading = false;
  error = '';

  comments: Comment[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: SocialBadService,
    public kpi: KpiService
  ) {}

  ngOnInit() {
    this.postId = Number(this.route.snapshot.queryParamMap.get('id') ?? '0');
    this.title = this.route.snapshot.queryParamMap.get('title') ?? '';

    const t0 = performance.now();
    this.loading = true;

    // Duplicada 1
    this.kpi.incSub();
    this.api.getComments(this.postId).subscribe({
      next: data => {
        const big: Comment[] = [];
        for (let i = 0; i < 100; i++) big.push(...data); // 5 * 100 = 500
        this.comments = big;

        this.kpi.setRenderItems(this.comments.length);
        this.kpi.setForecastDataMs(Math.round(performance.now() - t0)); // reutilizamos KPI “forecastDataMs” como “detailDataMs”
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando comentarios';
        this.loading = false;
      }
    });

    // Duplicada 2
    this.kpi.incSub();
    this.api.getComments(this.postId).subscribe({
      next: () => console.log('Comentarios duplicados OK'),
      error: () => {}
    });
  }

  // Anti-patrón: función costosa en template
  prettyEmail(email: string): string {
    let dummy = 0;
    for (let i = 0; i < 6000; i++) dummy += i % 7;
    return email.toLowerCase();
  }

  back() {
    this.router.navigate(['/home']);
  }

  goSettings() {
    this.router.navigate(['/settings']);
  }
}

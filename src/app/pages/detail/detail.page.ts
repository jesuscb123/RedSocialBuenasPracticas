import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonNote, IonSpinner
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
export class DetailPage implements OnInit, OnDestroy {
  postId = 0;
  title = '';

  loading = false;
  error = '';

  comments: Comment[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: SocialBadService,
    public kpi: KpiService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.postId = Number(this.route.snapshot.queryParamMap.get('id') ?? '0');
    this.title = this.route.snapshot.queryParamMap.get('title') ?? '';

    const t0 = performance.now();
    this.loading = true;

    // Cargar comentarios una vez, con cache
    this.kpi.incSub();
    this.api.getComments(this.postId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: data => {
        // Limitar comentarios para mejor rendimiento
        this.comments = data.slice(0, 50);
        this.kpi.setRenderItems(this.comments.length);
        this.kpi.setForecastDataMs(Math.round(performance.now() - t0));
        this.loading = false;
      },
      error: () => {
        this.error = 'Error cargando comentarios';
        this.loading = false;
      }
    });
  }

  // Simplificar para mejor rendimiento
  prettyEmail(email: string): string {
    return email.toLowerCase();
  }

  back() {
    this.router.navigate(['/home']);
  }

  goSettings() {
    this.router.navigate(['/settings']);
  }
}

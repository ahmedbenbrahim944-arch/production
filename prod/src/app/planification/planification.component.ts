import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface ProductionLine {
  ligne: string;
  referenceCount: number;
  imageUrl: string;
  references: string[];
}

interface ReferenceProduction {
  reference: string;
  of: string;
  qte_planifier: number;
  nh_planifier: number;
  emballage: number;
  nop: number;
  nh_realiser: number;
  dec_prod: number;
  delta_prod: number;
  pcs_prod: number;
  dec_mag: number;
  delta_prod_mag: number;
}

interface ProductionDay {
  day: string;
  date: string;
  production: number;
  references: ReferenceProduction[];
}

interface WeekPlanification {
  weekNumber: number;
  ligne: string;
  days: ProductionDay[];
}

@Component({
  selector: 'app-planification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planification.component.html',
  styleUrls: ['./planification.component.css']
})
export class PlanificationComponent {
  // Signals
  loading = signal(false);
  selectedLigne = signal<ProductionLine | null>(null);
  selectedWeek = signal<number | null>(null);
  availableLines = signal<ProductionLine[]>([]);
  weekPlanification = signal<WeekPlanification | null>(null);
  showSuccess = signal(false);
  successMessage = signal('');
  particles = signal<any[]>([]);
  isEditing = signal(false);

  // Données
  weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  constructor(private router: Router) {
    this.generateParticles();
    this.loadProductionLines();
  }

  private generateParticles() {
    const particles = Array.from({ length: 20 }, () => ({
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 2}px`,
      animationDelay: `${Math.random() * 10}s`,
      opacity: `${Math.random() * 0.3 + 0.1}`
    }));
    this.particles.set(particles);
  }

  private loadProductionLines() {
    console.log('Loading production lines...');
    const lines: ProductionLine[] = [
      {
        ligne: 'L04:RXT1',
        referenceCount: 13,
        imageUrl: 'assets/images/unnamed.jpg',
        references: ['RA5246801', 'RA5246802', 'RA5246803', 'RA5246804', 'RA5246805', 'RA5246806', 'RA5246811', 'RA5246814', 'RA5246815', 'RA5246822', 'RA5246823', 'RA5246827', 'RA5246828']
      },
      {
        ligne: 'L07:COM A1',
        referenceCount: 4,
        imageUrl: 'assets/images/unnamed (1).jpg',
        references: ['COM001', 'COM002', 'COM003', 'COM004']
      },
      {
        ligne: 'L09:COMXT2',
        referenceCount: 8,
        imageUrl: 'assets/images/unnamed (2).jpg',
        references: ['COMXT001', 'COMXT002', 'COMXT003', 'COMXT004', 'COMXT005', 'COMXT006', 'COMXT007', 'COMXT008']
      },
      {
        ligne: 'L10:RS3',
        referenceCount: 6,
        imageUrl: 'assets/images/unnamed (3).jpg',
        references: ['RS3001', 'RS3002', 'RS3003', 'RS3004', 'RS3005', 'RS3006']
      },
      {
        ligne: 'L14:CD XT1',
        referenceCount: 10,
        imageUrl: 'assets/images/unnamed (4).jpg',
        references: ['CDXT001', 'CDXT002', 'CDXT003', 'CDXT004', 'CDXT005', 'CDXT006', 'CDXT007', 'CDXT008', 'CDXT009', 'CDXT010']
      },
      {
        ligne: 'L15:MTSA3',
        referenceCount: 10,
        imageUrl: 'assets/images/unnamed (5).jpg',
        references: ['MTSA001', 'MTSA002', 'MTSA003', 'MTSA004', 'MTSA005', 'MTSA006', 'MTSA007', 'MTSA008', 'MTSA009', 'MTSA010']
      }
    ];
    this.availableLines.set(lines);
    console.log('Production lines loaded:', lines.length);
  }

  // Générer les semaines avec dates réelles
  getAvailableWeeks() {
    const weeks = [];
    const currentYear = new Date().getFullYear();
    
    for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
      const weekInfo = this.getWeekDates(currentYear, weekNumber);
      weeks.push(weekInfo);
    }
    
    return weeks;
  }

  // Obtenir les dates d'une semaine spécifique
  private getWeekDates(year: number, weekNumber: number): any {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
    
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(firstDayOfYear.getDate() + daysToFirstMonday);
    
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5);
    
    return {
      number: weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      display: `S${weekNumber}`
    };
  }

  onLigneSelected(line: ProductionLine) {
    console.log('Line selected:', line.ligne);
    this.selectedLigne.set(line);
    this.selectedWeek.set(null);
    this.weekPlanification.set(null);
    this.isEditing.set(false);
  }

  onWeekSelected(weekNumber: number) {
    console.log('Week selected:', weekNumber);
    const line = this.selectedLigne();
    
    if (line && weekNumber) {
      this.selectedWeek.set(weekNumber);
      this.loadWeekPlanification(weekNumber, line);
      this.isEditing.set(false);
    }
  }

  private loadWeekPlanification(week: number, line: ProductionLine) {
    console.log('Loading week planification...');
    this.loading.set(true);

    setTimeout(() => {
      const weekInfo = this.getWeekDates(new Date().getFullYear(), week);
      
      const days: ProductionDay[] = this.weekDays.map((day, index) => {
        const dayDate = new Date(weekInfo.startDate);
        dayDate.setDate(weekInfo.startDate.getDate() + index);
        
        return {
          day,
          date: dayDate.toISOString().split('T')[0],
          production: 12000,
          references: this.createReferencesForLine(line)
        };
      });

      this.weekPlanification.set({
        weekNumber: week,
        ligne: line.ligne,
        days
      });
      this.loading.set(false);
      console.log('Week planification loaded');
    }, 600);
  }

  private createReferencesForLine(line: ProductionLine): ReferenceProduction[] {
    return line.references.map((reference, index) => ({
      reference: reference,
      of: index === 0 ? '067625' : '',
      qte_planifier: index === 0 ? 4000 : Math.floor(Math.random() * 2000),
      nh_planifier: index === 0 ? 78 : Math.floor(Math.random() * 50),
      emballage: 200,
      nop: index === 0 ? 10 : Math.floor(Math.random() * 8),
      nh_realiser: Math.floor(Math.random() * 40),
      dec_prod: index === 0 ? -4000 : Math.floor(Math.random() * -2000),
      delta_prod: Math.floor(Math.random() * 1000),
      pcs_prod: Math.floor(Math.random() * 100),
      dec_mag: Math.floor(Math.random() * -500),
      delta_prod_mag: index === 0 ? -4000 : Math.floor(Math.random() * -1000)
    }));
  }

  backToLines(): void {
    this.selectedLigne.set(null);
    this.selectedWeek.set(null);
    this.weekPlanification.set(null);
    this.isEditing.set(false);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Activer/désactiver le mode édition
  toggleEditMode(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      this.showSuccessMessage('Modifications enregistrées avec succès');
    }
  }

  // Méthode pour calculer le total par jour
  calculateDayTotal(day: ProductionDay): number {
    return day.references.reduce((total, ref) => total + ref.qte_planifier, 0);
  }

  // Méthode pour calculer le total de la semaine
  calculateWeekTotal(): number {
    const planif = this.weekPlanification();
    if (!planif) return 0;
    
    return planif.days.reduce((weekTotal, day) => {
      return weekTotal + this.calculateDayTotal(day);
    }, 0);
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  // Méthode pour mettre à jour une valeur
  updateValue(day: ProductionDay, refIndex: number, field: keyof ReferenceProduction, value: any): void {
    if (this.weekPlanification()) {
      const updatedPlanif = { ...this.weekPlanification()! };
      const dayIndex = updatedPlanif.days.indexOf(day);
      
      if (dayIndex !== -1) {
        this.weekPlanification.set(updatedPlanif);
      }
    }
  }
}
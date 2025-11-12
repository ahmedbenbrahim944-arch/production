import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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

  // Données
  weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  constructor() {
    console.log('Component initialized');
    this.generateParticles();
    this.loadProductionLines();
  }

  private generateParticles() {
    const particles = Array.from({ length: 25 }, () => ({
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 2}px`,
      animationDelay: `${Math.random() * 15}s`,
      opacity: `${Math.random() * 0.4 + 0.1}`
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
    // Premier jour de l'année
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
    
    // Premier lundi de l'année
    const firstMonday = new Date(firstDayOfYear);
    firstMonday.setDate(firstDayOfYear.getDate() + daysToFirstMonday);
    
    // Début de la semaine demandée
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    
    // Fin de la semaine (samedi)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5); // Du lundi au samedi
    
    return {
      number: weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      display: `Semaine ${weekNumber} (${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)})`
    };
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  onLigneSelected(line: ProductionLine) {
    console.log('Line selected:', line.ligne);
    this.selectedLigne.set(line);
    this.selectedWeek.set(null);
    this.weekPlanification.set(null);
  }

  onWeekSelected(event: any) {
    const weekNumber = Number(event.target.value);
    console.log('Week selected:', weekNumber);
    const line = this.selectedLigne();
    
    if (line && weekNumber) {
      this.selectedWeek.set(weekNumber);
      this.loadWeekPlanification(weekNumber, line);
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
    }, 800);
  }

  private createReferencesForLine(line: ProductionLine): ReferenceProduction[] {
    return line.references.map((reference, index) => ({
      reference: reference,
      of: index === 0 ? '067625' : '',
      qte_planifier: index === 0 ? 4000 : 0,
      nh_planifier: index === 0 ? 78 : 0,
      emballage: 200,
      nop: index === 0 ? 10 : 0,
      nh_realiser: 0,
      dec_prod: index === 0 ? -4000 : 0,
      delta_prod: 0,
      pcs_prod: 0,
      dec_mag: 0,
      delta_prod_mag: index === 0 ? -4000 : 0
    }));
  }

  onQtePlanifierChange(ref: ReferenceProduction): void {
    if (ref.qte_planifier > 0) {
      ref.nh_planifier = Math.round((ref.qte_planifier / 100) * 2);
      ref.nop = Math.ceil(ref.nh_planifier / 8);
    } else {
      ref.nh_planifier = 0;
      ref.nop = 0;
    }
  }

  addNewReference(dayIndex: number): void {
    const planif = this.weekPlanification();
    if (planif) {
      const newRef = this.createEmptyReference();
      planif.days[dayIndex].references.push(newRef);
    }
  }

  private createEmptyReference(): ReferenceProduction {
    return {
      reference: '',
      of: '',
      qte_planifier: 0,
      nh_planifier: 0,
      emballage: 200,
      nop: 0,
      nh_realiser: 0,
      dec_prod: 0,
      delta_prod: 0,
      pcs_prod: 0,
      dec_mag: 0,
      delta_prod_mag: 0
    };
  }

  removeReference(dayIndex: number, refIndex: number): void {
    const planif = this.weekPlanification();
    if (planif && planif.days[dayIndex].references.length > 1) {
      planif.days[dayIndex].references.splice(refIndex, 1);
    }
  }

  savePlanification(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.showSuccessMessage('Planification enregistrée avec succès !');
      this.loading.set(false);
    }, 1000);
  }

  exportToExcel(): void {
    this.showSuccessMessage('Export Excel en cours...');
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  backToLines(): void {
    this.selectedLigne.set(null);
    this.selectedWeek.set(null);
    this.weekPlanification.set(null);
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
}
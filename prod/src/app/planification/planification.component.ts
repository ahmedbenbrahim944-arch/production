import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface ProductionLine {
  ligne: string;
  referenceCount: number;
  imageUrl: string;
  references: string[];
  isActive: boolean;
}
interface Causes5M {
  m1MatierePremiere: number;
  m2Absence: number;
  m2Rendement: number;
  m4Maintenance: number;
  m5Qualite: number;
}

interface DayEntry {
  of: string;
  nbOperateurs: number;
  c: number;
  m: number;
  dp: number;
  dm: number;
  delta: number;
  causes?: Causes5M;
}

interface ReferenceProduction {
  reference: string;
  [key: string]: string | DayEntry | undefined;
  lundi?: DayEntry;
  mardi?: DayEntry;
  mercredi?: DayEntry;
  jeudi?: DayEntry;
  vendredi?: DayEntry;
  samedi?: DayEntry;
}
interface MatierePremiere {
  reference: string;
  quantite: number;
}

interface WeekPlanification {
  weekNumber: number;
  ligne: string;
  startDate: Date;
  endDate: Date;
  references: ReferenceProduction[];
}

interface ReferenceDetail {
  reference: string;
  [key: string]: string | DayDetail | undefined;
  lundi?: DayDetail;
  mardi?: DayDetail;
  mercredi?: DayDetail;
  jeudi?: DayDetail;
  vendredi?: DayDetail;
  samedi?: DayDetail;
}

interface DayDetail {
  qPro: number;
  nbBac: number;
  tPiece: number;
  tProdH: number;
  tProdMin: number;
}

@Component({
  selector: 'app-planification',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planification.component.html',
  styleUrls: ['./planification.component.css']
})
export class PlanificationComponent implements AfterViewInit {
  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef;
  @ViewChild('tableContainer') tableContainer!: ElementRef;

  // Signals
  sidebarVisible = signal(true);
  loading = signal(false);
  selectedLigne = signal<ProductionLine | null>(null);
  selectedWeek = signal<number | null>(null);
  availableLines = signal<ProductionLine[]>([]);
  weekPlanification = signal<WeekPlanification | null>(null);
  showSuccess = signal(false);
  successMessage = signal('');
  particles = signal<any[]>([]);
  isEditing = signal(false);
  searchLineQuery = signal('');
  searchReferenceQuery = signal('');
  selectedReferenceDetails = signal<ReferenceDetail | null>(null);

  showCausesModal = signal(false);
  selectedEntryForCauses = signal<{
    reference: ReferenceProduction;
    day: string;
    entry: DayEntry;
  } | null>(null);
  
  currentCauses = signal<Causes5M>({
    m1MatierePremiere: 0,
    m2Absence: 0,
    m2Rendement: 0,
    m4Maintenance: 0,
    m5Qualite: 0
  });

  // Gestion du scroll
  isScrollable = signal(false);
  isScrolled = signal(false);
  isScrolledEnd = signal(false);
  showScrollIndicator = signal(true);

  private isTouchScrolling = false;
  private touchStartX = 0;
  private scrollLeftStart = 0;

  // Données
  weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  constructor(private router: Router) {
    this.generateParticles();
    this.loadProductionLines();
  }

  toggleSidebar(): void {
    this.sidebarVisible.set(!this.sidebarVisible());
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
        references: ['RA5246801', 'RA5246802', 'RA5246803', 'RA5246804', 'RA5246805', 'RA5246806', 'RA5246811', 'RA5246814', 'RA5246815', 'RA5246822', 'RA5246823', 'RA5246827', 'RA5246828'],
        isActive: true
      },
      {
        ligne: 'L07:COM A1',
        referenceCount: 4,
        imageUrl: 'assets/images/unnamed (1).jpg',
        references: ['COM001', 'COM002', 'COM003', 'COM004'],
        isActive: true
      },
      {
        ligne: 'L09:COMXT2',
        referenceCount: 8,
        imageUrl: 'assets/images/unnamed (2).jpg',
        references: ['COMXT001', 'COMXT002', 'COMXT003', 'COMXT004', 'COMXT005', 'COMXT006', 'COMXT007', 'COMXT008'],
        isActive: false
      },
      {
        ligne: 'L10:RS3',
        referenceCount: 6,
        imageUrl: 'assets/images/unnamed (3).jpg',
        references: ['RS3001', 'RS3002', 'RS3003', 'RS3004', 'RS3005', 'RS3006'],
        isActive: true
      },
      {
        ligne: 'L14:CD XT1',
        referenceCount: 10,
        imageUrl: 'assets/images/unnamed (4).jpg',
        references: ['CDXT001', 'CDXT002', 'CDXT003', 'CDXT004', 'CDXT005', 'CDXT006', 'CDXT007', 'CDXT008', 'CDXT009', 'CDXT010'],
        isActive: true
      },
      {
        ligne: 'L15:MTSA3',
        referenceCount: 10,
        imageUrl: 'assets/images/unnamed (5).jpg',
        references: ['MTSA001', 'MTSA002', 'MTSA003', 'MTSA004', 'MTSA005', 'MTSA006', 'MTSA007', 'MTSA008', 'MTSA009', 'MTSA010'],
        isActive: false
      }
    ];
    this.availableLines.set(lines);
    console.log('Production lines loaded:', lines.length);
  }

  // Computed pour les lignes filtrées
  filteredLines = computed(() => {
    const query = this.searchLineQuery().toLowerCase();
    if (!query) return this.availableLines();
    
    return this.availableLines().filter(line => 
      line.ligne.toLowerCase().includes(query)
    );
  });

  // Computed pour les références filtrées
  filteredWeekPlanification = computed(() => {
    const planif = this.weekPlanification();
    const query = this.searchReferenceQuery().toLowerCase();
    
    if (!planif || !query) return planif;
    
    const filteredPlanif = {
      ...planif,
      references: planif.references.filter(ref => 
        ref.reference.toLowerCase().includes(query)
      )
    };
    
    return filteredPlanif;
  });

  getAvailableWeeks() {
    const weeks = [];
    const currentYear = new Date().getFullYear();
    
    for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
      const weekInfo = this.getWeekDates(currentYear, weekNumber);
      weeks.push(weekInfo);
    }
    
    return weeks;
  }

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
    this.selectedReferenceDetails.set(null);
  }

  onWeekSelected(weekNumber: number) {
    console.log('Week selected:', weekNumber);
    const line = this.selectedLigne();
    
    if (line && weekNumber) {
      this.selectedWeek.set(weekNumber);
      this.loadWeekPlanification(weekNumber, line);
      this.isEditing.set(false);
      this.selectedReferenceDetails.set(null);
    }
  }

  private loadWeekPlanification(week: number, line: ProductionLine) {
    console.log('Loading week planification...');
    this.loading.set(true);

    setTimeout(() => {
      const weekInfo = this.getWeekDates(new Date().getFullYear(), week);
      
      const references: ReferenceProduction[] = line.references.map((reference, index) => {
        const refData: ReferenceProduction = { reference };
        
        // Générer des données pour chaque jour
        this.weekDays.forEach(day => {
          const hasData = Math.random() > 0.3; // 70% de chance d'avoir des données
          if (hasData) {
            const c = Math.floor(Math.random() * 2000) + 500;
            const dp = Math.floor(Math.random() * c * 0.9);
            const dayEntry: DayEntry = {
              of: index === 0 && day === 'lundi' ? '06753' : `0${Math.floor(Math.random() * 90000) + 10000}`,
              nbOperateurs: Math.floor(Math.random() * 20) + 10,
              c: c,
              m: Math.floor(Math.random() * 200),
              dp: dp,
              dm: Math.floor(Math.random() * c * 0.9),
              delta: Math.round(((dp / c) * 100))
            };
            refData[day] = dayEntry;
          }
        });
        
        return refData;
      });

      this.weekPlanification.set({
        weekNumber: week,
        ligne: line.ligne,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
        references
      });
      this.loading.set(false);
      console.log('Week planification loaded');
    }, 600);
  }

  backToLines(): void {
    this.selectedLigne.set(null);
    this.selectedWeek.set(null);
    this.weekPlanification.set(null);
    this.isEditing.set(false);
    this.selectedReferenceDetails.set(null);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleEditMode(): void {
    const currentEditingState = this.isEditing();
    
    if (!currentEditingState) {
      // Mode édition activé
      this.addEntriesToAllDaysAndReferences();
    }
    
    this.isEditing.set(!currentEditingState);
    
    if (currentEditingState) {
      // Mode édition désactivé - Enregistrement
      this.showSuccessMessage('Modifications enregistrées avec succès');
    }
  }

  private addEntriesToAllDaysAndReferences(): void {
    const planif = this.weekPlanification();
    if (!planif) return;

    const updatedPlanif = { ...planif };
    
    updatedPlanif.references = updatedPlanif.references.map((ref, index) => {
      const updatedRef = { ...ref };
      
      this.weekDays.forEach(day => {
        if (!updatedRef[day]) {
          const c = 1000;
          const dp = 750;
          const dayEntry: DayEntry = {
            of: `0${Math.floor(Math.random() * 90000) + 10000}`,
            nbOperateurs: 17,
            c: c,
            m: 0,
            dp: dp,
            dm: 500,
            delta: Math.round(((dp / c) * 100))
          };
          updatedRef[day] = dayEntry;
        }
      });
      
      return updatedRef;
    });

    this.weekPlanification.set(updatedPlanif);
    this.showSuccessMessage('Entrées ajoutées à tous les jours et références');
  }

  onSearchLineChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchLineQuery.set(target.value);
  }

  onSearchReferenceChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchReferenceQuery.set(target.value);
  }

  clearLineSearch(): void {
    this.searchLineQuery.set('');
  }

  clearReferenceSearch(): void {
    this.searchReferenceQuery.set('');
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  updateDayEntry(reference: ReferenceProduction, day: string, field: string, value: any): void {
    if (this.weekPlanification()) {
      const updatedPlanif = { ...this.weekPlanification()! };
      const refIndex = updatedPlanif.references.findIndex(r => r.reference === reference.reference);
      
      if (refIndex !== -1) {
        const dayEntry = updatedPlanif.references[refIndex][day] as DayEntry | undefined;
        if (dayEntry) {
          (dayEntry as any)[field] = field === 'of' ? value : +value;
          
          // Recalculer delta si c ou dp change
          if (field === 'c' || field === 'dp') {
            dayEntry.delta = Math.round((dayEntry.dp / dayEntry.c) * 100);
          }
        }
        this.weekPlanification.set(updatedPlanif);
      }
    }
  }

  getDayDate(dayIndex: number): Date {
    const planif = this.weekPlanification();
    if (!planif) return new Date();
    
    const date = new Date(planif.startDate);
    date.setDate(date.getDate() + dayIndex);
    return date;
  }

  getDayEntry(ref: ReferenceProduction, day: string): DayEntry | undefined {
    return ref[day] as DayEntry | undefined;
  }

  // Nouvelle méthode pour afficher les détails d'une référence
  showReferenceDetails(ref: ReferenceProduction): void {
    console.log('Showing details for reference:', ref.reference);
    
    // Générer des données de détail pour la référence
    const referenceDetail: ReferenceDetail = {
      reference: ref.reference
    };
    
    // Générer des données pour chaque jour
    this.weekDays.forEach(day => {
      const dayEntry = ref[day] as DayEntry | undefined;
      if (dayEntry) {
        const qPro = dayEntry.c;
        const nbBac = Math.ceil(qPro / 50); // 50 pièces par bac
        const tPiece = Math.floor(Math.random() * 30) + 10; // 10-40 secondes par pièce
        const totalSeconds = qPro * tPiece;
        const tProdH = Math.floor(totalSeconds / 3600);
        const tProdMin = Math.floor((totalSeconds % 3600) / 60);
        
        const dayDetail: DayDetail = {
          qPro: qPro,
          nbBac: nbBac,
          tPiece: tPiece,
          tProdH: tProdH,
          tProdMin: tProdMin
        };
        
        referenceDetail[day] = dayDetail;
      }
    });
    
    this.selectedReferenceDetails.set(referenceDetail);
  }

  // Retour au planning de la semaine
  backToWeekPlanning(): void {
    this.selectedReferenceDetails.set(null);
  }

  // Obtenir la valeur d'un détail pour un jour spécifique
  getReferenceDetailValue(day: string, field: string): string {
    const detail = this.selectedReferenceDetails();
    if (!detail) return '-';
    
    const dayDetail = detail[day] as DayDetail | undefined;
    if (!dayDetail) return '-';
    
    return dayDetail[field as keyof DayDetail].toString();
  }

  // Obtenir le total pour un champ spécifique
  getTotalReferenceDetail(field: string): string {
    const detail = this.selectedReferenceDetails();
    if (!detail) return '-';
    
    let total = 0;
    this.weekDays.forEach(day => {
      const dayDetail = detail[day] as DayDetail | undefined;
      if (dayDetail) {
        total += dayDetail[field as keyof DayDetail] as number;
      }
    });
    
    return total.toString();
  }

  // Gestion du scroll
  onTableScroll(event: Event): void {
    const wrapper = event.target as HTMLElement;
    this.updateScrollState(wrapper);
    this.onFirstScroll();
  }

  onTouchStart(event: TouchEvent): void {
    const wrapper = this.scrollWrapper.nativeElement;
    this.isTouchScrolling = true;
    this.touchStartX = event.touches[0].pageX;
    this.scrollLeftStart = wrapper.scrollLeft;
    wrapper.style.cursor = 'grabbing';
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isTouchScrolling) return;
    
    event.preventDefault();
    const wrapper = this.scrollWrapper.nativeElement;
    const x = event.touches[0].pageX;
    const walk = (x - this.touchStartX) * 2;
    wrapper.scrollLeft = this.scrollLeftStart - walk;
    
    this.updateScrollState(wrapper);
  }

  onTouchEnd(): void {
    this.isTouchScrolling = false;
    const wrapper = this.scrollWrapper.nativeElement;
    wrapper.style.cursor = 'grab';
  }

  private updateScrollState(wrapper: HTMLElement): void {
    const scrollLeft = wrapper.scrollLeft;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    
    this.isScrolled.set(scrollLeft > 10);
    this.isScrolledEnd.set(scrollLeft >= maxScroll - 10);
    this.isScrollable.set(wrapper.scrollWidth > wrapper.clientWidth);
  }

  scrollToStart(): void {
    if (this.scrollWrapper?.nativeElement) {
      this.scrollWrapper.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  hideScrollIndicator(): void {
    this.showScrollIndicator.set(false);
  }

  onFirstScroll(): void {
    this.hideScrollIndicator();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.scrollWrapper?.nativeElement) {
        const wrapper = this.scrollWrapper.nativeElement;
        this.updateScrollState(wrapper);
      }
    }, 100);
  }
  // Ajouter ces méthodes à la fin de la classe PlanificationComponent

openCausesModal(ref: ReferenceProduction, day: string): void {
  const entry = this.getDayEntry(ref, day);
  if (!entry) return;

  this.selectedEntryForCauses.set({ reference: ref, day, entry });
  
  // Charger les causes existantes ou initialiser à zéro
  if (entry.causes) {
    this.currentCauses.set({ ...entry.causes });
  } else {
    this.currentCauses.set({
      m1MatierePremiere: 0,
      m2Absence: 0,
      m2Rendement: 0,
      m4Maintenance: 0,
      m5Qualite: 0
    });
  }
  
  this.showCausesModal.set(true);
}

closeCausesModal(): void {
  this.showCausesModal.set(false);
  this.selectedEntryForCauses.set(null);
}

updateCause(causeKey: keyof Causes5M, value: string): void {
  const numValue = Math.max(0, parseInt(value) || 0);
  this.currentCauses.update(causes => ({
    ...causes,
    [causeKey]: numValue
  }));
}

incrementCause(causeKey: keyof Causes5M, amount: number = 100): void {
  this.currentCauses.update(causes => ({
    ...causes,
    [causeKey]: causes[causeKey] + amount
  }));
}

decrementCause(causeKey: keyof Causes5M, amount: number = 100): void {
  this.currentCauses.update(causes => ({
    ...causes,
    [causeKey]: Math.max(0, causes[causeKey] - amount)
  }));
}

getTotalCauses(): number {
  const causes = this.currentCauses();
  return Object.values(causes).reduce((sum, val) => sum + val, 0);
}

getEcartCDP(): number {
  const selected = this.selectedEntryForCauses();
  if (!selected) return 0;
  return Math.abs(selected.entry.c - selected.entry.dp);
}

getDifferenceRestante(): number {
  return this.getEcartCDP() - this.getTotalCauses();
}

saveCauses(): void {
  const selected = this.selectedEntryForCauses();
  if (!selected) return;

  const planif = this.weekPlanification();
  if (!planif) return;

  const updatedPlanif = { ...planif };
  const refIndex = updatedPlanif.references.findIndex(
    r => r.reference === selected.reference.reference
  );

  if (refIndex !== -1) {
    const dayEntry = updatedPlanif.references[refIndex][selected.day] as DayEntry;
    if (dayEntry) {
      dayEntry.causes = { ...this.currentCauses() };
    }
    this.weekPlanification.set(updatedPlanif);
  }

  this.showSuccessMessage('Causes sauvegardées avec succès');
  this.closeCausesModal();
}

getSelectedC(): number {
  const selected = this.selectedEntryForCauses();
  if (!selected) return 0;
  return selected.entry.c;
}

getSelectedDP(): number {
  const selected = this.selectedEntryForCauses();
  if (!selected) return 0;
  return selected.entry.dp;
}
}
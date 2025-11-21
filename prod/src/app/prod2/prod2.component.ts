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

interface DayEntry {
  of: string;
  nbOperateurs: number;
  c: number;
  m: number;
  dp: number;
  dm: number;
  delta: number;
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

interface Operator {
  matricule: string;
  nom: string;
  prenom: string;
  selected?: boolean;
}

interface WorkPhase {
  phase: string;
  heures: number;
  ligne?: string;
}

interface ProductionRecord {
  id: string;
  matricule: string;
  nomPrenom: string;
  date: string;
  ligne1: string;
  phasesLigne1: WorkPhase[];
  ligne2: string;
  phasesLigne2: WorkPhase[];
  totalHeures: number;
}

interface OperatorFormData {
  matricule: string;
  nomPrenom: string;
  ligne1: string;
  phasesLigne1: WorkPhase[];
  ligne2: string;
  phasesLigne2: WorkPhase[];
  newPhaseLigne1: { phase: string; heures: number };
  newPhaseLigne2: { phase: string; heures: number };
  totalHeures: number;
}

@Component({
  selector: 'app-prod2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './prod2.component.html',
  styleUrls: ['./prod2.component.css']
})
export class Prod2Component implements AfterViewInit {

  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef;
  @ViewChild('tableContainer') tableContainer!: ElementRef;

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

  showProductionForm = signal(false);
  selectedDayForProduction = signal<string>('');
  productionRecords = signal<ProductionRecord[]>([]);
  currentDate = signal<string>('');
  activeTab = signal<'ligne1' | 'ligne2'>('ligne1');
  searchRecordQuery = signal('');
  
  operators = signal<Operator[]>([
    { matricule: 'EMP001', nom: 'DUPONT', prenom: 'Jean', selected: false },
    { matricule: 'EMP002', nom: 'MARTIN', prenom: 'Marie', selected: false },
    { matricule: 'EMP003', nom: 'BERNARD', prenom: 'Pierre', selected: false },
    { matricule: 'EMP004', nom: 'THOMAS', prenom: 'Sophie', selected: false },
    { matricule: 'EMP005', nom: 'ROBERT', prenom: 'Michel', selected: false },
    { matricule: 'EMP006', nom: 'PETIT', prenom: 'Catherine', selected: false },
    { matricule: 'EMP007', nom: 'DURAND', prenom: 'François', selected: false },
    { matricule: 'EMP008', nom: 'LEROUX', prenom: 'Nathalie', selected: false }
  ]);

  operatorsFormData = signal<Map<string, OperatorFormData>>(new Map());

  availablePhases = signal<string[]>([]);
  availablePhasesLigne2 = signal<string[]>([]);

  weekDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  constructor(private router: Router) {
    this.generateParticles();
    this.loadProductionLines();
    this.loadSampleProductionRecords();
     this.updateFilteredOperators();
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

  filteredLines = computed(() => {
    const query = this.searchLineQuery().toLowerCase();
    if (!query) return this.availableLines();
    
    return this.availableLines().filter(line => 
      line.ligne.toLowerCase().includes(query)
    );
  });

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

  filteredProductionRecords = computed(() => {
    const records = this.productionRecords();
    const query = this.searchRecordQuery().toLowerCase();
    const currentDate = this.currentDate();
    
    if (!query) {
      return records.filter(record => record.date === currentDate);
    }
    
    return records.filter(record => 
      record.date === currentDate && 
      (record.matricule.toLowerCase().includes(query) ||
       record.nomPrenom.toLowerCase().includes(query) ||
       record.ligne1.toLowerCase().includes(query) ||
       (record.ligne2 && record.ligne2.toLowerCase().includes(query)))
    );
  });

  selectedOperators = computed(() => {
    return this.operators().filter(op => op.selected);
  });

  hasSelectedOperators = computed(() => {
    return this.selectedOperators().length > 0;
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
        
        this.weekDays.forEach(day => {
          const hasData = Math.random() > 0.3;
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
      this.addEntriesToAllDaysAndReferences();
    }
    
    this.isEditing.set(!currentEditingState);
    
    if (currentEditingState) {
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

  clearRecordSearch(): void {
    this.searchRecordQuery.set('');
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

  // NOUVELLE MÉTHODE : Gestion des onglets
  setActiveTab(tab: 'ligne1' | 'ligne2'): void {
    this.activeTab.set(tab);
  }

  

  private setDefaultDate(day: string): void {
    const planif = this.weekPlanification();
    if (!planif) return;

    const dayIndex = this.weekDays.indexOf(day);
    const date = new Date(planif.startDate);
    date.setDate(date.getDate() + dayIndex);
    
    const formattedDate = this.formatDate(date);
    this.currentDate.set(formattedDate);
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  resetOperatorSelections(): void {
    this.operators.update(ops => 
      ops.map(op => ({ ...op, selected: false }))
    );
  }

  initializeOperatorsFormData(): void {
    const currentLine = this.selectedLigne();
    if (!currentLine) return;

    const formDataMap = new Map<string, OperatorFormData>();
    
    this.operators().forEach(operator => {
      formDataMap.set(operator.matricule, {
        matricule: operator.matricule,
        nomPrenom: `${operator.nom} ${operator.prenom}`,
        ligne1: currentLine.ligne,
        phasesLigne1: [],
        ligne2: '',
        phasesLigne2: [],
        newPhaseLigne1: { phase: '', heures: 0 },
        newPhaseLigne2: { phase: '', heures: 0 },
        totalHeures: 0
      });
    });

    this.operatorsFormData.set(formDataMap);
    this.loadAvailablePhases(currentLine.ligne);
  }

  private loadAvailablePhases(ligne: string): void {
    const phasesMap: { [key: string]: string[] } = {
      'L04:RXT1': ['4101', '4102', '4103', '4104', '4201', '4202'],
      'L07:COM A1': ['5101', '5102', '5103', '5201'],
      'L09:COMXT2': ['6101', '6102', '6103', '6201', '6202'],
      'L10:RS3': ['7101', '7102', '7103'],
      'L14:CD XT1': ['8101', '8102', '8103', '8104'],
      'L15:MTSA3': ['9101', '9102', '9103']
    };

    this.availablePhases.set(phasesMap[ligne] || []);
    this.availablePhasesLigne2.set(['PHASE1', 'PHASE2', 'PHASE3', 'PHASE4']);
  }

  private loadSampleProductionRecords(): void {
    const sampleRecords: ProductionRecord[] = [
      {
        id: '1',
        matricule: 'EMP001',
        nomPrenom: 'DUPONT Jean',
        date: '06/01/2025',
        ligne1: 'L04:RXT1',
        phasesLigne1: [{ phase: '4101', heures: 4, ligne: 'L04:RXT1' }],
        ligne2: '',
        phasesLigne2: [],
        totalHeures: 4
      },
      {
        id: '2',
        matricule: 'EMP002',
        nomPrenom: 'MARTIN Marie',
        date: '06/01/2025',
        ligne1: 'L04:RXT1',
        phasesLigne1: [{ phase: '4102', heures: 6, ligne: 'L04:RXT1' }],
        ligne2: 'L07:COM A1',
        phasesLigne2: [{ phase: 'PHASE1', heures: 2, ligne: 'L07:COM A1' }],
        totalHeures: 8
      }
    ];

    this.productionRecords.set(sampleRecords);
  }

  toggleOperatorSelection(matricule: string): void {
    this.operators.update(ops => 
      ops.map(op => 
        op.matricule === matricule ? { ...op, selected: !op.selected } : op
      )
    );
  }

  

 

  getOperatorFormData(matricule: string): OperatorFormData | undefined {
    return this.operatorsFormData().get(matricule);
  }

  updateOperatorFormData(matricule: string, updates: Partial<OperatorFormData>): void {
    const currentData = this.operatorsFormData().get(matricule);
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      updatedData.totalHeures = this.calculateTotalHeuresForOperator(updatedData);
      
      this.operatorsFormData.update(map => {
        map.set(matricule, updatedData);
        return new Map(map);
      });
    }
  }

  calculateTotalHeuresForOperator(formData: OperatorFormData): number {
    const totalLigne1 = formData.phasesLigne1.reduce((sum, phase) => sum + phase.heures, 0);
    const totalLigne2 = formData.phasesLigne2.reduce((sum, phase) => sum + phase.heures, 0);
    return totalLigne1 + totalLigne2;
  }

  addPhaseToLigne1(matricule: string): void {
    const formData = this.getOperatorFormData(matricule);
    if (!formData) return;

    const newPhase = { ...formData.newPhaseLigne1 };
    
    if (newPhase.phase && newPhase.heures > 0) {
      const workPhase: WorkPhase = {
        phase: newPhase.phase,
        heures: newPhase.heures,
        ligne: formData.ligne1
      };
      
      this.updateOperatorFormData(matricule, {
        phasesLigne1: [...formData.phasesLigne1, workPhase],
        newPhaseLigne1: { phase: '', heures: 0 }
      });
    }
  }

  addPhaseToLigne2(matricule: string): void {
    const formData = this.getOperatorFormData(matricule);
    if (!formData) return;

    const newPhase = { ...formData.newPhaseLigne2 };
    
    if (newPhase.phase && newPhase.heures > 0 && formData.ligne2) {
      const workPhase: WorkPhase = {
        phase: newPhase.phase,
        heures: newPhase.heures,
        ligne: formData.ligne2
      };
      
      this.updateOperatorFormData(matricule, {
        phasesLigne2: [...formData.phasesLigne2, workPhase],
        newPhaseLigne2: { phase: '', heures: 0 }
      });
    }
  }

  removePhase(matricule: string, ligne: 'ligne1' | 'ligne2', index: number): void {
    const formData = this.getOperatorFormData(matricule);
    if (!formData) return;

    if (ligne === 'ligne1') {
      this.updateOperatorFormData(matricule, {
        phasesLigne1: formData.phasesLigne1.filter((_, i) => i !== index)
      });
    } else {
      this.updateOperatorFormData(matricule, {
        phasesLigne2: formData.phasesLigne2.filter((_, i) => i !== index)
      });
    }
  }

  updateNewPhase(matricule: string, ligne: 'ligne1' | 'ligne2', field: 'phase' | 'heures', value: string | number): void {
    const formData = this.getOperatorFormData(matricule);
    if (!formData) return;

    if (ligne === 'ligne1') {
      this.updateOperatorFormData(matricule, {
        newPhaseLigne1: { 
          ...formData.newPhaseLigne1, 
          [field]: field === 'heures' ? +value : value 
        }
      });
    } else {
      this.updateOperatorFormData(matricule, {
        newPhaseLigne2: { 
          ...formData.newPhaseLigne2, 
          [field]: field === 'heures' ? +value : value 
        }
      });
    }
  }

  updateLigne2(matricule: string, value: string): void {
    this.updateOperatorFormData(matricule, { ligne2: value });
  }

  formatPhases(phases: WorkPhase[]): string {
    return phases.map(p => `${p.phase}(${p.heures}h)`).join(', ');
  }

  

  resetOperatorForms(): void {
    const selectedOps = this.selectedOperators();
    const currentLine = this.selectedLigne();
    
    selectedOps.forEach(operator => {
      this.updateOperatorFormData(operator.matricule, {
        phasesLigne1: [],
        phasesLigne2: [],
        newPhaseLigne1: { phase: '', heures: 0 },
        newPhaseLigne2: { phase: '', heures: 0 },
        ligne2: '',
        totalHeures: 0
      });
    });
  }

  closeProductionForm(): void {
    this.showProductionForm.set(false);
    this.resetOperatorSelections();
  }

  showReferenceDetails(ref: ReferenceProduction): void {
    console.log('Showing details for reference:', ref.reference);
    
    const referenceDetail: ReferenceDetail = {
      reference: ref.reference
    };
    
    this.weekDays.forEach(day => {
      const dayEntry = ref[day] as DayEntry | undefined;
      if (dayEntry) {
        const qPro = dayEntry.c;
        const nbBac = Math.ceil(qPro / 50);
        const tPiece = Math.floor(Math.random() * 30) + 10;
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

  backToWeekPlanning(): void {
    this.selectedReferenceDetails.set(null);
  }

  getReferenceDetailValue(day: string, field: string): string {
    const detail = this.selectedReferenceDetails();
    if (!detail) return '-';
    
    const dayDetail = detail[day] as DayDetail | undefined;
    if (!dayDetail) return '-';
    
    return dayDetail[field as keyof DayDetail].toString();
  }

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
  isScrollable = signal(false);
  isScrolled = signal(false);
  isScrolledEnd = signal(false);
  showScrollIndicator = signal(true);

  private isTouchScrolling = false;
  private touchStartX = 0;
  private scrollLeftStart = 0;

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
  // Ajoutez ces signaux après les autres signaux existants
selectedMatricules = signal<string[]>([]);
showRecordsPanel = signal<boolean>(false);
showRecordsDetails = signal<boolean>(false);
selectedRecordForDetails = signal<ProductionRecord | null>(null);
filteredOperatorsForSelection = signal<Operator[]>([]);

// Ajoutez ces méthodes dans la classe

// Méthode pour filtrer les opérateurs
updateFilteredOperators(): void {
  const query = this.searchRecordQuery().toLowerCase();
  const allOperators = this.operators();
  
  if (!query) {
    this.filteredOperatorsForSelection.set(allOperators);
    return;
  }
  
  const filtered = allOperators.filter(op => 
    op.matricule.toLowerCase().includes(query) ||
    op.nom.toLowerCase().includes(query) ||
    op.prenom.toLowerCase().includes(query)
  );
  this.filteredOperatorsForSelection.set(filtered);
}

// Méthode pour basculer la sélection d'un matricule
toggleMatriculeSelection(matricule: string): void {
  const currentSelection = this.selectedMatricules();
  if (currentSelection.includes(matricule)) {
    this.selectedMatricules.set(currentSelection.filter(m => m !== matricule));
  } else {
    this.selectedMatricules.set([...currentSelection, matricule]);
    // Initialiser les données pour ce nouvel opérateur
    this.initializeOperatorFormData(matricule);
  }
}

// Sélectionner tous les opérateurs
selectAllOperators(): void {
  const allMatricules = this.operators().map(op => op.matricule);
  this.selectedMatricules.set(allMatricules);
  // Initialiser les données pour tous les opérateurs
  allMatricules.forEach(matricule => this.initializeOperatorFormData(matricule));
}

// Désélectionner tous les opérateurs
deselectAllOperators(): void {
  this.selectedMatricules.set([]);
  this.operatorsFormData.set(new Map());
}

// Initialiser les données pour un opérateur spécifique
initializeOperatorFormData(matricule: string): void {
  const currentLine = this.selectedLigne();
  if (!currentLine) return;

  const operator = this.operators().find(op => op.matricule === matricule);
  if (!operator) return;

  const currentFormData = this.operatorsFormData();
  
  // Ne réinitialiser que si l'opérateur n'a pas déjà des données
  if (!currentFormData.has(matricule)) {
    const newFormData = new Map(currentFormData);
    newFormData.set(matricule, {
      matricule: operator.matricule,
      nomPrenom: `${operator.nom} ${operator.prenom}`,
      ligne1: currentLine.ligne,
      phasesLigne1: [],
      phasesLigne2: [],
      ligne2: '',
      newPhaseLigne1: { phase: '', heures: 0 },
      newPhaseLigne2: { phase: '', heures: 0 },
      totalHeures: 0
    });
    this.operatorsFormData.set(newFormData);
  }
  
  this.loadAvailablePhases(currentLine.ligne);
}

// Sauvegarder tous les opérateurs sélectionnés
saveAllProductionRecords(): void {
  const selectedMatricules = this.selectedMatricules();
  if (selectedMatricules.length === 0) {
    alert('Veuillez sélectionner au moins un opérateur');
    return;
  }

  let savedCount = 0;
  let hasErrors = false;

  selectedMatricules.forEach(matricule => {
    const formData = this.getOperatorFormData(matricule);
    if (!formData || formData.totalHeures === 0) {
      console.log(`Aucune donnée pour ${matricule}`);
      return;
    }

    if (formData.totalHeures > 8) {
      alert(`Le total des heures pour ${formData.nomPrenom} ne peut pas dépasser 8 heures (${formData.totalHeures}h)`);
      hasErrors = true;
      return;
    }

    const newRecord: ProductionRecord = {
      id: Date.now().toString() + savedCount,
      matricule: formData.matricule,
      nomPrenom: formData.nomPrenom,
      date: this.currentDate(),
      ligne1: formData.ligne1,
      phasesLigne1: [...formData.phasesLigne1],
      phasesLigne2: [...formData.phasesLigne2],
      ligne2: formData.ligne2,
      totalHeures: formData.totalHeures
    };

    this.productionRecords.update(records => [newRecord, ...records]);
    savedCount++;
  });

  if (hasErrors) return;

  if (savedCount > 0) {
    this.showSuccessMessage(`${savedCount} enregistrement(s) sauvegardé(s) avec succès`);
    this.resetOperatorForms();
  } else {
    alert('Aucun enregistrement à sauvegarder');
  }
}

// Réinitialiser les formulaires


// Basculer l'affichage du panneau des enregistrements
toggleRecordsPanel(): void {
  this.showRecordsPanel.set(!this.showRecordsPanel());
}

// Afficher les détails d'un enregistrement
showRecordDetails(record: ProductionRecord): void {
  this.selectedRecordForDetails.set(record);
  this.showRecordsDetails.set(true);
}

// Fermer les détails
closeRecordDetails(): void {
  this.showRecordsDetails.set(false);
  this.selectedRecordForDetails.set(null);
}

// Appliquer les mêmes phases à tous les opérateurs sélectionnés
applyToAllOperators(): void {
  const selectedMatricules = this.selectedMatricules();
  if (selectedMatricules.length === 0) {
    alert('Veuillez sélectionner au moins un opérateur');
    return;
  }

  // Prendre le premier opérateur comme modèle
  const firstMatricule = selectedMatricules[0];
  const templateData = this.getOperatorFormData(firstMatricule);
  
  if (!templateData) return;

  selectedMatricules.forEach(matricule => {
    if (matricule !== firstMatricule) {
      this.updateOperatorFormData(matricule, {
        phasesLigne1: [...templateData.phasesLigne1],
        phasesLigne2: [...templateData.phasesLigne2],
        ligne2: templateData.ligne2,
        totalHeures: templateData.totalHeures
      });
    }
  });

  this.showSuccessMessage(`Configuration appliquée à ${selectedMatricules.length} opérateurs`);
}

// Mettre à jour la méthode onPersonIconClick
onPersonIconClick(day: string): void {
  console.log('Opening production form for day:', day);
  
  this.selectedDayForProduction.set(day);
  this.showProductionForm.set(true);
  this.showRecordsPanel.set(false);
  
  this.setDefaultDate(day);
  this.selectedMatricules.set([]);
  this.searchRecordQuery.set('');
  this.updateFilteredOperators(); // Initialiser la liste filtrée
}

// Mettre à jour la méthode onSearchRecordChange
onSearchRecordChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  this.searchRecordQuery.set(target.value);
  this.updateFilteredOperators();
}
}
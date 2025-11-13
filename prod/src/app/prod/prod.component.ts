import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface ProductionLine {
  ligne: string;
  referenceCount: number;
  imageUrl: string | null;
  imageOriginalName: string | null;
  references: string[];
  lastCreated: string;
}

interface CreateLineForm {
  ligne: string;
  references: string;
  image: File | null;
  imagePreview: string | null;
  errors: {
    ligne?: string;
    references?: string;
    image?: string;
  };
}

interface AddReferencesForm {
  ligne: string;
  references: string;
  errors: {
    ligne?: string;
    references?: string;
  };
}

interface WeekForm {
  weekNumber: string;
  description: string;
  errors: {
    weekNumber?: string;
    description?: string;
  };
}

interface User {
  id: number;
  nom: string;
  motDePasse: string;
  dateCreation: string;
}

interface UserForm {
  nom: string;
  motDePasse: string;
  errors: {
    nom?: string;
    motDePasse?: string;
  };
}

@Component({
  selector: 'app-prod',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './prod.component.html',
  styleUrls: ['./prod.component.css']
})
export class ProdComponent implements OnInit {
  // Signals pour une meilleure réactivité
  loading = signal(false);
  lines = signal<ProductionLine[]>([]);
  searchQuery = signal('');
  activeTab = signal('view'); // 'view', 'create', 'add-ref', 'new-week', 'add-user'
  selectedLine = signal<ProductionLine | null>(null);

  createForm: CreateLineForm = {
    ligne: '',
    references: '',
    image: null,
    imagePreview: null,
    errors: {}
  };

  addRefForm: AddReferencesForm = {
    ligne: '',
    references: '',
    errors: {}
  };

  weekForm: WeekForm = {
    weekNumber: '',
    description: '',
    errors: {}
  };

  availableWeeks: number[] = [];

  users = signal<User[]>([]);
  userForm: UserForm = {
    nom: '',
    motDePasse: '',
    errors: {}
  };

  // Animation states
  showSuccess = signal(false);
  successMessage = signal('');
  particles = signal<any[]>([]);

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateParticles();
    this.loadSampleData();
    this.generateAvailableWeeks();
    this.loadSampleUsers();
  }

  private generateAvailableWeeks() {
    // Génère les semaines de 1 à 52 pour l'année en cours
    this.availableWeeks = Array.from({ length: 52 }, (_, i) => i + 1);
  }

  private getCurrentWeekNumber(): number {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  onCreateWeek() {
    // Validation
    this.weekForm.errors = {};
    let hasErrors = false;

    if (!this.weekForm.weekNumber) {
      this.weekForm.errors.weekNumber = 'Veuillez sélectionner une semaine';
      hasErrors = true;
    }

    if (hasErrors) return;

    this.loading.set(true);

    // Simulation de création de semaine
    setTimeout(() => {
      this.showSuccessMessage(`Semaine ${this.weekForm.weekNumber} créée avec succès !`);
      this.resetWeekForm();
      this.activeTab.set('view');
      this.loading.set(false);
    }, 1000);
  }

  onCancelWeek() {
    this.resetWeekForm();
    this.activeTab.set('view');
  }

  private resetWeekForm() {
    this.weekForm = {
      weekNumber: '',
      description: '',
      errors: {}
    };
  }

  private generateParticles() {
    const particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 8 + 2}px`,
        animationDelay: `${Math.random() * 15}s`,
        opacity: `${Math.random() * 0.4 + 0.1}`
      });
    }
    this.particles.set(particles);
  }

  private loadSampleData() {
    const sampleData: ProductionLine[] = [];
    this.lines.set(sampleData);
  }

  onSearch() {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.loadSampleData();
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      const filtered = this.lines().filter(line => 
        line.ligne.toLowerCase().includes(query) ||
        line.references.some(ref => ref.toLowerCase().includes(query))
      );
      this.lines.set(filtered);
      this.loading.set(false);
    }, 500);
  }

  onCreateLine() {
    // Validation
    this.createForm.errors = {};
    let hasErrors = false;

    if (!this.createForm.ligne.trim()) {
      this.createForm.errors.ligne = 'Le nom de la ligne est requis';
      hasErrors = true;
    }

    if (!this.createForm.references.trim()) {
      this.createForm.errors.references = 'Au moins une référence est requise';
      hasErrors = true;
    }

    if (hasErrors) return;

    this.loading.set(true);

    // Simulation de création
    setTimeout(() => {
      const newLine: ProductionLine = {
        ligne: this.createForm.ligne,
        referenceCount: this.createForm.references.split(',').length,
        imageUrl: this.createForm.imagePreview,
        imageOriginalName: this.createForm.image?.name || null,
        references: this.createForm.references.split(',').map(ref => ref.trim()),
        lastCreated: new Date().toISOString()
      };

      this.lines.update(lines => [newLine, ...lines]);
      this.showSuccessMessage('Ligne de production créée avec succès !');
      this.resetCreateForm();
      this.activeTab.set('view');
      this.loading.set(false);
    }, 1000);
  }

  onAddReferences() {
    // Validation
    this.addRefForm.errors = {};
    let hasErrors = false;

    if (!this.addRefForm.ligne.trim()) {
      this.addRefForm.errors.ligne = 'La ligne est requise';
      hasErrors = true;
    }

    if (!this.addRefForm.references.trim()) {
      this.addRefForm.errors.references = 'Au moins une référence est requise';
      hasErrors = true;
    }

    if (hasErrors) return;

    this.loading.set(true);

    // Simulation d'ajout
    setTimeout(() => {
      this.showSuccessMessage('Références ajoutées avec succès !');
      this.resetAddRefForm();
      this.activeTab.set('view');
      this.loading.set(false);
    }, 1000);
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.createForm.errors.image = 'Veuillez sélectionner une image valide';
        return;
      }

      this.createForm.image = file;
      this.createForm.errors.image = '';

      // Créer un preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.createForm.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.createForm.image = null;
    this.createForm.imagePreview = null;
  }

  selectLine(line: ProductionLine) {
    this.selectedLine.set(line);
  }

  closeModal() {
    this.selectedLine.set(null);
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.loadSampleData();
  }

  private showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    setTimeout(() => {
      this.showSuccess.set(false);
    }, 3000);
  }

  private resetCreateForm() {
    this.createForm = {
      ligne: '',
      references: '',
      image: null,
      imagePreview: null,
      errors: {}
    };
  }

  private resetAddRefForm() {
    this.addRefForm = {
      ligne: '',
      references: '',
      errors: {}
    };
  }

  getTotalLines(): number {
    return this.lines().length;
  }

  getTotalReferences(): number {
    return this.lines().reduce((total, line) => total + line.referenceCount, 0);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Gestion des utilisateurs
  private loadSampleUsers() {
    const sampleUsers: User[] = [
      { id: 1, nom: 'Admin', motDePasse: '****', dateCreation: new Date().toISOString() },
      { id: 2, nom: 'Operateur1', motDePasse: '****', dateCreation: new Date().toISOString() }
    ];
    this.users.set(sampleUsers);
  }

  onAddUser() {
    // Validation
    this.userForm.errors = {};
    let hasErrors = false;

    if (!this.userForm.nom.trim()) {
      this.userForm.errors.nom = 'Le nom est requis';
      hasErrors = true;
    }

    if (!this.userForm.motDePasse.trim()) {
      this.userForm.errors.motDePasse = 'Le mot de passe est requis';
      hasErrors = true;
    } else if (this.userForm.motDePasse.length < 6) {
      this.userForm.errors.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
      hasErrors = true;
    }

    if (hasErrors) return;

    this.loading.set(true);

    // Simulation d'ajout d'utilisateur
    setTimeout(() => {
      const newUser: User = {
        id: this.users().length + 1,
        nom: this.userForm.nom,
        motDePasse: '****', // Masquer le mot de passe
        dateCreation: new Date().toISOString()
      };

      this.users.update(users => [...users, newUser]);
      this.showSuccessMessage(`Utilisateur "${this.userForm.nom}" ajouté avec succès !`);
      this.resetUserForm();
      this.loading.set(false);
    }, 1000);
  }

  onCancelUser() {
    this.resetUserForm();
  }

  private resetUserForm() {
    this.userForm = {
      nom: '',
      motDePasse: '',
      errors: {}
    };
  }

  getTotalUsers(): number {
    return this.users().length;
  }
}
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  flipped = false;
  loading = false;
  particles: any[] = [];
  currentInputField: string = 'email';
  numpadValue: string = '';

  loginForm = { 
    email: '', 
    password: '',
    errors: { email: '', password: '' }
  };

  registerForm = { 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirm: '',
    errors: { firstName: '', lastName: '', email: '', password: '', confirm: '' }
  };

  // Clavier numérique intégré
  numpadButtons = [
    '7', '8', '9',
    '4', '5', '6', 
    '1', '2', '3',
    '*', '0', '#'
  ];

  ngOnInit() {
    this.createParticles();
  }

  ngOnDestroy() {
    this.particles = [];
  }

  createParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 15 + 's',
        size: Math.random() * 4 + 2 + 'px',
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  // Écoute des touches du clavier physique
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key;
    
    // Gestion des touches numériques du pavé numérique
    if (this.isNumericKey(key) || key === '*' || key === '#' || key === 'Backspace' || key === 'Enter') {
      event.preventDefault();
    }

    if (this.isNumericKey(key)) {
      this.onNumpadButtonClick(key);
    }
    else if (key === 'Backspace' || key === 'Delete') {
      this.onNumpadButtonClick('*');
    }
    else if (key === 'Enter') {
      this.onNumpadButtonClick('#');
    }
    else if (key === '*' || key === '#') {
      this.onNumpadButtonClick(key);
    }
  }

  private isNumericKey(key: string): boolean {
    return /^[0-9]$/.test(key);
  }

  toggleFlip() { 
    this.flipped = !this.flipped;
    this.clearErrors();
    // Réinitialiser le champ actif
    this.currentInputField = this.flipped ? 'firstName' : 'email';
    this.numpadValue = this.getCurrentFieldValue();
  }

  clearErrors() {
    this.loginForm.errors = { email: '', password: '' };
    this.registerForm.errors = { firstName: '', lastName: '', email: '', password: '', confirm: '' };
  }

  // Méthodes pour le clavier numérique
  openNumpad(field: string) {
    this.currentInputField = field;
    this.numpadValue = this.getCurrentFieldValue();
  }

  getCurrentFieldValue(): string {
    switch (this.currentInputField) {
      case 'email':
        return this.loginForm.email;
      case 'password':
        return this.loginForm.password;
      case 'firstName':
        return this.registerForm.firstName;
      case 'lastName':
        return this.registerForm.lastName;
      case 'registerEmail':
        return this.registerForm.email;
      case 'registerPassword':
        return this.registerForm.password;
      case 'confirmPassword':
        return this.registerForm.confirm;
      default:
        return '';
    }
  }

  setCurrentFieldValue(value: string) {
    switch (this.currentInputField) {
      case 'email':
        this.loginForm.email = value;
        break;
      case 'password':
        this.loginForm.password = value;
        break;
      case 'firstName':
        this.registerForm.firstName = value;
        break;
      case 'lastName':
        this.registerForm.lastName = value;
        break;
      case 'registerEmail':
        this.registerForm.email = value;
        break;
      case 'registerPassword':
        this.registerForm.password = value;
        break;
      case 'confirmPassword':
        this.registerForm.confirm = value;
        break;
    }
  }

  onNumpadButtonClick(button: string) {
    if (button === '*') {
      // Effacer le dernier caractère
      this.numpadValue = this.numpadValue.slice(0, -1);
    } else if (button === '#') {
      // Valider et passer au champ suivant
      this.setCurrentFieldValue(this.numpadValue);
      this.goToNextField();
    } else {
      // Ajouter le caractère
      this.numpadValue += button;
    }
    this.setCurrentFieldValue(this.numpadValue);
  }

  goToNextField() {
    const fields = this.flipped ? 
      ['firstName', 'lastName', 'registerEmail', 'registerPassword', 'confirmPassword'] : 
      ['email', 'password'];
    
    const currentIndex = fields.indexOf(this.currentInputField);
    
    if (currentIndex < fields.length - 1) {
      this.openNumpad(fields[currentIndex + 1]);
    }
  }

  validateLogin(): boolean {
    let isValid = true;
    this.loginForm.errors = { email: '', password: '' };

    if (!this.loginForm.email) {
      this.loginForm.errors.email = 'Email requis';
      isValid = false;
    } else if (!this.isValidEmail(this.loginForm.email)) {
      this.loginForm.errors.email = 'Format email invalide';
      isValid = false;
    }

    if (!this.loginForm.password) {
      this.loginForm.errors.password = 'Mot de passe requis';
      isValid = false;
    } else if (this.loginForm.password.length < 6) {
      this.loginForm.errors.password = 'Minimum 6 caractères';
      isValid = false;
    }

    return isValid;
  }

  validateRegister(): boolean {
    let isValid = true;
    this.registerForm.errors = { firstName: '', lastName: '', email: '', password: '', confirm: '' };

    if (!this.registerForm.firstName) {
      this.registerForm.errors.firstName = 'Prénom requis';
      isValid = false;
    }

    if (!this.registerForm.lastName) {
      this.registerForm.errors.lastName = 'Nom requis';
      isValid = false;
    }

    if (!this.registerForm.email) {
      this.registerForm.errors.email = 'Email requis';
      isValid = false;
    } else if (!this.isValidEmail(this.registerForm.email)) {
      this.registerForm.errors.email = 'Format email invalide';
      isValid = false;
    }

    if (!this.registerForm.password) {
      this.registerForm.errors.password = 'Mot de passe requis';
      isValid = false;
    } else if (this.registerForm.password.length < 8) {
      this.registerForm.errors.password = 'Minimum 8 caractères';
      isValid = false;
    }

    if (this.registerForm.password !== this.registerForm.confirm) {
      this.registerForm.errors.confirm = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showLoader() {
    this.loading = true;
    setTimeout(() => this.loading = false, 1500);
  }

  onLogin() {
    if (this.validateLogin()) {
      this.showLoader();
      console.log('Login data:', this.loginForm);
    }
  }

  onRegister() {
    if (this.validateRegister()) {
      this.showLoader();
      console.log('Register data:', this.registerForm);
    }
  }

  isFlipped() { 
    return this.flipped; 
  }

  getCurrentFieldName(): string {
    const fieldNames: {[key: string]: string} = {
      'email': 'Email',
      'password': 'Mot de passe',
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'registerEmail': 'Email',
      'registerPassword': 'Mot de passe',
      'confirmPassword': 'Confirmation'
    };
    return fieldNames[this.currentInputField] || 'Champ';
  }
}
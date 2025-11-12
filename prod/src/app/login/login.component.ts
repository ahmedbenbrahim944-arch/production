import { Component, OnInit, OnDestroy } from '@angular/core';
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

  toggleFlip() { 
    this.flipped = !this.flipped;
    this.clearErrors();
  }

  clearErrors() {
    // Reset login errors
    this.loginForm.errors = { email: '', password: '' };
    
    // Reset register errors
    this.registerForm.errors = { firstName: '', lastName: '', email: '', password: '', confirm: '' };
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
      // Simulation appel API
      console.log('Login data:', this.loginForm);
    }
  }

  onRegister() {
    if (this.validateRegister()) {
      this.showLoader();
      // Simulation appel API
      console.log('Register data:', this.registerForm);
    }
  }

  isFlipped() { 
    return this.flipped; 
  }
}
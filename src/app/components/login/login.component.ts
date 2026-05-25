import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginSucesso = new EventEmitter<string>();

  usuario = '';
  senha = '';
  lembrar = true;
  mostrarSenha = false;
  tentandoEntrar = false;
  enviado = false;
  mensagemErro = '';

  get usuarioInvalido(): boolean {
    return this.enviado && this.usuario.trim().length < 3;
  }

  get senhaInvalida(): boolean {
    return this.enviado && this.senha.trim().length < 4;
  }

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar(): void {
    this.enviado = true;
    this.mensagemErro = '';

    if (this.usuarioInvalido || this.senhaInvalida) {
      this.mensagemErro = 'Informe um usuário e uma senha com pelo menos 4 caracteres.';
      return;
    }

    this.tentandoEntrar = true;

    setTimeout(() => {
      this.tentandoEntrar = false;
      this.loginSucesso.emit(this.usuario.trim());
    }, 650);
  }

  entrarDemo(): void {
    this.usuario = 'biblioteca.admin';
    this.senha = 'demo2026';
    this.entrar();
  }
}

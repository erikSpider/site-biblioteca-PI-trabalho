import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Autor } from '../../models/autor';
import { AutorService } from '../../services/autor.service';
import { Livro } from '../../models/livro';
import { LivroService } from '../../services/livro.service';

@Component({
  selector: 'app-autores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autores.component.html',
  styleUrls: ['./autores.component.css']
})
export class AutoresComponent implements OnInit, OnChanges {

  @Input() modo = 'cadastrar';
  @Input() pesquisaGlobal = '';

  autores: Autor[] = [];
  autoresFiltrados: Autor[] = [];
  livros: Livro[] = [];

  editando = false;
  mostrandoFormulario = false;
  pesquisa = '';
  mensagemErro = '';
  mensagemSucesso = '';
  autorParaExcluir: Autor | null = null;

  autor: Autor = {
    id: 0,
    codigo: 0,
    nome: '',
    dataNascimento: '',
    nacionalidade: ''
  };

  constructor(
    private autorService: AutorService,
    private livroService: LivroService
  ) {}

  ngOnInit(): void {
    this.listarAutores();
    this.listarLivros();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pesquisaGlobal']) {
      this.pesquisa = this.pesquisaGlobal || '';
      this.consultar();
    }
  }

  listarAutores() {
    this.autorService.listar().subscribe((retorno: Autor[]) => {
      this.autores = retorno;
      this.consultar();
    });
  }

  salvar() {
    if (!this.formularioValido()) {
      return;
    }

    const maiorCodigo = this.autores.length > 0
      ? Math.max(...this.autores.map(a => a.codigo || 0))
      : 0;

    const maiorId = this.maiorIdNumerico();

    const novoAutor: Autor = {
      ...this.autor,
      id: maiorId + 1,
      codigo: maiorCodigo + 1
    };

    this.autorService.criar(novoAutor).subscribe(() => {
      this.limparFormulario();
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Autor cadastrado com sucesso.');
      this.listarAutores();
    });
  }

  listarLivros() {
    this.livroService.listar().subscribe((retorno: Livro[]) => {
      this.livros = retorno;
    });
  }

  novo() {
    this.limparFormulario();
    this.editando = false;
    this.mostrandoFormulario = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  cancelarFormulario() {
    this.limparFormulario();
    this.editando = false;
    this.mostrandoFormulario = false;
    this.mensagemErro = '';
  }

  abrirConfirmacaoExclusao(autor: Autor) {
    this.autorParaExcluir = autor;
  }

  cancelarExclusao() {
    this.autorParaExcluir = null;
  }

  confirmarExclusao() {
    if (!this.autorParaExcluir) {
      return;
    }

    if (this.temLivroVinculado(this.autorParaExcluir.id)) {
      this.autorParaExcluir = null;
      this.mensagemErro = 'Não é possível excluir um autor com livros cadastrados.';
      return;
    }

    this.autorService.excluir(this.autorParaExcluir.id).subscribe(() => {
      this.autorParaExcluir = null;
      this.mostrarSucesso('Autor excluido com sucesso.');
      this.listarAutores();
    });
  }

  editar(autor: Autor) {
    this.autor = { ...autor };
    this.editando = true;
    this.mostrandoFormulario = true;
  }

  atualizar() {
    if (!this.formularioValido()) {
      return;
    }

    this.autorService.atualizar(this.autor.id, this.autor).subscribe(() => {
      this.limparFormulario();
      this.editando = false;
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Autor atualizado com sucesso.');
      this.listarAutores();
    });
  }

  consultar() {
    const termo = this.normalizar(this.pesquisa);

    this.autoresFiltrados = this.autores.filter(a =>
      this.normalizar(`${a.id} ${a.codigo} ${a.nome} ${a.nacionalidade} ${this.formatarData(a.dataNascimento)}`).includes(termo)
    );
  }

  normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  limparFormulario() {
    this.autor = {
      id: 0,
      codigo: 0,
      nome: '',
      dataNascimento: '',
      nacionalidade: ''
    };
    this.mensagemErro = '';
  }

  mostrarSucesso(mensagem: string) {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const partes = data.split('-');
    return partes.length == 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

  temLivroVinculado(idAutor: number | string): boolean {
    return this.livros.some(livro => livro.idAutor == idAutor);
  }

  formularioValido(): boolean {
    if (!this.autor.nome.trim() || !this.autor.dataNascimento || !this.autor.nacionalidade.trim()) {
      this.mensagemErro = 'Preencha nome, data de nascimento e nacionalidade.';
      return false;
    }

    this.mensagemErro = '';
    return true;
  }

  maiorIdNumerico(): number {
    const idsNumericos = this.autores
      .map(a => Number(a.id))
      .filter(id => Number.isInteger(id) && id > 0);

    const codigos = this.autores
      .map(a => a.codigo || 0)
      .filter(codigo => codigo > 0);

    return Math.max(0, ...idsNumericos, ...codigos);
  }

}

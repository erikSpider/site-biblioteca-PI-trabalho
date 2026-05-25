import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Livro } from '../../models/livro';
import { Autor } from '../../models/autor';

import { LivroService } from '../../services/livro.service';
import { AutorService } from '../../services/autor.service';
import { LocacaoService } from '../../services/locacao.service';
import { Locacao } from '../../models/locacao';

@Component({
  selector: 'app-livros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './livros.component.html',
  styleUrls: ['./livros.component.css']
})
export class LivrosComponent implements OnInit, OnChanges {

  @Input() modo = 'cadastrar';
  @Input() pesquisaGlobal = '';

  livros: Livro[] = [];
  livrosFiltrados: Livro[] = [];
  autores: Autor[] = [];
  locacoes: Locacao[] = [];

  pesquisa = '';
  editando = false;
  mostrandoFormulario = false;
  mensagemErro = '';
  mensagemSucesso = '';
  livroParaExcluir: Livro | null = null;

  livro: Livro = {
    id: 0,
    codigo: 0,
    idAutor: 0,
    titulo: '',
    dataPublicacao: '',
    editora: '',
    genero: ''
  };

  constructor(
    private livroService: LivroService,
    private autorService: AutorService,
    private locacaoService: LocacaoService
  ) {}

  ngOnInit(): void {
    this.listarLivros();
    this.listarAutores();
    this.listarLocacoes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pesquisaGlobal']) {
      this.pesquisa = this.pesquisaGlobal || '';
      this.consultar();
    }
  }

  listarLivros() {
    this.livroService.listar().subscribe((retorno: Livro[]) => {
      this.livros = retorno;
      this.consultar();
    });
  }

  listarAutores() {
    this.autorService.listar().subscribe((retorno: Autor[]) => {
      this.autores = retorno;
      this.consultar();
    });
  }

  listarLocacoes() {
    this.locacaoService.listar().subscribe((retorno: Locacao[]) => {
      this.locacoes = retorno;
      this.consultar();
    });
  }

  salvar() {
    if (!this.formularioValido()) {
      return;
    }

    const maiorCodigo = this.livros.length > 0
      ? Math.max(...this.livros.map(l => l.codigo || 0))
      : 0;

    const maiorId = this.maiorIdNumerico();

    const novoLivro: Livro = {
      ...this.livro,
      id: maiorId + 1,
      codigo: maiorCodigo + 1
    };

    this.livroService.criar(novoLivro).subscribe(() => {
      this.limparFormulario();
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Livro cadastrado com sucesso.');
      this.listarLivros();
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

  abrirConfirmacaoExclusao(livro: Livro) {
    this.livroParaExcluir = livro;
  }

  cancelarExclusao() {
    this.livroParaExcluir = null;
  }

  confirmarExclusao() {
    if (!this.livroParaExcluir) {
      return;
    }

    if (this.temLocacaoAtiva(this.livroParaExcluir.id)) {
      this.livroParaExcluir = null;
      this.mensagemErro = 'Não é possível excluir um livro com locação ativa.';
      return;
    }

    this.livroService.excluir(this.livroParaExcluir.id).subscribe(() => {
      this.livroParaExcluir = null;
      this.mostrarSucesso('Livro excluido com sucesso.');
      this.listarLivros();
    });
  }

  editar(livro: Livro) {
    this.livro = { ...livro };
    this.editando = true;
    this.mostrandoFormulario = true;
  }

  atualizar() {
    if (!this.formularioValido()) {
      return;
    }

    this.livroService.atualizar(this.livro.id, this.livro).subscribe(() => {
      this.limparFormulario();
      this.editando = false;
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Livro atualizado com sucesso.');
      this.listarLivros();
    });
  }

  consultar() {
    const termo = this.normalizar(this.pesquisa);

    this.livrosFiltrados = this.livros.filter(l =>
      this.normalizar(`${l.id} ${l.codigo} ${l.titulo} ${this.buscarAutor(l.idAutor)} ${l.editora} ${l.genero} ${this.statusLivro(l.id)} ${this.formatarData(l.dataPublicacao)}`).includes(termo)
    );
  }

  normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  buscarAutor(idAutor: number | string): string {
    const autor = this.autores.find(a => a.id == idAutor);
    return autor ? autor.nome : '';
  }

  temLocacaoAtiva(idLivro: number | string): boolean {
    return this.locacoes.some(locacao => locacao.idLivro == idLivro && this.calcularStatusLocacao(locacao) != 'Devolvido');
  }

  statusLivro(idLivro: number | string): string {
    const locacaoAtiva = this.locacoes.find(locacao =>
      locacao.idLivro == idLivro && this.calcularStatusLocacao(locacao) != 'Devolvido'
    );

    return locacaoAtiva ? this.calcularStatusLocacao(locacaoAtiva) : 'Disponível';
  }

  calcularStatusLocacao(locacao: Locacao): string {
    if (locacao.status == 'Devolvido') {
      return 'Devolvido';
    }

    if (locacao.dataDevolucao && this.dataPassou(locacao.dataDevolucao)) {
      return 'Atrasado';
    }

    return 'Emprestado';
  }

  dataPassou(data: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataComparacao = new Date(`${data}T00:00:00`);
    return dataComparacao < hoje;
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const partes = data.split('-');
    return partes.length == 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

  limparFormulario() {
    this.livro = {
      id: 0,
      codigo: 0,
      idAutor: 0,
      titulo: '',
      dataPublicacao: '',
      editora: '',
      genero: ''
    };
    this.mensagemErro = '';
  }

  mostrarSucesso(mensagem: string) {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }

  formularioValido(): boolean {
    if (!this.livro.titulo.trim() || !this.livro.idAutor || !this.livro.dataPublicacao || !this.livro.editora.trim() || !this.livro.genero.trim()) {
      this.mensagemErro = 'Preencha título, autor, data de publicação, editora e gênero.';
      return false;
    }

    this.mensagemErro = '';
    return true;
  }

  maiorIdNumerico(): number {
    const idsNumericos = this.livros
      .map(l => Number(l.id))
      .filter(id => Number.isInteger(id) && id > 0);

    const codigos = this.livros
      .map(l => l.codigo || 0)
      .filter(codigo => codigo > 0);

    return Math.max(0, ...idsNumericos, ...codigos);
  }

}

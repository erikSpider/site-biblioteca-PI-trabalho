import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Cliente } from '../../models/cliente';
import { Livro } from '../../models/livro';
import { Locacao } from '../../models/locacao';
import { ClienteService } from '../../services/cliente.service';
import { LivroService } from '../../services/livro.service';
import { LocacaoService } from '../../services/locacao.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit, OnChanges {

  @Input() modo = 'cadastrar';
  @Input() pesquisaGlobal = '';
  @Input() abrirLocacoesCliente: (idCliente: number | string) => void = () => {};

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  livros: Livro[] = [];
  locacoes: Locacao[] = [];

  editando = false;
  mostrandoFormulario = false;
  pesquisa = '';
  mensagemErro = '';
  mensagemSucesso = '';
  clienteParaExcluir: Cliente | null = null;

  cliente: Cliente = {
    id: 0,
    codigo: 0,
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
  };

  constructor(
    private clienteService: ClienteService,
    private livroService: LivroService,
    private locacaoService: LocacaoService
  ) {}

  ngOnInit(): void {
    this.listarClientes();
    this.listarLivros();
    this.listarLocacoes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pesquisaGlobal']) {
      this.pesquisa = this.pesquisaGlobal || '';
      this.consultar();
    }
  }

  listarClientes() {
    this.clienteService.listar().subscribe((retorno: Cliente[]) => {
      this.clientes = retorno;
      this.consultar();
    });
  }

  listarLivros() {
    this.livroService.listar().subscribe((retorno: Livro[]) => {
      this.livros = retorno;
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

    const maiorCodigo = this.clientes.length > 0
      ? Math.max(...this.clientes.map(c => c.codigo || 0))
      : 0;

    const maiorId = this.maiorIdNumerico();

    const novoCliente: Cliente = {
      ...this.cliente,
      id: maiorId + 1,
      codigo: maiorCodigo + 1
    };

    this.clienteService.criar(novoCliente).subscribe(() => {
      this.limparFormulario();
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Cliente cadastrado com sucesso.');
      this.listarClientes();
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

  abrirConfirmacaoExclusao(cliente: Cliente) {
    this.clienteParaExcluir = cliente;
  }

  cancelarExclusao() {
    this.clienteParaExcluir = null;
  }

  confirmarExclusao() {
    if (!this.clienteParaExcluir) {
      return;
    }

    if (this.temLocacaoAtiva(this.clienteParaExcluir.id)) {
      this.clienteParaExcluir = null;
      this.mensagemErro = 'Não é possível excluir um cliente com locação ativa.';
      return;
    }

    this.clienteService.excluir(this.clienteParaExcluir.id).subscribe(() => {
      this.clienteParaExcluir = null;
      this.mostrarSucesso('Cliente excluido com sucesso.');
      this.listarClientes();
      this.listarLocacoes();
    });
  }

  editar(cliente: Cliente) {
    this.cliente = { ...cliente };
    this.editando = true;
    this.mostrandoFormulario = true;
  }

  atualizar() {
    if (!this.formularioValido()) {
      return;
    }

    this.clienteService.atualizar(this.cliente.id, this.cliente).subscribe(() => {
      this.limparFormulario();
      this.editando = false;
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Cliente atualizado com sucesso.');
      this.listarClientes();
    });
  }

  consultar() {
    const termo = this.normalizar(this.pesquisa);

    this.clientesFiltrados = this.clientes.filter(c =>
      this.normalizar(`${c.id} ${c.codigo} ${c.nome} ${c.email} ${c.telefone} ${c.endereco} ${this.buscarLivrosCliente(c.id)}`).includes(termo)
    );
  }

  normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  buscarLivrosCliente(idCliente: number | string): string {
    const livrosLocados = this.locacoes
      .filter(locacao => locacao.idCliente == idCliente && locacao.status != 'Devolvido')
      .map(locacao => {
        const livro = this.livros.find(l => l.id == locacao.idLivro);
        return livro ? `${livro.titulo} (${locacao.status})` : '';
      })
      .filter(titulo => titulo);

    return livrosLocados.length > 0 ? livrosLocados.join(', ') : 'Nenhuma locação ativa';
  }

  temLocacaoAtiva(idCliente: number | string): boolean {
    return this.locacoes.some(locacao => locacao.idCliente == idCliente && locacao.status != 'Devolvido');
  }

  limparFormulario() {
    this.cliente = {
      id: 0,
      codigo: 0,
      nome: '',
      email: '',
      telefone: '',
      endereco: ''
    };
    this.mensagemErro = '';
  }

  mostrarSucesso(mensagem: string) {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }

  formularioValido(): boolean {
    if (!this.cliente.nome.trim() || !this.cliente.email.trim() || !this.cliente.telefone.trim() || !this.cliente.endereco.trim()) {
      this.mensagemErro = 'Preencha nome, e-mail, telefone e endereço.';
      return false;
    }

    if (!this.emailValido(this.cliente.email)) {
      this.mensagemErro = 'Informe um e-mail válido.';
      return false;
    }

    this.mensagemErro = '';
    return true;
  }

  emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  abrirLocacoes(cliente: Cliente) {
    window.dispatchEvent(new CustomEvent('abrirLocacoesCliente', { detail: cliente.id }));
  }

  maiorIdNumerico(): number {
    const idsNumericos = this.clientes
      .map(c => Number(c.id))
      .filter(id => Number.isInteger(id) && id > 0);

    const codigos = this.clientes
      .map(c => c.codigo || 0)
      .filter(codigo => codigo > 0);

    return Math.max(0, ...idsNumericos, ...codigos);
  }

}

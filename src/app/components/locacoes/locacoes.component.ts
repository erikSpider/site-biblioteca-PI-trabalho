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
  selector: 'app-locacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locacoes.component.html',
  styleUrls: ['./locacoes.component.css']
})
export class LocacoesComponent implements OnInit, OnChanges {

  @Input() modo = 'cadastrar';
  @Input() clienteFiltroId: number | string = 0;
  @Input() pesquisaGlobal = '';

  clientes: Cliente[] = [];
  livros: Livro[] = [];
  locacoes: Locacao[] = [];
  locacoesFiltradas: Locacao[] = [];

  editando = false;
  mostrandoFormulario = false;
  pesquisa = '';
  filtroStatus = 'Todos';
  mensagemErro = '';
  mensagemSucesso = '';
  locacaoParaExcluir: Locacao | null = null;

  locacao: Locacao = {
    id: 0,
    codigo: 0,
    idCliente: 0,
    idLivro: 0,
    dataLocacao: '',
    dataDevolucao: '',
    status: 'Em andamento'
  };

  constructor(
    private locacaoService: LocacaoService,
    private clienteService: ClienteService,
    private livroService: LivroService
  ) {}

  ngOnInit(): void {
    this.listarLocacoes();
    this.listarClientes();
    this.listarLivros();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clienteFiltroId'] && !changes['clienteFiltroId'].firstChange) {
      this.aplicarFiltroCliente();
    }

    if (changes['pesquisaGlobal']) {
      this.pesquisa = this.pesquisaGlobal || '';
      this.consultar();
    }
  }

  listarLocacoes() {
    this.locacaoService.listar().subscribe((retorno: Locacao[]) => {
      this.locacoes = retorno.map(locacao => ({
        ...locacao,
        status: this.calcularStatus(locacao)
      }));
      this.consultar();
      this.aplicarFiltroCliente();
    });
  }

  listarClientes() {
    this.clienteService.listar().subscribe((retorno: Cliente[]) => {
      this.clientes = retorno;
      this.consultar();
      this.aplicarFiltroCliente();
    });
  }

  listarLivros() {
    this.livroService.listar().subscribe((retorno: Livro[]) => {
      this.livros = retorno;
      this.consultar();
    });
  }

  salvar() {
    if (!this.formularioValido()) {
      return;
    }

    if (!this.livroDisponivel(this.locacao.idLivro)) {
      this.mensagemErro = 'Este livro já está em uma locação ativa. Escolha outro livro.';
      return;
    }

    const maiorCodigo = this.locacoes.length > 0
      ? Math.max(...this.locacoes.map(l => l.codigo || 0))
      : 0;

    const maiorId = this.maiorIdNumerico();

    const novaLocacao: Locacao = {
      ...this.locacao,
      id: maiorId + 1,
      codigo: maiorCodigo + 1,
      status: this.calcularStatus(this.locacao)
    };

    this.locacaoService.criar(novaLocacao).subscribe(() => {
      this.limparFormulario();
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Locação cadastrada com sucesso.');
      this.listarLocacoes();
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

  abrirConfirmacaoExclusao(locacao: Locacao) {
    this.locacaoParaExcluir = locacao;
  }

  cancelarExclusao() {
    this.locacaoParaExcluir = null;
  }

  confirmarExclusao() {
    if (!this.locacaoParaExcluir) {
      return;
    }

    this.locacaoService.excluir(this.locacaoParaExcluir.id).subscribe(() => {
      this.locacaoParaExcluir = null;
      this.mostrarSucesso('Locação excluída com sucesso.');
      this.listarLocacoes();
    });
  }

  editar(locacao: Locacao) {
    this.locacao = { ...locacao };
    this.editando = true;
    this.mostrandoFormulario = true;
    this.mensagemErro = '';
  }

  atualizar() {
    if (!this.formularioValido()) {
      return;
    }

    if (!this.livroDisponivel(this.locacao.idLivro, this.locacao.id)) {
      this.mensagemErro = 'Este livro já está em uma locação ativa. Escolha outro livro.';
      return;
    }

    this.locacao.status = this.calcularStatus(this.locacao);

    this.locacaoService.atualizar(this.locacao.id, this.locacao).subscribe(() => {
      this.limparFormulario();
      this.editando = false;
      this.mostrandoFormulario = false;
      this.mostrarSucesso('Locação atualizada com sucesso.');
      this.listarLocacoes();
    });
  }

  devolver(locacao: Locacao) {
    const locacaoDevolvida: Locacao = {
      ...locacao,
      status: 'Devolvido'
    };

    this.locacaoService.atualizar(locacao.id, locacaoDevolvida).subscribe(() => {
      this.mostrarSucesso('Livro devolvido com sucesso.');
      this.listarLocacoes();
    });
  }

  consultar() {
    const termo = this.normalizar(this.pesquisa);

    this.locacoesFiltradas = this.locacoes.filter(l => {
      const status = this.calcularStatus(l);
      const textoCombina = this.normalizar(`${l.id} ${l.codigo} ${this.buscarCliente(l.idCliente)} ${this.buscarLivro(l.idLivro)} ${status} ${this.formatarData(l.dataLocacao)} ${this.formatarData(l.dataDevolucao)}`).includes(termo);

      const statusCombina = this.filtroStatus == 'Todos' || status == this.filtroStatus;

      return textoCombina && statusCombina;
    });
  }

  normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  limparPesquisa() {
    this.pesquisa = '';
    this.filtroStatus = 'Todos';
    this.clienteFiltroId = 0;
    this.consultar();
  }

  aplicarFiltroCliente() {
    if (!this.clienteFiltroId || this.clientes.length == 0 || this.locacoes.length == 0) {
      return;
    }

    const cliente = this.clientes.find(c => c.id == this.clienteFiltroId);

    if (cliente) {
      this.pesquisa = cliente.nome;
      this.filtroStatus = 'Todos';
      this.consultar();
    }
  }

  totalFiltrado(): number {
    return this.locacoesFiltradas.length;
  }

  totalPorStatus(status: string): number {
    return this.locacoesFiltradas.filter(locacao => this.calcularStatus(locacao) == status).length;
  }

  buscarCliente(idCliente: number | string): string {
    const cliente = this.clientes.find(c => c.id == idCliente);
    return cliente ? cliente.nome : '';
  }

  buscarLivro(idLivro: number | string): string {
    const livro = this.livros.find(l => l.id == idLivro);
    return livro ? livro.titulo : '';
  }

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const partes = data.split('-');
    return partes.length == 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

  livroDisponivel(idLivro: number | string, idLocacaoAtual: number | string = 0): boolean {
    return !this.locacoes.some(locacao =>
      locacao.idLivro == idLivro &&
      locacao.id != idLocacaoAtual &&
      this.calcularStatus(locacao) != 'Devolvido'
    );
  }

  calcularStatus(locacao: Locacao): string {
    if (locacao.status == 'Devolvido') {
      return 'Devolvido';
    }

    if (locacao.dataDevolucao && this.dataPassou(locacao.dataDevolucao)) {
      return 'Atrasado';
    }

    return 'Em andamento';
  }

  dataPassou(data: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataComparacao = new Date(`${data}T00:00:00`);
    return dataComparacao < hoje;
  }

  formularioValido(): boolean {
    if (!this.locacao.idCliente || !this.locacao.idLivro || !this.locacao.dataLocacao || !this.locacao.dataDevolucao) {
      this.mensagemErro = 'Preencha cliente, livro, data da locação e previsão de devolução.';
      return false;
    }

    if (this.locacao.dataDevolucao < this.locacao.dataLocacao) {
      this.mensagemErro = 'A previsão de devolução não pode ser anterior à data da locação.';
      return false;
    }

    this.mensagemErro = '';
    return true;
  }

  limparFormulario() {
    this.locacao = {
      id: 0,
      codigo: 0,
      idCliente: 0,
      idLivro: 0,
      dataLocacao: '',
      dataDevolucao: '',
      status: 'Em andamento'
    };
    this.mensagemErro = '';
  }

  mostrarSucesso(mensagem: string) {
    this.mensagemSucesso = mensagem;
    setTimeout(() => this.mensagemSucesso = '', 3000);
  }

  maiorIdNumerico(): number {
    const idsNumericos = this.locacoes
      .map(l => Number(l.id))
      .filter(id => Number.isInteger(id) && id > 0);

    const codigos = this.locacoes
      .map(l => l.codigo || 0)
      .filter(codigo => codigo > 0);

    return Math.max(0, ...idsNumericos, ...codigos);
  }

}

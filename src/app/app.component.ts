import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutoresComponent } from './components/autores/autores.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { HomeComponent } from './components/home/home.component';
import { LivrosComponent } from './components/livros/livros.component';
import { LocacoesComponent } from './components/locacoes/locacoes.component';
import { LoginComponent } from './components/login/login.component';
import { Autor } from './models/autor';
import { Cliente } from './models/cliente';
import { Livro } from './models/livro';
import { Locacao } from './models/locacao';
import { DashboardService } from './services/dashboard.service';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface SearchResult {
  tipo: string;
  titulo: string;
  detalhe: string;
  tela: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HomeComponent,
    AutoresComponent,
    LivrosComponent,
    ClientesComponent,
    LocacoesComponent,
    LoginComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  tela = 'home';
  autenticado = false;
  usuarioLogado = '';
  menuMobileAberto = false;
  carregandoPagina = false;
  clienteFiltroLocacoes: number | string = 0;
  termoBusca = '';
  buscaAberta = false;
  indiceBusca: SearchResult[] = [];

  constructor(private dashboardService: DashboardService) {}

  navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'livros', label: 'Livros', icon: 'book' },
    { id: 'clientes', label: 'Clientes', icon: 'users' },
    { id: 'autores', label: 'Autores', icon: 'author' },
    { id: 'locacoes', label: 'Alocações', icon: 'allocation' }
  ];

  get tituloPagina(): string {
    const titulos: Record<string, string> = {
      home: 'Biblioteca Flow',
      autores: 'Autores',
      livros: 'Livros',
      clientes: 'Clientes',
      locacoes: 'Alocações'
    };

    return titulos[this.tela] || 'Biblioteca Flow';
  }

  get subtituloPagina(): string {
    const subtitulos: Record<string, string> = {
      home: 'Visão geral do acervo com experiência premium',
      autores: 'Perfis literários, vínculos e curadoria do acervo',
      livros: 'Vitrine inteligente para catálogo, busca e disponibilidade',
      clientes: 'Relacionamento com leitores, histórico e contatos',
      locacoes: 'Linha do tempo de empréstimos, atrasos e devoluções'
    };

    return subtitulos[this.tela] || 'Sistema de gestão de biblioteca';
  }

  get placeholderBusca(): string {
    const placeholders: Record<string, string> = {
      home: 'Buscar em todo o sistema...',
      livros: 'Buscar livros...',
      clientes: 'Buscar clientes...',
      autores: 'Buscar autores...',
      locacoes: 'Buscar alocações...'
    };

    return placeholders[this.tela] || 'Buscar...';
  }

  navegar(tela: string): void {
    if (this.tela == tela) {
      this.menuMobileAberto = false;
      return;
    }

    if (tela == 'locacoes') {
      this.clienteFiltroLocacoes = 0;
    }

    this.carregandoPagina = true;
    this.menuMobileAberto = false;
    this.limparBusca();

    setTimeout(() => {
      this.tela = tela;
      this.carregandoPagina = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  }

  alternarMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
  }

  entrar(usuario: string): void {
    this.usuarioLogado = usuario || 'Administrador';
    this.autenticado = true;
    this.tela = 'home';
    this.carregarIndiceBusca();
  }

  sair(): void {
    this.autenticado = false;
    this.usuarioLogado = '';
    this.tela = 'home';
    this.menuMobileAberto = false;
    this.termoBusca = '';
    this.buscaAberta = false;
    this.indiceBusca = [];
  }

  get resultadosBusca(): SearchResult[] {
    const termo = this.normalizar(this.termoBusca);

    if (termo.length < 2) {
      return [];
    }

    return this.indiceBusca
      .filter(item => this.normalizar(`${item.tipo} ${item.titulo} ${item.detalhe}`).includes(termo))
      .slice(0, 8);
  }

  pesquisar(): void {
    this.buscaAberta = this.tela == 'home' && this.termoBusca.trim().length >= 2;
  }

  limparBusca(): void {
    this.termoBusca = '';
    this.buscaAberta = false;
  }

  abrirResultado(resultado: SearchResult): void {
    this.limparBusca();
    this.navegar(resultado.tela);
  }

  carregarIndiceBusca(): void {
    this.dashboardService.carregarDados().subscribe({
      next: ([autores, livros, clientes, locacoes]) => {
        this.indiceBusca = [
          ...livros.map(livro => this.criarResultadoLivro(livro, autores)),
          ...clientes.map(cliente => this.criarResultadoCliente(cliente)),
          ...autores.map(autor => this.criarResultadoAutor(autor)),
          ...locacoes.map(locacao => this.criarResultadoLocacao(locacao, livros, clientes))
        ];
      },
      error: () => {
        this.indiceBusca = [];
      }
    });
  }

  criarResultadoLivro(livro: Livro, autores: Autor[]): SearchResult {
    const autor = autores.find(item => item.id == livro.idAutor);

    return {
      tipo: 'Livro',
      titulo: livro.titulo,
      detalhe: `${autor?.nome || 'Autor não informado'} • ${livro.genero || 'Gênero não informado'}`,
      tela: 'livros'
    };
  }

  criarResultadoCliente(cliente: Cliente): SearchResult {
    return {
      tipo: 'Cliente',
      titulo: cliente.nome,
      detalhe: `${cliente.email} • ${cliente.telefone}`,
      tela: 'clientes'
    };
  }

  criarResultadoAutor(autor: Autor): SearchResult {
    return {
      tipo: 'Autor',
      titulo: autor.nome,
      detalhe: autor.nacionalidade || 'Nacionalidade não informada',
      tela: 'autores'
    };
  }

  criarResultadoLocacao(locacao: Locacao, livros: Livro[], clientes: Cliente[]): SearchResult {
    const livro = livros.find(item => item.id == locacao.idLivro);
    const cliente = clientes.find(item => item.id == locacao.idCliente);

    return {
      tipo: 'Alocação',
      titulo: livro?.titulo || 'Livro não encontrado',
      detalhe: `${cliente?.nome || 'Cliente não encontrado'} • ${locacao.status}`,
      tela: 'locacoes'
    };
  }

  normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  abrirLocacoesDoCliente(idCliente: number | string): void {
    this.clienteFiltroLocacoes = idCliente;
    this.navegar('locacoes');
  }

  @HostListener('window:abrirLocacoesCliente', ['$event'])
  receberPedidoLocacoes(evento: CustomEvent<number | string>): void {
    this.abrirLocacoesDoCliente(evento.detail);
  }
}

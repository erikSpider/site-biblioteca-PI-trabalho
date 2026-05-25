import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from '../../services/dashboard.service';
import { Autor } from '../../models/autor';
import { Livro } from '../../models/livro';
import { Cliente } from '../../models/cliente';
import { Locacao } from '../../models/locacao';

interface LocacaoResumo {
  codigo: number;
  cliente: string;
  livro: string;
  autor: string;
  dataLocacao: string;
  dataDevolucao: string;
  status: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  carregando = true;
  totalAutores = 0;
  totalLivros = 0;
  totalClientes = 0;
  totalLocacoes = 0;
  locacoesAtivas = 0;
  locacoesAtrasadas = 0;
  livrosDisponiveis = 0;

  ultimosLivros: Livro[] = [];
  locacoesResumo: LocacaoResumo[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard() {
    this.carregando = true;

    this.dashboardService.carregarDados().subscribe((dados: [Autor[], Livro[], Cliente[], Locacao[]]) => {

      const autores = dados[0];
      const livros = dados[1];
      const clientes = dados[2];
      const locacoes = dados[3];

      this.totalAutores = autores.length;
      this.totalLivros = livros.length;
      this.totalClientes = clientes.length;
      this.totalLocacoes = locacoes.length;
      this.locacoesAtivas = locacoes.filter(l => this.calcularStatus(l) != 'Devolvido').length;
      this.locacoesAtrasadas = locacoes.filter(l => this.calcularStatus(l) == 'Atrasado').length;
      this.livrosDisponiveis = Math.max(0, livros.length - this.locacoesAtivas);

      this.ultimosLivros = livros.slice(-5).reverse();
      this.locacoesResumo = locacoes
        .slice(-6)
        .reverse()
        .map(locacao => {
          const cliente = clientes.find(c => c.id == locacao.idCliente);
          const livro = livros.find(l => l.id == locacao.idLivro);
          const autor = autores.find(a => a.id == livro?.idAutor);

          return {
            codigo: locacao.codigo,
            cliente: cliente ? cliente.nome : 'Cliente não encontrado',
            livro: livro ? livro.titulo : 'Livro não encontrado',
            autor: autor ? autor.nome : 'Autor não encontrado',
            dataLocacao: locacao.dataLocacao,
            dataDevolucao: locacao.dataDevolucao,
            status: this.calcularStatus(locacao)
          };
        });

      setTimeout(() => this.carregando = false, 350);
    });
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

  formatarData(data: string): string {
    if (!data) {
      return '';
    }

    const partes = data.split('-');
    return partes.length == 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
  }

}

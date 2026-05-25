import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

import { Autor } from '../models/autor';
import { Livro } from '../models/livro';
import { Cliente } from '../models/cliente';
import { Locacao } from '../models/locacao';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private autoresApi = 'http://localhost:3000/autores';
  private livrosApi = 'http://localhost:3000/livros';
  private clientesApi = 'http://localhost:3000/clientes';
  private locacoesApi = 'http://localhost:3000/locacoes';

  constructor(private http: HttpClient) { }

  carregarDados(): Observable<[Autor[], Livro[], Cliente[], Locacao[]]> {
    return forkJoin([
      this.http.get<Autor[]>(this.autoresApi),
      this.http.get<Livro[]>(this.livrosApi),
      this.http.get<Cliente[]>(this.clientesApi),
      this.http.get<Locacao[]>(this.locacoesApi)
    ]);
  }
}

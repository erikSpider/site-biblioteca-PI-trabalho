import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Locacao } from '../models/locacao';

@Injectable({
  providedIn: 'root'
})
export class LocacaoService {

  private api = 'http://localhost:3000/locacoes';

  constructor(private http: HttpClient) { }

  listar(): Observable<Locacao[]> {
    return this.http.get<Locacao[]>(this.api);
  }

  criar(locacao: Locacao): Observable<Locacao> {
    return this.http.post<Locacao>(this.api, locacao);
  }

  excluir(id: number | string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  atualizar(id: number | string, locacao: Locacao): Observable<Locacao> {
    return this.http.put<Locacao>(`${this.api}/${id}`, locacao);
  }

}

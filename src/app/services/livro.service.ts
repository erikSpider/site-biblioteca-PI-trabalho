import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Livro } from '../models/livro';

@Injectable({
  providedIn: 'root'
})
export class LivroService {

  private api = 'http://localhost:3000/livros';

  constructor(private http: HttpClient) { }

  listar(): Observable<Livro[]> {
    return this.http.get<Livro[]>(this.api);
  }

  criar(livro: Livro): Observable<Livro> {
    return this.http.post<Livro>(this.api, livro);
  }

  excluir(id: number | string) {
    return this.http.delete(`${this.api}/${id}`);
  }

  atualizar(id: number | string, livro: Livro): Observable<Livro> {
    return this.http.put<Livro>(`${this.api}/${id}`, livro);
  }

}

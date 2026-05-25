import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Autor } from '../models/autor';

@Injectable({
  providedIn: 'root'
})
export class AutorService {

  private api = 'http://localhost:3000/autores';

  constructor(private http: HttpClient) { }

  listar(): Observable<Autor[]> {
    return this.http.get<Autor[]>(this.api);
  }

  criar(autor: Autor): Observable<Autor> {
  return this.http.post<Autor>(this.api, autor);
}
  excluir(id: number | string) {
  return this.http.delete(`${this.api}/${id}`);
}
atualizar(id: number | string, autor: Autor): Observable<Autor> {
  return this.http.put<Autor>(`${this.api}/${id}`, autor);
}
}

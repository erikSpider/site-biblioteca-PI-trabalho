export interface Locacao {
  id: number | string;
  codigo: number;
  idCliente: number | string;
  idLivro: number | string;
  dataLocacao: string;
  dataDevolucao: string;
  status: string;
}

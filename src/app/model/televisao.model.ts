    export class Televisao {
        id !: number | null;
        marca !: string | null;
        modelo !: string | null;
        descricao !: string | null;
        resolucao !: TipoResolucao | null;
        tamanhoTela !: TipoTela | null;
        dimensao !: Dimensao | null;
        valor !: number | null;
        estoque !: number | null;
        imageUrl !: string | null;
    }

    type TipoResolucao = {
            id : number|null,
            nome : string | null,
            pixels : string | null;
    }

    type TipoTela = {
            id : number|null,
            nome : string | null,
    }

    type Dimensao = {
        id : number|null,
        comprimento : number | null,
        altura : number | null,
        polegada : number | null,
    }
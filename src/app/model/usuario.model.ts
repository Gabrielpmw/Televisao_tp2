export class Usuario {
    id !: number;
    username !: string;
    perfil !: Perfil
}

export enum Perfil{
    ADMIN = 'adm',
    USER = 'cliente'
}

export class LoginDTO {
    username !: string;
    senha !: string;
}
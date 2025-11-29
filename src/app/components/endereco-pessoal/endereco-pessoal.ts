import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Services
import { EnderecoService } from '../../services/endereco.service';
import { MunicipioService } from '../../services/municipio.service';
import { ConsultaCepService } from '../../services/consultar-cep.service';
// Models
import { EnderecoRequestDTO, EnderecoResponseDTO } from '../../model/Endereco.model';
import { MunicipioResponseDTO } from '../../model/municipioEstado.model';


@Component({
  selector: 'app-endereco',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './endereco-pessoal.html',
  styleUrls: ['./endereco-pessoal.css']
})
export class EnderecoPessoal implements OnInit {

  // Injeção de Dependências
  private fb = inject(FormBuilder);
  private enderecoService = inject(EnderecoService);
  private municipioService = inject(MunicipioService);
  private cepService = inject(ConsultaCepService);

  // Estado do Componente
  enderecos: EnderecoResponseDTO[] = [];
  listaMunicipios: MunicipioResponseDTO[] = [];

  exibirFormulario = false;
  modoEdicao = false;
  idEnderecoEmEdicao: number | null = null;

  // Definição do Formulário
  form: FormGroup = this.fb.group({
    cep: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(9)]],
    bairro: ['', [Validators.required, Validators.maxLength(100)]],
    numero: [null, [Validators.required, Validators.min(1)]],
    complemento: ['', [Validators.required, Validators.maxLength(100)]],
    idMunicipio: [null, [Validators.required]]
  });

  ngOnInit(): void {
    this.carregarMeusEnderecos();
    this.carregarMunicipios();
  }

  // --- CARREGAMENTO DE DADOS ---

  carregarMeusEnderecos() {
    this.enderecoService.getMyEnderecos().subscribe({
      next: (data) => this.enderecos = data,
      error: (err) => console.error('Erro ao carregar endereços', err)
    });
  }

  carregarMunicipios() {
    // Necessário carregar todos para poder selecionar automaticamente pelo nome vindo do CEP
    this.municipioService.findAll().subscribe({
      next: (data) => this.listaMunicipios = data,
      error: (err) => console.error('Erro ao carregar municípios', err)
    });
  }

  // --- LÓGICA DO CEP (O "Pulo do Gato") ---

  buscarCep(event: any) {
    let cep = event.target.value.replace(/\D/g, '');

    if (cep.length === 8) {
      this.cepService.consultaCEP(cep).subscribe({
        next: (dadosViaCep) => {
          if (dadosViaCep.erro) {
            alert('CEP inválido.');
            return;
          }

          // Preenche campos visuais
          this.form.patchValue({
            bairro: dadosViaCep.bairro,
            complemento: dadosViaCep.complemento
          });

          // --- AQUI MUDA TUDO ---

          // Chama o Backend enviando o que o ViaCEP retornou (Ex: Palmas, TO)
          // O Backend vai procurar. Se não achar, cria e devolve.
          this.municipioService.checkAndCreate(dadosViaCep.localidade, dadosViaCep.uf)
            .subscribe({
              next: (municipioDoBanco) => {
                // O banco devolveu o município (novo ou existente)
                // Atualizamos a lista local para o select funcionar visualmente
                this.adicionarNaListaSeNaoExistir(municipioDoBanco);

                // Seleciona o ID no formulário
                this.form.patchValue({ idMunicipio: municipioDoBanco.idMunicipio });
              },
              error: (err) => {
                console.error('Erro ao processar município', err);
                alert('Erro ao sincronizar cidade com o servidor.');
              }
            });
        }
      });
    }
  }

  // Método auxiliar para evitar duplicidade visual no select
  adicionarNaListaSeNaoExistir(novo: MunicipioResponseDTO) {
    const existe = this.listaMunicipios.some(m => m.idMunicipio === novo.idMunicipio);
    if (!existe) {
      this.listaMunicipios.push(novo);
      // Ordena a lista de novo se quiser ficar bonitinho
      this.listaMunicipios.sort((a, b) => a.municipio.localeCompare(b.municipio));
    }
  }

  // --- AÇÕES DE TELA ---

  iniciarNovoCadastro() {
    this.modoEdicao = false;
    this.idEnderecoEmEdicao = null;
    this.form.reset();
    this.exibirFormulario = true;
  }

  iniciarEdicao(endereco: EnderecoResponseDTO) {
    this.modoEdicao = true;
    this.idEnderecoEmEdicao = endereco.idEndereco;

    this.form.patchValue({
      cep: endereco.cep,
      bairro: endereco.bairro,
      numero: endereco.numero,
      complemento: endereco.complemento,
      idMunicipio: endereco.municipio.idMunicipio // O DTO de resposta tem o objeto completo
    });

    this.exibirFormulario = true;
  }

  cancelar() {
    this.exibirFormulario = false;
    this.form.reset();
  }

  deletarEndereco(id: number) {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      this.enderecoService.delete(id).subscribe({
        next: () => this.carregarMeusEnderecos(),
        error: (err) => alert('Erro ao deletar endereço.')
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: EnderecoRequestDTO = this.form.getRawValue();

    if (this.modoEdicao && this.idEnderecoEmEdicao) {
      this.enderecoService.update(this.idEnderecoEmEdicao, dto).subscribe({
        next: () => {
          alert('Endereço atualizado!');
          this.finalizarOperacao();
        },
        error: (err) => console.error('Erro ao atualizar', err)
      });
    } else {
      this.enderecoService.create(dto).subscribe({
        next: () => {
          alert('Endereço cadastrado com sucesso!');
          this.finalizarOperacao();
        },
        error: (err) => console.error('Erro ao cadastrar', err)
      });
    }
  }

  private finalizarOperacao() {
    this.carregarMeusEnderecos();
    this.exibirFormulario = false;
    this.form.reset();
  }
}
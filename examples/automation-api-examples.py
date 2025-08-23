#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Exemplos de uso da API de Automação do ProntuPsi
Este arquivo demonstra como consumir a API em Python
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

class ProntuPsiAutomationAPI:
    def __init__(self, base_url: str = "http://localhost:3000", user_id: str = None):
        """
        Inicializa a API de automação
        
        Args:
            base_url: URL base da API
            user_id: ID do usuário para as operações
        """
        self.base_url = f"{base_url}/automation-api"
        self.user_id = user_id
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict:
        """
        Faz uma requisição HTTP para a API
        
        Args:
            method: Método HTTP (GET, POST, etc.)
            endpoint: Endpoint da API
            data: Dados para enviar no body (para POST)
            params: Parâmetros de query string
            
        Returns:
            Resposta da API como dicionário
            
        Raises:
            requests.RequestException: Se houver erro na requisição
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            else:
                raise ValueError(f"Método HTTP não suportado: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            print(f"Erro na requisição HTTP: {e}")
            raise
    
    def get_user_stats(self) -> Dict[str, Any]:
        """Busca estatísticas do usuário"""
        print("=== Buscando estatísticas do usuário ===")
        
        try:
            stats = self._make_request('GET', f"/user/{self.user_id}/stats")
            print(f"Estatísticas: {json.dumps(stats, indent=2, ensure_ascii=False)}")
            return stats
        except Exception as e:
            print(f"Erro ao buscar estatísticas: {e}")
            return {}
    
    def get_pacientes(self) -> Dict[str, Any]:
        """Lista todos os pacientes do usuário"""
        print("\n=== Listando pacientes ===")
        
        try:
            pacientes = self._make_request('GET', f"/user/{self.user_id}/pacientes")
            print(f"Total de pacientes: {pacientes.get('total', 0)}")
            print(f"Pacientes: {json.dumps(pacientes.get('data', []), indent=2, ensure_ascii=False)}")
            return pacientes
        except Exception as e:
            print(f"Erro ao listar pacientes: {e}")
            return {}
    
    def get_paciente_by_id(self, paciente_id: str) -> Dict[str, Any]:
        """Busca informações de um paciente específico"""
        print(f"\n=== Buscando paciente {paciente_id} ===")
        
        try:
            paciente = self._make_request('GET', f"/user/{self.user_id}/paciente/{paciente_id}")
            print(f"Paciente: {json.dumps(paciente.get('data', {}), indent=2, ensure_ascii=False)}")
            return paciente
        except Exception as e:
            print(f"Erro ao buscar paciente: {e}")
            return {}
    
    def get_agenda_sessoes(self, data_inicio: str = None, data_fim: str = None, paciente_id: str = None) -> Dict[str, Any]:
        """Lista sessões (agendas) do usuário"""
        print("\n=== Listando sessões ===")
        
        try:
            params = {}
            if data_inicio:
                params['dataInicio'] = data_inicio
            if data_fim:
                params['dataFim'] = data_fim
            if paciente_id:
                params['pacienteId'] = paciente_id
            
            sessoes = self._make_request('GET', f"/user/{self.user_id}/agenda-sessoes", params=params)
            print(f"Total de sessões: {sessoes.get('total', 0)}")
            print(f"Sessões: {json.dumps(sessoes.get('data', []), indent=2, ensure_ascii=False)}")
            return sessoes
        except Exception as e:
            print(f"Erro ao listar sessões: {e}")
            return {}
    
    def get_agenda_sessoes_by_paciente(self, paciente_id: str) -> Dict[str, Any]:
        """Lista sessões de um paciente específico"""
        print(f"\n=== Listando sessões do paciente {paciente_id} ===")
        
        try:
            sessoes = self._make_request('GET', f"/user/{self.user_id}/paciente/{paciente_id}/agenda-sessoes")
            print(f"Total de sessões: {sessoes.get('total', 0)}")
            return sessoes
        except Exception as e:
            print(f"Erro ao listar sessões do paciente: {e}")
            return {}
    
    def get_financial_info(self, data_inicio: str = None, data_fim: str = None) -> Dict[str, Any]:
        """Busca informações financeiras do usuário"""
        print("\n=== Buscando informações financeiras ===")
        
        try:
            params = {}
            if data_inicio:
                params['dataInicio'] = data_inicio
            if data_fim:
                params['dataFim'] = data_fim
            
            financeiro = self._make_request('GET', f"/user/{self.user_id}/financeiro", params=params)
            print(f"Resumo financeiro: {json.dumps(financeiro.get('data', {}).get('resumo', {}), indent=2, ensure_ascii=False)}")
            print(f"Total de pagamentos: {len(financeiro.get('data', {}).get('pagamentos', []))}")
            return financeiro
        except Exception as e:
            print(f"Erro ao buscar informações financeiras: {e}")
            return {}
    
    def create_paciente(self, paciente_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cadastra um novo paciente"""
        print("\n=== Cadastrando novo paciente ===")
        
        try:
            novo_paciente = self._make_request('POST', f"/user/{self.user_id}/pacientes", data=paciente_data)
            print(f"Paciente criado: {json.dumps(novo_paciente.get('data', {}), indent=2, ensure_ascii=False)}")
            return novo_paciente
        except Exception as e:
            print(f"Erro ao criar paciente: {e}")
            return {}
    
    def create_agenda_sessao(self, sessao_data: Dict[str, Any]) -> Dict[str, Any]:
        """Agenda uma nova sessão"""
        print("\n=== Agendando nova sessão ===")
        
        try:
            nova_sessao = self._make_request('POST', f"/user/{self.user_id}/agenda-sessoes", data=sessao_data)
            print(f"Sessão agendada: {json.dumps(nova_sessao.get('data', {}), indent=2, ensure_ascii=False)}")
            return nova_sessao
        except Exception as e:
            print(f"Erro ao agendar sessão: {e}")
            return {}
    
    def run_automation(self) -> None:
        """Executa uma automação completa"""
        print("🚀 Iniciando automação do ProntuPsi...\n")
        
        try:
            # 1. Verificar estatísticas
            self.get_user_stats()
            
            # 2. Listar pacientes
            pacientes = self.get_pacientes()
            
            if pacientes and pacientes.get('data'):
                # 3. Buscar informações do primeiro paciente
                primeiro_paciente = pacientes['data'][0]
                self.get_paciente_by_id(primeiro_paciente['id'])
                
                # 4. Listar sessões do primeiro paciente
                self.get_agenda_sessoes_by_paciente(primeiro_paciente['id'])
            
            # 5. Listar sessões dos últimos 30 dias
            hoje = datetime.now()
            trinta_dias_atras = hoje - timedelta(days=30)
            
            self.get_agenda_sessoes(
                data_inicio=trinta_dias_atras.strftime('%Y-%m-%d'),
                data_fim=hoje.strftime('%Y-%m-%d')
            )
            
            # 6. Buscar informações financeiras dos últimos 30 dias
            self.get_financial_info(
                data_inicio=trinta_dias_atras.strftime('%Y-%m-%d'),
                data_fim=hoje.strftime('%Y-%m-%d')
            )
            
            # 7. Exemplo de criação de paciente (comentado para não executar automaticamente)
            """
            novo_paciente = self.create_paciente({
                'nome': 'João Silva',
                'email': 'joao@email.com',
                'telefone': '(11) 99999-9999',
                'cpf': '123.456.789-00',
                'nascimento': '1990-01-01',
                'endereco': 'Rua A, 123',
                'profissao': 'Engenheiro',
                'genero': 'Masculino'
            })
            
            if novo_paciente:
                # 8. Agendar sessão para o novo paciente
                self.create_agenda_sessao({
                    'pacienteId': novo_paciente['data']['id'],
                    'data': '2024-01-25',
                    'horario': '14:00:00',
                    'tipoDaConsulta': 'Terapia Individual',
                    'modalidade': 'Online',
                    'tipoAtendimento': 'Primeira Consulta',
                    'duracao': 60,
                    'value': 15000,
                    'observacao': 'Sessão criada via automação'
                })
            """
            
            print("\n✅ Automação concluída com sucesso!")
            
        except Exception as e:
            print(f"\n❌ Erro na automação: {e}")


def main():
    """Função principal para executar os exemplos"""
    # Substitua pelo ID real do usuário
    USER_ID = "123e4567-e89b-12d3-a456-426614174000"
    
    # Criar instância da API
    api = ProntuPsiAutomationAPI(user_id=USER_ID)
    
    # Executar automação
    api.run_automation()


if __name__ == "__main__":
    main()

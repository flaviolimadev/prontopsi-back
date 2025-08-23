// Exemplo de uso da API de Automação do ProntuPsi com configuração
// Este arquivo demonstra como usar a API com as configurações do config.js

const config = require('./config');

class ProntuPsiAutomationClient {
  constructor(customConfig = {}) {
    // Mesclar configuração padrão com configuração customizada
    this.config = { ...config, ...customConfig };
    
    // Validar configuração
    this.validateConfig();
    
    // Configurar cliente HTTP
    this.baseUrl = `${this.config.api.baseUrl}${this.config.api.automationEndpoint}`;
    this.timeout = this.config.api.timeout;
    this.maxRetries = this.config.api.maxRetries;
    this.retryDelay = this.config.api.retryDelay;
    
    // Configurar headers padrão
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'ProntuPsi-Automation-Client/1.0.0',
    };
    
    // Adicionar headers de segurança se configurados
    if (this.config.security.securityHeaders) {
      Object.assign(this.defaultHeaders, this.config.security.securityHeaders);
    }
    
    // Cache simples em memória
    this.cache = new Map();
    this.cacheEnabled = this.config.cache.enabled;
    this.cacheTTL = this.config.cache.ttl * 1000; // Converter para milissegundos
    this.cacheMaxSize = this.config.cache.maxSize;
    
    // Rate limiting
    this.rateLimitEnabled = this.config.rateLimit.enabled;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    this.maxRequestsPerMinute = this.config.rateLimit.maxRequestsPerMinute;
    
    // Logging
    this.loggingEnabled = this.config.logging.enabled;
    this.logLevel = this.config.logging.level;
  }
  
  validateConfig() {
    if (!this.config.api.baseUrl) {
      throw new Error('API baseUrl é obrigatório');
    }
    if (!this.config.auth.userId) {
      throw new Error('userId é obrigatório');
    }
  }
  
  log(level, message, data = null) {
    if (!this.loggingEnabled) return;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.logLevel] || 0;
    const messageLevel = levels[level] || 0;
    
    if (messageLevel >= currentLevel) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        data,
        userId: this.config.auth.userId,
      };
      
      if (this.config.logging.format === 'json') {
        console.log(JSON.stringify(logEntry));
      } else {
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
      }
    }
  }
  
  checkRateLimit() {
    if (!this.rateLimitEnabled) return true;
    
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    // Reset contador se passou 1 minuto
    if (now - this.lastResetTime >= oneMinute) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      this.log('warn', 'Rate limit excedido');
      return false;
    }
    
    this.requestCount++;
    return true;
  }
  
  getCacheKey(endpoint, params = {}) {
    const key = `${endpoint}:${JSON.stringify(params)}`;
    return key;
  }
  
  getFromCache(key) {
    if (!this.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Verificar se o cache expirou
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    this.log('debug', 'Cache hit', { key });
    return cached.data;
  }
  
  setCache(key, data) {
    if (!this.cacheEnabled) return;
    
    // Limpar cache se exceder tamanho máximo
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    
    this.log('debug', 'Cache set', { key });
  }
  
  async makeRequest(method, endpoint, data = null, params = {}, useCache = false) {
    // Verificar rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit excedido. Tente novamente em alguns minutos.');
    }
    
    // Verificar cache para requisições GET
    if (useCache && method.toUpperCase() === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, params);
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method: method.toUpperCase(),
      headers: this.defaultHeaders,
      timeout: this.timeout,
    };
    
    // Adicionar parâmetros de query
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value);
        }
      });
      url += `?${searchParams.toString()}`;
    }
    
    // Adicionar dados para POST/PUT
    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    this.log('debug', 'Fazendo requisição', { method, url, data, params });
    
    let lastError;
    
    // Tentativas com retry
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Armazenar no cache se for GET e cache estiver habilitado
        if (useCache && method.toUpperCase() === 'GET') {
          const cacheKey = this.getCacheKey(endpoint, params);
          this.setCache(cacheKey, result);
        }
        
        this.log('info', 'Requisição bem-sucedida', { method, endpoint, status: response.status });
        return result;
        
      } catch (error) {
        lastError = error;
        this.log('warn', `Tentativa ${attempt} falhou`, { error: error.message });
        
        if (attempt < this.maxRetries) {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    this.log('error', 'Todas as tentativas falharam', { error: lastError.message });
    throw lastError;
  }
  
  // Métodos da API
  
  async getUserStats() {
    this.log('info', 'Buscando estatísticas do usuário');
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/stats`, null, {}, true);
  }
  
  async getPacientes() {
    this.log('info', 'Listando pacientes');
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/pacientes`, null, {}, true);
  }
  
  async getPacienteById(pacienteId) {
    this.log('info', 'Buscando paciente específico', { pacienteId });
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/paciente/${pacienteId}`, null, {}, true);
  }
  
  async getAgendaSessoes(dataInicio = null, dataFim = null, pacienteId = null) {
    this.log('info', 'Listando sessões', { dataInicio, dataFim, pacienteId });
    
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    if (pacienteId) params.pacienteId = pacienteId;
    
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/agenda-sessoes`, null, params, true);
  }
  
  async getAgendaSessoesByPaciente(pacienteId) {
    this.log('info', 'Listando sessões do paciente', { pacienteId });
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/paciente/${pacienteId}/agenda-sessoes`, null, {}, true);
  }
  
  async getFinancialInfo(dataInicio = null, dataFim = null) {
    this.log('info', 'Buscando informações financeiras', { dataInicio, dataFim });
    
    const params = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
    return this.makeRequest('GET', `/user/${this.config.auth.userId}/financeiro`, null, params, true);
  }
  
  async createPaciente(pacienteData) {
    this.log('info', 'Criando novo paciente', { pacienteData });
    
    // Validar campos obrigatórios
    const requiredFields = this.config.data.requiredPacienteFields;
    for (const field of requiredFields) {
      if (!pacienteData[field]) {
        throw new Error(`Campo obrigatório não informado: ${field}`);
      }
    }
    
    // Adicionar status padrão se não informado
    if (pacienteData.status === undefined) {
      pacienteData.status = this.config.data.defaultStatus;
    }
    
    const result = await this.makeRequest('POST', `/user/${this.config.auth.userId}/pacientes`, pacienteData);
    
    // Limpar cache relacionado a pacientes
    if (this.cacheEnabled) {
      this.cache.clear();
    }
    
    return result;
  }
  
  async createAgendaSessao(sessaoData) {
    this.log('info', 'Agendando nova sessão', { sessaoData });
    
    // Validar campos obrigatórios
    const requiredFields = this.config.data.requiredSessaoFields;
    for (const field of requiredFields) {
      if (!sessaoData[field]) {
        throw new Error(`Campo obrigatório não informado: ${field}`);
      }
    }
    
    // Adicionar status padrão se não informado
    if (sessaoData.status === undefined) {
      sessaoData.status = this.config.data.defaultStatus;
    }
    
    const result = await this.makeRequest('POST', `/user/${this.config.auth.userId}/agenda-sessoes`, sessaoData);
    
    // Limpar cache relacionado a sessões
    if (this.cacheEnabled) {
      this.cache.clear();
    }
    
    return result;
  }
  
  // Método para executar automação completa
  async runAutomation() {
    this.log('info', 'Iniciando automação completa');
    
    try {
      const results = {};
      
      // 1. Estatísticas do usuário
      results.stats = await this.getUserStats();
      
      // 2. Listar pacientes
      results.pacientes = await this.getPacientes();
      
      // 3. Informações do primeiro paciente (se existir)
      if (results.pacientes.data && results.pacientes.data.length > 0) {
        const primeiroPaciente = results.pacientes.data[0];
        results.primeiroPaciente = await this.getPacienteById(primeiroPaciente.id);
        results.sessoesPaciente = await this.getAgendaSessoesByPaciente(primeiroPaciente.id);
      }
      
      // 4. Sessões dos últimos 30 dias
      const hoje = new Date();
      const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      results.sessoesRecentes = await this.getAgendaSessoes(
        trintaDiasAtras.toISOString().split('T')[0],
        hoje.toISOString().split('T')[0]
      );
      
      // 5. Informações financeiras dos últimos 30 dias
      results.financeiro = await this.getFinancialInfo(
        trintaDiasAtras.toISOString().split('T')[0],
        hoje.toISOString().split('T')[0]
      );
      
      this.log('info', 'Automação concluída com sucesso');
      return results;
      
    } catch (error) {
      this.log('error', 'Erro na automação', { error: error.message });
      throw error;
    }
  }
  
  // Métodos utilitários
  
  clearCache() {
    this.cache.clear();
    this.log('info', 'Cache limpo');
  }
  
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.cacheMaxSize,
      enabled: this.cacheEnabled,
      ttl: this.cacheTTL,
    };
  }
  
  getRateLimitStats() {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const timeUntilReset = Math.max(0, oneMinute - (now - this.lastResetTime));
    
    return {
      enabled: this.rateLimitEnabled,
      currentCount: this.requestCount,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      timeUntilReset: Math.ceil(timeUntilReset / 1000), // em segundos
    };
  }
}

// Exemplo de uso
async function main() {
  try {
    // Criar cliente com configuração padrão
    const client = new ProntuPsiAutomationClient();
    
    // Executar automação
    const results = await client.runAutomation();
    
    console.log('✅ Automação concluída!');
    console.log('📊 Estatísticas:', results.stats.data);
    console.log('👥 Total de pacientes:', results.pacientes.total);
    console.log('📅 Sessões recentes:', results.sessoesRecentes.total);
    console.log('💰 Total recebido:', results.financeiro.data.resumo.totalRecebido);
    
    // Exibir estatísticas do cliente
    console.log('\n📈 Estatísticas do Cliente:');
    console.log('Cache:', client.getCacheStats());
    console.log('Rate Limit:', client.getRateLimitStats());
    
  } catch (error) {
    console.error('❌ Erro na automação:', error.message);
  }
}

// Executar se este arquivo for executado diretamente
if (require.main === module) {
  main();
}

module.exports = ProntuPsiAutomationClient;

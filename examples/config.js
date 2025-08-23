// Configuração para a API de Automação do ProntuPsi
// Copie este arquivo e ajuste as configurações conforme necessário

module.exports = {
  // Configurações da API
  api: {
    // URL base da API (ajuste conforme seu ambiente)
    baseUrl: process.env.PRONTUPSI_API_URL || 'http://localhost:3000',
    
    // Endpoint da API de automação
    automationEndpoint: '/automation-api',
    
    // Timeout das requisições (em milissegundos)
    timeout: 30000,
    
    // Número máximo de tentativas em caso de erro
    maxRetries: 3,
    
    // Delay entre tentativas (em milissegundos)
    retryDelay: 1000,
  },
  
  // Configurações de autenticação
  auth: {
    // ID do usuário para acessar os dados
    // IMPORTANTE: Substitua pelo ID real do usuário
    userId: process.env.PRONTUPSI_USER_ID || '123e4567-e89b-12d3-a456-426614174000',
    
    // API Key (para futuras implementações)
    apiKey: process.env.PRONTUPSI_API_KEY || null,
  },
  
  // Configurações de dados
  data: {
    // Filtros padrão para datas
    defaultDateRange: {
      days: 30, // Últimos 30 dias
    },
    
    // Campos obrigatórios para criação de pacientes
    requiredPacienteFields: ['nome'],
    
    // Campos obrigatórios para criação de sessões
    requiredSessaoFields: ['pacienteId', 'data', 'horario', 'tipoDaConsulta', 'modalidade', 'tipoAtendimento', 'duracao', 'value'],
    
    // Status padrão para novos registros
    defaultStatus: 1,
  },
  
  // Configurações de logging
  logging: {
    // Habilitar logs detalhados
    enabled: process.env.LOGGING_ENABLED !== 'false',
    
    // Nível de log (debug, info, warn, error)
    level: process.env.LOG_LEVEL || 'info',
    
    // Formato dos logs
    format: 'json',
  },
  
  // Configurações de cache
  cache: {
    // Habilitar cache
    enabled: process.env.CACHE_ENABLED !== 'false',
    
    // Tempo de vida do cache (em segundos)
    ttl: 300, // 5 minutos
    
    // Tamanho máximo do cache
    maxSize: 100,
  },
  
  // Configurações de rate limiting
  rateLimit: {
    // Habilitar rate limiting
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    
    // Máximo de requisições por minuto
    maxRequestsPerMinute: 60,
    
    // Máximo de requisições por hora
    maxRequestsPerHour: 1000,
  },
  
  // Configurações de notificações
  notifications: {
    // Habilitar notificações de erro
    enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
    
    // Webhook para notificações
    webhookUrl: process.env.NOTIFICATION_WEBHOOK_URL || null,
    
    // Email para notificações
    email: process.env.NOTIFICATION_EMAIL || null,
  },
  
  // Configurações de ambiente
  environment: {
    // Ambiente atual (development, staging, production)
    current: process.env.NODE_ENV || 'development',
    
    // Habilitar modo debug
    debug: process.env.DEBUG === 'true',
    
    // Habilitar validações extras
    strictMode: process.env.STRICT_MODE === 'true',
  },
  
  // Configurações de monitoramento
  monitoring: {
    // Habilitar métricas
    enabled: process.env.MONITORING_ENABLED !== 'false',
    
    // Endpoint para métricas
    metricsEndpoint: '/metrics',
    
    // Intervalo de coleta de métricas (em segundos)
    collectionInterval: 60,
  },
  
  // Configurações de segurança
  security: {
    // Habilitar validação de IP
    ipValidation: process.env.IP_VALIDATION === 'true',
    
    // IPs permitidos (array de IPs ou ranges)
    allowedIPs: process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [],
    
    // Habilitar CORS
    cors: process.env.CORS_ENABLED !== 'false',
    
    // Headers de segurança
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
  
  // Configurações de banco de dados
  database: {
    // Pool de conexões
    connectionPool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10,
    },
    
    // Timeout de consulta (em segundos)
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30,
  },
  
  // Configurações de filas
  queues: {
    // Habilitar processamento em fila
    enabled: process.env.QUEUES_ENABLED !== 'false',
    
    // Número de workers
    workers: parseInt(process.env.QUEUE_WORKERS) || 2,
    
    // Tamanho máximo da fila
    maxSize: parseInt(process.env.QUEUE_MAX_SIZE) || 1000,
  },
  
  // Configurações de backup
  backup: {
    // Habilitar backup automático
    enabled: process.env.BACKUP_ENABLED !== 'false',
    
    // Frequência de backup (em horas)
    frequency: parseInt(process.env.BACKUP_FREQUENCY) || 24,
    
    // Retenção de backups (em dias)
    retention: parseInt(process.env.BACKUP_RETENTION) || 7,
  },
};

// Função para validar configurações
function validateConfig(config) {
  const errors = [];
  
  // Validar URL da API
  if (!config.api.baseUrl) {
    errors.push('API baseUrl é obrigatório');
  }
  
  // Validar ID do usuário
  if (!config.auth.userId) {
    errors.push('userId é obrigatório');
  }
  
  // Validar timeout
  if (config.api.timeout < 1000) {
    errors.push('timeout deve ser maior que 1000ms');
  }
  
  // Validar rate limiting
  if (config.rateLimit.maxRequestsPerMinute < 1) {
    errors.push('maxRequestsPerMinute deve ser maior que 0');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuração inválida: ${errors.join(', ')}`);
  }
  
  return true;
}

// Função para obter configuração validada
function getValidatedConfig() {
  const config = require('./config');
  validateConfig(config);
  return config;
}

// Função para obter configuração por ambiente
function getConfigByEnvironment(env) {
  const config = require('./config');
  
  // Ajustar configurações baseado no ambiente
  switch (env) {
    case 'production':
      config.logging.level = 'warn';
      config.cache.enabled = true;
      config.rateLimit.enabled = true;
      config.monitoring.enabled = true;
      break;
      
    case 'staging':
      config.logging.level = 'info';
      config.cache.enabled = true;
      config.rateLimit.enabled = true;
      break;
      
    case 'development':
    default:
      config.logging.level = 'debug';
      config.cache.enabled = false;
      config.rateLimit.enabled = false;
      config.monitoring.enabled = false;
      break;
  }
  
  return config;
}

// Exportar funções auxiliares
module.exports.validateConfig = validateConfig;
module.exports.getValidatedConfig = getValidatedConfig;
module.exports.getConfigByEnvironment = getConfigByEnvironment;

-- Consultar informações de trial e plano de um usuário específico
-- Substitua o email pelo email do usuário que você quer consultar

SELECT 
    id,
    email,
    nome,
    sobrenome,
    plan_type as "Plano",
    subscription_status as "Status da Assinatura",
    trial_used as "Trial Usado?",
    trial_starts_at as "Trial Iniciou em",
    trial_ends_at as "Trial Termina em",
    CASE 
        WHEN trial_ends_at IS NOT NULL AND trial_ends_at > NOW() THEN 
            EXTRACT(DAY FROM (trial_ends_at - NOW())) || ' dias restantes'
        ELSE 'Trial expirado ou não ativo'
    END as "Dias Restantes",
    created_at as "Conta Criada em"
FROM users
WHERE email = 'joao.j10095@hotmail.com';

-- OU consultar TODOS os usuários:

-- SELECT 
--     id,
--     email,
--     plan_type as "Plano",
--     subscription_status as "Status",
--     trial_used as "Trial Usado?",
--     trial_ends_at as "Trial Termina em"
-- FROM users
-- ORDER BY created_at DESC;


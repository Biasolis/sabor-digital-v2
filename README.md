# Sabor Digital V2

**Sabor Digital V2** é uma plataforma SaaS (Software as a Service) multi-tenant completa para a gestão de restaurantes, bares e lanchonetes. O sistema oferece desde a gestão de cardápio digital e pedidos até o controle financeiro, de estoque e mesas, com um sistema de subdomínios para cada cliente (tenant).

## Stack de Tecnologia

-   **Frontend:** Vite + React
-   **Backend:** Node.js com Express.js
-   **Banco de Dados:** PostgreSQL (gerenciado pela Neon)
-   **Armazenamento de Arquivos:** MinIO (compatível com API S3)
-   **Atendimento ao Cliente:** Integração com Ticket-Z (fork do Whaticket)

## Estrutura do Projeto

O projeto é organizado em um monorepo com duas pastas principais:

-   `/backend`: Contém toda a API RESTful, lógica de negócios e comunicação com o banco de dados.
-   `/frontend`: Contém a aplicação do cliente (painéis de admin, dashboards da loja, etc.) construída com React.

## Como Começar

*Instruções de instalação e configuração serão adicionadas aqui.*
-- Habilita a extensão para gerar UUIDs, que são ótimos para chaves primárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela para os planos de assinatura do SaaS
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB, -- Usamos JSONB para flexibilidade nos recursos do plano
    is_public BOOLEAN DEFAULT true, -- Para planos personalizados que não aparecem no site
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para os tenants (os restaurantes clientes do SaaS)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- Ex: active, inactive, suspended
    plan_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan FOREIGN KEY(plan_id) REFERENCES plans(id)
);

-- Criamos um tipo ENUM para os papéis dos usuários, garantindo a consistência dos dados
CREATE TYPE user_role AS ENUM ('admin', 'caixa', 'cozinha', 'garcom', 'auxiliar');

-- Tabela para os usuários de cada tenant
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(email, tenant_id) -- O email deve ser único por tenant
);

-- Tabela separada para os Super Admins da plataforma
CREATE TABLE superadmins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO plans (name, price, features) VALUES ('Plano Básico', 49.90, '{"users": 5, "menu": true}');


-- Tabela para as categorias do cardápio de cada tenant
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    "order" INTEGER DEFAULT 0, -- Coluna para permitir a reordenação das categorias
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, name) -- O nome da categoria deve ser único por loja
);

-- Tabela para os produtos do cardápio
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    category_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255), -- Para a integração com o S3/MinIO no futuro
    is_available BOOLEAN DEFAULT true, -- Para ativar/desativar um produto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_category FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tabela para gerenciar as mesas do restaurante
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    "number" INTEGER NOT NULL, -- O número da mesa visível para o cliente
    status VARCHAR(50) DEFAULT 'available', -- Ex: available, occupied, reserved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, "number") -- O número da mesa deve ser único por loja
);

-- Criamos um tipo ENUM para o status dos pedidos
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'ready', 'delivered', 'canceled', 'paid');

-- Tabela para as comandas (pedidos)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    table_id UUID, -- Pode ser nulo para pedidos de delivery/retirada no futuro
    user_id UUID, -- O usuário (garçom) que abriu a comanda
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_table FOREIGN KEY(table_id) REFERENCES tables(id) ON DELETE SET NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela para os itens dentro de cada comanda/pedido
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL, -- Preço no momento da compra, para histórico
    observation TEXT, -- Observação do item (ex: "sem cebola")
    CONSTRAINT fk_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabela para os itens do estoque (ingredientes, bebidas, etc.)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity_on_hand DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
    unit_of_measure VARCHAR(50) NOT NULL, -- Ex: 'kg', 'g', 'litro', 'ml', 'unidade'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, name) -- O nome do item de estoque deve ser único por loja
);

-- Tabela de associação (pivot) para definir a "receita" de cada produto
-- Ex: 1 Pizza Margherita (product_id) consome 0.150 kg de Queijo (inventory_item_id)
CREATE TABLE product_inventory_usage (
    product_id UUID NOT NULL,
    inventory_item_id UUID NOT NULL,
    quantity_consumed DECIMAL(10, 3) NOT NULL,
    PRIMARY KEY (product_id, inventory_item_id),
    CONSTRAINT fk_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_item FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Tabela para os caixas (pontos de venda físicos ou lógicos)
CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE(tenant_id, name)
);

-- Tabela para as sessões de trabalho de cada caixa
CREATE TABLE cash_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    cash_register_id UUID NOT NULL,
    opened_by_user_id UUID NOT NULL,
    closed_by_user_id UUID, -- Nulo até o caixa ser fechado
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2), -- Nulo até o caixa ser fechado
    status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open' ou 'closed'
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_cash_register FOREIGN KEY(cash_register_id) REFERENCES cash_registers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_opened_by FOREIGN KEY(opened_by_user_id) REFERENCES users(id),
    CONSTRAINT fk_closed_by FOREIGN KEY(closed_by_user_id) REFERENCES users(id)
);

-- Criamos um tipo ENUM para os tipos de transação
CREATE TYPE transaction_type AS ENUM ('revenue', 'expense', 'opening_float', 'withdrawal');
CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'pix', 'other');

-- Tabela para registrar todas as transações (o livro-razão)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    cash_session_id UUID NOT NULL,
    order_id UUID, -- Associado a uma venda
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method, -- Usado principalmente para 'revenue'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_cash_session FOREIGN KEY(cash_session_id) REFERENCES cash_sessions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order FOREIGN KEY(order_id) REFERENCES orders(id)
);

-- 1. Tabela para cadastrar os clientes das lojas
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL, -- Número do WhatsApp para as notificações
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 2. Adiciona a coluna 'customer_id' na tabela de comandas (orders)
ALTER TABLE orders
ADD COLUMN customer_id UUID,
ADD CONSTRAINT fk_customer FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL;

ALTER TABLE orders 
ADD COLUMN tip_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE orders 
ADD COLUMN final_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE tenants
ADD COLUMN logo_url VARCHAR(255),
ADD COLUMN primary_color VARCHAR(7),
ADD COLUMN secondary_color VARCHAR(7);

ALTER TABLE tenants
ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT true;
-- Finanzas Personales - Datos iniciales

-- Categorías de ingresos
INSERT INTO categories (name, type, parent_id, sort_order) VALUES
('SERVIU', 'income', NULL, 1),
('Ingeniería', 'income', NULL, 2),
('Arriendo Santiago', 'income', NULL, 3),
('Topografías', 'income', NULL, 4);

-- Categorías padre de gastos
INSERT INTO categories (name, type, parent_id, sort_order) VALUES
('Servicios básicos', 'expense', NULL, 1),
('Suscripciones', 'expense', NULL, 2),
('Alimentación', 'expense', NULL, 3),
('Transporte & Auto', 'expense', NULL, 4),
('Familia & Hogar', 'expense', NULL, 5),
('Salud & Bienestar', 'expense', NULL, 6),
('Finanzas', 'expense', NULL, 7),
('Ocio & Viajes', 'expense', NULL, 8);

-- Subcategorías: Servicios básicos
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Electricidad', 'expense', id, 1 FROM categories WHERE name = 'Servicios básicos' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Agua', 'expense', id, 2 FROM categories WHERE name = 'Servicios básicos' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Gas', 'expense', id, 3 FROM categories WHERE name = 'Servicios básicos' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Internet', 'expense', id, 4 FROM categories WHERE name = 'Servicios básicos' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Telefonía', 'expense', id, 5 FROM categories WHERE name = 'Servicios básicos' AND type = 'expense';

-- Subcategorías: Suscripciones
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Spotify', 'expense', id, 1 FROM categories WHERE name = 'Suscripciones' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'ChatGPT', 'expense', id, 2 FROM categories WHERE name = 'Suscripciones' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'MeLi+', 'expense', id, 3 FROM categories WHERE name = 'Suscripciones' AND type = 'expense';

-- Subcategorías: Alimentación
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Supermercado', 'expense', id, 1 FROM categories WHERE name = 'Alimentación' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Delivery / salir a comer', 'expense', id, 2 FROM categories WHERE name = 'Alimentación' AND type = 'expense';

-- Subcategorías: Transporte & Auto
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Transporte público', 'expense', id, 1 FROM categories WHERE name = 'Transporte & Auto' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Combustible', 'expense', id, 2 FROM categories WHERE name = 'Transporte & Auto' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Seguro auto', 'expense', id, 3 FROM categories WHERE name = 'Transporte & Auto' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Mantención auto', 'expense', id, 4 FROM categories WHERE name = 'Transporte & Auto' AND type = 'expense';

-- Subcategorías: Familia & Hogar
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Jardín infantil', 'expense', id, 1 FROM categories WHERE name = 'Familia & Hogar' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Asesora hogar', 'expense', id, 2 FROM categories WHERE name = 'Familia & Hogar' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Ropa y calzado', 'expense', id, 3 FROM categories WHERE name = 'Familia & Hogar' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Regalos', 'expense', id, 4 FROM categories WHERE name = 'Familia & Hogar' AND type = 'expense';

-- Subcategorías: Salud & Bienestar
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Isapre', 'expense', id, 1 FROM categories WHERE name = 'Salud & Bienestar' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Farmacia', 'expense', id, 2 FROM categories WHERE name = 'Salud & Bienestar' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Deporte', 'expense', id, 3 FROM categories WHERE name = 'Salud & Bienestar' AND type = 'expense';

-- Subcategorías: Finanzas
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Seguro con ahorro', 'expense', id, 1 FROM categories WHERE name = 'Finanzas' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Pago deudas', 'expense', id, 2 FROM categories WHERE name = 'Finanzas' AND type = 'expense';
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Ahorro / inversión', 'expense', id, 3 FROM categories WHERE name = 'Finanzas' AND type = 'expense';

-- Subcategorías: Ocio & Viajes
INSERT INTO categories (name, type, parent_id, sort_order)
SELECT 'Viajes o vacaciones', 'expense', id, 1 FROM categories WHERE name = 'Ocio & Viajes' AND type = 'expense';

-- Medios de pago
INSERT INTO payment_methods (name) VALUES
('CMR'),
('Lider BCI'),
('Débito'),
('Efectivo');

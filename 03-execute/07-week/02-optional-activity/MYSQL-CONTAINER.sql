-- CREAR TABLAS
CREATE TABLE Clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100)
);

CREATE TABLE Productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    precio DECIMAL(10,2)
);

-- INSERTAR DATOS (5 por entidad)
INSERT INTO Clientes (nombre, correo) VALUES
('Juan Perez', 'juan@gmail.com'),
('Maria Lopez', 'maria@gmail.com'),
('Carlos Ruiz', 'carlos@gmail.com'),
('Ana Torres', 'ana@gmail.com'),
('Luis Gomez', 'luis@gmail.com');

INSERT INTO Productos (nombre, precio) VALUES
('Laptop', 2500),
('Mouse', 50),
('Teclado', 120),
('Monitor', 800),
('Impresora', 600);

-- ACTUALIZACIONES (2 por entidad)
UPDATE Clientes SET correo = 'juanp@gmail.com' WHERE id = 1;
UPDATE Clientes SET nombre = 'Maria L.' WHERE id = 2;

UPDATE Productos SET precio = 2600 WHERE id = 1;
UPDATE Productos SET nombre = 'Mouse Gamer' WHERE id = 2;

-- ELIMINACIONES (2 por entidad)
DELETE FROM Clientes WHERE id = 5;
DELETE FROM Clientes WHERE id = 4;

DELETE FROM Productos WHERE id = 5;
DELETE FROM Productos WHERE id = 4;

-- CONSULTAS (2 por entidad)
SELECT * FROM Clientes WHERE nombre LIKE 'J%';
SELECT * FROM Clientes WHERE correo LIKE '%gmail.com';

SELECT * FROM Productos WHERE precio > 100;
SELECT * FROM Productos WHERE nombre LIKE '%o%';
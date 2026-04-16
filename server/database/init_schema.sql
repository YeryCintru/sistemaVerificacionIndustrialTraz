-- Eliminamos las tablas si ya existen para poder reconstruir el esquema limpio desde cero.
-- El orden de baja es importante debido a las claves foráneas.
DROP TABLE IF EXISTS Auditoria;
DROP TABLE IF EXISTS Orden_produccion;
DROP TABLE IF EXISTS Producto;
DROP TABLE IF EXISTS Operario;

-- 1. Tabla Operario
CREATE TABLE Operario (
    Id_operario INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_operario VARCHAR(100) NOT NULL,
    Clave_operario VARCHAR(255) NOT NULL,
    Rol_operario ENUM('Admin', 'Supervisor', 'Operario') NOT NULL
);

-- 2. Tabla Producto
CREATE TABLE Producto (
    Id_producto INT AUTO_INCREMENT PRIMARY KEY,
    Codigo_producto VARCHAR(50) UNIQUE NOT NULL,
    Nombre_producto VARCHAR(100) NOT NULL,
    Estado_producto ENUM('Correcto', 'Bloqueado', 'Baja') NOT NULL DEFAULT 'Correcto',
    Verificador_producto VARCHAR(100),
    FechaCreacion_producto DATETIME DEFAULT CURRENT_TIMESTAMP,
    Documentacion_producto TEXT
);

-- 3. Tabla Orden_produccion
CREATE TABLE Orden_produccion (
    Id_ordenProd INT AUTO_INCREMENT PRIMARY KEY,
    Codigo_ordenProd VARCHAR(100) UNIQUE NOT NULL,
    Lote_ordenProd VARCHAR(50) NOT NULL,
    Cantidad_ordenProd INT NOT NULL,
    CantidadCompletada_ordenProd INT DEFAULT 0,
    FechaInicio_ordenProd DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaCierre_ordenProd DATETIME,
    Estado_ordenProd ENUM('Pendiente', 'En Progreso', 'Cerrada') NOT NULL DEFAULT 'Pendiente',
    Comentarios_ordenProd TEXT,
    Id_producto INT NOT NULL,
    FOREIGN KEY (Id_producto) REFERENCES Producto(Id_producto) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. Tabla Auditoria
CREATE TABLE Auditoria (
    Id_log INT AUTO_INCREMENT PRIMARY KEY,
    Numero_log VARCHAR(50) UNIQUE,
    Accion_log VARCHAR(100) NOT NULL,
    Resultado_log VARCHAR(100) NOT NULL,
    Momento_log DATETIME DEFAULT CURRENT_TIMESTAMP,
    Comentarios_log TEXT,
    Id_operario INT,
    Id_ordenProd INT,
    FOREIGN KEY (Id_operario) REFERENCES Operario(Id_operario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (Id_ordenProd) REFERENCES Orden_produccion(Id_ordenProd) ON DELETE SET NULL ON UPDATE CASCADE
);

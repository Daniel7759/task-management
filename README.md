# 📋 Aplicación de Gestión de Tareas con Spring Boot y Angular

Este proyecto implementa una aplicación web completa de **gestión de tareas** con autenticación **JWT**, que permite a múltiples usuarios **crear, editar, filtrar y gestionar** sus tareas de forma segura.

---

## 🏗️ Arquitectura del Sistema

La aplicación sigue una arquitectura en capas con una clara separación entre presentación, lógica de negocio y acceso a datos:

- **Backend**: Spring Boot 3.3.2 con Java 17
- **Frontend**: Angular (ubicado en `RetoTecnicoFrontend/`)
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT con Spring Security

---

## ⚙️ Tecnologías Utilizadas

### Backend (`RetoTecnico`)
- **Spring Boot 3.3.2**: Framework principal
- **Spring Security**: Autenticación y autorización
- **Spring Data JPA**: Acceso a datos con Hibernate
- **PostgreSQL**: Base de datos
- **JWT (JJWT 0.11.5)**: Tokens de autenticación
- **Maven**: Gestión de dependencias y build

### Frontend (`RetoTecnicoFrontend`)
- **Angular**: Framework frontend
- **TypeScript**: Lenguaje de programación
- **HTTP Client**: Comunicación con el backend (ej: `task.service.ts:9-12`)

---

## ⚙️ Configuración del Proyecto

### Requisitos Previos
- Java 17+
- PostgreSQL
- Node.js (para Angular)
- Maven (o usar el wrapper `./mvnw`)

### Configuración de la Base de Datos
El backend se conecta a una base de datos PostgreSQL en `localhost:5432`, con nombre de base de datos: `task-api`.

### Puertos del Proyecto
- **Backend**: `8093`
- **Frontend**: `4200` (por defecto en Angular)

---

## 🚀 Instalación y Ejecución

### Backend (`RetoTecnico`)
```bash
# Clonar repositorio
git clone <repository-url>
cd RetoTecnico

# Ejecutar con Maven Wrapper
./mvnw spring-boot:run

# O compilar y ejecutar JAR
./mvnw clean package
java -jar target/RetoTecnico-0.0.1-SNAPSHOT.jar
```

### Frontend (`RetoTecnicoFrontend`)
```bash

cd RetoTecnicoFrontend/project
npm install
ng serve
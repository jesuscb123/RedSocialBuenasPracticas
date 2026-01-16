# RedSocialBuenasPrácticas 

**Código refactorizado: https://github.com/jesuscb123/RedSocialBuenasPracticas/tree/rama2

Este proyecto consiste en la optimización y refactorización de la aplicación Ionic/Angular denominada **RedSocialBuenasPracticas**. El objetivo ha sido aplicar técnicas de desarrollo eficiente para mejorar el rendimiento, la gestión de memoria y la escalabilidad, cumpliendo con los apartados **2.2.1 al 2.4.3** de la guía de buenas prácticas.

Para este ejercicio, se ha utilizado Inteligencia Artificial como apoyo para identificar patrones de código ineficiente y aplicar las correcciones arquitectónicas necesarias.

## 📋 Objetivos Cumplidos (Teoría 2.2.1 - 2.4.3)
* **Centralización de lógica:** Migración de lógica de componentes a servicios (Apartado 2.2.3).
* **Gestión de DOM:** Optimización de listas de grandes volúmenes (Apartado 2.3.2).
* **Control de fugas de memoria:** Gestión de desuscripciones y uso de `AsyncPipe` (Apartado 2.4.3).

---

## 📊 Comparativa de KPIs (Datos Reales)

Tras aplicar las optimizaciones, se han comparado los resultados entre la versión original y la versión optimizada ("Refactorizado"). Los datos extraídos de las métricas del proyecto son los siguientes:

| Métrica (KPI) | Malas Prácticas (Original) | Buenas Prácticas (Optimizado) | Mejora Lograda |
| :--- | :---: | :---: | :--- |
| **Peticiones HTTP totales** | **2 #** | **1 #** | **-50%**. Eliminación de redundancia. |
| **Suscripciones activas** | **2 #** | **1 #** | **-50%**. Prevención de memory leaks. |
| **Elementos en lista** | **1000 #** | **100 #** | **-90%**. Reducción de estrés en el DOM. |
| **Eficiencia de Carga** | ~18.8ms | **~5.8ms** | **3x más rápido**. Mejora en fluidez. |

## 🛠️ Principales Mejoras Realizadas

### 1. Optimización de Servicios (Apartado 2.2.3)
Se detectó que la aplicación realizaba peticiones HTTP duplicadas al navegar. Se implementó un patrón de servicio para compartir el estado, reduciendo las peticiones a la mitad y mejorando el tiempo de respuesta.

### 2. Gestión de Listas y DOM (Apartado 2.3.2)
La versión original intentaba renderizar 1000 elementos de forma simultánea, lo que penaliza gravemente la memoria y los FPS. Se ajustó el renderizado a 100 elementos con carga progresiva, garantizando un scroll fluido en dispositivos móviles.

### 3. Observables y Suscripciones (Apartado 2.4.3)
Se corrigieron las fugas de memoria asegurando que las suscripciones se cierren al abandonar la vista. Esto se refleja en la reducción del KPI de "Suscripciones activas tras navegación repetida".

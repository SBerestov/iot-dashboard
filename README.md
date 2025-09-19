# IoT Dashboard

**Веб-приложение для мониторинга устройств умного дома (Zigbee + IoT)**  

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PowerShell](https://img.shields.io/badge/PowerShell-5.1-blue)](https://learn.microsoft.com/powershell/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)](https://www.mysql.com/)
[![Mosquitto](https://img.shields.io/badge/MQTT-Mosquitto-green)](https://mosquitto.org/)

## 📌 О проекте
Система мониторинга умных устройств с использованием MQTT-брокера Mosquitto и кастомного PowerShell-сервера.  

### Возможности:
- **Дашборд с деревом адресов и комнат**  
- **Мониторинг параметров датчиков** (температура, влажность и др.)  
- **SVG-графики изменений показателей** по дням, неделям и месяцам  
- **CRUD-операции** с датчиками и локациями  
- **Второй дашборд с Яндекс.Картами** (точки расположения объектов, статус по цветам: 🟢 нормально, 🟡 выход за пределы нормы, 🔴 отсутствуют данные)  
- **MySQL база данных** для хранения информации  

## 🛠 Технологии
- **Фронтенд**: HTML, CSS (адаптивный дизайн), JavaScript 
- **Бэкенд**: PowerShell (самописный сервер), MySQL  
- **IoT**: Mosquitto MQTT Broker, Zigbee устройства  
- **API**: Яндекс.Карты  

## 📸 Демонстрация
1. Древовидный список локаций и датчиков  
   ![tree-view](assets/gifs/01.gif)

2. Отрисовка SVG-графика по параметрам датчиков
   ![chart](assets/gifs/02.gif)

3. Отрисовка SVG-графика за период (месяц)
   ![chart-month](assets/gifs/03.gif)

4. Отрисовка SVG-графика за период (день) 
   ![chart-day](assets/gifs/04.gif)

5. Дашборд всех объектов
   ![dashboard-objects](assets/gifs/05.gif)

6. Добавление нового устройства
   ![add-new-device](assets/gifs/06.gif)

7. Удаление устройства
   ![delete-device](assets/gifs/07.gif)

function changeImage() {
    let toggleBtn = document.getElementById('imgClickAndChange');
    let dropDownMenu = document.querySelector('.dropdown_menu');

    dropDownMenu.classList.toggle('open');
    let isOpen = dropDownMenu.classList.contains('open');

    toggleBtn.src = isOpen ? 'images/xmark-solid.svg' : 'images/bars-solid.svg';
}
window.onload = function() {
    let toggleBtn = document.getElementById('imgClickAndChange');
    let toggleBtnIcon = document.querySelector('.toggle_btn i');
    let dropDownMenu = document.querySelector('.dropdown_menu');

    toggleBtn.onclick = function() {
        changeImage();
    }
}

var host = window.location.origin;
var sourceNameHistory = localStorage.getItem('sourceNameHistory') ? JSON.parse(localStorage.getItem('sourceNameHistory')) : { 1: 'AqaraSensor1' };

let groups = document.querySelectorAll('.vertical-menu');

groups.forEach(function(group) {
    let buttons = group.querySelectorAll('button');

    if (group.id === 'buttons-group-1') {
        buttons.forEach(function(button, index) {

            button.id = 'g1-button-' + (index + 1);

            buttons.forEach(function(btn) {
                btn.classList.remove('active');
            });

            let activeButtonGroup1 = localStorage.getItem('activeButtonGroup1');
            if (activeButtonGroup1) {
                let activeButton = document.getElementById(activeButtonGroup1);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }

            button.addEventListener('click', function(event) {
                
                // Деактивируем все кнопки в текущей группе
                buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                // Активируем только нажатую кнопку
                this.classList.add('active');

                localStorage.setItem('activeButtonGroup1', this.id);

                let group2Buttons = document.getElementById('buttons-group-2').querySelectorAll('button');
                let group3Buttons = document.getElementById('buttons-group-3').querySelectorAll('button');

                group2Buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                group3Buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
            });
        });
    } else if (group.id === 'buttons-group-2') {
        buttons.forEach(function(button, index) {

            button.id = 'g2-button-' + (index + 1);

            buttons.forEach(function(btn) {
                btn.classList.remove('active');
            });

            let activeButtonGroup2 = localStorage.getItem('activeButtonGroup2');
            if (activeButtonGroup2) {
                let activeButton = document.getElementById(activeButtonGroup2);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }

            button.addEventListener('click', function(event) {
                
                buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                this.classList.add('active');

                localStorage.setItem('activeButtonGroup2', this.id);

                let group3Buttons = document.getElementById('buttons-group-3').querySelectorAll('button');
                
                group3Buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
            });
        });
    } else if (group.id === 'buttons-group-3') {
        buttons.forEach(function(button, index) {

            button.id = 'g3-button-' + (index + 1);

            buttons.forEach(function(btn) {
                btn.classList.remove('active');
            });

            let activeButtonGroup3 = localStorage.getItem('activeButtonGroup3');
            if (activeButtonGroup3) {
                let activeButton = document.getElementById(activeButtonGroup3);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }

            button.addEventListener('click', function(event) {
                
                buttons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                
                this.classList.add('active');

                localStorage.setItem('activeButtonGroup3', this.id);

                let group1Buttons = document.getElementById('buttons-group-1').querySelectorAll('button');
                let group2Buttons = document.getElementById('buttons-group-2').querySelectorAll('button');

                let selectedButtons = [];

                

                group2Buttons.forEach(function(btn) {
                    if (btn.classList.contains('active')) {
                        groups.forEach(function(group) {
                            let activeButton = group.querySelector('.active');

                            if (activeButton) {
                                selectedButtons.push(activeButton.textContent);
                            }
                        });
                        let message = selectedButtons.join(', ');
                        let messageParts = message.split(', ');

                        let location_description = messageParts.slice(0, 2).join(', ');
                        let sensorNumber = messageParts[2].split('Датчик ')[1];

                        console.log(location_description);
                        console.log(sensorNumber);
                        console.log(message);

                        

                        fetch(host + '/IOT_Devices/get-reference-table=' + location_description)
                        .then(response => response.json())
                        .then(json => {
                            console.log(json);

                            var sourceName = json.source_id[sensorNumber-1];
                            console.log(sourceName);

                            sourceNameHistory[1] = sourceName;
                            localStorage.setItem('sourceNameHistory', JSON.stringify(sourceNameHistory));
                            console.log(sourceNameHistory[1]);

                            readFile(sourceName);
                        })
                        .catch(error => console.error('Error reading the data:', error));
                    }
                });
            });
        });
    }
});


// Создание списка объектов
function locationTreeData () {
    fetch(host + '/IOT_Devices/get-location-source')
    .then(response => response.json())
    .then(json => {
        
        console.log(json);

        var filteredJSON = json.source_id.reduce(function(result, current, index) {
            if (json.min_range[index] && json.max_range[index] != '') {
                result.push({ 
                    "id": json.id[index], 
                    "source_id": current, 
                    "location_description": json.location_description[index],
                    "location_cor_1": json.location_cor_1[index],
                    "location_cor_2": json.location_cor_2[index],
                    "property_name": json.property_name[index],
                    "min_range": json.min_range[index],
                    "max_range": json.max_range[index],
                    "properties_id": json.properties_id[index],
                    "property_name_rus": json.property_name_rus[index],
                    "type_id": json.type_id[index],
                    "value": json.value[index],
                    "datetime": json.datetime[index]
                });
            }
            return result;
        }, []); 

        console.log(filteredJSON);

        function buildLocationTree(data) {
            var ul = document.createElement('ul');
            ul.classList.add('tree');

            var locationMap = {};
            var level2Count = {};
            const statusCounts = {};

            data.forEach(function(item) {
                var locationSplit = item.location_description.split(' - ');
                var level_1 = locationSplit[0];
                var level_2 = locationSplit[1];
                var level_3 = item.source_id;

                if (!locationMap[level_1]) {
                    locationMap[level_1] = document.createElement('li');

                    var span = document.createElement('span');
                    span.classList.add('caret');
                    span.classList.add('level-1');
                    span.textContent = level_1;
                    locationMap[level_1].appendChild(span);

                    var nestedUl = document.createElement('ul');
                    nestedUl.classList.add('nested');
                    locationMap[level_1].appendChild(nestedUl);

                    ul.appendChild(locationMap[level_1]);
                }

                if (!locationMap[level_1 + level_2]) {
                    locationMap[level_1 + level_2] = document.createElement('li');

                    var span = document.createElement('span');
                    span.classList.add('caret');
                    span.classList.add('level-2');
                    span.textContent = level_2;
                    locationMap[level_1 + level_2].appendChild(span);

                    var nestedUl = document.createElement('ul');
                    nestedUl.classList.add('nested');
                    locationMap[level_1 + level_2].appendChild(nestedUl);

                    locationMap[level_1].querySelector('.nested').appendChild(locationMap[level_1 + level_2]);

                    level2Count[level_1 + level_2] = 1;
                }

                var nestedLi = document.createElement('li');
                var nestedSpan = document.createElement('span');

                if (!statusCounts[level_3]) {
                    nestedSpan.classList.add('caret');
                    nestedSpan.classList.add('level-3');
                    nestedSpan.textContent = level_3;
                    nestedLi.appendChild(nestedSpan);
                } else {
                    return;
                }
                

                // Функция форматирующая datetime
                function parseDateTime(dateTimeString) {
                    // Извлечение числового значения из строки
                    const numericValue = parseInt(dateTimeString.replace('/Date(', '').replace(')/', ''), 10);

                    // Создание объекта Date на основе числового значения
                    return new Date(numericValue);
                }

                let propertyValue
                let minRange
                let maxRange
                let currentTime = new Date;
                let locationDateTime
                if (item.datetime === null) {
                    locationDateTime = 0;
                } else {
                    locationDateTime = parseDateTime(item.datetime);
                }
                // Расчет разницы во времени в минутах
                const timeDiffInMinutes = Math.abs((currentTime - locationDateTime) / (1000 * 60));

                // Обновляем statusCounts для отображения состояний датчиков на странице "Детальный вид"
                if (!statusCounts[level_3]) {
                    statusCounts[level_3] = {
                        level_1: level_1,
                        level_2: level_2,
                        level_3: level_3,
                        ok: 0,
                        intermediate: 0,
                        noConnection: 0
                    };
                }

                if (level_3.includes("AqaraSensor")) {
                    propertyValue = parseFloat(item.value);
                    minRange = parseFloat(item.min_range);
                    maxRange = parseFloat(item.max_range);

                    if ((minRange && maxRange) !== '') {
                        if (timeDiffInMinutes < 30) {
                            statusCounts[level_3].noConnection++;
                            nestedSpan.classList.add('branch-status');
                            nestedSpan.style.backgroundImage = 'linear-gradient(to left, #F44336, #ff0000)';
                        } else if (propertyValue < minRange || propertyValue > maxRange) {
                            statusCounts[level_3].intermediate++;
                            nestedSpan.classList.add('branch-status');
                        } else if (propertyValue > minRange && propertyValue < maxRange) {
                            statusCounts[level_3].ok++;
                        }
                    }
                    // console.log(statusCounts);
                } else if (level_3.includes("AqaraWaterLeakSensor")) {
                    propertyValue = item.value;
                    minRange = item.min_range;
                    maxRange = item.max_range;

                    if ((minRange && maxRange) !== '') {
                        if (propertyValue === "true") {
                            statusCounts[level_3].noConnection++;
                            nestedSpan.classList.add('branch-status');
                            nestedSpan.style.backgroundImage = 'linear-gradient(to left, #F44336, #ff0000)';
                        } else if (propertyValue === "false") {
                            statusCounts[level_3].ok++;
                        }
                    }
                }

                // Установка значения датчика и локаций по умолчанию
                if (localStorage.getItem('selectedLevel3') === null || localStorage.getItem('selectedLevel3') === undefined || localStorage.getItem('selectedLevel3') === '') {
                    localStorage.setItem('selectedLevel3', level_3);

                    const undefinedState = 'undefined';

                    localStorage.setItem(`level-${level_1.replace(/\s/g, '_')}-${undefinedState}-open`, true);
                    localStorage.setItem(`level-${undefinedState}-${level_2.replace(/\s/g, '_')}-open`, true);
                }

                /*
                // Обработка статуса локаций и отображение в "Объекты"
                var newStatusCountsFromStorage = JSON.parse(localStorage.getItem('newStatusCounts'));
                var level3Split = localStorage.getItem('selectedLevel3').split(',');
                if (level3Split.includes(level_3)) {
                    if (newStatusCountsFromStorage && newStatusCountsFromStorage[level_3]) {
                        if (newStatusCountsFromStorage[level_3].noConnection > 0) {
                            nestedSpan.classList.add('branch-active');
                            nestedSpan.style.backgroundImage = 'linear-gradient(to left, #F44336, #ff0000)';
                        } else if (newStatusCountsFromStorage[level_3].intermediate > 0) {
                            nestedSpan.classList.add('branch-active');
                            nestedSpan.style.backgroundImage = 'linear-gradient(to left, #FFC107, #ff8d00)';
                        } else {
                            nestedSpan.classList.add('ok');
                        }
                    } else if (newStatusCountsFromStorage === 0 || newStatusCountsFromStorage === null || newStatusCountsFromStorage === '') {
                        nestedSpan.classList.add('branch-active');
                    }
                }
                
                console.log(newStatusCountsFromStorage);
                */

                if (localStorage.getItem(`level-${level_1}-${level_2}-open`)) {
                    locationMap[level_1 + level_2].querySelector('.nested').classList.add('tree-active');
                    locationMap[level_1 + level_2].querySelector('.caret').classList.add('caret-down');
                }

                // Загрузка состояния открытия/закрытия вложенных списков
                loadFolderState(locationMap, level_1, level_2);

                // Добавляем обработчик события для элементов третьего уровня
                nestedSpan.addEventListener("click", function(event) {
                    handleLevel3Click(event, level_3, locationMap, level_1, level_2);
                });

                var level2Element = locationMap[level_1 + level_2].querySelector('.caret.level-2');
                if (level2Element) {
                    level2Element.style.setProperty('--level2-count', ++level2Count[level_1 + level_2]);
                    level2Element.style.height = level2Count[level_1 + level_2] * 31 + 'px';
                }

                locationMap[level_1 + level_2].querySelector('.nested').appendChild(nestedLi);
            });

            var container = document.querySelector('.location-tree');
            container.appendChild(ul);

	       // Устанавливаем значение по умолчанию для первого и второго уровней
            var firstLevel1 = Object.keys(locationMap)[0];
            var firstLevel2 = Object.keys(locationMap)[1].slice(firstLevel1.length);

            if (!localStorage.getItem(`level-${firstLevel1.replace(/\s/g, '_')}-${firstLevel2.replace(/\s/g, '_')}-open`)) {
                localStorage.setItem(`level-${firstLevel1.replace(/\s/g, '_')}-${firstLevel2.replace(/\s/g, '_')}-open`, true);
                console.log(`Сохранен ключ: level-${firstLevel1.replace(/\s/g, '_')}-${firstLevel2.replace(/\s/g, '_')}-open, значение: true`);
            }

            // Добавление объектов на форму добавления устройств
            selectObjectLocationForAdd(data);
            // Добавление объектов на форму изменения и удаления устройств
            selectObjectLocationForChangeOrDelete(data);
            // Добавление объектов на форму измения устройства
            selectObjectLocationForChange(data);
        }

        function loadFolderState(locationMap, level_1, level_2) {
            var level1Element = locationMap[level_1] && locationMap[level_1].querySelector('.caret.level-1');
            var level2Element = locationMap[level_1 + level_2] && locationMap[level_1 + level_2].querySelector('.caret.level-2');

            // Проверяем наличие ключей в localStorage
            if (localStorage.getItem(`level-${level_1.replace(/\s/g, '_')}-undefined-open`) !== null) {
                var isLevel1Open = localStorage.getItem(`level-${level_1.replace(/\s/g, '_')}-undefined-open`) === 'true';
                console.log(isLevel1Open);
                if (level1Element) {
                    level1Element.classList.toggle('caret-down', isLevel1Open);
                    level1Element.parentElement.querySelector('.nested').classList.toggle('tree-active', isLevel1Open);
                }
            }

            if (localStorage.getItem(`level-undefined-${level_2.replace(/\s/g, '_')}-open`) !== null) {
                var isLevel2Open = localStorage.getItem(`level-undefined-${level_2.replace(/\s/g, '_')}-open`) === 'true';
                console.log(isLevel2Open);
                if (level2Element) {
                    level2Element.classList.toggle('caret-down', isLevel2Open);
                    level2Element.parentElement.querySelector('.nested').classList.toggle('tree-active', isLevel2Open);
                }
            }
        }

        function handleLevel3Click(event, level_3, locationMap, level_1, level_2) {
            sendFetchRequest(level_3);

            var allLevel3Spans = document.querySelectorAll('.caret.level-3');
            allLevel3Spans.forEach(function(span) {
                span.classList.remove('branch-active');

                // Чтобы избавиться от красного бекграунда после нажатия
                // span.style.backgroundImage = '';
            });
            event.target.classList.toggle("branch-active");

            localStorage.setItem('selectedLevel3', level_3);

            // Очистка данных статуса из main.html
            localStorage.removeItem('newStatusCounts');

            // Находим ближайший элемент второго уровня
            var currentElement = event.target;
            while (currentElement && !currentElement.classList.contains('level-2')) {
                currentElement = currentElement.parentElement;
            }
        }

        var container = document.querySelector('.location-tree');

        container.addEventListener("click", function(event) {
            if (event.target && event.target.classList.contains('caret')) {
                var currentElement = event.target;
                var level1 = currentElement.classList.contains('level-1');
                var level2 = currentElement.classList.contains('level-2');

                currentElement.parentElement.querySelector(".nested").classList.toggle("tree-active");
                currentElement.classList.toggle("caret-down");

                // Сохраняем состояние открытия/закрытия вложенных списков в localStorage
                saveFolderState(currentElement, level1, level2);
            }
        });

        function saveFolderState(currentElement, level1, level2) {
            if (level1 || level2) {
                console.log(currentElement.textContent);
                var key = `level-${level1 ? currentElement.textContent.replace(/\s/g, '_') : currentElement.dataset.level1}-${level2 ? currentElement.textContent.replace(/\s/g, '_') : currentElement.dataset.level2}-open`;
                localStorage.setItem(key, currentElement.classList.contains('caret-down'));
                console.log(`Сохранен ключ: ${key}, значение: ${currentElement.classList.contains('caret-down')}`);
            }
        }

        buildLocationTree(filteredJSON);
    })
    .catch(error => console.error('Error reading the data:', error));
}
window.onload = locationTreeData();

// По нажатию на устройство в объекте, запись устройства в localStorage и вызов readFile
function sendFetchRequest(level_3) {
    console.log(level_3);

    fetch(host + '/IOT_Devices/get-reference-table=' + level_3)
    .then(response => response.json())
    .then(json => {
        console.log(json);

        sourceNameHistory[1] = level_3;
        localStorage.setItem('sourceNameHistory', JSON.stringify(sourceNameHistory));
        console.log(sourceNameHistory[1]);

        readFile(level_3);
    })
}

// Обертка для передачи параметра из localStorage в readFile
function readFileWrapper() {
    // console.log(sourceNameHistory);

    const keys = Object.keys(sourceNameHistory);
    const lastKey = keys[keys.length - 1];
    const sourceName = sourceNameHistory[lastKey];
    readFile(sourceName);
}
setInterval(readFileWrapper, 10000);

// Заполнение и обновление карт данными из БД
function readFile(sourceName) {
    fetch(host + '/IOT_Devices/update-cards-data=' + sourceName)
    .then(response => response.json())
    .then(json => {
        /*
        // Здесь идет проверка на дулирующиеся строки. Если массив, то его 1 номер, а если строка, то просто переменная
        var dataHumidity, dataLinkquality, dataPowerOffCount, dataPressure, dataTemperature, dataVoltage, dataBattery, dataSourceName;

        Array.isArray(json.property_1) ? dataBattery = json.property_1[0] : dataBattery = json.property_1;
        Array.isArray(json.property_2) ? dataHumidity = json.property_2[0] : dataHumidity = json.property_2;
        Array.isArray(json.property_3) ? dataLinkquality = json.property_3[0] : dataLinkquality = json.property_3;
        Array.isArray(json.property_4) ? dataPowerOffCount = json.property_4[0] : dataPowerOffCount = json.property_4;
        Array.isArray(json.property_5) ? dataPressure = json.property_5[0] : dataPressure = json.property_5;
        Array.isArray(json.property_6) ? dataTemperature = json.property_6[0] : dataTemperature = json.property_6;
        Array.isArray(json.property_7) ? dataVoltage = json.property_7[0] : dataVoltage = json.property_7;

        console.log(json);

        var optionsValue = document.getElementsByClassName("options_value");

        optionsValue[0].innerHTML = dataHumidity;
        optionsValue[1].innerHTML = dataLinkquality;
        optionsValue[2].innerHTML = dataPowerOffCount;
        optionsValue[3].innerHTML = dataPressure;
        optionsValue[4].innerHTML = dataTemperature;
        optionsValue[5].innerHTML = dataVoltage;
        optionsValue[6].innerHTML = dataBattery;
        */
        console.log(json);

        var filteredJSON = json.source_id.reduce(function(result, current, index) {
            result.push({ 
                "source_id": current, 
                "min_range": json.min_range[index],
                "max_range": json.max_range[index],
                "properties_id": json.properties_id[index],
                "value": json.value[index],
                "datetime": json.datetime[index]
            });

            return result;
        }, []); 

        console.log(filteredJSON);

        var optionsValue = document.getElementsByClassName("options_value");
        var formState = document.getElementsByClassName("form_state");
        var textMuted = document.querySelector(".text-muted");
        var iconColor = document.querySelector(".icon");

        filteredJSON.forEach(property => {
            let sourceId = property.source_id;
            let propertyValue
            let propertiesId = parseFloat(property.properties_id);
            let minRange
            let maxRange
            let currentTime = new Date;
            let dateTime
            if (property.datetime === null) {
                dateTime = 0;
            } else {
                dateTime = parseDateTime(property.datetime);
            }

            if (sourceId.includes("AqaraSensor")) {
                document.querySelector("#type_id_1").style.display = "grid";
                document.querySelector("#type_id_4").style.display = "none";

                propertyValue = parseFloat(property.value);
                minRange = parseFloat(property.min_range);
                maxRange = parseFloat(property.max_range);

                switch (propertiesId) {
                    case 1: 
                        optionsValue[propertiesId + 5].innerHTML = propertyValue;
                        break;
                    case 2: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                    case 3: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                    case 4: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                    case 5: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                    case 6: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                    case 7: 
                        optionsValue[propertiesId - 2].innerHTML = propertyValue;
                        break;
                }
            } else if (sourceId.includes("AqaraWaterLeakSensor")) {
                document.querySelector("#type_id_1").style.display = "none";
                document.querySelector("#type_id_4").style.display = "grid";

                propertyValue = property.value;
                minRange = property.min_range;
                maxRange = property.max_range;

                switch (propertiesId) {
                    case 19: 
                        if (propertyValue === "false") {
                            propertyValue = "Нет";
                        } else if (propertyValue === "true") {
                            propertyValue = "Да";
                        }
                        optionsValue[propertiesId - (17 - 7)].innerHTML = propertyValue;
                        break;
                    case 20: 
                        optionsValue[propertiesId - (19 - 7)].innerHTML = propertyValue;
                        break;
                    case 22: 
                        if (propertyValue === "false") {
                            propertyValue = "Нет утечки";
                        } else if (propertyValue === "true") {
                            propertyValue = "Утечка!";
                        }
                        optionsValue[propertiesId - (22 - 7)].innerHTML = propertyValue;
                        break;
                }
            }
        
            // Расчет разницы во времени в минутах
            const timeDiffInMinutes = Math.abs((currentTime - dateTime) / (1000 * 60));
            // Отладка значений времени
            //console.log(`datetime: ${dateTime}, currentTime: ${currentTime}, diff: ${timeDiffInMinutes}`);

            console.log(property);
            console.log(minRange);
            console.log(maxRange);
            console.log(propertyValue);

            // Проверка на кликнутую карточку
            const formStateElement = formState[propertiesId - 2];
            if (formStateElement && formStateElement.classList.contains('clicked')) {
                return;
            }

            // Обновляем счетчики статусов для этой локации
            if (((minRange && maxRange) !== null) && ((sourceId.includes("AqaraSensor")))) {
                /*
                if (timeDiffInMinutes > 30) {
                    console.log('noConnection');
                    formState[propertiesId - 2].classList.add('status-no-connection');
                }
                */

                if (propertyValue < minRange || propertyValue > maxRange) {
                    console.log('intermediate');
                    formState[propertiesId - 2].classList.add('status-intermediate');
                } else if (propertyValue > minRange && propertyValue < maxRange) {
                    formState[propertiesId - 2].classList.remove('status-intermediate');
                    console.log('ok');
                }
            } else if (((minRange && maxRange) !== null) && sourceId.includes("AqaraWaterLeakSensor")) {
                if (propertyValue === "Утечка!") {
                    console.log('noConnection');
                    formState[propertiesId - (22 - 7)].classList.add('status-no-connection');
                } else if (propertyValue === "Нет утечки") {
                    formState[propertiesId - (22 - 7)].classList.remove('status-no-connection');
                    console.log('ok');
                } 
            }
        });

        // Функция форматирующая datetime
        function parseDateTime(dateTimeString) {
            // Извлечение числового значения из строки
            const numericValue = parseInt(dateTimeString.replace('/Date(', '').replace(')/', ''), 10);

            // Создание объекта Date на основе числового значения
            return new Date(numericValue);
        }
    })
    .catch(error => console.error('Error reading the data:', error));
}
window.onload = readFileWrapper();

const chooseOptionsFormSelector = document.querySelector('.choose-options-form');
const changeOrDeleteMessageSelector = document.querySelector('#change-or-delete-message');
const addDeviceFormSelector = document.querySelector('.add-device-form');
const changeOrDeleteFormSelector = document.querySelector('.change-or-delete-form');
const successMessage = document.querySelector('#success-message');
const successMessageChange = document.querySelector('#success-message-change-device');
const successMessageDeleteSelector = document.querySelector('#success-message-delete-device');
const changeDeviceFormSelector = document.querySelector('.change-device-form');
const changeOrDeleteMessage = document.querySelector('#change-or-delete-message');

function openNewObjectButtonAdd() {
    const newObjectButton = document.querySelector('#new-object-button-add');
    const chooseObjectButton = document.querySelector('#choose-object-button-add');

    newObjectButton.style.display = 'block';
    chooseObjectButton.style.display = 'none';

    // Отобразить input
    const itemListString = document.querySelector('.item-list-string-add');
    const itemListLevel1 = document.querySelector('.item-list-level1-add');
    const itemListLevel2 = document.querySelector('.item-list-level2-add');

    itemListString.style.display = 'flex';
    itemListLevel1.style.display = 'block';
    itemListLevel2.style.display = 'none';

    const inputGroup = document.querySelector('.input-group-add');

    inputGroup.style.display = 'none';
}

function openChooseObjectButtonAdd() {
    const newObjectButton = document.querySelector('#new-object-button-add');
    const chooseObjectButton = document.querySelector('#choose-object-button-add');

    chooseObjectButton.style.display = 'block';
    newObjectButton.style.display = 'none';

    const itemListString = document.querySelector('.item-list-string-add');
    const itemListLevel1 = document.querySelector('.item-list-level1-add');
    const itemListLevel2 = document.querySelector('.item-list-level2-add');

    itemListString.style.display = 'none';
    itemListLevel1.style.display = 'none';
    itemListLevel2.style.display = 'none';

    const inputGroup = document.querySelector('.input-group-add');

    inputGroup.style.display = 'flex';
}

function openNewObjectButtonChange() {
    const newObjectButton = document.querySelector('#new-object-button-change');
    const chooseObjectButton = document.querySelector('#choose-object-button-change');

    newObjectButton.style.display = 'block';
    chooseObjectButton.style.display = 'none';

    // Отобразить input
    const itemListString = document.querySelector('.item-list-string-change');
    const itemListLevel1 = document.querySelector('.item-list-level1-change');
    const itemListLevel2 = document.querySelector('.item-list-level2-change');

    itemListString.style.display = 'flex';
    itemListLevel1.style.display = 'block';
    itemListLevel2.style.display = 'none';

    const inputGroup = document.querySelector('.input-group-change');

    inputGroup.style.display = 'none';
}

function openChooseObjectButtonChange() {
    const newObjectButton = document.querySelector('#new-object-button-change');
    const chooseObjectButton = document.querySelector('#choose-object-button-change');

    chooseObjectButton.style.display = 'block';
    newObjectButton.style.display = 'none';

    const itemListString = document.querySelector('.item-list-string-change');
    const itemListLevel1 = document.querySelector('.item-list-level1-change');
    const itemListLevel2 = document.querySelector('.item-list-level2-change');

    itemListString.style.display = 'none';
    itemListLevel1.style.display = 'none';
    itemListLevel2.style.display = 'none';

    const inputGroup = document.querySelector('.input-group-change');

    inputGroup.style.display = 'flex';
}

function openChooseOptionsForm() {
    if (chooseOptionsFormSelector) {
        chooseOptionsFormSelector.classList.add('open');
    }

    document.querySelector('.overlay').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeChooseOptionsForm() {
    document.querySelector('.overlay').style.display = 'none';
    document.body.classList.remove('modal-open');

    if (chooseOptionsFormSelector) {
        chooseOptionsFormSelector.classList.remove('open');
    }
}

function closeChooseOptionsFormChange() {
    document.querySelector('.overlay').style.display = 'none';
    // document.body.classList.remove('modal-open');

    if (changeOrDeleteMessageSelector) {
        changeOrDeleteMessageSelector.classList.remove('open');
    }
}

function closeChooseOptionsFormDelete() {
    document.querySelector('.overlay').style.zIndex = '7';
    // document.body.classList.remove('modal-open');

    if (changeOrDeleteMessageSelector) {
        changeOrDeleteMessageSelector.classList.remove('open');
    }
}

function openAddDeviceForm() {
    if (addDeviceFormSelector) {
        addDeviceFormSelector.classList.add('open');
    }

    chooseOptionsFormSelector.classList.remove('open');
}

function closeAddDeviceForm() {
    if (addDeviceFormSelector) {
        addDeviceFormSelector.classList.remove('open');
    }

    chooseOptionsFormSelector.classList.add('open');
}

function closeSuccessMessage() {
    successMessage.classList.remove('fade-in'); // Удаляем класс появления
    successMessage.classList.add('fade-out'); // Добавляем класс скрытия

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        closeChooseOptionsForm();
        successMessage.style.display = 'none';
        successMessage.classList.remove('fade-out'); // Сбрасываем класс скрытия
    }, 500); // Длительность анимации скрытия
}

function closeSuccessMessageChange() {
    successMessageChange.classList.remove('fade-in'); // Удаляем класс появления
    successMessageChange.classList.add('fade-out'); // Добавляем класс скрытия

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        // closeChooseOptionsFormChange();
        successMessageChange.style.display = 'none';
        successMessageChange.classList.remove('fade-out'); // Сбрасываем класс скрытия
    }, 500); // Длительность анимации скрытия
}

function closeSuccessMessageDelete() {
    successMessageDeleteSelector.classList.remove('fade-in'); // Удаляем класс появления
    successMessageDeleteSelector.classList.add('fade-out'); // Добавляем класс скрытия

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        closeChooseOptionsFormDelete();
        successMessageDeleteSelector.style.display = 'none';
        successMessageDeleteSelector.classList.remove('fade-out'); // Сбрасываем класс скрытия
    }, 500); // Длительность анимации скрытия
}

function successMessageAddDevice() {
    openAddDeviceForm();

    successMessage.style.display = 'none';
}

function openChangeOrDeleteForm() {
    if (changeOrDeleteFormSelector) {
        changeOrDeleteFormSelector.classList.add('open');
    }

    chooseOptionsFormSelector.classList.remove('open');
}

function closeChangeOrDeleteForm() {
    if (changeOrDeleteFormSelector) {
        changeOrDeleteFormSelector.classList.remove('open');
    }

    chooseOptionsFormSelector.classList.add('open');
}

function openChangeOrDeleteMessage(level_1, level_2, level_3) {
    if (changeOrDeleteMessage) {
        changeOrDeleteMessage.classList.add('open');
    }

    const overlay = document.querySelector('.overlay');
    overlay.style.zIndex = '8';

    const articleElement = changeOrDeleteMessage.querySelector('.article');
    articleElement.textContent = level_3;
}

function closeChangeOrDeleteMessage() {
    if (changeOrDeleteMessage) {
        changeOrDeleteMessage.classList.remove('open');
    }

    const overlay = document.querySelector('.overlay');
    overlay.style.zIndex = '7';
}

// Выбрать объект локации из списка (Форма добавления)
function selectObjectLocationForAdd(data) {
    const ulLevel1Add = document.querySelector('.item-list-level1-add');
    const ulLevel2Add = document.querySelector('.item-list-level2-add');
    var locationMapLevel1 = new Set();
    var locationMapLevel2 = new Set();

    data.forEach(function(item) {
        var locationSplit = item.location_description.split(' - ');
        var level1Elements = locationSplit[0];
        var level2Elements = locationSplit[1];

        if (!locationMapLevel1.has(level1Elements)) {
            locationMapLevel1.add(level1Elements);

            const li = document.createElement('li');
            li.textContent = level1Elements;
            ulLevel1Add.appendChild(li);
        } 

        if (!locationMapLevel2.has(level2Elements)) {
            locationMapLevel2.add(level2Elements);

            const li = document.createElement('li');
            li.textContent = level2Elements;
            ulLevel2Add.appendChild(li);
        }
    });
    
    const objectStringLevel1Add = document.querySelector('#object-string-level1-add');
    const objectStringLevel2Add = document.querySelector('#object-string-level2-add');
    const listItemsLevel1Add = document.querySelectorAll('.item-list-level1-add li');
    const listItemsLevel2Add = document.querySelectorAll('.item-list-level2-add li');

    listItemsLevel1Add.forEach(item => {
        item.addEventListener('click', () => {
            objectStringLevel1Add.textContent = `${item.textContent} >`;
            ulLevel1Add.style.display = 'none';
            ulLevel2Add.style.display = 'block';
        });
    });

    listItemsLevel2Add.forEach(item => {
        item.addEventListener('click', () => {
            objectStringLevel2Add.textContent = item.textContent;
        });
    });

    objectStringLevel1Add.addEventListener('click', () => {
        if (ulLevel2Add.style.display === 'block') {
            objectStringLevel2Add.textContent = '';
            ulLevel1Add.style.display = 'block';
            ulLevel2Add.style.display = 'none';
        }
    });

    const imageBoxes = document.querySelectorAll('.image-box-add');
    imageBoxes.forEach(item => {
        item.addEventListener('click', () => {
            // Удаляем класс 'selected' у всех элементов
            imageBoxes.forEach(box => {
                box.classList.remove('selected');
            });

            // Добавляем класс 'selected' только к нажатому элементу
            item.classList.add('selected');
        });
    });

    document.getElementById('add-device-button').addEventListener('click', () => {
        addDeviceForm();
    });
}

// Форма для добавления новых устройств
function addDeviceForm() {
    const deviceId = document.getElementById('device-id-add').value;
    const deviceName = document.getElementById('device-name-add').value;
    const level1 = document.getElementById('object-string-level1-add').textContent.replace(' >', '');
    const level2 = document.getElementById('object-string-level2-add').textContent;
    const level1New = document.getElementById('object-level1-new-add').value;
    const level2New = document.getElementById('object-level2-new-add').value;
    const cor1 = document.getElementById('device-cor-1-add').value;
    const cor2 = document.getElementById('device-cor-2-add').value;
    const imageBox = document.querySelector('.image-box-add.selected');
    const imageValue = imageBox ? imageBox.getAttribute('value') : null;
    let locationString
    let level2Value

    const newObjectButton = document.getElementById('new-object-button-add');
    const chooseObjectButton = document.getElementById('choose-object-button-add');

    if (newObjectButton.style.display != 'none') {
        locationString = `${level1} - ${level2}`;
        level2Value = level2;
    } else if (chooseObjectButton.style.display != 'none') {
        locationString = `${level1New} - ${level2New}`;
        level2Value = 0;
    }

    console.log(level1New);
    console.log(level2New);
    console.log(locationString);

    const data = {
        deviceId,
        deviceName,
        location: locationString,
        cor1,
        cor2,
        imageValue
    };

    resetElementColors();

    const allFieldsFilled = Object.values(data).every(value => value !== null && value !== undefined && value !== '');

    if (allFieldsFilled && (level2Value !== null && level2Value !== undefined && level2Value !== '')) {
        // Отправляем данные на сервер
        fetch(host + '/add-device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            displaySuccessMessage();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        console.log('говно че');

        if (data.deviceId === null || data.deviceId === undefined || data.deviceId === '') {
            const element = document.getElementById('device-id-add-p');
            changeElementColor(element);
        } 
        if (data.deviceName === null || data.deviceName === undefined || data.deviceName === '') {
            const element = document.getElementById('device-name-add-p');
            changeElementColor(element);
        } 
        if ((level2 === null || level2 === undefined || level2 === '') && newObjectButton.style.display != 'none') {
            const element = document.getElementById('location-add-p');
            changeElementColor(element);
        } 
        if ((level1New === null || level1New === undefined || level1New === '') && chooseObjectButton.style.display != 'none') {
            const element = document.getElementById('object-level1-new-add-p');
            changeElementColor(element);
        } 
        if ((level2New === null || level2New === undefined || level2New === '') && chooseObjectButton.style.display != 'none') {
            const element = document.getElementById('object-level2-new-add-p');
            changeElementColor(element);
        }
        if (cor1 === null || cor1 === undefined || cor1 === '') {
            const element = document.getElementById('device-cor-1-add-p');
            changeElementColor(element);
        } 
        if (cor2 === null || cor2 === undefined || cor2 === '') {
            const element = document.getElementById('device-cor-2-add-p');
            changeElementColor(element);
        } 
        if (data.imageValue === null || data.imageValue === undefined || data.imageValue === '') {
            const element = document.getElementById('image-grid-add-p');
            changeElementColor(element);
        }
    }
}

// Выбрать объект локации из списка (Форма добавления)
function selectObjectLocationForChange(data) {
    const ulLevel1Change = document.querySelector('.item-list-level1-change');
    const ulLevel2Change = document.querySelector('.item-list-level2-change');
    var locationMapLevel1 = new Set();
    var locationMapLevel2 = new Set();

    data.forEach(function(item) {
        var locationSplit = item.location_description.split(' - ');
        var level1Elements = locationSplit[0];
        var level2Elements = locationSplit[1];

        if (!locationMapLevel1.has(level1Elements)) {
            locationMapLevel1.add(level1Elements);

            const li = document.createElement('li');
            li.textContent = level1Elements;
            ulLevel1Change.appendChild(li);
        } 

        if (!locationMapLevel2.has(level2Elements)) {
            locationMapLevel2.add(level2Elements);

            const li = document.createElement('li');
            li.textContent = level2Elements;
            ulLevel2Change.appendChild(li);
        }
    });
    
    const objectStringLevel1Change = document.querySelector('#object-string-level1-change');
    const objectStringLevel2Change = document.querySelector('#object-string-level2-change');
    const listItemsLevel1Change = document.querySelectorAll('.item-list-level1-change li');
    const listItemsLevel2Change = document.querySelectorAll('.item-list-level2-change li');

    listItemsLevel1Change.forEach(item => {
        item.addEventListener('click', () => {
            objectStringLevel1Change.textContent = `${item.textContent} >`;
            ulLevel1Change.style.display = 'none';
            ulLevel2Change.style.display = 'block';
        });
    });

    listItemsLevel2Change.forEach(item => {
        item.addEventListener('click', () => {
            objectStringLevel2Change.textContent = item.textContent;
        });
    });

    objectStringLevel1Change.addEventListener('click', () => {
        if (ulLevel2Change.style.display === 'block') {
            objectStringLevel2Change.textContent = '';
            ulLevel1Change.style.display = 'block';
            ulLevel2Change.style.display = 'none';
        }
    });

    const imageBoxes = document.querySelectorAll('.image-box-change');
    imageBoxes.forEach(item => {
        item.addEventListener('click', () => {
            // Удаляем класс 'selected' у всех элементов
            imageBoxes.forEach(box => {
                box.classList.remove('selected');
            });

            // Добавляем класс 'selected' только к нажатому элементу
            item.classList.add('selected');
        });
    });

    document.getElementById('change-device-button').addEventListener('click', () => {
        changeDeviceForm();
    });
}

// Форма для добавления новых устройств
function changeDeviceForm() {
    const deviceId = document.getElementById('device-id-change').value;
    const deviceName = document.getElementById('device-name-change').value;
    const level1 = document.getElementById('object-string-level1-change').textContent.replace(' >', '');
    const level2 = document.getElementById('object-string-level2-change').textContent;
    const level1New = document.getElementById('object-level1-new-change').value;
    const level2New = document.getElementById('object-level2-new-change').value;
    const cor1 = document.getElementById('device-cor-1-change').value;
    const cor2 = document.getElementById('device-cor-2-change').value;
    const imageBox = document.querySelector('.image-box-change.selected');
    const imageValue = imageBox ? imageBox.getAttribute('value') : null;
    let locationString
    let level2Value

    const newObjectButton = document.getElementById('new-object-button-change');
    const chooseObjectButton = document.getElementById('choose-object-button-change');

    if (newObjectButton.style.display != 'none') {
        locationString = `${level1} - ${level2}`;
        level2Value = level2;
    } else if (chooseObjectButton.style.display != 'none') {
        locationString = `${level1New} - ${level2New}`;
        level2Value = 0;
    }

    const data = {
        deviceId,
        deviceName,
        location: locationString,
        cor1,
        cor2,
        imageValue
    };

    resetElementColors();

    const allFieldsFilled = Object.values(data).every(value => value !== null && value !== undefined && value !== '');

    if (allFieldsFilled && (level2Value !== null && level2Value !== undefined && level2Value !== '')) {
        // Отправляем данные на сервер
        fetch(host + '/change-device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            displaySuccessMessageChange();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    } else {
        console.log('говно че');

        if (data.deviceId === null || data.deviceId === undefined || data.deviceId === '') {
            const element = document.getElementById('device-id-change-p');
            changeElementColor(element);
        } 
        if (data.deviceName === null || data.deviceName === undefined || data.deviceName === '') {
            const element = document.getElementById('device-name-change-p');
            changeElementColor(element);
        } 
        if ((level2 === null || level2 === undefined || level2 === '') && newObjectButton.style.display != 'none') {
            const element = document.getElementById('location-change-p');
            changeElementColor(element);
        } 
        if ((level1New === null || level1New === undefined || level1New === '') && chooseObjectButton.style.display != 'none') {
            const element = document.getElementById('object-level1-new-change-p');
            changeElementColor(element);
        } 
        if ((level2New === null || level2New === undefined || level2New === '') && chooseObjectButton.style.display != 'none') {
            const element = document.getElementById('object-level2-new-change-p');
            changeElementColor(element);
        }
        if (cor1 === null || cor1 === undefined || cor1 === '') {
            const element = document.getElementById('device-cor-1-change-p');
            changeElementColor(element);
        } 
        if (cor2 === null || cor2 === undefined || cor2 === '') {
            const element = document.getElementById('device-cor-2-change-p');
            changeElementColor(element);
        } 
        if (data.imageValue === null || data.imageValue === undefined || data.imageValue === '') {
            const element = document.getElementById('image-grid-change-p');
            changeElementColor(element);
        }
    }
}

function changeElementColor(element) {
    element.style.color = 'red';
    element.textContent = element.textContent + "*";
}

function resetElementColors() {
    const elements = [
        document.getElementById('device-id-add-p'),
        document.getElementById('device-name-add-p'),
        document.getElementById('location-add-p'),
        document.getElementById('device-cor-1-add-p'),
        document.getElementById('device-cor-2-add-p'),
        document.getElementById('image-grid-add-p'),
        document.getElementById('device-id-change-p'),
        document.getElementById('device-name-change-p'),
        document.getElementById('location-change-p'),
        document.getElementById('device-cor-1-change-p'),
        document.getElementById('device-cor-2-change-p'),
        document.getElementById('image-grid-change-p')
    ];
    
    elements.forEach(element => {
        if (element) {
            element.style.color = 'black'; // Сброс цвета
            element.textContent = element.textContent.replace('*', ''); // Удаление звездочки
        }
    });
}

function displaySuccessMessage() {
    const successMessageElement = document.getElementById('success-message');
    const deviceForm = document.querySelector('.add-device-form');

    successMessageElement.style.display = 'block'; // Показываем сообщение
    if (deviceForm) {
        deviceForm.classList.remove('open');
    }

    successMessageElement.classList.remove('fade-out'); // Удаляем класс скрытия
    successMessageElement.classList.add('fade-in'); // Добавляем класс появления
    successMessageElement.style.display = 'block'; // Показываем сообщение
}

function displaySuccessMessageChange() {
    const successMessageElement = document.getElementById('success-message-change-device');
    const deviceForm = document.querySelector('.change-device-form');

    successMessageElement.style.display = 'block'; // Показываем сообщение
    if (deviceForm) {
        deviceForm.classList.remove('open');
    }

    successMessageElement.classList.remove('fade-out'); // Удаляем класс скрытия
    successMessageElement.classList.add('fade-in'); // Добавляем класс появления
    successMessageElement.style.display = 'block'; // Показываем сообщение
}

function displaySuccessMessageDelete() {
    const successMessageElement = document.getElementById('success-message-delete-device');
    const deviceForm = document.querySelector('.change-device-form');

    successMessageElement.style.display = 'block'; // Показываем сообщение
    if (deviceForm) {
        deviceForm.classList.remove('open');
    }

    successMessageElement.classList.remove('fade-out'); // Удаляем класс скрытия
    successMessageElement.classList.add('fade-in'); // Добавляем класс появления
    successMessageElement.style.display = 'block'; // Показываем сообщение
}

function selectObjectLocationForChangeOrDelete(data) {
    const ul = document.createElement('ul');
    ul.classList.add('enclosed-l1');
    const objectList = document.querySelector('.object-list');

    const locationMap = {};
    const level3Count = {};

    data.forEach(function(item) {
        const locationSplit = item.location_description.split(' - ');
        const level_1 = locationSplit[0];
        const level_2 = locationSplit[1];
        const level_3 = item.source_id;

        // Уровень 1
        if (!locationMap[level_1]) {
            locationMap[level_1] = document.createElement('li');
            locationMap[level_1].classList.add('li-level-1');

            const span = document.createElement('span');
            span.classList.add('object-level-1');
            span.textContent = level_1;
            span.addEventListener('click', function() {
                const nestedUl = locationMap[level_1].querySelector('.enclosed-l2');
                toggleVisibility(nestedUl);
                span.classList.toggle('expanded'); // Добавляем класс для обозначения состояния
            });
            locationMap[level_1].appendChild(span);

            const nestedUl = document.createElement('ul');
            nestedUl.classList.add('enclosed-l2', 'hidden'); // Добавляем класс hidden
            locationMap[level_1].appendChild(nestedUl);

            ul.appendChild(locationMap[level_1]);
        }

        // Уровень 2
        if (!locationMap[level_1 + level_2]) {
            locationMap[level_1 + level_2] = document.createElement('li');

            const span = document.createElement('span');
            span.classList.add('object-level-2');
            span.textContent = level_2;
            span.addEventListener('click', function(event) {
                event.stopPropagation(); // Останавливаем всплытие события
                const nestedUl = locationMap[level_1 + level_2].querySelector('.enclosed-l3');
                toggleVisibility(nestedUl);
                span.classList.toggle('expanded'); // Добавляем класс для обозначения состояния
            });
            locationMap[level_1 + level_2].appendChild(span);

            const nestedUl = document.createElement('ul');
            nestedUl.classList.add('enclosed-l3', 'hidden'); // Добавляем класс hidden
            locationMap[level_1 + level_2].appendChild(nestedUl);

            locationMap[level_1].querySelector('.enclosed-l2').appendChild(locationMap[level_1 + level_2]);
        }

        // Уровень 3 (устройства)
        const nestedLi = document.createElement('li');
        const nestedSpan = document.createElement('span');

        if (!level3Count[level_3]) {
            nestedSpan.classList.add('object-level-3');
            nestedSpan.textContent = level_3;
            nestedLi.appendChild(nestedSpan);

            level3Count[level_3] = level_3;
        } else {
            return;
        }

        nestedSpan.addEventListener("click", function(event) {
            objectListLevel3Click(event, level_3, locationMap, level_1, level_2);
        });

        locationMap[level_1 + level_2].querySelector('.enclosed-l3').appendChild(nestedLi);
    });
    objectList.appendChild(ul);
}

function toggleVisibility(ul) {
    ul.classList.toggle('hidden');
}

function objectListLevel3Click(event, level_3, locationMap, level_1, level_2) {
    var allLevel3Spans = document.querySelectorAll('.object-level-3');
    allLevel3Spans.forEach(function(span) {
        span.classList.remove('device-active');
    });
    event.target.classList.toggle("device-active");

    openChangeOrDeleteMessage(level_1, level_2, level_3);

    // Находим ближайший элемент второго уровня
    var currentElement = event.target;
    while (currentElement && !currentElement.classList.contains('object-level-3')) {
        currentElement = currentElement.parentElement;
    }
}

function openChangeDeviceForm() {
    const deviceName = document.querySelector("#change-or-delete-message .article");
    const textDataDevice = deviceName.textContent;

    // Отправляем данные на сервер
    fetch(host + '/get-data-to-fill-fields', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(textDataDevice)
    })
    .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);

        const deviceId = document.querySelector('#device-id-change');
        const deviceName = document.querySelector('#device-name-change');
        const objectLevel1 = document.querySelector('#object-string-level1-change');
        const objectLevel2 = document.querySelector('#object-string-level2-change');
        const objectLevel1New = document.querySelector('#object-level1-new-change');
        const objectLevel2New = document.querySelector('#object-level2-new-change');
        const cor1 = document.querySelector('#device-cor-1-change');
        const cor2 = document.querySelector('#device-cor-2-change');
        const imageBoxes = document.querySelectorAll('.image-box-change');

        // Должен парсить через powershell файлик  .conf
        //deviceId.textContent = data. ;
        deviceName.value = data.source_id;
        objectLevel1.textContent = (data.location_description).split(" - ")[0] + " >";
        objectLevel2.textContent = (data.location_description).split(" - ")[1];
        objectLevel1New.value = (data.location_description).split(" - ")[0];
        objectLevel2New.value = (data.location_description).split(" - ")[1];
        cor1.value = data.location_cor_1;
        cor2.value = data.location_cor_2;

        imageBoxes.forEach(item => {
            if (data.type_id.toString() === item.getAttribute('value')) {
                item.classList.add('selected');
            }
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });

    if (changeDeviceFormSelector) {
        changeDeviceFormSelector.classList.add('open');
    }
}

function closeChangeDeviceForm() {
    if (changeDeviceFormSelector) {
        changeDeviceFormSelector.classList.remove('open');
    }
}


function deleteDevice() {
    const deviceName = document.querySelector("#change-or-delete-message .article");
    const textDataDevice = deviceName.textContent;

    // Отправляем данные на сервер
    fetch(host + '/delete-device', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(textDataDevice)
    })
    .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        displaySuccessMessageDelete();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Отображение данных из БД в виде таблицы
function tableView() {
    document.getElementById("chart_div").style.display = "none";
    document.querySelector(".sensors-table").style.display = "block";

    function clearTable() {
        var table = document.querySelector('.sensors-table').getElementsByTagName('tbody')[0];
        table.innerHTML = '';
    }
    clearTable();

    fetch(host + '/IOT_Devices/table-view')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        var table = document.querySelector('.sensors-table');
        var tbody = document.createElement('tbody');
        tbody.classList.add('slideIn');

        // Создаем объект для хранения уникальных датчиков
        var uniqueSensors = {};
        var uniqueIdAndValue = {};

        // Проходимся по данным и заполняем объект уникальных датчиков
        data.forEach(function(row) {
            console.log(uniqueSensors[row.datasource]);
            if (!uniqueSensors[row.datasource]) {
                uniqueSensors[row.datasource] = {
                    id: row.id,
                    datasource: row.datasource,
                    location_description: row.location_description,
                    values: [],
                    datetime: row.datetime
                };
            }
            
            uniqueSensors[row.datasource].values.push(row.value);

            // Проверка на дублированные строки из БД
            if (uniqueIdAndValue.id === row.id && uniqueIdAndValue.value === row.value) {
                console.log("Опять повторяются, я пошел бухать");
                uniqueSensors[row.datasource].values.pop();
            } else {
                console.log("Славу богу, сегодня трезвый");
            }

            uniqueIdAndValue = {
                id: row.id,
                value: row.value
            };
        });

        // Добавляем строки в таблицу
        Object.values(uniqueSensors).forEach(function(sensor) {
            var row = tbody.insertRow();
            var cell1 = row.insertCell(0); // Название датчика
            var cell2 = row.insertCell(1); // Локация
            var cell3 = row.insertCell(2); // Батарея
            var cell4 = row.insertCell(3); // Уровень сигнала
            var cell5 = row.insertCell(4); // Кол-во отключений
            var cell6 = row.insertCell(5); // Давление
            var cell7 = row.insertCell(6); // Температура
            var cell8 = row.insertCell(7); // Напряжение
            var cell9 = row.insertCell(8); // Влажность
            var cell10 = row.insertCell(9); // Дата/Время

            cell1.textContent = sensor.datasource;
            cell2.textContent = sensor.location_description;
            cell3.textContent = sensor.values[0] || '-'; // Батарея
            cell4.textContent = sensor.values[1] || '-'; // Уровень сигнала
            cell5.textContent = sensor.values[2] || '-'; // Кол-во отключений
            cell6.textContent = sensor.values[3] || '-'; // Давление
            cell7.textContent = sensor.values[4] || '-'; // Температура
            cell8.textContent = sensor.values[5] || '-'; // Напряжение
            cell9.textContent = sensor.values[6] || '-'; // Влажность
            cell10.textContent = sensor.datetime;
        });

        table.appendChild(tbody);
    })
    .catch(error => {
        console.error('Произошла ошибка при получении данных:', error);
    });

    function clearTable() {
        var table = document.querySelector('.sensors-table').getElementsByTagName('tbody')[0];
        table.remove();
    }

    document.getElementById("detailed-view-button").style.display = "block";
    document.getElementById("table-view-button").style.display = "none";
}
// Появление таблицы, вместо графика изменений и наоборот
function detailedView() {
    document.getElementById("chart_div").style.display = "block";
    document.querySelector(".sensors-table").style.display = "none";

    document.getElementById("detailed-view-button").style.display = "none";
    document.getElementById("table-view-button").style.display = "block";
}

/*
const accordionBtns = document.querySelectorAll('.accordion-btn');

// Реализация списка в виде - Accordion buttons 
accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const content = btn.nextElementSibling;
        const plusAndMinus = btn.querySelector(".plus-and-minus");
        if (plusAndMinus.textContent === '-') {
            plusAndMinus.textContent = "+";
        } else {
            plusAndMinus.textContent = "-";
        }

        accordionBtns.forEach(otherBtn => {
            if (otherBtn !== btn) {
                otherBtn.classList.remove('active');
                const plusAndMinus = otherBtn.querySelector(".plus-and-minus");
                plusAndMinus.textContent = "-";
            }
        });
    });
});

window.onload = function() {
    let tabs = document.querySelectorAll('.tab');
    let contentContainer = document.querySelector('.main');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            let url = this.getAttribute('href');

            fetch(url)
                .then(response => response.text())
                .then(data => {
                    let tempElement = document.createElement('div');
                        tempElement.innerHTML = data;
                        let header = tempElement.querySelector('#header');
                        if (header) {
                          header.remove();
                        }
                        contentContainer.innerHTML = tempElement.innerHTML;
                })
                .catch(error => {
                    console.error('Ошибка загрузки страницы:', error);
                });
        });
    });
}
*/

/*
// Отображение нажатых объектов и устройств
document.addEventListener("DOMContentLoaded", function() {
    changeDataButton(3, "ЦОД", "Зал А", "Зал Б", "Зал В", true, true, true);
    changeDataButton(4, "305-ая", "Холодный коридор", "Горячий коридор", "", true, true, false);
    changeDataButton(5, "Серверная тит. 85-01", "Основной зал", "", "", true, false, false);
    changeDataButton(6, "ЛАЗ (Цех связи)", "Основной зал", "", "", true, false, false);
});

function changeDataButton(buttonNum, mainLocText, loc1Text, loc2Text, loc3Text, loc1Disp, loc2Disp, loc3Disp) {
    var button = document.querySelector(".button" + buttonNum);
    var mainLocation = document.querySelector(".main-location");
    var location1 = document.querySelector(".location-1");
    var location2 = document.querySelector(".location-2");
    var location3 = document.querySelector(".location-3");

    function updateContent() {
        mainLocation.textContent = mainLocText;
        location1.textContent = loc1Text;
        location2.textContent = loc2Text;
        location3.textContent = loc3Text;

        console.log(loc1Text);
        console.log(loc2Text);
        console.log(loc3Text);

        location1.style.display = loc1Disp ? "flex" : "none";
        location2.style.display = loc2Disp ? "flex" : "none";
        location3.style.display = loc3Disp ? "flex" : "none";
    }

    button.addEventListener("click", function() {
        updateContent();
    });

    if (button.classList.contains('active')) {
        updateContent();
    }
}
*/


let cards = document.querySelectorAll('.form_state');
let selectedState = 1;

var propertyValue;
var sourceName;

// Отображение ранее сохраненной нажатой card
function displaySavedCardState() {
    var savedState = localStorage.getItem('selectedState') || 1;
    if (savedState) {
        selectedState = parseInt(savedState);

        cards[selectedState - 1].classList.add('clicked');

        cards.forEach(function(card) {
            if (card.classList.contains('clicked')) {
                propertyValue = card.getAttribute('value');

                var keys = Object.keys(sourceNameHistory);
                var lastKey = keys[keys.length - 1];
                sourceName = sourceNameHistory[lastKey];

                console.log('Форма с классом "clicked":', selectedState);
                console.log(propertyValue);
                console.log(sourceName);
            }
        });
    }
}
displaySavedCardState();


var requestValue = localStorage.getItem('requestValue') || '';

cards.forEach(function(card, index) {
    card.addEventListener('click', function(event) {
        cards.forEach(function(c) {
            c.classList.remove('clicked');
            c.classList.remove('status-no-connection');
            c.classList.remove('status-intermediate');
        });
        this.classList.add('clicked');

        selectedState = index + 1;

        localStorage.setItem('selectedState', selectedState);

        propertyValue = this.getAttribute('value');
        var xhr = new XMLHttpRequest();

        var selectedRadioButton = localStorage.getItem('selectedRadioButton');
        var keys = Object.keys(sourceNameHistory);
        var lastKey = keys[keys.length - 1];
        sourceName = sourceNameHistory[lastKey];

        if (localStorage.getItem('selectedRadioButton') === 'all') {
            requestValue = '';
        }

        xhr.open("POST", 'data-property=' + propertyValue + ';' + sourceName + ';' + requestValue, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log("form_state: OK");
            }
        };

        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.send();

        location.reload();
    });
});

function handleRadioButtonChange() {
    var radioButtons = document.querySelectorAll('input[type="radio"]');
    var calendarInputDay = document.querySelector('.calendar input[type="date"]');
    var calendarInputWeek = document.querySelector('.calendar input[type="week"]');
    var calendarInputMonth = document.querySelector('.calendar input[type="month"]');

    var selectedRadioButton = localStorage.getItem('selectedRadioButton') || 'all';

    function radioButtonActive(selectedRadioButton) {
        if (selectedRadioButton === 'day') {
            calendarInputDay.disabled = false;
            calendarInputWeek.disabled = true;
            calendarInputMonth.disabled = true;

            calendarInputWeek.value = '';
            calendarInputMonth.value = '';

            calendarInputDay.style.backgroundColor = "#0080FF";
            calendarInputWeek.style.backgroundColor = "#F4F4F4";
            calendarInputMonth.style.backgroundColor = "#F4F4F4";

            calendarInputDay.style.color = "#FFFFFF";
            calendarInputWeek.style.color = "#333333";
            calendarInputMonth.style.color = "#333333";
        } else if (selectedRadioButton === 'week') {
            calendarInputDay.disabled = true;
            calendarInputWeek.disabled = false;
            calendarInputMonth.disabled = true;

            calendarInputDay.value = '';
            calendarInputMonth.value = '';

            calendarInputDay.style.backgroundColor = "#F4F4F4";
            calendarInputWeek.style.backgroundColor = "#0080FF";
            calendarInputMonth.style.backgroundColor = "#F4F4F4";

            calendarInputDay.style.color = "#333333";
            calendarInputWeek.style.color = "#FFFFFF";
            calendarInputMonth.style.color = "#333333";
        } else if (selectedRadioButton === 'month') {
            calendarInputDay.disabled = true;
            calendarInputWeek.disabled = true;
            calendarInputMonth.disabled = false;

            calendarInputDay.value = '';
            calendarInputWeek.value = '';

            calendarInputDay.style.backgroundColor = "#F4F4F4";
            calendarInputWeek.style.backgroundColor = "#F4F4F4";
            calendarInputMonth.style.backgroundColor = "#0080FF";

            calendarInputDay.style.color = "#333333";
            calendarInputWeek.style.color = "#333333";
            calendarInputMonth.style.color = "#FFFFFF";
        } else {
            calendarInputDay.disabled = true;
            calendarInputWeek.disabled = true;
            calendarInputMonth.disabled = true;

            calendarInputDay.value = '';
            calendarInputWeek.value = '';
            calendarInputMonth.value = '';

            calendarInputDay.style.backgroundColor = "#F4F4F4";
            calendarInputWeek.style.backgroundColor = "#F4F4F4";
            calendarInputMonth.style.backgroundColor = "#F4F4F4";

            calendarInputDay.style.color = "#333333";
            calendarInputWeek.style.color = "#333333";
            calendarInputMonth.style.color = "#333333";
        }

        console.log(requestValue);
    }

    radioButtons.forEach(function(radioButton) {

        if (radioButton.id === selectedRadioButton) {
            radioButton.checked = true;
            radioButtonActive(selectedRadioButton);
        }

        // Проверка на пустые поля в выборе даты
        radioButton.addEventListener('change', function() {
            if (radioButton.checked) {
                selectedRadioButton = radioButton.id;
                localStorage.setItem('selectedRadioButton', selectedRadioButton)

                if (selectedRadioButton === 'all') {
                    requestValue = '';
                } else if (requestValue.split('=')[0] === 'month') {
                    if (selectedRadioButton !== 'month') {
                        requestValue = '';
                    }
                } else if (requestValue.split('=')[0] === 'week') {
                    if (selectedRadioButton !== 'week') {
                        requestValue = '';
                    }
                } else if (requestValue.split('=')[0] === 'day') {
                    if (selectedRadioButton !== 'day') {
                        requestValue = '';
                    }
                } else {
                    requestValue = selectedRadioButton;
                }

                radioButtonActive(selectedRadioButton);
            }
        });
    });
}

window.onload = handleRadioButtonChange;

var selectedDate = localStorage.getItem('selectedDate');

document.addEventListener('DOMContentLoaded', function() {
    var inputs = document.querySelectorAll('.calendar input[type=date], .calendar input[type=week], .calendar input[type=month]');

    inputs.forEach(function(input) {

        if (input.disabled !== false) {
            input.value = selectedDate;
        }

        input.addEventListener('change', function() {
            selectedDate = input.value;
            var selectedInput = input;

            localStorage.setItem('selectedDate', selectedDate);
            localStorage.setItem('selectedInput', selectedInput);

            changeGraphWithDate();
        });
    });
});

function changeGraphWithDate() {
    var buttonStyle = document.querySelector('.calendar input[type=button]');
    var xhr = new XMLHttpRequest();
    var typeValue = document.querySelectorAll('.calendar input');
    

    typeValue.forEach(function(input){
        if (input.value !== '' && input.type !== "button") {
            console.log(input.value);
            console.log(input.type);

            requestValue = input.type + '=' + input.value;
            localStorage.setItem('requestValue', requestValue);
            console.log(requestValue);
        } 
    });

    console.log(selectedState);
    console.log(propertyValue);
    console.log(sourceName);

    if (requestValue === 'all') {
        requestValue = '';
    }

    xhr.open("POST", 'data-property=' + propertyValue + ';' + sourceName + ';' + requestValue, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("form_state: OK");
        }
    };

    xhr.send();

    location.reload();
}
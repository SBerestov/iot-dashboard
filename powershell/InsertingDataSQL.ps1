$f1_SmartPlug = ""
$f2_SonoffSensor = ""
$f3_AqaraSensor = ""

# Проверяем, существует ли уже DSN, и если нет - создаем
if (-not (Get-OdbcDsn -Name "MyCon_x86" -DsnType "System" -Platform "64-bit" -ErrorAction SilentlyContinue)) {
    Add-OdbcDsn -Name "MyCon_x86" -DriverName "MySQL ODBC 8.1 ANSI Driver" -DsnType "System" -SetPropertyValue @("Server=localhost", "Trusted_Connection=Yes", "Database=monitoring_db") -Platform "64-bit"
}

function Get-ODBC-Data {
   param(
   [string]$query=$(throw 'query is required.')
   )
   $conn = New-Object System.Data.Odbc.OdbcConnection
   $conn.ConnectionString = "DSN=MyCon_x86;User=root;Password=Qq1234567;"
   $conn.open()

   $cmd = New-object System.Data.Odbc.OdbcCommand($query,$conn)
   $ds = New-Object system.Data.DataSet
   (New-Object system.Data.odbc.odbcDataAdapter($cmd)).fill($ds) | out-null
   $conn.close()
   $ds.Tables[0]
}

function Start-Mosquitto-Publisher {
    $folders = @(
        "C:\Temp\zigbee2mqtt-master\data\configuration.yaml",
        "C:\Temp\zigbee2mqtt-305Popova9\data\configuration.yaml",
        "C:\Temp\zigbee2mqtt-8501Promyshlennaya84\data\configuration.yaml",
        "C:\Temp\zigbee2mqtt-LAZPromyshlennaya84\data\configuration.yaml"
    )

    foreach ($folder in $folders) {
        $content = Get-Content -Path $folder
        $base_topic = ($content | Select-String -Pattern "base_topic: (.*)").Matches.Groups[1].Value
        
        # Для AqaraSensor
        $aqara_devices = ($content | Select-String -Pattern "AqaraSensor(.*)").Matches.Value
        # Для SonoffSensor
        $sonoff_devices = ($content | Select-String -Pattern "SonoffSensor(.*)").Matches.Value

        foreach ($device in $aqara_devices + $sonoff_devices) {
            $args = '-h 10.217.64.226 -p 1883 -t ' + $base_topic + '/' + $device
            Start-Process "C:\Program Files\mosquitto\mosquitto_sub.exe" -WindowStyle Hidden -RedirectStandardOutput ("C:\Temp\IOT_Devices\" + $device + ".txt") -ArgumentList $args
        }
    }
}

# Создаем папку для хранения данных, если ее нет
if (-not (Test-Path "C:\Temp\IOT_Devices")) {
    New-Item -ItemType Directory -Path "C:\Temp\IOT_Devices" -Force
}

Start-Mosquitto-Publisher

$file_lengths = @{}

while($true) {
    $device_catalog = Get-ChildItem "C:\Temp\IOT_Devices"

    foreach ($file in $device_catalog) {
        $file_path = $file.FullName
        $file_length = $file.Length

        if ($file_lengths.ContainsKey($file_path)) {
            if ($file_length -gt $file_lengths[$file_path]) {
                Write-Host "$file_path - $file_length"
                $file_lengths[$file_path] = $file_length

                $device_array = Get-Content -Path $file_path -Tail 1
                $device_name = $file.BaseName
                $dataLastWriteTime = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")

                try {
                    if ($device_name -like "AqaraSensor*") {
                        # Для каждого свойства AqaraSensor
                        @{
                            "battery" = 1
                            "humidity" = 2
                            "linkquality" = 3
                            "power_outage_count" = 4
                            "pressure" = 5
                            "temperature" = 6
                            "voltage" = 7
                        }.GetEnumerator() | ForEach-Object {
                            $property = $_.Key
                            $properties_id = $_.Value
                            $value = ($device_array | Select-String -Pattern ".*`"$property`":(.*?)[,}]").Matches.groups[1].value
                            
                            $query = @"
INSERT INTO data_sources (type_id, properties_id, value, datetime, data_source_name)
VALUES (1, $properties_id, '$value', '$dataLastWriteTime', '$device_name')
"@
                            Write-Host "Выполняем запрос: $query"
                            Get-ODBC-Data $query | Out-Null
                        }
                    }
                    elseif ($device_name -like "SonoffSensor*") {
                        # Для каждого свойства SonoffSensor
                        @{
                            "battery" = 8
                            "humidity" = 9
                            "linkquality" = 10
                            "temperature" = 11
                            "voltage" = 12
                        }.GetEnumerator() | ForEach-Object {
                            $property = $_.Key
                            $properties_id = $_.Value
                            $value = ($device_array | Select-String -Pattern ".*`"$property`":(.*?)[,}]").Matches.groups[1].value
                            
                            $query = @"
INSERT INTO data_sources (type_id, properties_id, value, datetime, data_source_name)
VALUES (2, $properties_id, '$value', '$dataLastWriteTime', '$device_name')
"@
                            Write-Host "Выполняем запрос: $query"
                            Get-ODBC-Data $query | Out-Null
                        }
                    }
                    Write-Host "Данные для $device_name успешно записаны в БД"
                }
                catch {
                    Write-Host "Ошибка при обработке файла $file_path : $_"
                    if ($query) { Write-Host "Запрос, вызвавший ошибку: $query" }
                }
            }
        }
        else {
            $file_lengths[$file_path] = $file_length
        }
    }
    
    Start-Sleep -Seconds 5
}
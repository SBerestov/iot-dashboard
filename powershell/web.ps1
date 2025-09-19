$url = 'C:\Temp\web_software\main.html' # File destination
$req = [system.Net.WebRequest]::Create($url)

$f1_SmartPlug = ""
$f2_SonoffSensor = ""
$f3_AqaraSensor = ""

Add-OdbcDsn -Name "MyCon_x86" -DriverName "MySQL ODBC 8.1 ANSI Driver" -DsnType "System" -SetPropertyValue @("Server=localhost", "Trusted_Connection=Yes", "Database=monitoring_db") -Platform "64-bit"

$DSN = Get-OdbcDsn -Name "MyCon_x86" -DsnType "System" -Platform "64-bit"

$httpListener = New-Object System.Net.HttpListener
$httpListener.Prefixes.Add("http://10.217.64.226:9090/") # IP network
$httpListener.Start()
Get-NetTCPConnection -State Listen | Select-Object -Property LocalAddress, LocalPort, State | Sort-Object LocalPort |ft

New-NetFirewallRule -DisplayName "AllowTestWebServer" -Direction Inbound -Protocol TCP –LocalPort 9090 -Action Allow

write-host "Press any key to stop HTTP listener after next request"
$rootdirectory="C:\Temp\web_software" # File destination
while (!([console]::Console.In.Peek)) {
$context = $httpListener.GetContext()

$htmlpath=$Context.Request.Url.AbsolutePath.ToString()
$absoluteUri=$context.Request.Url.AbsoluteUri.ToString()

$MatchesCount=($htmlpath | Select-String -Pattern "^\/.*html$").Matches.Count
if ($MatchesCount -gt 0)
{
    $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'text/HTML'
    $WebContent = Get-Content -Path $path -Encoding UTF8
    $EncodingWebContent = [Text.Encoding]::UTF8.GetBytes($WebContent)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()

}

$MatchesCount=($htmlpath | Select-String -Pattern "^\/$").Matches.Count
if ($MatchesCount -gt 0)
{
    
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'text/HTML'
    $WebContent = Get-Content -Path "C:\Temp\web_software\main.html" -Encoding UTF8 #
    $EncodingWebContent = [Text.Encoding]::UTF8.GetBytes($WebContent)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()

}
else 
{
    if((($htmlpath | select-string -Pattern "^/.*.css$").Matches.Count -gt 0))
    {
     $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'text/css'
    $WebContent = Get-Content -Path $path
    $EncodingWebContent = [system.Text.Encoding]::Default.GetBytes($WebContent)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
    if((($htmlpath | select-string -Pattern "^/.*.js$").Matches.Count -gt 0))
    {
     $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'text/javascript'
    $WebContent = Get-Content -Path $path
    $EncodingWebContent = [System.Text.Encoding]::Default.GetBytes($WebContent)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
    if (($htmlpath | select-string -Pattern "^/.*.png$").Matches.Count -gt 0)
    {
    $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'image/png'
    $EncodingWebContent = [System.IO.File]::ReadAllBytes($path)
    # $EncodingWebContent > C:\Temp\web_software\jpg.jpg
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
    if (($htmlpath | select-string -Pattern "^/.*.svg$").Matches.Count -gt 0)
    {
    $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'image/svg+xml'
    $EncodingWebContent = [System.IO.File]::ReadAllBytes($path)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
    if (($htmlpath | select-string -Pattern "^/.*.jpg$").Matches.Count -gt 0)
    {
    $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'image/jpg' 
    $EncodingWebContent = [System.IO.File]::ReadAllBytes($path)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
if (($htmlpath | select-string -Pattern "^/.*.bmp$").Matches.Count -gt 0)
    {
    $path=$Context.Request.Url.AbsolutePath.ToString()
    $path=$rootdirectory+$path.Replace("/","\")
    $context.Response.StatusCode = 200
    $context.Response.ContentType = 'image/bmp' 
    $EncodingWebContent = [System.IO.File]::ReadAllBytes($path)
    $context.Response.OutputStream.Write($EncodingWebContent , 0, $EncodingWebContent.Length)
    $context.Response.Close()
    $res = $req.GetResponse()
    }
    Write-Host $path
}

function Get-ODBC-Data{
   param(
   [string]$query=$(throw 'query is required.'),
   [string]$dsn
   )
   $conn = New-Object System.Data.Odbc.OdbcConnection
   $conn.ConnectionString = "DSN=MyCon_x86;User=root;Password=" + 'P@$$w0rd;'
   $conn.open()

   $cmd = New-object System.Data.Odbc.OdbcCommand($query,$conn)
   $ds = New-Object system.Data.DataSet
   (New-Object system.Data.odbc.odbcDataAdapter($cmd)).fill($ds) | out-null
   $conn.close()
   $ds.Tables[0]
}

# вот сюды запихивай


#    if ((Get-ChildItem "C:\Temp\IOT_Devices\SmartPlug_Sorted.txt").Length -gt $f1_SmartPlug){
#        write-host (Get-ChildItem "C:\Temp\IOT_Devices\SmartPlug_Sorted.txt").Length
#        $f1_SmartPlug = (Get-ChildItem "C:\Temp\IOT_Devices\SmartPlug_Sorted.txt").Length
#    }
    
$arraySmartPlug = Get-Item -Path 'C:\Temp\IOT_Devices\SmartPlug_Sorted.txt' | Get-Content -Tail 1 #IOT_devices

$dataChildLock_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"child_lock":"(.*)","current"').Matches.groups[1].value
$dataCurrent_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"current":(.*),"energy"').Matches.groups[1].value
$dataIndicatorMode_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"indicator_mode":"(.*)","linkquality"').Matches.groups[1].value
$dataLinkquality_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"linkquality":(.*),"power"').Matches.groups[1].value
$dataPower_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"power":(.*),"power_outage_memory"').Matches.groups[1].value
$dataPowerOutageMemory_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"power_outage_memory":"(.*)","state"').Matches.groups[1].value
$dataState_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"state":"(.*)","voltage"').Matches.groups[1].value
$dataVoltage_SmartPlug = ($arraySmartPlug | Select-String -Pattern '.*"voltage":(.*)}').Matches.groups[1].value

$lastRowDataSQL = Get-ODBC-Data("SELECT * FROM monitoring_db.data_sources WHERE type_id = 1 ORDER BY data_id DESC LIMIT 1;")

$html_heater_controller = @'
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
    
    <script src="https://kit.fontawesome.com/ee0489c718.js" crossorigin="anonymous"></script>
    
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>

	<title>Datacenter Monitoring</title>
	<link rel="stylesheet" type="text/css" href="styles/heater_controller.css">
</head>
<body>
	<div id="header">
		<table>
			<tr>
                <div id="software_name">
                    Datacenter Monitoring
                </div>
                <div id="links_header">
                    <ul>
                       <li><a href="main.html">Главная</a></li><!--
                    --><li><a href="lamp_controller.html">Освещение</a></li><!--
                    --><li><a href="heater_controller.html">Обогреватель</a></li><!--
                    --><li><a href="sonoff_sensor_controller.html">Sonoff</a></li><!--
                    --><li><a href="aqara_sensor_controller.html">Aqara</a></li>
                    </ul>
                </div>
                <div class="toggle_btn">
                    <img id="imgClickAndChange" src="images/bars-solid.svg" onclick="changeImage()" style="filter: invert(63%) sepia(70%) saturate(9%) hue-rotate(358deg) brightness(91%) contrast(96%); width: 40px;">
                </div>
                <div class="dropdown_menu">
                    <a href="main.html">Главная</a>
                    <a href="lamp_controller.html">Освещение</a>
                    <a href="heater_controller.html">Обогреватель</a>
                    <a href="sonoff_sensor_controller.html">Sonoff</a>
                    <a href="aqara_sensor_controller.html">Aqara</a>
                </div>
			</tr>
		</table>
	</div>    
        <section class="main-content">
            <div class="container">            
                        <div class="row">
                            <div class="main">
                                <div align="space-between" class='card' >
                                    <div class="row">
                                        <div class="col-12 col-sm-12 mt-3">
                                            <form>
                                                <fieldset>
                                                  <legend>Выберете промежуток:</legend>

                                                  <div>
                                                    <input type="radio" id="huey" name="drone" value="huey" checked />
                                                    <label for="huey">Месяц</label>
                                                  </div>

                                                  <div>
                                                    <input type="radio" id="dewey" name="drone" value="dewey" />
                                                    <label for="dewey">Неделя</label>
                                                  </div>

                                                  <div>
                                                    <input type="radio" id="louie" name="drone" value="louie" />
                                                    <label for="louie">День</label>
                                                  </div>
                                                  <input type="submit" value="Отправить">
                                                </fieldset>
                                            </form>
                                            <form class="calendar">
                                               <!-- <span>Укажите день: </span> -->
                                               <input type="date" name="day" min="2023-07-25">
                                               <input type="month" name="month">
                                               <input type="week" name="week">
                                               <input type="submit" value="Отправить">
                                            </form>
                                            <div id="chart_div" style="width: 800px; height: 400px;">
                                                <img src="images/doc8.svg">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" style="max-width: 300px; margin-right: 5px; margin-bottom: 1rem;">
                                        <div class="col-12 col-sm-12 mt-3">
                                            <div align="space-between" class='card_state' >
                                                <form action="#" class='form_state'>
                                                        <div class="options_name_state">
                                                            <div class="d-flex justify-content-between">
                                                                <strong class="options_value">{6}</strong>
                                                                <img class="icon" src="images/power-off-solid.svg" style="filter: invert(16%) sepia(78%) saturate(5756%) hue-rotate(342deg) brightness(95%) contrast(94%); width: 50px;">
                                                            </div> 
                                                            <div>Состояние переключателя</div>
                                                            <div class="dotted_line" style="padding-bottom: 10px;"></div>
                                                            <div class="d-flex justify-content-between">
                                                                <div class="flex-shrink-1 flex-grow-1">Вкл.</div>
                                                                <label class="switch">
                                                                  <input type="checkbox">
                                                                  <span class="slider round"></span>
                                                                </label>
                                                            </div>      
                                                        </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-12 mt-3">
                                            <div align="space-between" class='card_state' >
                                                <form action="#" class='form_state'>
                                                        <div class="options_name_state">
                                                            <div class="d-flex justify-content-between">
                                                                <div class="justify-content-start">
                                                                    <strong class="options_value">{1}</strong>
                                                                    <small class="text-muted" style="font-size: 20px;">А</small>
                                                                </div>
                                                                <img class="icon" src="images/plug-circle-bolt-solid.svg" style="filter: invert(61%) sepia(14%) saturate(941%) hue-rotate(133deg) brightness(92%) contrast(88%); width: 50px;">
                                                            </div> 
                                                            <div>Электрический ток</div>
                                                            <div class="dotted_line" style="border-top: 5px dotted darkcyan;"></div>        
                                                        </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-12 mt-3">
                                            <div align="space-between" class='card_state' >
                                                <form action="#" class='form_state'>
                                                        <div class="options_name_state" style="height: 100px;">
                                                            <div class="d-flex justify-content-between">
                                                                <div class="justify-content-start">
                                                                    <strong class="options_value">{7}</strong>
                                                                    <small class="text-muted" style="font-size: 20px;">В</small>
                                                                </div>
                                                                <img class="icon" src="images/bolt-solid.svg" style="filter: invert(72%) sepia(40%) saturate(6588%) hue-rotate(358deg) brightness(101%) contrast(107%); width: 45px;">
                                                            </div> 
                                                            <div class="flex-shrink-1 flex-grow-1">Напряжение</div>
                                                            <div class="dotted_line" style="border-top: 5px dotted darkorange;"></div>                                                       
                                                        </div>
                                                </form>
                                            </div>
                                        </div>
                                        <div class="col-12 col-sm-12 mt-3">
                                            <div align="space-between" class='card_state'>
                                                <form action="#" class='form_state'>
                                                        <div class="options_name_state" style="height: 100px;">
                                                            <div class="d-flex justify-content-between">
                                                                <div class="justify-content-start">
                                                                    <strong class="options_value">{4}</strong>
                                                                    <small class="text-muted" style="font-size: 20px;">Вт</small>
                                                                </div>
                                                                <img class="icon" src="images/charging-station-solid.svg" style="filter: invert(15%) sepia(49%) saturate(6524%) hue-rotate(356deg) brightness(93%) contrast(79%); width: 50px;">
                                                            </div> 
                                                            <div class="flex-shrink-1 flex-grow-1">Мощность</div>
                                                            <div class="dotted_line" style="border-top: 5px dotted firebrick;"></div>       
                                                        </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-12 col-sm-6 mt-3">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state" style="height: 100px;">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{8}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">В</small>
                                                    </div>
                                                    <div><a href="#"><i class="fa-sharp fa-solid fa-bolt fa-3x" style="color: darkorange"></i></a></div>
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">SQL</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkorange;"></div>      
                                            </div>
                                    </form>
                                </div>
                            </div>
                        </div>
            </div>
       </section>
    <script src="heater_controller.js"></script>
</body>
</html>
'@ -f $dataChildLock_SmartPlug, $dataCurrent_SmartPlug, $dataIndicatorMode_SmartPlug, $dataLinkquality_SmartPlug, $dataPower_SmartPlug, $dataPowerOutageMemory_SmartPlug, $dataState_SmartPlug, $dataVoltage_SmartPlug, $lastRowDataSQL.datetime
$html_heater_controller | Out-File C:\Temp\web_software\heater_controller.html -Encoding utf8 # File destination




$arraySonoffSensor = Get-Item -Path 'C:\Temp\IOT_Devices\SonoffSensor_Sorted.txt' | Get-Content -Tail 1 #IOT_devices

$dataBattery_SonoffSensor = ($arraySonoffSensor | Select-String -Pattern '.*"battery":(.*),"humidity"').Matches.groups[1].value
$dataHumidity_SonoffSensor = ($arraySonoffSensor | Select-String -Pattern '.*"humidity":(.*),"linkquality"').Matches.groups[1].value
$dataLinkquality_SonoffSensor = ($arraySonoffSensor | Select-String -Pattern '.*"linkquality":(.*),"temperature"').Matches.groups[1].value
$dataTemperature_SonoffSensor = ($arraySonoffSensor | Select-String -Pattern '.*"temperature":(.*),"voltage"').Matches.groups[1].value
$dataVoltage_SonoffSensor = ($arraySonoffSensor | Select-String -Pattern '.*"voltage":(.*)}').Matches.groups[1].value

$lastRowDataSQL = Get-ODBC-Data("SELECT * FROM monitoring_db.data_sources WHERE type_id = 1 ORDER BY data_id DESC LIMIT 1;")

$html_sonoff_sensor_controller = @'
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    
	<title>Datacenter Monitoring</title>
	<link rel="stylesheet" type="text/css" href="styles/sonoff_sensor_controller.css">
</head>
<body>
	<div id="header">
		<table>
			<tr>
                <div id="software_name">
                    Datacenter Monitoring
                </div>
                <div id="links_header">
                    <ul>
                       <li><a href="main.html">Главная</a></li><!--
                    --><li><a href="lamp_controller.html">Освещение</a></li><!--
                    --><li><a href="heater_controller.html">Обогреватель</a></li><!--
                    --><li><a href="sonoff_sensor_controller.html">Sonoff</a></li><!--
                    --><li><a href="aqara_sensor_controller.html">Aqara</a></li>
                    </ul>
                </div>
                <div class="toggle_btn">
                    <img id="imgClickAndChange" src="images/bars-solid.svg" onclick="changeImage()" style="filter: invert(63%) sepia(70%) saturate(9%) hue-rotate(358deg) brightness(91%) contrast(96%); width: 40px;">
                </div>
                <div class="dropdown_menu">
                    <a href="main.html">Главная</a>
                    <a href="lamp_controller.html">Освещение</a>
                    <a href="heater_controller.html">Обогреватель</a>
                    <a href="sonoff_sensor_controller.html">Sonoff</a>
                    <a href="aqara_sensor_controller.html">Aqara</a>
                </div>
			</tr>
		</table>
	</div>
        <section class="main-content">
            <div class="central" > 
            <div class="container" style="max-width: 900px;">
                        <div class="row">
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{1}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">%</small>
                                                    </div>
                                                    <img class="icon" src="images/droplet-solid.svg" style="filter: invert(62%) sepia(16%) saturate(839%) hue-rotate(133deg) brightness(89%) contrast(91%); width: 40px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Влажность</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkcyan;"></div>       
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{2}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">lqi</small>
                                                    </div>
                                                    <img class="icon" src="images/tower-broadcast-solid.svg" style="filter: invert(64%) sepia(20%) saturate(6808%) hue-rotate(194deg) brightness(97%) contrast(91%); width: 55px">
                                                </div> 
                                                <div>Уровень сигнала</div>
                                                <div class="dotted_line" style="border-top: 5px dotted cornflowerblue;"></div>
                                                       
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{3}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">°C</small>
                                                    </div>
                                                    <img class="icon" src="images/temperature-high-solid.svg" style="filter: invert(23%) sepia(96%) saturate(7266%) hue-rotate(360deg) brightness(93%) contrast(119%); width: 48px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Температура</div>
                                                <div class="dotted_line" style="border-top: 5px dotted red;"></div>
                                                       
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{4}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">мВ</small>
                                                    </div>
                                                    <img class="icon" src="images/bolt-solid.svg" style="filter: invert(72%) sepia(40%) saturate(6588%) hue-rotate(358deg) brightness(101%) contrast(107%); width: 40px;">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Напряжение</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkorange;"></div>
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="d-flex justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{0}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">%</small>
                                                    </div>
                                                    <img class="icon" src="images/battery-full-solid.svg" style="filter: invert(25%) sepia(79%) saturate(2677%) hue-rotate(93deg) brightness(100%) contrast(73%); width: 50px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Батарея</div>
                                                <div class="dotted_line" style="border-top: 5px dotted forestgreen;"></div>   
                                            </div>
                                    </form>
                                </div>
                            </div>
                        </div>
            </div>
            </div>
       </section>
    <script src="sonoff_sensor_controller.js"></script>
</body>
</html>
'@ -f $dataBattery_SonoffSensor, $dataHumidity_SonoffSensor, $dataLinkquality_SonoffSensor, $dataTemperature_SonoffSensor, $dataVoltage_SonoffSensor
$html_sonoff_sensor_controller | Out-File C:\Temp\web_software\sonoff_sensor_controller.html -Encoding utf8 # File destination




$arrayAqaraSensor = Get-Item -Path 'C:\Temp\IOT_Devices\AqaraSensor_Sorted.txt' | Get-Content -Tail 1 #IOT_devices

$dataBattery_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"battery":(.*),"humidity"').Matches.groups[1].value
$dataHumidity_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"humidity":(.*),"linkquality"').Matches.groups[1].value
$dataLinkquality_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"linkquality":(.*),"power_outage_count"').Matches.groups[1].value
$dataPowerOutageMemory_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"power_outage_count":(.*),"pressure"').Matches.groups[1].value
$dataPressure_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"pressure":(.*),"temperature"').Matches.groups[1].value
$dataTemperature_AqaraSensor = (($arrayAqaraSensor | Select-String -Pattern '.*"temperature":(.*),"voltage"').Matches.groups[1].value).ToString()
$dataVoltage_AqaraSensor = ($arrayAqaraSensor | Select-String -Pattern '.*"voltage":(.*)}').Matches.groups[1].value

$html_aqara_sensor_controller = @'
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<title>Datacenter Monitoring</title>
	<link rel="stylesheet" type="text/css" href="styles/aqara_sensor_controller.css">
</head>
<body>
	<div id="header">
		<table>
			<tr>
                <div id="software_name">
                    Datacenter Monitoring
                </div>
                <div id="links_header">
                    <ul>
                       <li><a href="main.html">Главная</a></li><!--
                    --><li><a href="lamp_controller.html">Освещение</a></li><!--
                    --><li><a href="heater_controller.html">Обогреватель</a></li><!--
                    --><li><a href="sonoff_sensor_controller.html">Sonoff</a></li><!--
                    --><li><a href="aqara_sensor_controller.html">Aqara</a></li>
                    </ul>
                </div>
                <div class="toggle_btn">
                    <img id="imgClickAndChange" src="images/bars-solid.svg" onclick="changeImage()" style="filter: invert(63%) sepia(70%) saturate(9%) hue-rotate(358deg) brightness(91%) contrast(96%); width: 40px;">
                </div>
                <div class="dropdown_menu">
                    <a href="main.html">Главная</a>
                    <a href="lamp_controller.html">Освещение</a>
                    <a href="heater_controller.html">Обогреватель</a>
                    <a href="sonoff_sensor_controller.html">Sonoff</a>
                    <a href="aqara_sensor_controller.html">Aqara</a>
                </div>
			</tr>
		</table>
	</div>
        <section class="main-content">
            <div class="central"> 
            <div class="container" style="max-width: 900px;">
                        <div class="row">
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{1}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">%</small>
                                                    </div>
                                                    <img class="icon" src="images/droplet-solid.svg" style="filter: invert(62%) sepia(16%) saturate(839%) hue-rotate(133deg) brightness(89%) contrast(91%); width: 40px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Влажность</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkcyan;"></div>
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{2}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">lqi</small>
                                                    </div>
                                                    <img class="icon" src="images/tower-broadcast-solid.svg" style="filter: invert(64%) sepia(20%) saturate(6808%) hue-rotate(194deg) brightness(97%) contrast(91%); width: 55px">
                                                </div> 
                                                <div>Уровень сигнала</div>
                                                <div class="dotted_line" style="border-top: 5px dotted cornflowerblue;;"></div>
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{3}</strong>
                                                    </div>
                                                    <img class="icon" src="images/plug-circle-exclamation-solid.svg" style="filter: invert(11%) sepia(65%) saturate(6453%) hue-rotate(294deg) brightness(87%) contrast(110%); width: 55px">
                                                </div> 
                                                <div>Отключений электроэнергии</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkmagenta;"></div>    
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{4}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">ГПа</small>
                                                    </div>
                                                    <img class="icon" src="images/cloud-arrow-up-solid.svg" style="filter: invert(77%) sepia(70%) saturate(4080%) hue-rotate(325deg) brightness(102%) contrast(103%); width: 60px">
                                                </div> 
                                                <div>Давление</div>
                                                <div class="dotted_line" style="border-top: 5px dotted coral;"></div>
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{5}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">°C</small>
                                                    </div>
                                                    <img class="icon" src="images/temperature-high-solid.svg" style="filter: invert(23%) sepia(96%) saturate(7266%) hue-rotate(360deg) brightness(93%) contrast(119%); width: 48px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Температура</div>
                                                <div class="dotted_line" style="border-top: 5px dotted red;"></div> 
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{6}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">мВ</small>
                                                    </div>
                                                    <img class="icon" src="images/bolt-solid.svg" style="filter: invert(72%) sepia(40%) saturate(6588%) hue-rotate(358deg) brightness(101%) contrast(107%); width: 40px;">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Напряжение</div>
                                                <div class="dotted_line" style="border-top: 5px dotted darkorange;"></div>
                                            </div>
                                    </form>
                                </div>
                            </div>
                            <div class="card">
                                <div align="space-between" class='card_state' >
                                    <form action="#" class='form_state'>
                                            <div class="options_name_state">
                                                <div class="justify-content-between">
                                                    <div class="justify-content-start">
                                                        <strong class="options_value">{0}</strong>
                                                        <small class="text-muted" style="font-size: 20px;">%</small>
                                                    </div>
                                                    <img class="icon" src="images/battery-full-solid.svg" style="filter: invert(25%) sepia(79%) saturate(2677%) hue-rotate(93deg) brightness(100%) contrast(73%); width: 50px">
                                                </div> 
                                                <div class="flex-shrink-1 flex-grow-1">Батарея</div>
                                                <div class="dotted_line" style="border-top: 5px dotted forestgreen;"></div>   
                                            </div>
                                    </form>
                                </div>
                            </div>
                        </div>
            </div>
            </div>
       </section>
    <script src="aqara_sensor_controller.js"></script>
</body>
</html>
'@ -f $dataBattery_AqaraSensor, $dataHumidity_AqaraSensor, $dataLinkquality_AqaraSensor, $dataPowerOutageMemory_AqaraSensor, $dataPressure_AqaraSensor, $dataTemperature_AqaraSensor, $dataVoltage_AqaraSensor
$html_aqara_sensor_controller | Out-File C:\Temp\web_software\aqara_sensor_controller.html -Encoding utf8 # File destination



if (($absoluteUri | Select-String -Pattern ".*\/?condition=on$").Matches.Count -gt 0) {
  $Context.Request.Url  
  $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
  $str = $c.GetStream()
  $writer=New-Object System.IO.StreamWriter($str)
  $writer.AutoFlush=$true
  $msg = '{ "id": 1, "method": "set_power", "params":["on", "smooth", 500]}'
  $writer.Writeline($msg)
  $str.Close()
  $c.Close()
}
if (($absoluteUri | Select-String -Pattern ".*\/?condition=off$").Matches.Count -gt 0) {
  $Context.Request.Url  
  $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
  $str = $c.GetStream()
  $writer=New-Object System.IO.StreamWriter($str)
  $writer.AutoFlush=$true
  $msg = '{ "id": 1, "method": "set_power", "params":["off", "smooth", 500]}'
  $writer.Writeline($msg)
  $str.Close()
  $c.Close()
}
    if (($absoluteUri | Select-String -Pattern ".*\/?colorNumberBlue=.*").Matches.Count -gt 0) {
      $colorNumberRed =  [int]($absoluteUri | Select-String -Pattern ".*Red=(.*)&colorNumberGreen").Matches.groups[1].value
      $colorNumberGreen =  [int]($absoluteUri | Select-String -Pattern ".*Green=(.*)&colorNumberBlue").Matches.groups[1].value
      $colorNumberBlue =  [int]($absoluteUri | Select-String -Pattern ".*Blue=(.*)").Matches.groups[1].value
      $RGB = [int]($colorNumberRed*65536+$colorNumberGreen*256+$colorNumberBlue)
      $RGB
      $Context.Request.Url  
      $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
      $str = $c.GetStream()
      $writer=New-Object System.IO.StreamWriter($str)
      $writer.AutoFlush=$true
      $msg = '{"id":1,"method":"set_rgb","params":['+$RGB+', "smooth", 500]}'
      $writer.Writeline($msg)
      $str.Close()
      $c.Close()
    }
if (($absoluteUri | Select-String -Pattern ".*\/?mode=mode1$").Matches.Count -gt 0) {
  $Context.Request.Url  
  $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
  $str = $c.GetStream()
  $writer=New-Object System.IO.StreamWriter($str)
  $writer.AutoFlush=$true
  $msg = '{"id":1,"method":"start_cf","params":[ 4, 2, "1000, 2, 2700, 100, 500, 1,
255, 10, 5000, 7, 0,0, 500, 2, 5000, 1"]}'
  $writer.Writeline($msg)
  $str.Close()
  $c.Close()
}
if (($absoluteUri | Select-String -Pattern ".*\/?mode=mode4$").Matches.Count -gt 0) {
  $Context.Request.Url  
  $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
  $str = $c.GetStream()
  $writer=New-Object System.IO.StreamWriter($str)
  $writer.AutoFlush=$true
  $msg = '{"id":1,"method":"set_default","params":[]}'
  $writer.Writeline($msg)
  $str.Close()
  $c.Close()
}


    if (($absoluteUri | Select-String -Pattern ".*\/?brightness=(.*)$").Matches.Count -gt 0) {
      $brightnessNumber =  ($absoluteUri | Select-String -Pattern "brightness=(.*)").Matches.groups[1].value
      $Context.Request.Url  
      $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
      $str = $c.GetStream()
      $writer=New-Object System.IO.StreamWriter($str)
      $writer.AutoFlush=$true
      $msg = '{ "id": 1, "method": "set_bright", "params":['+$brightnessNumber+', "smooth", 500]}'
      $writer.Writeline($msg)
      $str.Close()
      $c.Close()
    }

if (($absoluteUri | Select-String -Pattern ".*&saturation=(.*)$").Matches.Count -gt 0) {
      $saturationNumber =  ($absoluteUri | Select-String -Pattern "saturation=(.*)").Matches.groups[1].value
      $Context.Request.Url  
      $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
      $str = $c.GetStream()
      $writer=New-Object System.IO.StreamWriter($str)
      $writer.AutoFlush=$true
      $msg = '{"id":1,"method":"set_hsv","params":[-1, '+$saturationNumber+', "smooth", 500]}'
      $writer.Writeline($msg)
      $str.Close()
      $c.Close()
    }
if (($absoluteUri | Select-String -Pattern ".*&temperature=(.*)$").Matches.Count -gt 0) {
      $temperatureNumber =  ($absoluteUri | Select-String -Pattern ".*&temperature=(.*)&effect=(.*)$").Matches.groups[1].value
      $effect = [string]($absoluteUri | Select-String -Pattern ".*&temperature=(.*)&effect=(.*)$").Matches.groups[2].value
      $Context.Request.Url  
      $c = New-Object System.Net.Sockets.TcpClient("192.168.0.10", 55443) # IP-device
      $str = $c.GetStream()
      $writer=New-Object System.IO.StreamWriter($str)
      $writer.AutoFlush=$true
      $msg = '{"id":1,"method":"set_ct_abx","params":[ '+$temperatureNumber+', "smooth", 500]}'
      $writer.Writeline($msg)
      $str.Close()
      $c.Close()
    }

Write-Output "" # Newline

try {
    $res = $req.GetResponse()
} 
catch [System.Net.WebException] {
    $res = $_.Exception.Response
}

$res.StatusCode
#OK

[int]$res.StatusCode
#200

}
$httpListener.Close()
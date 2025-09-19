﻿Add-OdbcDsn -Name "MyCon_x86" -DriverName "MySQL ODBC 8.1 ANSI Driver" -DsnType "System" -SetPropertyValue @("Server=localhost", "Trusted_Connection=Yes", "Database=monitoring_db") -Platform "64-bit"

$DSN = Get-OdbcDsn -Name "MyCon_x86" -DsnType "System" -Platform "64-bit"

$svg_graph_content = Get-Item -Path 'C:\Users\BerestovSM\Desktop\graph.svg' | Get-Content

foreach ($sensorValue in $dots) {
    $maxGraphValue = 350
    $maxSensorValue = 180
    $unitSensorValue = [double]($maxGraphValue / $maxSensorValue)
    $graphValue = [double]::Parse($sensorValue) * $unitSensorValue
    $graphValue = (350-([math]::Round($graphValue, 0)))
    $graphValues += @($graphValue) # добавляем значение в массив
    Write-Host ($graphValues)
}

function GetData($type_id) {
    switch ($type_id) {
    1 {$property_4Name = 'power_outage_count'; $property_5Name = 'pressure'; $property_6Name = 'temperature'}
    2 {$property_4Name = 'temperature'; $property_5Name = 'voltage'; $property_6Name = 'temperature'}
    3 {$property_4Name = 'current'; $property_5Name = 'power'; $property_6Name = 'state'}
    }
    $dataSQL = (Get-ODBC-Data("SELECT avg(property_1) as battery, avg(property_2) as humidity, avg(property_3) as linkquality, avg(property_4) as $property_4Name, avg(property_5) as $property_5Name, avg(property_6) as $property_6Name, avg(property_7) as voltage FROM monitoring_db.data_sources WHERE type_id = $type_id GROUP BY week(datetime);"))
    $dataSQL
}
function GetMaxAndMinY($type_id, $propertyName) {
    $data = (Get-ODBC-Data("SELECT * FROM monitoring_db.data_sources WHERE type_id = $type_id;"))
    $propertyName
    $data.$propertyName
    $maxY = (Get-ODBC-Data("SELECT MAX($propertyName) FROM monitoring_db.data_sources WHERE type_id = $type_id;"))
    $minY = (Get-ODBC-Data("SELECT MIN($propertyName) FROM monitoring_db.data_sources WHERE type_id = $type_id;"))
    #return $maxY, $minY
    New-Object PSObject @{
        maxY = $maxY
        minY = $minY
    }
}
function FormSVG($type_id, $propertyName) {
    $data = Get-ODBC-Data("SELECT date_format(datetime, '%d-%m-%Y') as datetime, avg($propertyName) as field FROM monitoring_db.data_sources WHERE type_id = $type_id GROUP BY DAY(datetime);")
    $dataSVG = '<?xml version="1.0" standalone="no"?>

<?xml-stylesheet type="text/css" href="graph.css"?>

<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" class="graph" aria-labelledby="title" role="img" style="font-family: Open Sans, sans-serif;">
<title id="title">A line chart showing some information</title>
<g class="grid x-grid" id="xGrid" style="stroke: #838383;
        stroke-dasharray: 0;
        stroke-width: 1;">
<line x1="50" x2="50" y1="0" y2="350"></line>
</g>
<g class="grid y-grid" id="yGrid" style="stroke: #838383;
         stroke-dasharray: 0;
         stroke-width: 1;">
<line x1="50" x2="770" y1="350" y2="350"></line>
</g>
<g class="labels x-labels" style="text-anchor: middle; font-size: 13px;">'
    $intervalX = (720 / ($data.datetime.Count - 1))
    $startIntervalNumberX = 50
    $dataSVG = $dataSVG + "`n"
    foreach ($item in $data.datetime) {
        $labelsX = '<g class="tick" opacity="1" transform="translate(' + ($startIntervalNumberX) + ', 350)">' + "`n" + '<line stroke="#ccc" stroke-width="0.7" y2="6" y1="-350"/>' + "`n" + '</g>' + "`n"
        $dataSVG = $dataSVG + $labelsX
        $startIntervalNumberX = $startIntervalNumberX + $intervalX
    }
    $startIntervalNumberX = 50
    foreach ($item in $data.datetime) {
        $stringX = '<text x="' + ($startIntervalNumberX) + '" y="370">' + $item.datetime + '</text>', "`n"
        $dataSVG = $dataSVG + $stringX
        $startIntervalNumberX = $startIntervalNumberX + $intervalX
    }
    $dataSVG = $dataSVG + '<text x="740" dy="340" class="label-title" style="font-weight: bold; text-transform: uppercase; font-size: 12px; fill: black;">datetime</text>' + "`n" + '</g>' + "`n" + '<g class="labels y-labels" style="text-anchor: end; font-size: 13px;">' + "`n"
    $dataSVG = $dataSVG + '<g class="tick" opacity="1" transform="translate(50,0)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,50)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,100)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,150)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,200)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,250)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,300)">
<line stroke="#ccc" stroke-width="0.7" x2="-6" x1="720"/>
</g>
<g class="tick" opacity="1" transform="translate(50,350)">
<line stroke="#ccc" stroke-width="0.7" x2="-6"/>
</g>'
    $dataFieldMax = $data.field | Sort-Object -Descending
    $dataFieldMin = $data.field | Sort-Object
    $dataSVG = $dataSVG + '<text x="40" y="10">' + ($dataFieldMax[0]) + '</text>' + "`n"
    $dataFieldUnit = (($dataFieldMax[0]) / 7)
    $dataField = $dataFieldMax[0] - $dataFieldUnit
    $intervalY = 0
    for ($i = 0;$i -lt 7; $i++) {
        $labelsY = '<text x="40" y="' + (55 + $intervalY) + '">' + ([math]::Round($dataField, 1)) + '</text>' + "`n"
        $dataSVG = $dataSVG + $labelsY
        $dataField -= $dataFieldUnit
        $intervalY = $intervalY + 50
    }
    $dataSVG = $dataSVG + '<text x="140" y="10" class="label-title" style="font-weight: bold; text-transform: uppercase; font-size: 12px; fill: black;">' + $propertyName + '</text>'  + "`n" + '</g>' + "`n"
    foreach ($sensorValue in $data.field) {
        $maxGraphValue = 350
        $unitSensorValue = [double]($maxGraphValue / $dataFieldMax[0])
        $graphValue = ($sensorValue) * $unitSensorValue
        $graphValue = (350-([math]::Round($graphValue, 0)))
        $graphValues += @($graphValue) # добавляем значение в массив
        Write-Host ($graphValues)
    }
    $startIntervalNumberX = 50
    $firstStringY = '<path d="M50 ' + ($graphValues[0])
    $circleXY = '<circle cx="' + ($startIntervalNumberX) + '" cy="' + ($graphValues[0]) + '" r="3"></circle>' + "`n"
    foreach ($item in $graphValues[1..($graphValues.Count - 1)]) {
        $startIntervalNumberX = $startIntervalNumberX + $intervalX
        $lineXY = " L$startIntervalNumberX $item,"
        $firstStringY = $firstStringY + $lineXY

        $circleString =  '<circle cx="' + ($startIntervalNumberX) + '" cy="' + ($item) + '" r="3"></circle>' + "`n"
        $circleXY = $circleXY + $circleString

        $firstStringY
    }
    $firstStringY -match '.*(,)'
    $firstStringY = $firstStringY.Replace($Matches.1, "")
    $firstStringY = $firstStringY + '" stroke="rgba(0,0,255,0.1)" stroke-width="3" fill="none"/>' + "`n"
    $dataSVG = $dataSVG + $firstStringY
    $dataSVG = $dataSVG + '<g class="data" data-setname="Our first data set" style="fill: rgba(0,0,255,1.0); stroke-width: 1;">'
    $dataSVG = $dataSVG + $circleXY
    $dataSVG = $dataSVG + '</g>' + "`n" + '</svg>'
    $dataSVG | Out-File C:\Temp\web_software\images\doc8.svg -Encoding utf8
}


function Get-ODBC-Data{
   param(
   [string]$query=$(throw 'query is required.')
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

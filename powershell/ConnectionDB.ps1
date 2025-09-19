Add-OdbcDsn -Name "MyCon_x86" -DriverName "MySQL ODBC 8.1 ANSI Driver" -DsnType "System" -SetPropertyValue @("Server=localhost", "Trusted_Connection=Yes", "Database=monitoring_db") -Platform "64-bit"

$DSN = Get-OdbcDsn -Name "MyCon_x86" -DsnType "System" -Platform "64-bit"

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
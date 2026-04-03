@echo off
echo Publishing...
dotnet publish -c Release -o .\out
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Deploying to MonsterASP...
"C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe" -verb:sync -source:contentPath="D:\Others\CleanNinja\CleanNinja\CleanNinja.Server\out" -dest:contentPath=site58931,computerName=https://site58931.siteasp.net:8172/msdeploy.axd?site=site58931,userName=site58931,password=D?b5nK9%%-6oY,authtype=Basic,includeAcls=False -allowUntrusted -enableRule:AppOffline -skip:Directory="wwwroot\\uploads"
echo Done!

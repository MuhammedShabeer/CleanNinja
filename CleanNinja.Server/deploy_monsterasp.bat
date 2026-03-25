@echo off
"C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe" -verb:sync -source:contentPath="D:\Others\CleanNinja\CleanNinja\CleanNinja.Server\out2" -dest:contentPath=site58931,computerName=https://site58931.siteasp.net:8172/msdeploy.axd?site=site58931,userName=site58931,password=D?b5nK9%%-6oY,authtype=Basic,includeAcls=False -allowUntrusted -enableRule:AppOffline

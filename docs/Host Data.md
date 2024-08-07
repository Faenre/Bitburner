The syntax of the `server_data.json` that is output by `initialize.js` looks like the following:

```json
{
	"backdoor": false,
	"minDifficulty": 0,
	"moneyMax": 1e7,
	"ip": "some_ip",
	"hostname": "f00dnstuff",
	"organizationName": "solaris",
	"cpuCores": 1,
	"maxRam": 4,
	"portsRequired": 3,
	"ports": {
		"ftp": true,
		"smtp": false,
		"sql": true,
		"ssh": true
	}
}
```
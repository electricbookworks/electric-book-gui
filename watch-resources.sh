#!/bin/bash
set -e
#gulp watch &
sudo sysctl fs.inotify.max_user_watches=524288
watchman watch src/ts
watchman watch src/go/src
watchman watch src/scss
watchman -j  <<EOT
["trigger", "$(pwd)/src/ts", {
	"name": "dtemplate",
	"expression": ["pcre","\\\\.html$"],
	"command": [
		"dtemplate",
		"-dir", "$(pwd)/src/ts", 
		"-lang", "ts",
		"-out", "$(pwd)/src/ts/Templates.ts"
	]
}]
EOT
watchman -j <<EOT
["trigger", "$(pwd)/src/ts", {
	"name":"typescript",
	"expression": ["pcre","\\\\.ts$"],
	"chdir": "$(pwd)",
	"command":["rollup", "-c"]
}]
EOT
watchman -j <<EOT
["trigger", "$(pwd)/src/go/src", {
	"name":"genapi",
	"expression": ["pcre","/JSONRpc\\\\.go$"],
	"chdir": "$(pwd)",
	"command":["make","gen"]
}]
EOT
watchman -j <<EOT
["trigger", "$(pwd)/src/scss", {
    "name":"gencss",
    "expression": ["pcre", "\\\\.scss$"],
    "chdir": "$(pwd)",
    "command":["make", "css"]
}]
EOT

echo "Log file is most likely /usr/local/var/run/watchman/${USER}-state/log"
tail -f "/usr/local/var/run/watchman/${USER}-state/log"


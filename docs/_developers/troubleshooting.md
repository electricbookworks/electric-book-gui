---
title: Troubleshooting
description: Tips for identifying problems.
---

# Troubleshooting

If you have learned hard lessons and have tips for others, please add them to these docs.

## Site down

The site can go down if there are errors in your YAML files. For instance, a space out of place in `electricbook-0.yml` once took the EBM down.

We found the error with

`sudo journalctl -fu electricbook`

then started electricbook in a separate shell:

`sudo systemctl start electricbook`

and it reported that error as to why it wouldn't start. It said a yaml parsing error on line 31 of a config file, which we could then look for among the YAML config files.

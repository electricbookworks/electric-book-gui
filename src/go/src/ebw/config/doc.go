/*
package config handles the configuration of the
ebw server. It reads its configuration from an `electricbook.yml`
file, and then sequentially from `electricbook-[0,1,2...].yml files`
Therefore a default `electricbook.yml` configuration file should be
found in the repo, and the numbered files should be specific
to particular instances, and not stored in the repo, so that they
can contain private keys, etc.
*/
package config

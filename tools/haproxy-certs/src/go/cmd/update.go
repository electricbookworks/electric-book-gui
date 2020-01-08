package cmd

import (
	`os/exec`
	`path/filepath`
	// `fmt`
	`io`
	`os`
	`strings`
	`time`

	"github.com/spf13/cobra"
	`github.com/juju/errors`
)

type KeyDir struct {
	Dir string
	PrivKey os.FileInfo
	FullChain os.FileInfo
	Haproxy os.FileInfo
}

func Exec(cmdString string) error {
	log.Info(`Exec:`, cmdString)
	parts := strings.Split(cmdString, ` `)
	c := exec.Command(parts[0], parts[1:]...)
	c.Stdout, c.Stderr = os.Stdout, os.Stderr
	if err := c.Run(); nil!=err {
		return errors.Trace(err)
	}
	return nil
}

func NewKeyDir(pd string) (*KeyDir, error) {
	kd := &KeyDir{
		Dir: pd,
	}
	var err error
	kd.PrivKey, err = os.Stat(kd.Path(`privkey.pem`))
	if nil!=err {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, errors.Trace(err)
	}
	kd.FullChain, err = os.Stat(kd.Path(`fullchain.pem`))
	if nil!=err {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, errors.Trace(err)
	}
	kd.Haproxy, err = os.Stat(kd.Path(`haproxy.pem`))
	if nil!=err {
		if !os.IsNotExist(err) {
			return nil, errors.Trace(err)
		}
		kd.Haproxy = nil
	}
	return kd, nil
}

func (kd *KeyDir) ShouldUpdate() bool {
	if nil==kd {
		return false
	}
	if nil==kd.Haproxy {
		return true
	}
	latest := kd.PrivKey.ModTime()
	if kd.FullChain.ModTime().After(latest) {
		latest = kd.FullChain.ModTime()
	}
	return kd.Haproxy.ModTime().Before(latest)
}

func (kd *KeyDir) ShouldSleep() bool {
	if nil==kd {
		return false
	}
	now := time.Now().Add(-10 * time.Second)
	return now.Before(kd.PrivKey.ModTime()) || now.Before(kd.FullChain.ModTime())
}

func (kd *KeyDir) Update() error {
	log.Info(`Updating haproxy cert for `, kd.Dir)
	out, err := os.Create(kd.Path(`haproxy.pem`))
	if err!=err {
		return errors.Trace(err)
	}
	defer out.Close()
	if err = kd.Copy(out, `privkey.pem`); nil!=err {
		return err
	}
	if err = kd.Copy(out, `fullchain.pem`); nil!=err {
		return err
	}
	return nil
}

func (kd *KeyDir) Copy(out io.Writer, f string) error {
	in, err := os.Open(kd.Path(f))
	if nil!=err {
		return errors.Trace(err)
	}
	defer in.Close()
	_, err = io.Copy(out, in)
	if nil!=err {
		return errors.Trace(err)
	}
	return nil
}

func (kd *KeyDir) Path(f string) string {
	return filepath.Join(kd.Dir, f)
}

func FileExists(f string) (bool, error) {
	_, err := os.Stat(f)
	if nil==err {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, errors.Trace(err)
}

func updateCerts(leDir string) (bool,error) {
	keys := []*KeyDir{}
	dir, err := os.Open(leDir)
	if nil!=err {
		return false, errors.Trace(err)
	}
	defer dir.Close()
	files, err := dir.Readdir(-1)
	if nil!=err {
		return false, errors.Trace(err)
	}
	shouldSleep := false
	for _, f := range files {
		if !f.IsDir() {
			continue
		}
		if strings.HasPrefix(f.Name(), `.`) {
			continue
		}
		kd, err := NewKeyDir(filepath.Join(leDir, f.Name()))
		if nil!=err {
			return false, err
		}
		if nil!=kd && kd.ShouldUpdate() {
			keys = append(keys, kd)
			shouldSleep = shouldSleep || kd.ShouldSleep()
		}
	}
	// If it seems that a .pem file was written too recently, we pause a few
	// seconds to allow certbot to complete whatever it was busy with...
	// This should never be necessary if we run certbot ourselves...
	if shouldSleep {
		time.Sleep(2 * time.Second)
	}
	shouldReload := false
	for _, k := range keys {
		if k.ShouldUpdate() {
			shouldReload = true
			if err := k.Update(); nil!=err {
				return true, err
			}
		}
	}
	return shouldReload, nil
}

func update(renewCmd, leDir, reloadCmd string) error {
	if ``!=renewCmd {
		if err := Exec(renewCmd); nil!=err {
			return err
		}
	}
	reload, err := updateCerts(leDir)
	if ``!=reloadCmd && reload {
		if err := Exec(reloadCmd); nil!=err {
			return err
		}
	}
	// This err is the err from updateCerts - we might reload even if we encounter
	// an updateCerts error
	if nil!=err {
		return err
	}
	return nil
}

var updateCmdFlags struct {
	Dir string
	RenewCmd string
	ReloadCmd string
}

// updateCmd represents the update command
var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "Check for updated certs and update any that need updating",
	Long: `Scans the letsencrypt directory and checks for certs that require updating.`,
	Run: func(cmd *cobra.Command, args []string) {
		doError(update(updateCmdFlags.RenewCmd, updateCmdFlags.Dir, updateCmdFlags.ReloadCmd))
	},
}

func init() {
	rootCmd.AddCommand(updateCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// fetchCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// updateCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
	updateCmd.Flags().StringVarP(&updateCmdFlags.Dir,`dir`,`d`, `/etc/letsencrypt/live`,`Directory of letsencrypt live certificates`)
	updateCmd.Flags().StringVar(&updateCmdFlags.RenewCmd, `renew`, `/etc/haproxy/plugins/cert-renewal-haproxy.sh`, `cert renewal script`)
	updateCmd.Flags().StringVar(&updateCmdFlags.ReloadCmd, `reload`, `systemctl reload haproxy`, `Reload haproxy command`)
}

		
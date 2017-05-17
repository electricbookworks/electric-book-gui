package print

import (
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"regexp"
	"strconv"
	"sync"
	"syscall"
	"time"

	"github.com/golang/glog"
	"gopkg.in/lxc/go-lxc.v2"

	"ebw/config"
	"ebw/util"
)

var _ = filepath.Join

var cloneCount = 0
var cloneCountL sync.Mutex

func cloneContainer(cOld, cNew string) error {
	cmd := exec.Command(`lxc-copy`, `-n`, cOld, `-N`, cNew, `-s`)
	if err := cmd.Run(); nil != err {
		return util.Error(err)
	}
	if !cmd.ProcessState.Success() {
		return util.Error(fmt.Errorf(`lxc-copy failed : exit code is not 0`))
	}
	return nil
}

func PrintInContainer(repoPath, book, printOrScreen string, C chan PrintMessage) (string, error) {
	doError := func(err error) error {
		C <- PrintMessage{Event: `error`, Data: err.Error()}
		return util.Error(err)
	}
	// We clone our bookworks print container
	orig, err := lxc.NewContainer(config.Config.GetPrintContainer(), lxc.DefaultConfigPath())
	if nil != err {
		return ``, doError(err)
	}
	// Need to lock somehow
	cloneCountL.Lock()
	cloneCount++
	cname := fmt.Sprintf(`%s%d`, config.Config.GetPrintContainer(), cloneCount)
	cloneCountL.Unlock()

	glog.Infof(`ConfigPath = %s`, filepath.Join(lxc.DefaultConfigPath(), cname))

	if false {
		if err = orig.Clone(cname, lxc.CloneOptions{
			// Backend: lxc.Best,
			// ConfigPath: filepath.Join(lxc.DefaultConfigPath(), cname),
			// KeepName: true,  // keep the name of the hostname in the container
			// KeepMAC:  false, // new MAC address
			Snapshot: false,
		}); nil != err {
			return ``, doError(fmt.Errorf(`ERROR cloning %s as %s: %s`, config.Config.GetPrintContainer(), cname, err.Error()))
		}
	} else {
		if err = cloneContainer(config.Config.GetPrintContainer(), cname); nil != err {
			return ``, doError(fmt.Errorf(`ERROR cloning %s as %s: %s`, config.Config.GetPrintContainer(), cname, err.Error()))
		}
	}

	container, err := lxc.NewContainer(cname, lxc.DefaultConfigPath())
	if nil != err {
		return ``, doError(err)
	}

	// Destroy the container when we're done
	defer container.Destroy()

	// Attach our repoPath into the cloned container

	LXC, err := scanLxcConfig(container.ConfigFileName())
	if nil != err {
		return ``, doError(err)
	}
	if err = writeLxcConfig(container.ConfigFileName(), addMountToLxc(LXC, repoPath, `opt/book`)); nil != err {
		return ``, doError(err)
	}

	// We've changed the configuration file, so we need to reload it
	// and start it
	if err = container.LoadConfigFile(container.ConfigFileName()); nil != err {
		return ``, doError(err)
	}
	if err = container.Start(); nil != err {
		return ``, doError(err)
	}
	// Stop the container and ensure it's stopped on exit
	defer func() {
		if err = container.Stop(); nil != err {
			util.Error(err)
			return
		}
		if !container.Wait(lxc.STOPPED, 5*time.Second) {
			util.Error(err)
		}
	}()

	if !container.Wait(lxc.RUNNING, 5*time.Second) {
		return ``, doError(fmt.Errorf(`Failed to reach RUNNING state on container %s in 5s`))
	}

	// Container now running, attach a console
	// This code works well, but just creates a Conole for login...
	// Not that useful to me...
	// console := lxc.ConsoleOptions{
	// 	Tty:      -1,
	// 	StdinFd:  os.Stdin.Fd(),
	// 	StdoutFd: os.Stdout.Fd(),
	// 	StderrFd: os.Stderr.Fd(),
	// }
	// if err = container.Console(console); nil != err {
	// 	return ``, doError(fmt.Errorf(`ERROR with Console: %s`, err.Error()))
	// }
	inR, inW, err := os.Pipe()
	if nil != err {
		return ``, doError(fmt.Errorf(`ERROR creating pipe: %v`, err))
	}
	go func() {
		defer inW.Close()
		inW.WriteString(`echo 'Switching to ubuntu user'
su ubuntu
echo 'Start of printing script'
source /usr/local/rvm/scripts/rvm
bundle install
bundle exec jekyll build --config="_config.yml,_configs/_config.print-pdf.yml"
cd _html/` + book + `/text
prince -v -l file-list -o ../../../_output/` + book + `.pdf
echo 'End of printing script'
exit
`)
	}()

	cUser, err := user.Lookup(config.Config.PrintUser)
	if nil != err {
		return ``, doError(fmt.Errorf(`FAILED to find PrintUser %s: %s`, config.Config.PrintUser, err.Error()))
	}
	cUid, err := strconv.ParseInt(cUser.Uid, 10, 64)
	if nil != err {
		return ``, doError(fmt.Errorf(`FAILED to parse user.Uid %s: %s`, cUser.Uid, err.Error()))
	}
	cGid, err := strconv.ParseInt(cUser.Gid, 10, 64)
	if nil != err {
		return ``, doError(fmt.Errorf(`FAILED to parse user.Gid %s: %s`, cUser.Gid, err.Error()))
	}

	glog.Infof(`Going to run inside container as user %v: Uid=%d, Gid=%d`,
		cUser, cUid, cGid)

	attach := lxc.AttachOptions{
		// Specify the namespaces to attach to, as OR'ed list of clone flags
		// (syscall.CLONE_NEWNS | syscall.CLONE_NEWUTS ...).
		Namespaces: syscall.CLONE_NEWUTS | syscall.CLONE_NEWPID | syscall.CLONE_NEWNS,
		Cwd:        `/opt/book`,
		// UID:        int(cUid),
		// GID:        int(cGid),
		ClearEnv: true,
		StdinFd:  inR.Fd(),
		StdoutFd: os.Stdout.Fd(),
		StderrFd: os.Stderr.Fd(),
	}

	if err = container.AttachShell(attach); nil != err {
		return ``, doError(fmt.Errorf(`ERROR with Attach: %s`, err.Error()))
	}

	output := filepath.Join(`_output`, book+`.pdf`)
	return output, nil
}

// addMountToLxc scans the lxc config for
// lxc.mount =
// It passes that through and an lxc.mount.entry as follows:
// lxc.mount.entry = /home/craig/proj/fundza/fundza var/proj/fundza none bind,optional,create=dir 0 0
// Once that's done, it continues, removing any existing mount for the named source
func addMountToLxc(C chan string, src, dest string) chan string {
	mountLine := fmt.Sprintf("lxc.mount.entry = %s %s none bind,optional,create=dir 0 0",
		src, dest)
	mountRegexp := regexp.MustCompile(`^\s*lxc\.mount\s*=`)
	duplicateRegexp := regexp.MustCompile(`^\s*lxc\.mount\.entry\s*=\s*` + src)
	return addLineToLxc(C, mountRegexp, duplicateRegexp, mountLine)
}

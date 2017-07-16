package git

type ResolveMergeOption int

const (
	ResolveMergeOur ResolveMergeOption = 1 << iota
	ResolveMergeTheir
	ResolveMergeGit
)

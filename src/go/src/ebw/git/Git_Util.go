package git

import (
	git2go "gopkg.in/libgit2/git2go.v25"
)

// objectToTree converts a git2go.Object into a Tree
func (g *Git) objectToTree(obj *git2go.Object) (*git2go.Tree, error) {
	treeObj, err := obj.Peel(git2go.ObjectTree)
	if nil != err {
		return nil, g.Error(err)
	}
	defer treeObj.Free()
	tree, err := treeObj.AsTree()
	if nil != err {
		return nil, g.Error(err)
	}
	return tree, nil
}

// objectToCommit converts a git2go.Object to a git2go.Commit
func (g *Git) objectToCommit(obj *git2go.Object) (*git2go.Commit, error) {
	commitObj, err := obj.Peel(git2go.ObjectCommit)
	if nil != err {
		return nil, g.Error(err)
	}
	defer commitObj.Free()
	commit, err := commitObj.AsCommit()
	if nil != err {
		return nil, g.Error(err)
	}
	return commit, nil
}

// objectToCommitAndTree converts an object to both a git2go Commit and git2go Tree
func (g *Git) objectToCommitAndTree(obj *git2go.Object) (*git2go.Commit, *git2go.Tree, error) {
	commit, err := g.objectToCommit(obj)
	if nil != err {
		return nil, nil, err
	}
	tree, err := g.objectToTree(obj)
	if nil != err {
		return nil, nil, err
	}
	return commit, tree, nil
}

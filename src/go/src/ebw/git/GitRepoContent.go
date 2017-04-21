package git

const DefaultSearchFile = `_data/meta.yml`

func ContainsFile(client *Client, gr *GitRepo) (bool, error) {
	content, _, _, _ := client.Repositories.GetContents(client.Context,
		gr.Owner.GetLogin(), gr.GetName(), DefaultSearchFile, nil)

	return nil != content, nil

}

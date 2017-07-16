package git

const DefaultSearchFile = `_data/meta.yml`

func ContainsFile(client *Client, gr *GitRepo) (bool, error) {
	content, _, _, _ := client.Repositories.GetContents(client.Context,
		gr.Owner.GetLogin(), gr.GetName(), DefaultSearchFile, nil)
	// TODO This is tricky because I get an err if the file isn't found.
	// On the other hand, the error could be that something went wrong
	// with the API. How do I determine which is which?

	return nil != content, nil

}

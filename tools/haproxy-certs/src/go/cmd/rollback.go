package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"haproxy-certs/database"
)

// rollbackCmd rolls back the database
var rollbackCmd = &cobra.Command{
	Use:   "rollback",
	Short: "Rollback the database to a specific version",
	Long: `Rolls back the database to a specific version`,
	Run: func(cmd *cobra.Command, args []string) {
		if 1!=len(args) {
			doError(fmt.Errorf("You need to provide the version you wish to roll back to, or -1 to go back 1 version"))
		}
		doError(database.Rollback(viper.GetString("db"), args[0]))
	},
}

func init() {
	rootCmd.AddCommand(rollbackCmd)
}


package cmd

import (
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"haproxy-certs/web"
)

// webCmd runs the webserver
var webCmd = &cobra.Command{
	Use:   "web",
	Short: "Run the webserver",
	Long: `Runs the webserver`,
	Run: func(cmd *cobra.Command, args []string) {
		doError(web.Web(viper.GetString("db"), viper.GetString("listen")))
	},
}

func init() {
	rootCmd.AddCommand(webCmd)
	webCmd.Flags().StringP("listen","l",":19051","Port/Address on which to listen")
	viper.BindPFlag("listen",webCmd.Flags().Lookup("listen"))
}


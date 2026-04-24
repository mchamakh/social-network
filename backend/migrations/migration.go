package migrations

import (
	"log"
	"path/filepath"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigration(databaseURL string) {
	migrationPath, err := filepath.Abs("./migrations")
	if err != nil {
		log.Fatal(err)
	}

	m, err := migrate.New(
		"file://"+migrationPath,
		databaseURL,
	)
	if err != nil {
		log.Fatal(err)
	}

	if err := m.Up(); err != nil && err.Error() != "no change" {
		log.Fatal(err)
	}

	log.Println("migration applied successfully")
}

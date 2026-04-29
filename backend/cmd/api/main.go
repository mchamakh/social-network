package main

import (
	"api/config"
	"api/container"
	"api/database"
	"api/routes"
	"os"
)

func main() {
	config.LoadEnv()

	dsn := os.Getenv("DB_URL")

	db, err := database.InitDB(dsn)
	if err != nil {
		panic("could not connect to the db")
	}

	container := container.NewContainer(db)

	r := routes.NewRouter(container)

	r.Run()

}

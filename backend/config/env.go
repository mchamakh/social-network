package config

import (
	"log"
	"sync"

	"github.com/joho/godotenv"
)

var once sync.Once

func LoadEnv() {
	once.Do(func() {
		err := godotenv.Load()
		if err != nil {
			log.Println("could not find any .env file, or error loading it !")
		}
	})
}

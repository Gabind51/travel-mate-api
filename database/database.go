package database

import (
	"log"

	"travelmate-api/models"
	"travelmate-api/utils"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("travelmate.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	DB.AutoMigrate(&models.User{}, models.Trip{})
	createDefaultAdmin()

	log.Println("db init")

	return nil
}

func createDefaultAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("email = ?", "admin@travelmate.com").Count(&count)

	if count == 0 {
		hashedPassword, _ := utils.HashPassword("admin123456")
		admin := models.User{
			Name:     "Admin",
			Email:    "admin@travelmate.com",
			Password: hashedPassword,
			IsAdmin:  true,
		}

		DB.Create(&admin)
		log.Println("Admin créé avec succès.")
	}
}


package database

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"travelmate-api/models"
	"golang.org/x/crypto/bcrypt"
)

var DB *gorm.DB

func InitDB() {
	var err error

	// Ouvre une BDD SQLite dans un fichier local
	DB, err = gorm.Open(sqlite.Open("travelmate.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Erreur de connexion à la base de données :", err)
	}

	// Migration automatique des modèles
	err = DB.AutoMigrate(&models.User{}, &models.Trip{})
	if err != nil {
		log.Fatal("Erreur lors de la migration :", err)
	}

	// Création de l'utilisateur admin s'il n'existe pas
	createDefaultAdmin()
}

func createDefaultAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("email = ?", "admin@travelmate.com").Count(&count)

	if count == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Erreur lors du hash du mot de passe admin :", err)
			return
		}

		admin := models.User{
			Name:     "Admin",
			Email:    "admin@travelmate.com",
			Password: string(hashedPassword),
			IsAdmin:  true,
		}

		if err := DB.Create(&admin).Error; err != nil {
			log.Println("Erreur lors de la création de l'admin :", err)
		} else {
			log.Println("Admin créé avec succès.")
		}
	}
}

package controllers

import (
	"os"

	"travelmate-api/database"

	"github.com/gin-gonic/gin"
)

func ResetDatabase(c *gin.Context) {
	if database.DB != nil {
		sqlDB, err := database.DB.DB()
		if err != nil {
			c.JSON(500, gin.H{"error": "impossible de récupérer la connexion SQL : " + err.Error()})
			return
		}
		sqlDB.Close()
	}

	err := os.Remove("travelmate.db")
	if err != nil && !os.IsNotExist(err) {
		c.JSON(500, gin.H{"error": "Erreur lors de la suppression de la base : " + err.Error()})
		return
	}

	err = database.InitDB()
	if err != nil {
		c.JSON(500, gin.H{"error": "Erreur lors de l'initialisation de la base : " + err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Base de données réinitialisée avec succès"})
}

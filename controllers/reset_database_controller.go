package controllers

import (
	"net/http"
	"travelmate-api/database"

	"github.com/gin-gonic/gin"
)

func ResetDatabase(c *gin.Context) {
	// Supprimer toutes les données sauf l’admin
	if err := database.DB.Exec("DELETE FROM trips").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur sur trips"})
		return
	}
	if err := database.DB.Exec("DELETE FROM users WHERE is_admin = false").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur sur users"})
		return
	}
	// Ajouter d’autres tables ici si besoin (ex: activities, notes…)

	c.JSON(http.StatusOK, gin.H{"message": "Base de données réinitialisée"})
}

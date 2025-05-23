package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"travelmate-api/database"
	"travelmate-api/models"
)

func GetMe(c *gin.Context) {
	userIDStr, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userIDStr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utilisateur non trouvé"})
		return
	}

	// On ne retourne pas le mot de passe
	user.Password = ""
	c.JSON(http.StatusOK, user)
}


// GetUsers godoc
// @Summary Liste tous les utilisateurs
// @Description Retourne tous les utilisateurs enregistrés
// @Tags users
// @Produce json
// @Success 200 {array} models.User
// @Router /users [get]
// @Security BearerAuth
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération des utilisateurs"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// GetUsersByID godoc
// @Summary Liste un utilisateur en fonction de son email
// @Description Retourne tous les utilisateurs enregistrés
// @Tags users
// @Produce json
// @Param email path string true "Email de l'utilisateur"
// @Success 200 {array} models.User
// @Router /user [get]
// @Security BearerAuth
func GetUsersByEmail(c *gin.Context) {
	email := c.Param("email")
	var user []models.User
	if err := database.DB.First(&user, email).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Utilisateur non trouvé"})
		return
	}
	c.JSON(http.StatusOK, user)
}

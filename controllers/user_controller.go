package controllers

import (
	"log"
	"net/http"
	"strconv"

	"travelmate-api/database"
	"travelmate-api/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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

// UpdateUser godoc
// @Summary Mise à jour d'un utilisateur
// @Description Met à jour un utilisateur
// @Tags users
// @Produce json
// @Param id path string true "Identifiant de l'utilisateur"
// @Success 200 {array} models.User
// @Router /users [PUT]
// @Security BearerAuth
func UpdateUser(c *gin.Context) {
	// On récupère le paramètre envoyé dans la requête
	idParam := c.Param("id")
	userIDToUpdate, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID utilisateur invalide"})
		return
	}

	// On recupère les informations de l'utilisateur courant
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}
	currentUserIDUint := currentUserID.(uint)

	// On regarde si l'utilisateur courant est admin
	isAdminVal, exists := c.Get("is_admin")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}
	isAdmin := isAdminVal.(bool)

	// On recupère l'utilisateur à modifier
	var userToUpdate models.User
	if err := database.DB.First(&userToUpdate, userIDToUpdate).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utilisateur non trouvé"})
		return
	}

	// Si l'utilisateur n'est pas admin et qu'il essaye de modifier les informations d'un autre utilisateur
	if !isAdmin && currentUserIDUint != uint(userIDToUpdate) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Vous ne pouvez modifier que vos propres informations"})
		return
	}
	// Si l'utilisateur est admin et qu'il essaye de modifier les informations d'un autre admin
	log.Println(userToUpdate.ID, currentUserIDUint, userIDToUpdate)
	if isAdmin && userToUpdate.IsAdmin && currentUserIDUint != uint(userIDToUpdate) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Un admin ne peut pas modifier un autre admin"})
		return
	}

	var input struct {
		Name     *string `json:"name"`
		Email    *string `json:"email" binding:"omitempty,email"`
		Password *string `json:"password" binding:"omitempty,min=6"`
		IsAdmin  *bool   `json:"is_admin"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !isAdmin && input.IsAdmin != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Seul les administrateurs peuvent modifier les privilèges"})
		return
	}

	if input.Name != nil {
		userToUpdate.Name = *input.Name
	}
	if input.Email != nil {
		var count int64
		database.DB.Model(&models.User{}).Where("email = ? AND id != ?", *input.Email, userToUpdate.ID).Count(&count)
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Cet email est déjà utilisé"})
			return
		}
		userToUpdate.Email = *input.Email
	}
	if input.Password != nil {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors du hash du mot de passe"})
			return
		}
		userToUpdate.Password = string(hashedPassword)
	}

	log.Println(input)

	if input.IsAdmin != nil {
		if !isAdmin { 
			c.JSON(http.StatusForbidden, gin.H{"error": "Seul un administrateur peut modifier ce champ"})
			return
		}
		userToUpdate.IsAdmin = *input.IsAdmin
	}

	if err := database.DB.Save(&userToUpdate).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la mise à jour de l'utilisateur"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Utilisateur mis à jour avec succès"})
}

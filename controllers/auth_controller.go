package controllers

import (
	"net/http"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"travelmate-api/models"
	"travelmate-api/database"
	"travelmate-api/utils"
)

var jwtKey = []byte("your_secret_key")

// GetTrips godoc
// @Summary Création d'un utilisateur
// @Description Permet à un utilisateur de créer un compte
// @Tags auth
// @Accept application/x-www-form-urlencoded
// @Produce json
// @Param input body models.Register true "Nom de l'utilisateur"
// @Success 200 {array} models.RegisterResponse
// @Router /register [post]
func Register(c *gin.Context) {
	var input struct {
		Name     string `form:"name" binding:"required"`
		Email    string `form:"email" binding:"required,email"`
		Password string `form:"password" binding:"required,min=6"`
	}

	// Bind JSON
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Vérifie si l'email existe déjà
	var existingUser models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email déjà utilisé"})
		return
	}

	// Hash du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors du hash du mot de passe"})
		return
	}

	// Création de l'utilisateur
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
		IsAdmin:  false,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la création de l'utilisateur"})
		return
	}

	// Génération du token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(72 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la génération du token"})
		return
	}

	// Réponse
	c.JSON(http.StatusCreated, gin.H{
		"message": "Utilisateur créé",
		"token":   tokenString,
	})
}

// GetTrips godoc
// @Summary Authentification d'un utilisateur
// @Description Permet à un utilisateur de s'authentifier
// @Tags auth
// @Accept application/x-www-form-urlencoded
// @Produce json
// @Param email formData string true "Email"
// @Param password formData string true "Mot de passe"
// @Success 200 {array} models.RegisterResponse
// @Router /login [post]
func Login(c *gin.Context) {
	var input struct {
		Email    string `form:"email"`
		Password string `form:"password"`
	}

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Champs invalides"})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur introuvable"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		if err != nil {
			log.Fatal(err)
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Mot de passe incorrect"})
		return
	}

	token, _ := utils.GenerateJWT(user.ID, user.IsAdmin)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

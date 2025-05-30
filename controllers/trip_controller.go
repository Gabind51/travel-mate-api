package controllers

import (
	"net/http"

	"travelmate-api/database"
	"travelmate-api/models"

	"github.com/gin-gonic/gin"
)

// GetTrips godoc
// @Summary Liste tous les voyages
// @Description Retourne tous les voyages enregistrés
// @Tags trips
// @Produce json
// @Success 200 {array} models.Trip
// @Router /trips [get]
// @Security BearerAuth
func GetTrips(c *gin.Context) {
	var trips []models.Trip
	if err := database.DB.Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération"})
		return
	}
	c.JSON(http.StatusOK, trips)
}

// GetTripByID godoc
// @Summary Récupérer un voyage par son ID
// @Description Retourne les détails d’un voyage spécifique à partir de son ID
// @Tags Trips
// @Produce json
// @Param id path int true "ID du voyage"
// @Success 200 {object} models.Trip
// @Failure 404 {object} map[string]string "Voyage non trouvé"
// @Router /trips/{id} [get]
func GetTripByID(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Voyage non trouvé"})
		return
	}
	c.JSON(http.StatusOK, trip)
}

// GetTripsByUserID godoc
// @Summary Récupérer les voyages d’un utilisateur
// @Description Retourne tous les voyages associés à un utilisateur donné
// @Tags Trips
// @Produce json
// @Param id path int true "ID de l'utilisateur"
// @Success 200 {array} models.Trip
// @Failure 500 {object} map[string]string "Erreur lors de la récupération des voyages"
// @Router /trips/user/{id} [get]
func GetTripsByUserID(c *gin.Context) {
	id := c.Param("id")

	var trips []models.Trip
	if err := database.DB.Where("user_id = ?", id).Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération des voyages"})
		return
	}

	c.JSON(http.StatusOK, trips)
}

// CreateTrip godoc
// @Summary Créer un voyage
// @Description Crée un nouveau voyage avec les informations fournies
// @Tags Trips
// @Accept json
// @Produce json
// @Param trip body models.Trip true "Données du voyage"
// @Success 201 {object} models.Trip
// @Failure 400 {object} map[string]string "Format invalide"
// @Failure 500 {object} map[string]string "Erreur de création"
// @Router /trips [post]
func CreateTrip(c *gin.Context) {
	var trip models.Trip
	if err := c.ShouldBindJSON(&trip); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format invalide"})
		return
	}
	if err := database.DB.Create(&trip).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur de création"})
		return
	}
	c.JSON(http.StatusCreated, trip)
}

// UpdateTrip godoc
// @Summary Mettre à jour un voyage
// @Description Met à jour un voyage existant avec les nouvelles données fournies
// @Tags Trips
// @Accept json
// @Produce json
// @Param id path int true "ID du voyage"
// @Param trip body models.Trip true "Nouvelles données du voyage"
// @Success 200 {object} models.Trip
// @Failure 400 {object} map[string]string "Format invalide"
// @Failure 404 {object} map[string]string "Voyage non trouvé"
// @Router /trips/{id} [put]
func UpdateTrip(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Voyage non trouvé"})
		return
	}
	if err := c.ShouldBindJSON(&trip); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format invalide"})
		return
	}
	database.DB.Save(&trip)
	c.JSON(http.StatusOK, trip)
}

// UpdateMultipleTrips godoc
// @Summary Mettre à jour plusieurs voyages
// @Description Met à jour les champs spécifiés pour une liste de voyages
// @Tags Trips
// @Accept json
// @Produce json
// @Param update body object{ids=[]uint,update=map[string]interface{}} true "Liste des IDs et des champs à mettre à jour"
// @Success 200 {object} map[string]string "Mise à jour effectuée"
// @Failure 400 {object} map[string]string "Format invalide ou données manquantes"
// @Failure 500 {object} map[string]string "Erreur lors de la mise à jour"
// @Router /trips [put]
func UpdateMultipleTrips(c *gin.Context) {
	var payload struct {
		IDs    []uint              `json:"ids"`
		Update map[string]interface{} `json:"update"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format invalide"})
		return
	}

	if len(payload.IDs) == 0 || len(payload.Update) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "IDs ou données manquantes"})
		return
	}

	if err := database.DB.Model(&models.Trip{}).Where("id IN ?", payload.IDs).Updates(payload.Update).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la mise à jour"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Mise à jour effectuée"})
}

// DeleteTrip godoc
// @Summary Supprimer un voyage
// @Description Supprime un voyage par son ID si l'utilisateur est le propriétaire ou un administrateur
// @Tags Trips
// @Produce json
// @Param id path int true "ID du voyage à supprimer"
// @Success 200 {object} map[string]string "Le voyage a bien été supprimé"
// @Failure 400 {object} map[string]string "Requête invalide"
// @Failure 401 {object} map[string]string "Utilisateur non authentifié"
// @Failure 403 {object} map[string]string "Accès refusé"
// @Failure 404 {object} map[string]string "Voyage introuvable"
// @Failure 500 {object} map[string]string "Erreur serveur lors de la suppression"
// @Security BearerAuth
// @Router /trips/{id} [delete]
func DeleteTrip(c *gin.Context) {
	id := c.Param("id")

	// Récupère le voyage
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Voyage introuvable"})
		return
	}

	// Récupère l'utilisateur connecté
	currentUserID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Utilisateur non authentifié"})
		return
	}

	isAdmin, _ := c.Get("is_admin")

	// Vérifie si l'utilisateur est propriétaire ou admin
	if trip.UserID != currentUserID.(uint) && !isAdmin.(bool) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Accès refusé : vous ne pouvez pas supprimer ce voyage"})
		return
	}

	// Supprime le voyage
	if err := database.DB.Delete(&trip).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la suppression"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Le voyage a bien été supprimé"})
}

func DeleteMultipleTrips(c *gin.Context) {
	var payload struct {
		IDs []uint `json:"ids"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format invalide"})
		return
	}

	if len(payload.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Aucun ID fourni"})
		return
	}

	if err := database.DB.Where("id IN ?", payload.IDs).Delete(&models.Trip{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la suppression"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Suppression effectuée"})
}

// SearchTrips godoc
// @Summary Rechercher des voyages
// @Description Recherche les voyages dont un champ contient la sous-chaîne donnée (titre, description, localisation, dates)
// @Tags Trips
// @Accept json
// @Produce json
// @Param query query string true "Terme de recherche (doit correspondre partiellement à un champ du voyage)"
// @Success 200 {array} models.Trip
// @Failure 400 {object} map[string]string "Le paramètre 'query' est requis"
// @Failure 500 {object} map[string]string "Erreur lors de la recherche"
// @Router /trips/search [get]
func SearchTrips(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Le paramètre 'query' est requis"})
		return
	}

	var trips []models.Trip
	searchPattern := "%" + query + "%"

	err := database.DB.Where(
		"title LIKE ? OR description LIKE ? OR location LIKE ? OR start_date LIKE ? OR end_date ILIKE ?",
		searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
	).Find(&trips).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la recherche"})
		return
	}

	c.JSON(http.StatusOK, trips)
}

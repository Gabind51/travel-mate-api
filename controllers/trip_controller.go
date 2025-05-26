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

func GetTripByID(c *gin.Context) {
	id := c.Param("id")
	var trip models.Trip
	if err := database.DB.First(&trip, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Voyage non trouvé"})
		return
	}
	c.JSON(http.StatusOK, trip)
}

func GetTripsByUserID(c *gin.Context) {
	id := c.Param("id")

	var trips []models.Trip
	if err := database.DB.Where("user_id = ?", id).Find(&trips).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la récupération des voyages"})
		return
	}

	c.JSON(http.StatusOK, trips)
}

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

func DeleteTrip(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Trip{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur suppression"})
		return
	}
	c.Status(http.StatusNoContent)
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

func SearchTrips(c *gin.Context) {
	location := c.Query("location")
	if location == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error" : "Le paramètre 'location' est requis"})
		return
	}

	var trips []models.Trip
	if err := database.DB.Where("location LIKE ?", "%"+location+"%").Find(&trips).Error; err!= nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erreur lors de la recherche"})
		return
	}

	c.JSON(http.StatusOK, trips)
}

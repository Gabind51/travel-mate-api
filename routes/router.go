package routes

import (
    "github.com/gin-gonic/gin"
    "travelmate-api/controllers"
    "travelmate-api/middleware"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "travelmate-api/docs"
)

func SetupRoutes(r *gin.Engine) {
    // Swagger
    r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

    // Auth
    r.POST("/login", controllers.Login)
    r.POST("/register", controllers.Register)
    
    // Utilisation du middlewate sur l'ensemble des routes
    protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
    protected.GET("/me", controllers.GetMe)

	// Users
	protected.GET("/users", controllers.GetUsers)
	protected.GET("/user", controllers.GetUsersByEmail)

    // Trips
    tripGroup := protected.Group("/trips")
    {
        tripGroup.GET("", controllers.GetTrips)
		tripGroup.GET("/:id", controllers.GetTripByID)
		tripGroup.POST("", controllers.CreateTrip)
		tripGroup.PUT("/:id", controllers.UpdateTrip)
		tripGroup.PUT("/", controllers.UpdateMultipleTrips)
		tripGroup.DELETE("/:id", controllers.DeleteTrip)
		tripGroup.DELETE("", controllers.DeleteMultipleTrips)
    }

    // Admin
    admin := protected.Group("/admin")
    admin.Use(middleware.IsAdmin())
    {
        admin.POST("/reset", controllers.ResetDatabase)
    }
}

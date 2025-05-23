package models

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `json:"name" validate:"required"`
	Email    string `gorm:"uniqueIndex" json:"email" validate:"required,email"`
	Password string `gorm:"type:text;not null" json:"-"` 
	IsAdmin  bool   `json:"isAdmin"`
}

type Register struct {
    Name     string `json:"name" example:"Jean Dupont" binding:"required"`
    Email    string `json:"email" example:"jean@example.com" binding:"required,email"`
    Password string `json:"password" example:"secret123" binding:"required,min=6"`
}

type RegisterResponse struct {
    Message string `json:"message" example:"Inscription réussie"`
    Token   string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
}

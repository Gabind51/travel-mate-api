package models

type Trip struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Location    string  `json:"location"`
	StartDate   string  `json:"startDate"`
	EndDate     string  `json:"endDate"`
	Longitude   float64 `json:"longitude"`
	Latitude    float64 `json:"latitude"`
	Notes       string  `json:"notes"`
	UserID      uint    `json:"userId"`
}

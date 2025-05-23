package utils

import (
	"time"
	"os"
	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(getJWTSecret())

func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "my_very_secret_key" // fallback
	}
	return secret
}

func GenerateJWT(userID uint, isAdmin bool) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": userID,
		"is_admin": isAdmin,
        "exp":     time.Now().Add(time.Hour * 24).Unix(), // expiration dans 24h
    })

	tokenString, err := token.SignedString(getJWTSecret())
    if err != nil {
        return "", err
    }

    return tokenString, nil
}

func ParseToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, err
	}

	return claims, nil
}

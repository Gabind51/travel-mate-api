package logger

import (
	"io"
	"log"
	"os"
)

var (
	ErrorLogger *log.Logger
	InfoLogger  *log.Logger
	RequestLogger *log.Logger
)

func InitLogger() {
	// Ouvre les fichiers de log (créés s'ils n'existent pas)
	errorFile, err := os.OpenFile("logs/error.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Erreur lors de l'ouverture de error.log: %v", err)
	}

	infoFile, err := os.OpenFile("logs/app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("Erreur lors de l'ouverture de app.log: %v", err)
	}

	// Initialise les loggers
	ErrorLogger = log.New(io.MultiWriter(os.Stderr, errorFile), "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	InfoLogger = log.New(io.MultiWriter(os.Stdout, infoFile), "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
}

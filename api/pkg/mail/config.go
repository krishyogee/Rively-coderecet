package mail

import (
	"os"
)

type EmailConfig struct {
	SMTPHost    string
	SMTPPort    int
	Username    string
	Password    string
	SenderEmail string
}

func LoadConfig() *EmailConfig {
	return &EmailConfig{
		SMTPHost:    os.Getenv("SENDER_SMTP_SERVER"),
		SMTPPort:    587, // Default SMTP port, or fetch from env
		Username:    os.Getenv("SENDER_EMAIL"),
		Password:    os.Getenv("SENDER_PASSWORD"),
		SenderEmail: os.Getenv("SENDER_EMAIL"),
	}
}

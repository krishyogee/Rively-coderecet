// email/email.go
package mail

import (
	"fmt"
	"log"
	"sync"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	config *EmailConfig
}

var (
	emailServiceInstance *EmailService
	once                 sync.Once
)

// InitEmailService initializes the EmailService singleton
func InitEmailService() {
	once.Do(func() {
		config := LoadConfig()
		emailServiceInstance = &EmailService{config: config}
	})
}

// GetEmailService returns the singleton instance of EmailService
func GetEmailService() *EmailService {
	return emailServiceInstance
}

func (s *EmailService) SendMail(to, subject, body string) error {
	fmt.Println("Sending maillll", s.config.Password, s.config.SMTPHost, s.config.SenderEmail)
	m := gomail.NewMessage()
	m.SetHeader("From", s.config.SenderEmail)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body)

	dialer := gomail.NewDialer(s.config.SMTPHost, s.config.SMTPPort, s.config.Username, s.config.Password)

	if err := dialer.DialAndSend(m); err != nil {
		log.Printf("Could not send email to %s: %v", to, err)
		return err
	}

	log.Printf("Email sent to %s", to)
	return nil
}

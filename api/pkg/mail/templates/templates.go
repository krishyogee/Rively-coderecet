// // File: internal/mail/templates/templates.go
package templates

// import (
// 	"bytes"
// 	"embed"
// 	"html/template"
// )

// //go:embed html/*
// var templateFS embed.FS

// // EmailTemplate represents the data needed for email templates
// type EmailTemplate struct {
// 	VerificationLink string
// 	EmailAddress     string
// }

// // GetVerificationEmailHTML returns the parsed verification email HTML
// func GetVerificationEmailHTML(data EmailTemplate) (string, error) {
// 	tmpl, err := template.ParseFS(templateFS, "html/verification.html")
// 	if err != nil {
// 		return "", err
// 	}

// 	var buf bytes.Buffer
// 	if err := tmpl.Execute(&buf, data); err != nil {
// 		return "", err
// 	}

// 	return buf.String(), nil
// }

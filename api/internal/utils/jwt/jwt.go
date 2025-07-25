package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

type InviteTokenClaims struct {
	DepartmentUID string    `json:"departmentUID"`
	CustomerUID   string    `json:"customerUID"`
	IsValid       bool      `json:"isValid"`
	ExpiresAt     time.Time `json:"expiresAt"`
	CreatedAt     time.Time `json:"createdAt"`
}

const secretKey = "your-secret-key-change-this-in-production" // TODO: Move to environment variable

// GenerateInviteToken creates a JWT token for email invitation
func GenerateInviteToken(departmentUID, customerUID string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(24 * time.Hour) // Valid for 24 hours

	claims := InviteTokenClaims{
		DepartmentUID: departmentUID,
		CustomerUID:   customerUID,
		IsValid:       true,
		ExpiresAt:     expiresAt,
		CreatedAt:     now,
	}

	// Create header
	header := map[string]interface{}{
		"alg": "HS256",
		"typ": "JWT",
	}

	// Encode header
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	headerEncoded := base64.RawURLEncoding.EncodeToString(headerJSON)

	// Encode payload
	payloadJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payloadEncoded := base64.RawURLEncoding.EncodeToString(payloadJSON)

	// Create signature
	message := headerEncoded + "." + payloadEncoded
	signature := createSignature(message, secretKey)

	// Combine all parts
	token := message + "." + signature

	return token, nil
}

// ValidateInviteToken validates and decodes a JWT token
func ValidateInviteToken(token string) (*InviteTokenClaims, error) {
	// Split token into parts
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	headerEncoded := parts[0]
	payloadEncoded := parts[1]
	signatureProvided := parts[2]

	// Verify signature
	message := headerEncoded + "." + payloadEncoded
	expectedSignature := createSignature(message, secretKey)

	if !hmac.Equal([]byte(signatureProvided), []byte(expectedSignature)) {
		return nil, fmt.Errorf("invalid token signature")
	}

	// Decode payload
	payloadJSON, err := base64.RawURLEncoding.DecodeString(payloadEncoded)
	if err != nil {
		return nil, fmt.Errorf("failed to decode payload: %w", err)
	}

	var claims InviteTokenClaims
	if err := json.Unmarshal(payloadJSON, &claims); err != nil {
		return nil, fmt.Errorf("failed to unmarshal claims: %w", err)
	}

	// Check if token is expired
	if time.Now().After(claims.ExpiresAt) {
		claims.IsValid = false
		return &claims, nil // Return claims but mark as invalid
	}

	return &claims, nil
}

// createSignature creates HMAC SHA256 signature
func createSignature(message, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(message))
	return base64.RawURLEncoding.EncodeToString(h.Sum(nil))
}

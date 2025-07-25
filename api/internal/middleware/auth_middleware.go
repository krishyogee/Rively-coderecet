package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type contextKey string

const (
	UserContextKey = contextKey("user")
)

type User struct {
	ID          string        // Clerk user ID (e.g., user_2zHMtEyAUpVjHYRbo08bHD5IkpM)
	UserName    string
	User        interface{}
	Roles       []string
	CustomerUID uuid.UUID
	UserUID     uuid.UUID     // Custom UUID from database
}

func AuthMiddleware() gin.HandlerFunc {
	fmt.Println("AuthMiddleware")
	return func(c *gin.Context) {
		// Skip auth for OPTIONS requests (CORS preflight)
		if c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		// Skip auth for playground requests
		if c.Request.Method == "GET" {
			c.Next()
			return
		}

		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Unable to read request body"})
			return
		}
		// Restore the body to allow further reading
		c.Request.Body = io.NopCloser(bytes.NewReader(body))

		// Parse the body as a JSON object
		var requestBody map[string]interface{}
		err = json.Unmarshal(body, &requestBody)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

		// Extract the operation name
		operationName, ok := requestBody["operationName"].(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No operation name found"})
			return
		}

		// Log the operation name
		fmt.Println("AuthMiddleware operationName:", operationName)

		if isPublicOperation(operationName) {
			c.Next()
			return
		}


		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token provided"})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		_, err = jwt.Verify(c.Request.Context(), &jwt.VerifyParams{Token: token})
		if err != nil {
			fmt.Println("Verification error:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		decodedToken, err := jwt.Decode(c.Request.Context(), &jwt.DecodeParams{Token: token})
		if err != nil {
			fmt.Println("Error while decoding token:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}


		// Extract user details directly from decodedToken.Extra
		customerIDStr, ok := decodedToken.Extra["customerID"].(string)
		if !ok {
			fmt.Println("CustomerID not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid customer ID"})
			c.Abort()
			return
		}

		customerID, err := uuid.Parse(customerIDStr)
		if err != nil {
			fmt.Println("Invalid customer ID format:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid customer ID format"})
			c.Abort()
			return
		}

		userUIDStr, ok := decodedToken.Extra["userUID"].(string)
		if !ok {
			fmt.Println("UserUID not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user UID"})
			c.Abort()
			return
		}

		userUID, err := uuid.Parse(userUIDStr)
		if err != nil {
			fmt.Println("Invalid user UID format:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user UID format"})
			c.Abort()
			return
		}

		role, ok := decodedToken.Extra["role"].(string)
		if !ok {
			fmt.Println("Role not found in token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid role"})
			c.Abort()
			return
		}

		// UserName might not be present in the token; adjust as needed
		userName, _ := decodedToken.Extra["userName"].(string) // Optional field

		user := &User{
			ID:          decodedToken.Subject, // Clerk user ID
			User:        decodedToken,
			UserUID:     userUID,             // Custom UUID
			UserName:    userName,
			CustomerUID: customerID,
			Roles:       []string{role},
		}

		// Attach user to context for downstream access
		ctx := context.WithValue(c.Request.Context(), UserContextKey, user)
		c.Request = c.Request.WithContext(ctx)

		// Proceed to next middleware or handler
		c.Next()
	}
}

func isPublicOperation(operationName string) bool {
	publicOperations := map[string]bool{
		"Login":          true,
		"Signup":         true,
		"signup":         true,
		"verifyCustomer": true,
	}
	return publicOperations[operationName]
}

func GetUserUIDFromContext(ctx context.Context) (uuid.NullUUID, error) {
	user, ok := ctx.Value(UserContextKey).(*User)
	if !ok {
		return uuid.NullUUID{Valid: false}, fmt.Errorf("no user in context")
	}
	return uuid.NullUUID{UUID: user.UserUID, Valid: true}, nil
}

func GetCustomerUIDFromContext(ctx context.Context) (uuid.NullUUID, error) {
	user, ok := ctx.Value(UserContextKey).(*User)
	if !ok {
		return uuid.NullUUID{Valid: false}, fmt.Errorf("no user in context")
	}
	return uuid.NullUUID{UUID: user.CustomerUID, Valid: true}, nil
}

// Add this function to retrieve Clerk user ID
func GetClerkUserIDFromContext(ctx context.Context) (string, error) {
	user, ok := ctx.Value(UserContextKey).(*User)
	if !ok {
		return "", fmt.Errorf("no user in context")
	}
	if user.ID == "" {
		return "", fmt.Errorf("clerk user ID not found in context")
	}
	return user.ID, nil
}
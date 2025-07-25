package helpers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"

	"crypto/sha256"
	"encoding/binary"

	"github.com/google/uuid"
)

func GenerateToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func NullInt32ToIntPointer(nullInt sql.NullInt32) *int {
	if !nullInt.Valid {
		return nil
	}
	value := int(nullInt.Int32)
	return &value
}

func IntToNullIntPointer(i int) *sql.NullInt32 {
	return &sql.NullInt32{Int32: int32(i), Valid: true}
}

func GetDomainFromEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) == 2 {
		domainParts := strings.Split(parts[1], ".")
		if len(domainParts) > 0 {
			return domainParts[0]
		}
	}
	return ""
}

// Utility function to convert uuid.NullUUID to string
func NullUUIDToString(n uuid.NullUUID) string {
    if n.Valid {
        return n.UUID.String()
    }
    return ""
}

// Converts a string to a uuid.NullUUID
func StringToNullUUID(s string) uuid.NullUUID {
    parsedUUID, err := uuid.Parse(s)
    if err != nil {
        return uuid.NullUUID{Valid: false}
    }
    return uuid.NullUUID{UUID: parsedUUID, Valid: true}
}

func StringToPtr(s string) *string {
    return &s
}

func Int32ToPtr(i int32) *int {
    v := int(i)
    return &v
}

func NullStringToPtr(ns sql.NullString) *string {
    if ns.Valid {
        return &ns.String
    }
    return nil
}

func StringToNullString(s string) sql.NullString {
    return sql.NullString{String: s, Valid: true}
}

func StringToUUID(s string) (uuid.UUID, error) {
    parsedUUID, err := uuid.Parse(s)
    if err != nil {
        return uuid.UUID{}, err
    }
    return parsedUUID, nil
}

func BoolToPtr(b bool) *bool {
    return &b
}

func StringToInt32(s string) (int32, error) {
    i, err := strconv.ParseInt(s, 10, 32)
    if err != nil {
        return 0, err
    }
    return int32(i), nil
}

func StringToFloat64(s string) (float64, error) {
    f, err := strconv.ParseFloat(s, 64)
    if err != nil {
        return 0, err
    }
    return f, nil
}

func StringToNullTime(s string) (sql.NullTime, error) {
    t, err := time.Parse(time.RFC3339, s)
    if err != nil {
        return sql.NullTime{}, err
    }
    return sql.NullTime{Time: t, Valid: true}, nil
}

func ToJSON(v interface{}) string {
    b, err := json.MarshalIndent(v, "", "  ")
    if err != nil {
        return fmt.Sprintf("error converting to JSON: %v", err)
    }
    return string(b)
}
//	Converts a uuid.NullUUID to a Ptr
func UUIDToIntPtr(n uuid.NullUUID) *int {
	if !n.Valid {
		return nil
	}

	// Hash the UUID to produce a deterministic integer
	hash := sha256.Sum256([]byte(n.UUID.String()))
	value := int(binary.BigEndian.Uint32(hash[:4])) // Use the first 4 bytes of the hash
	return &value
}

// NullTimeToStringPtr converts a sql.NullTime to a pointer to a string.
// If the time is valid, it formats it using the provided layout (e.g., RFC3339).
// If the time is invalid, it returns nil.
func NullTimeToStringPtr(nullTime sql.NullTime, layout string) *string {
	if !nullTime.Valid {
		return nil
	}
	formattedTime := nullTime.Time.Format(layout)
	return &formattedTime
}

// StringValue returns the value of a *string or an empty string if nil
func StringValue(str *string) string {
	if str == nil {
		return ""
	}
	return *str
}

func NullUUIDToStringPtr(n uuid.NullUUID) *string {
	if n.Valid {
		uuidStr := n.UUID.String()
		return &uuidStr
	}
	return nil
}

func PtrToString(s *string) string {
    if s == nil {
        return ""
    }
    return *s
}

func PtrToBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

func ParseTime(dateStr string) time.Time {
	parsedTime, _ := time.Parse("2006-01-02T15:04:05Z", dateStr) // Adjust layout as needed
	return parsedTime
}

func FloatToPtr(f float64) *float64 {
    return &f
}


// GetQuarter takes a date string as input and returns the quarter (Q1, Q2, etc.) and the year.
func GetQuarter(inputDate string) (string, error) {
	// Parse the input date in the format YYYY-MM-DD
	parsedDate, err := time.Parse("2006-01-02", inputDate)
	if err != nil {
		return "", fmt.Errorf("invalid date format: %v", err)
	}

	// Extract year and month from the parsed date
	year := parsedDate.Year()
	month := parsedDate.Month()

	var quarter string

	switch {
	case month >= 1 && month <= 3:
		quarter = "Q1"
	case month >= 4 && month <= 6:
		quarter = "Q2"
	case month >= 7 && month <= 9:
		quarter = "Q3"
	case month >= 10 && month <= 12:
		quarter = "Q4"
	}

	return fmt.Sprintf("%s %d", quarter, year), nil
}

// CalculateProgress calculates progress as a percentage
func CalculateProgress(startValue, currentValue, targetValue float64) float64 {
	// Avoid division by zero if startValue equals targetValue
	if targetValue == startValue {
		if currentValue == targetValue {
			return 100 // Target reached
		}
		return 0 // No progress if currentValue is not equal to targetValue
	}

	// Calculate progress
	progress := ((currentValue - startValue) / (targetValue - startValue)) * 100

	// Clamp progress between 0% and 100%
	return math.Min(math.Max(progress, 0), 100)
}



func GetMetricTypeID(metricType string) (int, error) {
	const (
		Number      = 1
		Percentage  = 2
		Currency    = 3
		Boolean     = 4
	)

	switch metricType {
	case "NUMBER":
		return Number, nil
	case "PERCENTAGE":
		return Percentage, nil
	case "CURRENCY":
		return Currency, nil
	case "BOOLEAN":
		return Boolean, nil
	default:
		return Number, nil
	}
}

func GetUpdateFrequencyID(updateFrequency string) (int, error) {
	switch updateFrequency {
	case "DAILY":
		return 1, nil
	case "WEEKLY":
		return 2, nil
	case "MONTHLY":
		return 3, nil
	default:
		return 0, fmt.Errorf("invalid update frequency: %s", updateFrequency)
	}
}

// NullTimeToString converts a nullable time.Time to a string.
func NullTimeToString(t time.Time, layout string) string {
	if t.IsZero() {
		return "" // or return a default value
	}
	return t.Format(layout)
}

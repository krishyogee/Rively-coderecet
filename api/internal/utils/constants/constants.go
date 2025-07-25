package constants

const LOCAL_ENV = "local"

// KeyResultStatusMap maps the status enum to its corresponding ID
var KeyResultStatusMap = map[string]int{
    "ON_TRACK":  1,
    "AT_RISK":   2,
    "BEHIND":    3,
    "COMPLETED": 4,
}

// KeyResultStatusReverseMap maps the ID to its corresponding status enum
var KeyResultStatusReverseMap = map[int]string{
    1: "on-track",
    2: "at-risk",
    3: "behind",
    4: "completed",
}

// GetKeyResultStatusID returns the ID for a given status
func GetKeyResultStatusID(status string) int {
    if id, exists := KeyResultStatusMap[status]; exists {
        return id
    }
    return 0 // or handle error as needed
}

// GetKeyResultStatusString returns the string representation for a given ID
func GetKeyResultStatusString(id int) string {
    if status, exists := KeyResultStatusReverseMap[id]; exists {
        return status
    }
    return "" // or handle error as needed
}

// get progress type db value from enum
func GetProgressTypeDBValue(progressType string) string {
    switch progressType {
    case "AGGREGATION":
        return "aggregation"
    case "MANUAL":
        return "manual"
    default:
        return "manual"
    }
}

// get unit type db value from enum
func GetUnitTypeDBValue(unitType string) string {
    switch unitType {
    case "PERCENTAGE":
        return "percentage"
    case "CURRENCY":
        return "currency"
    case "NUMBER":
        return "number"
    default:
        return "number"
    }
}
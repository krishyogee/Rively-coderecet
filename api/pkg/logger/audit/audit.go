package audit

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type AuditLogger struct {
	logger *zap.Logger
	db     *sql.DB
}

type AuditEvent struct {
	ID         string                 `json:"id"`
	UserID     string                 `json:"userId"`
	Action     string                 `json:"action"`     // CREATE, UPDATE, DELETE, etc.
	EntityType string                 `json:"entityType"` // User, Project, Document, etc.
	EntityID   string                 `json:"entityId"`
	Changes    map[string]interface{} `json:"changes"`  // What changed
	Metadata   map[string]interface{} `json:"metadata"` // Additional context
	IPAddress  string                 `json:"ipAddress"`
	UserAgent  string                 `json:"userAgent"`
	CreatedAt  time.Time              `json:"createdAt"`
}

func NewAuditLogger(db *sql.DB) (*AuditLogger, error) {
	// Create a separate logger configuration for audit logs
	config := zap.NewProductionConfig()

	// Customize encoder config for audit logs
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	config.OutputPaths = []string{"audit.log", "stdout"}

	// Create logger
	logger, err := config.Build(
		zap.AddCaller(),
		zap.Fields(
			zap.String("log_type", "audit"),
		),
	)
	if err != nil {
		return nil, err
	}

	return &AuditLogger{
		logger: logger,
		db:     db,
	}, nil
}

// LogAudit logs an audit event both to file and database
func (a *AuditLogger) LogAudit(ctx context.Context, event AuditEvent) error {
	// Log to file using Zap
	a.logger.Info("audit_event",
		zap.String("user_id", event.UserID),
		zap.String("action", event.Action),
		zap.String("entity_type", event.EntityType),
		zap.String("entity_id", event.EntityID),
		zap.Any("changes", event.Changes),
		zap.Any("metadata", event.Metadata),
		zap.String("ip_address", event.IPAddress),
		zap.String("user_agent", event.UserAgent),
	)

	// Store in database
	query := `
        INSERT INTO audit_logs (
            id, user_id, action, entity_type, entity_id,
            changes, metadata, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `

	_, err := a.db.ExecContext(ctx, query,
		event.ID,
		event.UserID,
		event.Action,
		event.EntityType,
		event.EntityID,
		event.Changes,
		event.Metadata,
		event.IPAddress,
		event.UserAgent,
		event.CreatedAt,
	)

	return err
}

// QueryAudit retrieves audit logs with filtering
func (a *AuditLogger) QueryAudit(ctx context.Context, filters map[string]interface{}, limit int) ([]AuditEvent, error) {
	// Build query based on filters
	query := `
        SELECT id, user_id, action, entity_type, entity_id,
               changes, metadata, ip_address, user_agent, created_at
        FROM audit_logs
        WHERE 1=1
    `
	var args []interface{}
	var conditions []string

	// Add filters dynamically
	if entityType, ok := filters["entity_type"].(string); ok {
		args = append(args, entityType)
		conditions = append(conditions, fmt.Sprintf("entity_type = $%d", len(args)))
	}
	if entityID, ok := filters["entity_id"].(string); ok {
		args = append(args, entityID)
		conditions = append(conditions, fmt.Sprintf("entity_id = $%d", len(args)))
	}
	if userID, ok := filters["user_id"].(string); ok {
		args = append(args, userID)
		conditions = append(conditions, fmt.Sprintf("user_id = $%d", len(args)))
	}

	// Add conditions to query
	for _, condition := range conditions {
		query += " AND " + condition
	}

	// Add ordering and limit
	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprint(len(args)+1)
	args = append(args, limit)

	// Execute query
	rows, err := a.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []AuditEvent
	for rows.Next() {
		var event AuditEvent
		err := rows.Scan(
			&event.ID,
			&event.UserID,
			&event.Action,
			&event.EntityType,
			&event.EntityID,
			&event.Changes,
			&event.Metadata,
			&event.IPAddress,
			&event.UserAgent,
			&event.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}

	return events, nil
}

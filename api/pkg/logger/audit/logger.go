package audit

import (
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	once          sync.Once
	consoleLogger *zap.Logger
)

// InitConsoleLogger initializes a singleton console logger
func InitConsoleLogger() {
	once.Do(func() {
		config := zap.NewProductionConfig()
		config.EncoderConfig.TimeKey = "timestamp"
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
		config.OutputPaths = []string{"stdout"}

		logger, err := config.Build()
		if err != nil {
			panic(err) // Handle initialization error here if needed
		}
		consoleLogger = logger
	})
}

// GetConsoleLogger returns the singleton instance of the console logger
func GetConsoleLogger() *zap.Logger {
	if consoleLogger == nil {
		InitConsoleLogger()
	}
	return consoleLogger
}

// SyncConsoleLogger flushes any buffered log entries for the console logger
func SyncConsoleLogger() error {
	if consoleLogger != nil {
		return consoleLogger.Sync()
	}
	return nil
}

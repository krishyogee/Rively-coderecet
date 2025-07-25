package middleware

import (
	"context"
	"errors"
	custom_err "flint/pkg/logger/errors"
	"fmt"

	"github.com/99designs/gqlgen/graphql"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

type ErrorMiddleware struct{}

func (m ErrorMiddleware) ExtensionName() string {
	return "ErrorMiddleware"
}

func (m ErrorMiddleware) Validate(schema graphql.ExecutableSchema) error {
	return nil
}

func (m ErrorMiddleware) InterceptResponse(ctx context.Context, next graphql.ResponseHandler) *graphql.Response {

	resp := next(ctx)

	if resp == nil || len(resp.Errors) == 0 {
		return resp
	}

	for i, err := range resp.Errors {
		var gqlErr *custom_err.GraphQLError 
		if errors.As(err.Err, &gqlErr) {
			fmt.Printf("Processing custom error in middleware using errors.As: %+v\n", gqlErr)
			resp.Errors[i] = &gqlerror.Error{
				Message: gqlErr.Message,
				Path:    err.Path,
				Extensions: map[string]interface{}{
					"code":                   gqlErr.Code,
					"type":                   gqlErr.Type,
					"userError":              gqlErr.UserError,
					"userPresentableMessage": gqlErr.UserPresentableMessage,
				},
			}

			if gqlErr.Meta != nil {
				resp.Errors[i].Extensions["meta"] = gqlErr.Meta
			}

			if len(gqlErr.Fields) > 0 {
				resp.Errors[i].Extensions["fields"] = gqlErr.Fields
			}

			continue
		}

		// If not our custom error, wrap it as a generic error
		resp.Errors[i] = &gqlerror.Error{
			Message: err.Error(),
			Path:    err.Path,
			Extensions: map[string]interface{}{
				"code":      custom_err.InternalError,
				"type":      "GLOBAL",
				"userError": false,
			},
		}
	}

	return resp
}

func NewErrorMiddleware() *ErrorMiddleware {
	return &ErrorMiddleware{}
}

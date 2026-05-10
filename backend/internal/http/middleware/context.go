package middleware

import "context"

type contextKey string

const UserIDKey contextKey = "user_id"

func UserID(ctx context.Context) (string, bool) {
	value, ok := ctx.Value(UserIDKey).(string)
	return value, ok && value != ""
}

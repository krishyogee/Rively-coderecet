package routes

import (
	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.RouterGroup) {

	authRoutes := r.Group("/auth")

	authRoutes.POST("/signup")

}

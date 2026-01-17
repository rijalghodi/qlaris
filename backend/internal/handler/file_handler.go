package handler

import (
	"fmt"
	"path/filepath"
	"time"

	"app/internal/contract"
	"app/pkg/storage"
	"app/pkg/util"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type FileHandler struct {
	storage *storage.R2Storage
}

func NewFileHandler(storage *storage.R2Storage) FileHandler {
	return FileHandler{storage: storage}
}

func (h FileHandler) RegisterRoutes(app *fiber.App) {
	app.Post("/files", h.UploadFile)
}

// UploadFile
//
//	@Summary	Upload a file
//	@Tags		files
//	@Accept		multipart/form-data
//	@Produce	json
//	@Param		file	formData	file	true	"File to upload"
//	@Param		isPublic	formData	string	true	"isPublic: true or false"
//	@Param		folder	formData	string	false	"folder name"
//	@Success	200		{object}	helpers.Response{data=contract.FileUploadResponse}
//	@Failure	400		{object}	helpers.Response
//	@Failure	422		{object}	helpers.Response
//	@Router		/files [post]
func (h FileHandler) UploadFile(c *fiber.Ctx) error {
	// file
	file, err := c.FormFile("file")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// dir
	isPublic := c.FormValue("isPublic")
	if isPublic != "true" && isPublic != "false" && isPublic != "" && isPublic != "undefined" {
		return fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("value %s of isPublic not allowed (must be true or false)", isPublic))
	}
	parentDir := "private"
	if isPublic == "true" {
		parentDir = "public"
	}
	folder := c.FormValue("folder")
	var dir string
	if folder == "" {
		dir = parentDir
	} else {
		dir = fmt.Sprintf("%s/%s", parentDir, folder)
	}

	// Generate unique key
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().Unix()
	uniqueID := uuid.New().String()[:8]
	key := fmt.Sprintf("%s/%d-%s%s", dir, timestamp, uniqueID, ext)

	// Upload to storage
	err = h.storage.Upload(file, key)
	if err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, err.Error())
	}

	// Construct response
	var url string
	if isPublic == "true" {
		url = h.storage.PublicURL(key)
	} else {
		// For private files, generate presigned URL (15 minutes)
		url, err = h.storage.PresignGet(key, 0)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "failed to generate download URL")
		}
	}

	res := contract.FileUploadResponse{
		Key: key,
		URL: url,
	}

	return c.Status(fiber.StatusOK).JSON(util.ToSuccessResponse(res))
}

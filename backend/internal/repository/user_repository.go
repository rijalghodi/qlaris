package repository

import (
	"app/internal/config"
	"app/internal/model"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetUserByGoogleID(googleID string) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Business").Where("google_id = ?", googleID).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Business").Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByID(id string) (*model.User, error) {
	var user model.User
	err := r.db.Preload("Business").Where("id = ?", id).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByIDAndBusinessID(id string, businessID string) (*model.User, error) {
	var user model.User

	err := r.db.Preload("Business").Where("id = ? AND business_id = ?", id, businessID).First(&user).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) CreateUser(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) UpdateUser(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) UpdateUserPassword(userID, hashedPassword string) error {
	return r.db.Model(&model.User{}).Where("id = ?", userID).Update("password_hash", hashedPassword).Error
}

func (r *UserRepository) ListUsers(businessID string, page, pageSize int, role []config.UserRole) ([]*model.User, int64, error) {
	var users []*model.User
	var total int64

	query := r.db.Model(&model.User{}).Preload("Business")

	if businessID != "" {
		query = query.Where("business_id = ?", businessID)
	}

	if len(role) > 0 {
		query = query.Where("role IN ?", role)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) DeleteUser(userID string) error {
	return r.db.Delete(&model.User{}, "id = ?", userID).Error
}

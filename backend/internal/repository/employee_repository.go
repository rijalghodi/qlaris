package repository

import (
	"app/internal/model"

	"gorm.io/gorm"
)

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) CreateEmployee(employee *model.Employee) error {
	return r.db.Create(employee).Error
}

func (r *EmployeeRepository) GetEmployeeByID(id string) (*model.Employee, error) {
	var employee model.Employee
	err := r.db.Preload("Business").Where("id = ?", id).First(&employee).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &employee, nil
}

func (r *EmployeeRepository) GetEmployeeByIDAndBusinessID(id, businessID string) (*model.Employee, error) {
	var employee model.Employee
	err := r.db.Preload("Business").Where("id = ? AND business_id = ?", id, businessID).First(&employee).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &employee, nil
}

func (r *EmployeeRepository) ListEmployees(businessID string, page, pageSize int) ([]*model.Employee, int64, error) {
	var employees []*model.Employee
	var total int64

	query := r.db.Model(&model.Employee{}).Preload("Business").
		Where("business_id = ?", businessID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&employees).Error; err != nil {
		return nil, 0, err
	}

	return employees, total, nil
}

func (r *EmployeeRepository) UpdateEmployee(employee *model.Employee) error {
	return r.db.Save(employee).Error
}

func (r *EmployeeRepository) UpdateEmployeePin(employeeID, hashedPin string) error {
	return r.db.Model(&model.Employee{}).Where("id = ?", employeeID).Update("pin_hash", hashedPin).Error
}

func (r *EmployeeRepository) DeleteEmployee(employeeID string) error {
	return r.db.Delete(&model.Employee{}, "id = ?", employeeID).Error
}

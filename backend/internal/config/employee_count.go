package config

type EmployeeCount struct {
	Min  int
	Max  int
	Name string
}

var EmployeeCountMap = []EmployeeCount{
	{Min: 0, Max: 0, Name: "0"},
	{Min: 1, Max: 5, Name: "1-5"},
	{Min: 6, Max: 10, Name: "6-10"},
	{Min: 11, Max: 25, Name: "11-25"},
	{Min: 26, Max: 10000, Name: "26+"},
}

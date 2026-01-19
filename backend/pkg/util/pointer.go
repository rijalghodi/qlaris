package util

func ToPointer[T any](val T) (res *T) {
	return &val
}

func ToValue[T any](val *T) (res T) {
	if val == nil {
		return
	}
	return *val
}

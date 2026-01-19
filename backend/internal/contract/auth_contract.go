package contract

type TokenRes struct {
	AccessToken           string `json:"accessToken"`
	AccessTokenExpiresAt  string `json:"accessTokenExpiresAt"`
	RefreshToken          string `json:"refreshToken"`
	RefreshTokenExpiresAt string `json:"refreshTokenExpiresAt"`
}

type GoogleOAuthReq struct {
	IDToken string `json:"idToken" validate:"required"`
}

type GoogleOAuthRes struct {
	TokenRes
	UserRes
}

type RefreshTokenReq struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshTokenRes struct {
	TokenRes
	UserRes
}

type GoogleLoginReq struct {
	Name          string `json:"name"`
	Email         string `json:"email" validate:"required,email,max=50"`
	VerifiedEmail bool   `json:"verified_email" validate:"required"`
	Picture       string `json:"picture" validate:"omitempty,url"`
}

type GoogleLoginRes struct {
	TokenRes
	UserRes
}

type LoginReq struct {
	Email    string `json:"email" validate:"required,email,max=50"`
	Password string `json:"password" validate:"required,min=8,max=50"`
}

type LoginRes struct {
	TokenRes
	UserRes
}

type RegisterReq struct {
	Email    string `json:"email" validate:"required,email,max=50"`
	Password string `json:"password" validate:"required,min=8,max=50"`
	Name     string `json:"name"`
}

type RegisterRes struct {
	UserRes
	NextRequestAt *string `json:"nextRequestAt"`
}

type ForgotPasswordReq struct {
	Email string `json:"email" validate:"required,email,max=50"`
}

type ForgotPasswordRes struct {
	NextRequestAt *string `json:"nextRequestAt"`
}

type ResetPasswordReq struct {
	Token    string `json:"token" validate:"required"`
	Password string `json:"password" validate:"required,min=8,max=50"`
}

type ResetPasswordRes struct {
	NextRequestAt *string `json:"nextRequestAt"`
}

type SendVerificationEmailReq struct {
	Email string `json:"email" validate:"required,email,max=50"`
}

type SendVerificationEmailRes struct {
	NextRequestAt *string `json:"nextRequestAt"`
}

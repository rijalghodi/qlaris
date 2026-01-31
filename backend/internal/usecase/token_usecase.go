package usecase

import (
	"app/internal/config"
	"app/internal/contract"
	"app/pkg/util"
	"time"
)

type TokenUsecase struct{}

func NewTokenUsecase() *TokenUsecase {
	return &TokenUsecase{}
}

func (u *TokenUsecase) GenerateTokenPair(userID string, businessID string) (contract.TokenRes, error) {
	accessExpiresAt := time.Now().Add(config.JWT_ACCESS_TTL)
	accessToken, err := util.GenerateToken(userID, string(config.TokenTypeAccess), config.Env.JWT.Secret, accessExpiresAt)
	if err != nil {
		return contract.TokenRes{}, err
	}

	refreshExpiresAt := time.Now().Add(config.JWT_REFRESH_TTL)
	refreshToken, err := util.GenerateToken(userID, string(config.TokenTypeRefresh), config.Env.JWT.Secret, refreshExpiresAt)
	if err != nil {
		return contract.TokenRes{}, err
	}

	return contract.TokenRes{
		AccessToken:           accessToken,
		AccessTokenExpiresAt:  accessExpiresAt.Format(time.RFC3339),
		RefreshToken:          refreshToken,
		RefreshTokenExpiresAt: refreshExpiresAt.Format(time.RFC3339),
	}, nil

}

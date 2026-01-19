package usecase

import (
	"app/internal/config"
	"app/pkg/logger"
	"fmt"

	"github.com/go-gomail/gomail"
)

type EmailUsecase struct {
	Dialer *gomail.Dialer
}

func NewEmailUsecase() *EmailUsecase {
	return &EmailUsecase{
		Dialer: gomail.NewDialer(
			config.Env.SMTPGoogle.Host,
			config.Env.SMTPGoogle.Port,
			config.Env.SMTPGoogle.Email,
			config.Env.SMTPGoogle.Password,
		),
	}
}

func (s *EmailUsecase) SendEmail(to, subject, body string) error {
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", config.Env.SMTPGoogle.Sender)
	mailer.SetHeader("To", to)
	mailer.SetHeader("Subject", subject)
	mailer.SetBody("text/plain", body)

	if err := s.Dialer.DialAndSend(mailer); err != nil {
		logger.Log.Errorf("Failed to send email: %v", err)
		return err
	}

	return nil
}

func (s *EmailUsecase) SendHTMLEmail(to, subject, body string) error {
	mailer := gomail.NewMessage()
	mailer.SetHeader("From", config.Env.SMTPGoogle.Sender)
	mailer.SetHeader("To", to)
	mailer.SetHeader("Subject", subject)
	mailer.SetBody("text/html", body)

	if err := s.Dialer.DialAndSend(mailer); err != nil {
		logger.Log.Errorf("Failed to send HTML email: %v", err)
		return err
	}

	return nil
}

func (s *EmailUsecase) SendResetPasswordEmail(to, token string) error {
	subject := fmt.Sprintf("Reset password - %s", config.AppName)

	// TODO: replace this url with the link to the reset password page of your front-end app
	resetPasswordURL := fmt.Sprintf("%s?token=%s", config.Env.Auth.ResetPasswordURL, token)
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
	<table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<tr>
						<td style="padding: 40px;">
							<h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
							<p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">Dear user,</p>
							<p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
							<table width="100%%" cellpadding="0" cellspacing="0">
								<tr>
									<td align="center" style="padding: 20px 0;">
										<a href="%s" style="display: inline-block; padding: 14px 40px; background-color: #333333; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Reset Password</a>
									</td>
								</tr>
							</table>
							<p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:</p>
							<p style="margin: 0 0 30px 0; color: #333333; font-size: 14px; word-break: break-all;">%s</p>
							<p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">If you did not request a password reset, please ignore this email.</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`, resetPasswordURL, resetPasswordURL)
	return s.SendHTMLEmail(to, subject, body)
}

func (s *EmailUsecase) SendVerificationEmail(to, token string) error {
	subject := fmt.Sprintf("Email Verification - %s", config.AppName)

	// TODO: replace this url with the link to the email verification page of your front-end app
	verificationEmailURL := fmt.Sprintf("%s?token=%s", config.Env.Auth.VerifyEmailURL, token)
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
	<table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<tr>
						<td style="padding: 40px;">
							<h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
							<p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.5;">Dear user,</p>
							<p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.5;">Thank you for creating an account. Please verify your email address by clicking the button below:</p>
							<table width="100%%" cellpadding="0" cellspacing="0">
								<tr>
									<td align="center" style="padding: 20px 0;">
										<a href="%s" style="display: inline-block; padding: 14px 40px; background-color: #333333; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Verify Email</a>
									</td>
								</tr>
							</table>
							<p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:</p>
							<p style="margin: 0 0 30px 0; color: #333333; font-size: 14px; word-break: break-all;">%s</p>
							<p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">If you did not create an account, please ignore this email.</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`, verificationEmailURL, verificationEmailURL)
	return s.SendHTMLEmail(to, subject, body)
}

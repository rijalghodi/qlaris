package storage

import (
	"context"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2Storage struct {
	client     *s3.Client
	bucket     string
	publicURL  string
	defaultTTL time.Duration
}

func NewR2Storage(
	endpoint string, // https://<accountid>.r2.cloudflarestorage.com
	accessKey string,
	secretKey string,
	bucket string,
	publicURL string,
	defaultTTLSeconds int,
) *R2Storage {

	cfg := aws.Config{
		Region: "auto",
		Credentials: credentials.NewStaticCredentialsProvider(
			accessKey,
			secretKey,
			"",
		),
		EndpointResolverWithOptions: aws.EndpointResolverWithOptionsFunc(
			func(service, region string, _ ...interface{}) (aws.Endpoint, error) {
				return aws.Endpoint{
					URL:               endpoint,
					SigningRegion:     "auto",
					HostnameImmutable: true,
				}, nil
			},
		),
	}

	client := s3.NewFromConfig(cfg)

	return &R2Storage{
		client:     client,
		bucket:     bucket,
		publicURL:  publicURL,
		defaultTTL: time.Duration(defaultTTLSeconds) * time.Second,
	}
}

func (r *R2Storage) Upload(file *multipart.FileHeader, key string) error {
	f, err := file.Open()
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = r.client.PutObject(context.Background(), &s3.PutObjectInput{
		Bucket: &r.bucket,
		Key:    &key,
		Body:   f,
	})

	return err
}

func (r *R2Storage) PresignGet(key string, ttl time.Duration) (string, error) {
	if ttl == 0 {
		ttl = r.defaultTTL
	}

	ps := s3.NewPresignClient(r.client)
	out, err := ps.PresignGetObject(
		context.Background(),
		&s3.GetObjectInput{
			Bucket: &r.bucket,
			Key:    &key,
		},
		func(o *s3.PresignOptions) {
			o.Expires = ttl
		},
	)
	if err != nil {
		return "", err
	}

	return out.URL, nil
}

func (r *R2Storage) PublicURL(key string) string {
	if r.publicURL == "" {
		return ""
	}
	return fmt.Sprintf("%s/%s", r.publicURL, key)
}

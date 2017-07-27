#!/usr/bin/env bash


case "$CIRCLE_BRANCH" in

	"development")
		DATABASE_URL=$APP_DATABASE_URL_DEVELOPMENT
		PORT=$APP_PORT_DEVELOPMENT
		STAGE=$APP_STAGE_DEVELOPMENT
		S3_BUCKET=$APP_S3_BUCKET_DEVELOPMENT
		AWS_KEY_ID=$APP_AWS_KEY_ID_DEVELOPMENT
		AWS_SECRET_KEY=$APP_AWS_SECRET_KEY_DEVELOPMENT
		FRONTEND_HOST=$APP_FRONTEND_HOST_DEVELOPMENT
		EMAIL_FROM=$APP_EMAIL_FROM_DEVELOPMENT
        SNS_PLATFORM_ARN_IOS=$APP_SNS_PLATFORM_ARN_IOS_DEVELOPMENT
		LOG_LEVEL=$APP_LOG_LEVEL_DEVELOPMENT
		REFRESH_TOKEN_EXPIRES_IN=$APP_REFRESH_TOKEN_EXPIRES_IN_DEVELOPMENT
		TWITTER_CONSUMER_KEY=$APP_TWITTER_CONSUMER_KEY_DEVELOPMENT
		TWITTER_CONSUMER_SECRET=$APP_TWITTER_CONSUMER_SECRET_DEVELOPMENT
		CROWDRISE_CLIENT_ID=$APP_CROWDRISE_CLIENT_ID_DEVELOPMENT
		CROWDRISE_CLIENT_SECRET=$APP_CROWDRISE_CLIENT_SECRET_DEVELOPMENT
		CROWDRISE_REDIRECT_URL=$APP_CROWDRISE_REDIRECT_URL_DEVELOPMENT
		BACKEND_HOST=$APP_BACKEND_HOST_DEVELOPMENT
		EMAILS_SUPPORT=$APP_EMAILS_SUPPORT_DEVELOPMENT
		;;
	"qa")
		DATABASE_URL=$APP_DATABASE_URL_QA
		PORT=$APP_PORT_QA
		STAGE=$APP_STAGE_QA
		S3_BUCKET=$APP_S3_BUCKET_QA
		AWS_KEY_ID=$APP_AWS_KEY_ID_QA
		AWS_SECRET_KEY=$APP_AWS_SECRET_KEY_QA
		FRONTEND_HOST=$APP_FRONTEND_HOST_QA
		EMAIL_FROM=$APP_EMAIL_FROM_QA
		SNS_PLATFORM_ARN_IOS=$APP_SNS_PLATFORM_ARN_IOS_QA
		LOG_LEVEL=$APP_LOG_LEVEL_QA
		REFRESH_TOKEN_EXPIRES_IN=$APP_REFRESH_TOKEN_EXPIRES_IN_QA
		TWITTER_CONSUMER_KEY=$APP_TWITTER_CONSUMER_KEY_QA
		TWITTER_CONSUMER_SECRET=$APP_TWITTER_CONSUMER_SECRET_QA
		CROWDRISE_CLIENT_ID=$APP_CROWDRISE_CLIENT_ID_QA
		CROWDRISE_CLIENT_SECRET=$APP_CROWDRISE_CLIENT_SECRET_QA
		CROWDRISE_REDIRECT_URL=$APP_CROWDRISE_REDIRECT_URL_QA
		BACKEND_HOST=$APP_BACKEND_HOST_QA
		EMAILS_SUPPORT=$APP_EMAILS_SUPPORT_QA
		;;
	"master")
		DATABASE_URL=$APP_DATABASE_URL_MASTER
		PORT=$APP_PORT_MASTER
		STAGE=$APP_STAGE_MASTER
		S3_BUCKET=$APP_S3_BUCKET_MASTER
		AWS_KEY_ID=$APP_AWS_KEY_ID_MASTER
		AWS_SECRET_KEY=$APP_AWS_SECRET_KEY_MASTER
		FRONTEND_HOST=$APP_FRONTEND_HOST_MASTER
		EMAIL_FROM=$APP_EMAIL_FROM_MASTER
		SNS_PLATFORM_ARN_IOS=$APP_SNS_PLATFORM_ARN_IOS_MASTER
		LOG_LEVEL=$APP_LOG_LEVEL_MASTER
		REFRESH_TOKEN_EXPIRES_IN=$APP_REFRESH_TOKEN_EXPIRES_IN_MASTER
		TWITTER_CONSUMER_KEY=$APP_TWITTER_CONSUMER_KEY_MASTER
		TWITTER_CONSUMER_SECRET=$APP_TWITTER_CONSUMER_SECRET_MASTER
		CROWDRISE_CLIENT_ID=$APP_CROWDRISE_CLIENT_ID_MASTER
		CROWDRISE_CLIENT_SECRET=$APP_CROWDRISE_CLIENT_SECRET_MASTER
		CROWDRISE_REDIRECT_URL=$APP_CROWDRISE_REDIRECT_URL_MASTER
		BACKEND_HOST=$APP_BACKEND_HOST_MASTER
		EMAILS_SUPPORT=$APP_EMAILS_SUPPORT_MASTER
		;;
	*)
		echo "Unhandled $CIRCLE_BRANCH, allowed: development, qa, master"
		return 1
		;;
	esac

cat > ./taskDefinition.json << EOF
[{
    "volumesFrom": [],
    "portMappings": [{
        "hostPort": $PORT,
        "containerPort": $PORT,
        "protocol": "tcp"
    }],
    "essential": true,
    "mountPoints": [],
    "name": "beam-server",
    "environment": [
        {
            "name": "DATABASE_URL",
            "value": "$DATABASE_URL"
        },
        {
            "name": "PORT",
            "value": "$PORT"
        },
        {
            "name": "STAGE",
            "value": "$STAGE"
        },
        {
            "name": "AWS_KEY_ID",
            "value": "$AWS_KEY_ID"
        },
        {
            "name": "AWS_SECRET_KEY",
            "value": "$AWS_SECRET_KEY"
        },
        {
            "name": "S3_BUCKET",
            "value": "$S3_BUCKET"
        },
        {
            "name": "FRONTEND_HOST",
            "value": "$FRONTEND_HOST"
        },
        {
            "name": "EMAIL_FROM",
            "value": "$EMAIL_FROM"
        },
        {
            "name": "SNS_PLATFORM_ARN_IOS",
            "value": "$SNS_PLATFORM_ARN_IOS"
        },
        {
            "name": "LOG_LEVEL",
            "value": "$LOG_LEVEL"
        },
        {
            "name": "REFRESH_TOKEN_EXPIRES_IN",
            "value": "$REFRESH_TOKEN_EXPIRES_IN"
        },
        {
            "name": "TWITTER_CONSUMER_KEY",
            "value": "$TWITTER_CONSUMER_KEY"
        },
        {
            "name": "TWITTER_CONSUMER_SECRET",
            "value": "$TWITTER_CONSUMER_SECRET"
        },
        {
            "name": "CROWDRISE_CLIENT_ID",
            "value": "$CROWDRISE_CLIENT_ID"
        },
        {
            "name": "CROWDRISE_CLIENT_SECRET",
            "value": "$CROWDRISE_CLIENT_SECRET"
        },
        {
            "name": "CROWDRISE_REDIRECT_URL",
            "value": "$CROWDRISE_REDIRECT_URL"
        },
        {
            "name": "EMAILS_SUPPORT",
            "value": "$EMAILS_SUPPORT"
        },
        {
            "name": "BACKEND_HOST",
            "value": "$BACKEND_HOST"
        }
    ],
    "image": "638961190131.dkr.ecr.us-east-1.amazonaws.com/beam-server:$CIRCLE_BRANCH",
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "beam-server-$CIRCLE_BRANCH",
            "awslogs-region": "us-east-1"
        }
    },
    "cpu": 0,
    "memoryReservation": 900
}]
EOF
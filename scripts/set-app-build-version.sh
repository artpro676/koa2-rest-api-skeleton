#!/usr/bin/env bash

cat > ./public/version.txt << EOF
CircleCI build number : ${CIRCLE_BUILD_NUM}
Github commit : ${CIRCLE_REPOSITORY_URL}/commit/${CIRCLE_SHA1}
Github branch : ${CIRCLE_BRANCH}
Github username : ${CIRCLE_USERNAME}
Date : $(date)
EOF

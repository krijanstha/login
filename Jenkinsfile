pipeline {
  agent any

  environment {
    DOCKER_COMPOSE_FILE = 'docker-compose.yml'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker compose -f ${DOCKER_COMPOSE_FILE} build --pull'
      }
    }

    stage('Run Smoke Test') {
      steps {
        sh 'docker compose -f ${DOCKER_COMPOSE_FILE} up -d'
        sh 'sleep 15'
        sh 'curl -f http://localhost:4001 || exit 1'
        sh 'curl -f http://localhost:8080 || exit 1'
      }
    }
  }

  post {
    always {
      sh 'docker compose -f ${DOCKER_COMPOSE_FILE} down -v || true'
    }
  }
}

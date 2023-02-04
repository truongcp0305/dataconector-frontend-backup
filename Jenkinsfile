pipeline{
    agent any
    environment{
        SERVICE_NAME = "apps.symper.vn"
        BRANCH_NAME = "${GIT_BRANCH.split("/")[1]}"
        DOCKER_TAG = "${GIT_COMMIT.substring(0,7)}"
        SERVICE_ENV = "test"
    }
    stages{
        stage("Build npm"){
//             agent {
//                 docker {
//                     image 'node:16.14.2'
//                     args '-p 3000:3000 -u 0:0  -v /tmp:/root/.cache'
//                 }
//             }
            steps{
                sh 'node -v'
                sh 'npm -v'
                sh 'sudo npm i @vue/cli -g'
                sh 'npm install'
                sh 'npm run dev'
            }
            post{
                success{
                    echo "Build frontend code successful"
                }
                failure{
                    echo "Build frontend code fail"
                }
        
            }
        }
        stage("build"){
            steps{
                withCredentials([usernamePassword(credentialsId: 'docker-hub', passwordVariable: 'DOCKER_REGISTRY_PWD', usernameVariable: 'DOCKER_REGISTRY_USER')]) {
                    sh 'echo $DOCKER_REGISTRY_PWD | docker login -u $DOCKER_REGISTRY_USER --password-stdin localhost:5000'
                }
                script {
                    sh "docker build -t localhost:5000/${BRANCH_NAME}-${SERVICE_NAME}:${DOCKER_TAG} ."
                    sh "docker push localhost:5000/${BRANCH_NAME}-${SERVICE_NAME}:${DOCKER_TAG}"
                    sh "docker image rm localhost:5000/${BRANCH_NAME}-${SERVICE_NAME}:${DOCKER_TAG}"
                }
            }
        }
        stage("deploy to k8s"){
            steps{
                sh "chmod +x changeTag.sh"
                sh "./changeTag.sh ${BRANCH_NAME}-${SERVICE_NAME}:${DOCKER_TAG} ${SERVICE_ENV}"
                sshagent(['ssh-remote']) {
                    sh "ssh root@103.148.57.32 rm -rf /root/kubernetes/deployment/test/${SERVICE_NAME}"
                    sh "ssh root@103.148.57.32 mkdir /root/kubernetes/deployment/test/${SERVICE_NAME}"
                    sh "scp -o StrictHostKeyChecking=no k8s/* root@103.148.57.32:/root/kubernetes/deployment/test/${SERVICE_NAME}"
                    sh "ssh root@103.148.57.32 kubectl config set-context --current --namespace=${SERVICE_ENV}"
                    sh "ssh root@103.148.57.32 kubectl apply -f /root/kubernetes/deployment/test/${SERVICE_NAME}"
                }
            }
        }
    }
    post{
        always{
            emailext body: '$PROJECT_NAME - Build # $BUILD_NUMBER - $BUILD_STATUS: \nCheck console output at $BUILD_URL to view the results.',
            subject: '$PROJECT_NAME - Build # $BUILD_NUMBER - $BUILD_STATUS!',
            to: 'hoangnd@symper.vn'
        }
        success{
            echo "========pipeline executed successfully ========"
        }
        failure{
            echo "========pipeline execution failed========"
        }
    }
}

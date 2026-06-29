# Stage 1: Build the jar using Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal JRE runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/prediction-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Start Spring Boot listening on the port provided by Render
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]

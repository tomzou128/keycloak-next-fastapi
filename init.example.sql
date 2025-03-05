-- Create the fastapi-backend database
CREATE DATABASE fastapi_backend;

-- Create the fastapi_user user and set the password
CREATE USER fastapi_user WITH PASSWORD '<be_db_password>';

-- Grant all privileges on the fastapi_backend database to the fastapi_user user
GRANT ALL PRIVILEGES ON DATABASE fastapi_backend TO fastapi_user;

-- Create the keycloak database
CREATE DATABASE keycloak;

-- Create the keycloak user and set the password
CREATE USER keycloak WITH PASSWORD '<kc_db_password>';

-- Grant all privileges on the keycloak database to the keycloak user
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- Grant the keycloak user the privilege to CREATE tables in the public schema (a more secure approach)
GRANT CREATE ON SCHEMA public TO keycloak;

-- Revoke public privileges on the public schema (enhance security, optional)
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE keycloak FROM PUBLIC;
REVOKE ALL ON DATABASE fastapi_backend FROM PUBLIC;

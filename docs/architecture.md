# Architecture Overview

## High-Level System Diagram
(Insert Mermaid diagram here later)

## Components
- React Frontend (multi-page)
- API Gateway
- Lambda Functions
- RDS Postgres
- Amazon Bedrock
- VPC (public/private subnets)
- IAM Roles
- CloudWatch Logging
- Terraform IaC

## Frontend
- Multi-page React app
- Hosted on S3
- Distributed via CloudFront

## Backend
- Lambda functions for each route
- Connects to RDS
- Calls Bedrock for reasoning

## Database
- RDS Postgres in private subnets

## Networking
- VPC with 2 public + 2 private subnets

## IaC
- Terraform modules for each component
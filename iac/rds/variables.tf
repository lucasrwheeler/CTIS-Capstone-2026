variable "project" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnets" {
  type = list(string)
}

variable "lambda_cidr_blocks" {
  type = list(string)
  description = "CIDR blocks for Lambda access"
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
  sensitive = true
}
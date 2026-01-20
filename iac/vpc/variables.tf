
//adding Variables
variable "project" {
  type        = string
  description = "Project name prefix"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "public_subnet_a" {
  type = string
}

variable "public_subnet_b" {
  type = string
}

variable "private_subnet_a" {
  type = string
}

variable "private_subnet_b" {
  type = string
}

variable "az_a" {
  type = string
}

variable "az_b" {
  type = string
}
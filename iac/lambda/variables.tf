variable "lambda_name" {
  type = string
}

variable "handler" {
  type = string
}

variable "runtime" {
  type    = string
  default = "nodejs18.x"
}

variable "source_path" {
  type = string
}

variable "role_arn" {
  type = string
}
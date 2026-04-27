resource "aws_cloudwatch_dashboard" "ctis_portal" {
  dashboard_name = "CTIS-Portal-Overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# Guilford CTIS Academic Portal — Live Dashboard"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Invocations"
          region = "us-east-1"
          stat   = "Sum"
          period = 300
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "degree_audit"],
            ["AWS/Lambda", "Invocations", "FunctionName", "eligibility"],
            ["AWS/Lambda", "Invocations", "FunctionName", "plan"],
            ["AWS/Lambda", "Invocations", "FunctionName", "getProfessors"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Errors"
          region = "us-east-1"
          stat   = "Sum"
          period = 300
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "degree_audit"],
            ["AWS/Lambda", "Errors", "FunctionName", "eligibility"],
            ["AWS/Lambda", "Errors", "FunctionName", "plan"],
            ["AWS/Lambda", "Errors", "FunctionName", "getProfessors"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 16
        y      = 1
        width  = 8
        height = 6
        properties = {
          title  = "Lambda Duration (ms)"
          region = "us-east-1"
          stat   = "Average"
          period = 300
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "degree_audit"],
            ["AWS/Lambda", "Duration", "FunctionName", "eligibility"],
            ["AWS/Lambda", "Duration", "FunctionName", "plan"],
            ["AWS/Lambda", "Duration", "FunctionName", "getProfessors"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway — 4xx & 5xx Errors"
          region = "us-east-1"
          stat   = "Sum"
          period = 300
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiName", "ctis-portal-api", "Stage", "prod"],
            ["AWS/ApiGateway", "5XXError", "ApiName", "ctis-portal-api", "Stage", "prod"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway — Latency (ms)"
          region = "us-east-1"
          stat   = "Average"
          period = 300
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiName", "ctis-portal-api", "Stage", "prod"],
            ["AWS/ApiGateway", "IntegrationLatency", "ApiName", "ctis-portal-api", "Stage", "prod"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 12
        height = 6
        properties = {
          title  = "RDS — Database Connections"
          region = "us-east-1"
          stat   = "Average"
          period = 300
          metrics = [
            ["AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "guilford-capstone-postgres"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 13
        width  = 12
        height = 6
        properties = {
          title  = "RDS — CPU Utilization"
          region = "us-east-1"
          stat   = "Average"
          period = 300
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "guilford-capstone-postgres"]
          ]
        }
      }
    ]
  })
}
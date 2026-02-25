# Risks, Ethics, and Limitations

## Data Privacy and FERPA Considerations
Although this project uses demo data and does not store real student records, any real deployment of an academic planning system would involve sensitive educational information. Protecting student data would require strict adherence to FERPA guidelines, secure authentication, and encrypted data storage. This capstone acknowledges these requirements but does not implement full production-grade privacy controls.

## Security Risks
The system includes cloud components such as API Gateway, Lambda, and RDS. Misconfigured IAM roles, public database exposure, or overly permissive network rules could introduce vulnerabilities. In this project, RDS is placed in private subnets and only accessible through Lambda, but additional hardening (WAF, rate limiting, audit logging) would be required in a real environment.

## AI Reasoning Limitations
The explanation engine and future Bedrock integration may generate helpful summaries, but AI-generated reasoning can be incomplete or occasionally incorrect. Students should not rely solely on automated explanations for academic decisions. Human advisors remain the final authority for course eligibility and degree planning.

## Ethical Use of Automation
Automating academic advising tasks can improve clarity and reduce confusion, but it must not replace human judgment. The system is designed to support advisors, not override them. Transparency is essential: users should understand when explanations are AI-generated and when they are based on strict prerequisite logic.

## System Reliability and Cloud Costs
Cloud-based systems depend on stable infrastructure. Outages, misconfigurations, or cost overruns could impact availability. This project uses AWS resources in a controlled environment, but a production deployment would require monitoring, scaling policies, and cost governance.

## Scope Limitations
This capstone focuses on eligibility logic, explanations, and cloud deployment. It does not include:
- real SIS integration  
- full authentication/authorization  
- multi-user role management  
- production-grade monitoring  

These limitations are acknowledged and documented to ensure transparency for future developers or evaluators.
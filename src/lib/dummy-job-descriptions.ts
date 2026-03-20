export interface DummyJobDescription {
  id: string;
  title: string;
  level: 'Entry' | 'Mid' | 'Senior';
  description: string;
}

export const DUMMY_JOB_DESCRIPTIONS: DummyJobDescription[] = [
  {
    id: 'frontend-senior',
    title: 'Senior Frontend Developer',
    level: 'Senior',
    description: `Senior Frontend Developer

We are hiring a Senior Frontend Developer to lead UI architecture and build fast, accessible web products.

Requirements:
- 5+ years in React and TypeScript
- Deep understanding of Next.js, SSR, and performance optimization
- Strong CSS architecture skills (Tailwind or CSS Modules)
- Experience with testing (Jest, React Testing Library)
- Experience mentoring junior developers

Nice to have:
- GraphQL and Apollo Client
- Design systems experience
- CI/CD and Vercel deployment knowledge

Responsibilities:
- Build production-grade UI features
- Collaborate with product and design teams
- Improve web performance and maintainability
- Participate in code reviews and technical planning`
  },
  {
    id: 'backend-node-mid',
    title: 'Node.js Backend Engineer',
    level: 'Mid',
    description: `Node.js Backend Engineer

We are looking for a Backend Engineer to build scalable APIs and services.

Requirements:
- 3+ years with Node.js and TypeScript
- Hands-on with Express.js or Fastify
- Experience with PostgreSQL and Redis
- Understanding of REST API design and security practices
- Familiarity with Docker and cloud deployment

Nice to have:
- Event-driven architecture experience
- Knowledge of message queues (Kafka/RabbitMQ)
- Experience with observability tooling

Responsibilities:
- Design and implement backend services
- Optimize query performance and reliability
- Build robust auth and rate-limiting flows
- Work with frontend and DevOps teams`
  },
  {
    id: 'product-manager-mid',
    title: 'Product Manager - SaaS',
    level: 'Mid',
    description: `Product Manager - SaaS

We need a Product Manager to drive roadmap execution for a B2B SaaS product.

Requirements:
- 3+ years in product management
- Experience with agile planning and prioritization frameworks
- Strong communication and stakeholder management
- Ability to define PRDs and success metrics
- Data-driven decision making with analytics tools

Nice to have:
- Experience in HRTech or recruitment products
- Familiarity with A/B testing
- Exposure to AI-powered product features

Responsibilities:
- Define product strategy and quarterly roadmap
- Partner with engineering, design, and GTM
- Track feature performance and customer feedback
- Drive iterative product improvements`
  },
  {
    id: 'data-analyst-entry',
    title: 'Data Analyst',
    level: 'Entry',
    description: `Data Analyst

We are hiring a Data Analyst to convert business data into actionable insights.

Requirements:
- 1-2 years in analytics role or relevant internship experience
- Strong SQL and Excel/Sheets skills
- Familiarity with BI tools (Power BI/Tableau/Looker)
- Ability to present findings to non-technical stakeholders
- Basic knowledge of statistics

Nice to have:
- Python (Pandas, Matplotlib)
- Experience with cohort and funnel analysis
- Exposure to experimentation frameworks

Responsibilities:
- Build recurring dashboards and KPI reports
- Perform ad hoc analysis for business teams
- Identify trends, risks, and opportunities
- Support strategic planning with data insights`
  },
  {
    id: 'devops-senior',
    title: 'Senior DevOps Engineer',
    level: 'Senior',
    description: `Senior DevOps Engineer

We are seeking a Senior DevOps Engineer to improve deployment velocity and platform reliability.

Requirements:
- 5+ years in DevOps/SRE roles
- Strong AWS experience (EC2, ECS/EKS, RDS, IAM)
- Infrastructure as Code with Terraform
- CI/CD pipeline design (GitHub Actions/GitLab CI)
- Monitoring and incident response expertise

Nice to have:
- Kubernetes production operations
- Security hardening and compliance workflows
- Cost optimization experience in cloud environments

Responsibilities:
- Build and maintain cloud infrastructure
- Automate deployments and rollback strategies
- Improve observability and system reliability
- Lead incident management and postmortems`
  }
];

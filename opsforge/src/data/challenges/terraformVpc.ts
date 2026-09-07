import { OpsChallenge } from '../../types/ops';

export const terraformVpcChallenge: OpsChallenge = {
  id: 'terraform-cyclic-vpc',
  title: 'Resolve Cyclic Dependency & Multi-AZ Subnet Drift',
  track: 'terraform',
  severity: 'SEV-2',
  difficulty: 'Intermediate',
  serviceName: 'cloud-infrastructure',
  estimatedTimeMin: 15,
  tags: ['Terraform', 'HCL', 'VPC', 'Networking', 'DependencyGraph'],
  summary:
    '`terraform apply` is failing on production VPC rollout with a graph cycle error: `Cycle: aws_security_group.app_sg -> aws_subnet.private_b -> aws_security_group.app_sg`. Additionally, the junior dev assigned overlapping CIDR blocks `10.0.1.0/24` to both AZ-a and AZ-b subnets.',
  symptoms: [
    'Terraform plan fails with: `Error: Cycle in dependency graph`.',
    'AWS VPC creation blocked; new staging cluster deployment delayed by 2 days.',
    'Overlapping CIDR block allocations trigger AWS API validation failure.'
  ],
  reproductionSteps: [
    'Run `terraform plan` in the terminal to inspect the dependency graph cycle.',
    'Review `main.tf` for circular references and duplicate CIDR definitions.'
  ],
  acceptanceRules: [
    {
      id: 'break-cycle',
      description: 'Remove circular dependency between security group and subnets (or extract inline rules to separate `aws_security_group_rule`).',
      hint: 'Remove unnecessary `depends_on = [aws_security_group.app_sg]` from `aws_subnet.private_b`.'
    },
    {
      id: 'unique-cidrs',
      description: 'Assign unique, non-overlapping CIDR blocks to subnets (e.g. `10.0.1.0/24` for AZ-a, `10.0.2.0/24` for AZ-b).',
      hint: 'Change second subnet CIDR to `10.0.2.0/24`.'
    },
    {
      id: 'export-outputs',
      description: 'Export `vpc_id` and `private_subnets` in the terraform outputs block.',
      hint: 'Declare `output "vpc_id" { value = aws_vpc.main.id }`.'
    }
  ],
  starterFiles: [
    {
      name: 'main.tf',
      language: 'hcl',
      content: `terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "opsforge-prod-vpc"
  }
}

# Subnet in us-east-1a
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "private-az1a"
  }
}

# Subnet in us-east-1b
resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  # BUG 1: Duplicate CIDR colliding with private_a!
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1b"

  # BUG 2: Circular dependency! Subnet depends on security group which depends on subnet!
  depends_on = [aws_security_group.app_sg]

  tags = {
    Name = "private-az1b"
  }
}

resource "aws_security_group" "app_sg" {
  name        = "app-service-sg"
  description = "Security group for microservices"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    # References subnet private_a and private_b CIDRs
    cidr_blocks = [aws_subnet.private_a.cidr_block, aws_subnet.private_b.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# TODO: Add output blocks for vpc_id and private_subnets
`
    }
  ],
  initialTopology: {
    clusterName: 'aws-us-east-1-vpc',
    namespace: 'infra',
    ingressUrl: 'https://aws.console/vpc-planner',
    cpuTotal: 0,
    memTotal: 0,
    errorRatePercent: 100,
    latencyMs: 0,
    service: {
      name: 'vpc-main-gateway',
      type: 'LoadBalancer',
      port: 443,
      targetPort: 443,
      healthy: false
    },
    pods: [
      {
        id: 'tf-drift',
        name: 'terraform-state-lock:CYCLE_DETECTED',
        status: 'Error',
        restarts: 0,
        cpuUsage: '0m',
        memUsage: 'Graph Loop',
        ready: '0/1'
      }
    ]
  },
  healthyTopology: {
    clusterName: 'aws-us-east-1-vpc',
    namespace: 'infra',
    ingressUrl: 'https://aws.console/vpc-planner',
    cpuTotal: 15,
    memTotal: 20,
    errorRatePercent: 0,
    latencyMs: 8,
    service: {
      name: 'vpc-main-gateway',
      type: 'LoadBalancer',
      port: 443,
      targetPort: 443,
      healthy: true
    },
    pods: [
      {
        id: 'tf-drift',
        name: 'terraform-resource:vpc-089fa2bc81',
        status: 'Running',
        restarts: 0,
        cpuUsage: '10m',
        memUsage: 'Reconciled',
        ready: '1/1'
      }
    ]
  },
  testAssertions: [
    {
      id: 'check-no-cycle',
      name: 'Eliminates Circular Dependency in HCL Graph',
      description: 'Checks that aws_subnet.private_b does not declare depends_on on aws_security_group.app_sg.',
      verify: (files) => {
        const tf = files['main.tf'] || '';
        const hasBadDepends = /aws_subnet"[\s\S]*?depends_on\s*=\s*\[[\s\S]*?aws_security_group/i.test(tf);
        return {
          passed: !hasBadDepends,
          message: !hasBadDepends
            ? 'Circular depends_on relationship removed.'
            : 'aws_subnet.private_b still has depends_on referencing aws_security_group.app_sg.',
          diff: { expected: 'No depends_on referencing app_sg', actual: 'Found circular depends_on' }
        };
      }
    },
    {
      id: 'check-cidr-collision',
      name: 'Non-Overlapping Subnet CIDR Ranges',
      description: 'Ensures private_a and private_b have distinct CIDRs (e.g. 10.0.1.0/24 and 10.0.2.0/24).',
      verify: (files) => {
        const tf = files['main.tf'] || '';
        const cidrs = [...tf.matchAll(/cidr_block\s*=\s*"([^"]+)"/g)].map(m => m[1]);
        const subnetCidrs = cidrs.filter(c => c !== '10.0.0.0/16');
        const isUnique = new Set(subnetCidrs).size === subnetCidrs.length && subnetCidrs.length >= 2;
        return {
          passed: isUnique,
          message: isUnique
            ? `Subnet CIDRs are distinct: ${subnetCidrs.join(', ')}.`
            : `Subnet CIDRs contain duplicates or overlap: ${subnetCidrs.join(', ')}.`,
          diff: { expected: '10.0.1.0/24 and 10.0.2.0/24', actual: subnetCidrs.join(', ') }
        };
      }
    },
    {
      id: 'check-outputs',
      name: 'Outputs for vpc_id and private_subnets',
      description: 'Exports VPC ID and subnets for downstream infrastructure modules.',
      verify: (files) => {
        const tf = files['main.tf'] || '';
        const hasVpcOutput = /output\s+"vpc_id"/i.test(tf);
        return {
          passed: hasVpcOutput,
          message: hasVpcOutput
            ? 'Output vpc_id successfully declared.'
            : 'Missing output "vpc_id" declaration in main.tf.',
          diff: { expected: 'output "vpc_id" { value = aws_vpc.main.id }', actual: 'Missing output block' }
        };
      }
    }
  ],
  postMortem: {
    rootCause:
      'A cyclic graph was introduced because `aws_subnet.private_b` explicitly declared `depends_on = [aws_security_group.app_sg]`, while `aws_security_group.app_sg` implicitly depended on `aws_subnet.private_b.cidr_block` for its ingress rules. Additionally, copy-pasting the subnet block resulted in colliding CIDRs (`10.0.1.0/24`).',
    impact:
      'Terraform apply halted during production deployment. Infrastructure provisioning was blocked.',
    detection:
      'Terraform CLI dependency graph validation error during CI PR gate.',
    solutionBreakdown: [
      'Removed unnecessary explicit `depends_on` from `aws_subnet.private_b`.',
      'Assigned `10.0.2.0/24` to `aws_subnet.private_b` to eliminate CIDR overlap.',
      'Declared outputs for modular consumption.'
    ],
    referenceFiles: [
      {
        name: 'main.tf',
        language: 'hcl',
        content: `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "opsforge-prod-vpc"
  }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "private-az1a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "private-az1b"
  }
}

resource "aws_security_group" "app_sg" {
  name        = "app-service-sg"
  description = "Security group for microservices"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private_a.cidr_block, aws_subnet.private_b.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}
`
      }
    ],
    preventativeMeasures: [
      'Use tflint and terraform validate in pre-commit hooks.',
      'Adopt AWS VPC Terraform official module to automate CIDR subnetting with `cidrsubnets()` function.'
    ]
  },
  initialTerminalLogs: [
    'terraform plan',
    '╷ Error: Cycle in dependency graph:',
    '│   aws_security_group.app_sg -> aws_subnet.private_b -> aws_security_group.app_sg',
    '│',
    '│ Cyclic dependencies cannot be resolved automatically.',
    '╵'
  ]
};

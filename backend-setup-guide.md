# Backend API Setup for SQL Server Migration

## Option 1: Node.js/Express + SQL Server

### 1. Create Backend Project
```bash
mkdir be-finance-api
cd be-finance-api
npm init -y
npm install express cors helmet bcryptjs jsonwebtoken mssql dotenv
npm install -D @types/node @types/express @types/bcryptjs @types/jsonwebtoken typescript ts-node nodemon
```

### 2. Basic Server Structure
```
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── app.ts
├── package.json
└── tsconfig.json
```

### 3. Database Connection (src/config/database.ts)
```typescript
import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log('Connected to SQL Server');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

export { sql };
```

### 4. Authentication Controller (src/controllers/authController.ts)
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../config/database';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, loginType } = req.body;
    
    // Find user
    const userResult = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;
    
    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.recordset[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Get profile based on login type
    let profile;
    if (loginType === 'officer') {
      const profileResult = await sql.query`
        SELECT * FROM Officer_profile WHERE user_id = ${user.id}
      `;
      profile = profileResult.recordset[0];
    } else {
      const profileResult = await sql.query`
        SELECT * FROM user_profiles WHERE id = ${user.id}
      `;
      profile = profileResult.recordset[0];
    }
    
    const token = jwt.sign(
      { userId: user.id, role: profile?.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role,
        name: profile?.full_name || `${profile?.first_name} ${profile?.last_name}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role } = req.body;
    
    // Check if user exists
    const existingUser = await sql.query`
      SELECT * FROM Users WHERE email = ${email}
    `;
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userResult = await sql.query`
      INSERT INTO Users (email, password_hash)
      OUTPUT INSERTED.id
      VALUES (${email}, ${hashedPassword})
    `;
    
    const userId = userResult.recordset[0].id;
    
    // Create profile
    await sql.query`
      INSERT INTO user_profiles (id, email, full_name, role)
      VALUES (${userId}, ${email}, ${fullName}, ${role})
    `;
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

### 5. Loan Assessment Controller
```typescript
export const saveLoanAssessment = async (req: Request, res: Response) => {
  try {
    const {
      businessName,
      businessType,
      annualRevenue,
      monthlyIncome,
      existingLoanAmount,
      creditScore,
      loanAmount,
      loanTerm,
      eligibilityScore,
      isEligible,
      rejectionReason
    } = req.body;
    
    const userId = req.user.userId; // From JWT middleware
    
    // Find or create customer_information record
    let customerResult = await sql.query`
      SELECT * FROM customer_information WHERE id = ${userId}
    `;
    
    if (customerResult.recordset.length === 0) {
      await sql.query`
        INSERT INTO customer_information (id, email)
        VALUES (${userId}, ${req.user.email})
      `;
    }
    
    // Insert loan assessment
    await sql.query`
      INSERT INTO Loan_applicants (
        applicant_id, business_name, business_type, annual_revenue,
        monthly_income, existing_loan_amount, credit_score,
        requested_loan_amount, requested_loan_term_months,
        eligibility_score, is_eligible, ineligibility_reason
      )
      VALUES (
        ${userId}, ${businessName}, ${businessType}, ${annualRevenue},
        ${monthlyIncome}, ${existingLoanAmount}, ${creditScore},
        ${loanAmount}, ${loanTerm}, ${eligibilityScore},
        ${isEligible}, ${rejectionReason}
      )
    `;
    
    res.json({ message: 'Assessment saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

## Option 2: ASP.NET Core API

If you prefer C#/.NET:

### 1. Create ASP.NET Core Project
```bash
dotnet new webapi -n BEFinanceAPI
cd BEFinanceAPI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
```

### 2. Entity Models
```csharp
public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserProfile
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    public string Role { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LoanApplicant
{
    public Guid Id { get; set; }
    public Guid ApplicantId { get; set; }
    public string BusinessName { get; set; }
    public string BusinessType { get; set; }
    public decimal AnnualRevenue { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal ExistingLoanAmount { get; set; }
    public int CreditScore { get; set; }
    public decimal RequestedLoanAmount { get; set; }
    public int RequestedLoanTermMonths { get; set; }
    public decimal EligibilityScore { get; set; }
    public bool IsEligible { get; set; }
    public string IneligibilityReason { get; set; }
    public DateTime CreatedAt { get; set; }
}
```
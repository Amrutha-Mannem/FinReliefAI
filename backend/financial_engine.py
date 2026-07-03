def calculate_financial_health(income, expenses, total_emi):
    """
    Calculate financial health metrics including EMI ratio, 
    debt-to-income ratio, monthly surplus, and stress level.
    """
    # Calculate monthly surplus
    monthly_surplus = income - expenses - total_emi
    
    # Calculate EMI-to-income ratio (percentage)
    emi_ratio = (total_emi / income) * 100 if income > 0 else 0
    
    # Calculate Debt-to-Income ratio (percentage)
    dti_ratio = ((expenses + total_emi) / income) * 100 if income > 0 else 0
    
    # Classify stress level based on EMI ratio
    if emi_ratio > 40:
        stress_level = "High"
    elif emi_ratio > 20:
        stress_level = "Medium"
    else:
        stress_level = "Low"
    
    return {
        "monthly_surplus": round(monthly_surplus, 2),
        "emi_ratio": round(emi_ratio, 2),
        "dti_ratio": round(dti_ratio, 2),
        "stress_level": stress_level
    }


def calculate_settlement(outstanding_amount, overdue_months, loan_type):
    """
    Calculate optimal settlement amount based on:
    - Outstanding amount
    - Overdue months
    - Loan type
    """
    # Base settlement discount (20%)
    base_discount = 0.20
    
    # Increase discount if loan is overdue for more than 6 months
    if overdue_months > 6:
        base_discount += 0.15
    elif overdue_months > 3:
        base_discount += 0.10
    elif overdue_months > 0:
        base_discount += 0.05
    
    # Additional discount for personal loans
    if loan_type.lower() == "personal":
        base_discount += 0.05
    
    # Calculate suggested settlement amount
    suggested_settlement = outstanding_amount * (1 - base_discount)
    
    # Determine risk category
    if overdue_months > 3:
        risk_category = "High"
    elif overdue_months > 0:
        risk_category = "Medium"
    else:
        risk_category = "Low"
    
    # Calculate amount saved
    predicted_amount = outstanding_amount - suggested_settlement
    
    return {
        "suggested_settlement": round(suggested_settlement, 2),
        "risk_category": risk_category,
        "predicted_amount": round(predicted_amount, 2)
    }


def analyze_loan_priority(loans):
    """
    Analyze and sort loans by priority based on:
    - Overdue duration
    - Interest rate
    - EMI burden
    """
    loan_priorities = []
    
    for loan in loans:
        # Calculate priority score
        priority_score = 0
        
        # Overdue months factor
        if loan.get('overdue_months', 0) > 6:
            priority_score += 30
        elif loan.get('overdue_months', 0) > 3:
            priority_score += 20
        elif loan.get('overdue_months', 0) > 0:
            priority_score += 10
        
        # Interest rate factor
        if loan.get('interest_rate', 0) > 15:
            priority_score += 20
        elif loan.get('interest_rate', 0) > 10:
            priority_score += 10
        
        # EMI burden factor
        if loan.get('emi', 0) > 10000:
            priority_score += 15
        elif loan.get('emi', 0) > 5000:
            priority_score += 10
        
        loan_priorities.append({
            'loan_id': loan.get('loan_id'),
            'lender_name': loan.get('lender_name'),
            'priority_score': priority_score,
            'priority_level': 'High' if priority_score > 40 else 'Medium' if priority_score > 20 else 'Low'
        })
    
    # Sort by priority score (descending)
    loan_priorities.sort(key=lambda x: x['priority_score'], reverse=True)
    
    return loan_priorities